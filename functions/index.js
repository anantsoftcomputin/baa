/** CCAvenue hosted checkout; pricing and fulfilment remain on the server. */
const crypto = require("crypto");
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { membershipFee, eventTotal, contributionAmount, encrypt, decrypt, validId, matchesOrder, gatewayEndpoints } = require("./payments");
admin.initializeApp();
const db = admin.firestore();
const { FieldValue } = admin.firestore;
const REGION = "asia-south1";
const WORKING_KEY = defineSecret("CCAVENUE_WORKING_KEY");
const MERCHANT_ID = defineString("CCAVENUE_MERCHANT_ID");
const ACCESS_CODE = defineString("CCAVENUE_ACCESS_CODE");
const SITE_URL = defineString("PAYMENT_SITE_URL", { default: "https://bhavansalumniassociation.org" });
const ENVIRONMENT = defineString("CCAVENUE_ENV", { default: "production" });
const options = {
  region: REGION,
  secrets: [WORKING_KEY],
  // Route public gateway requests through Cloud NAT's reserved outbound IP.
  vpcConnector: "baa-payments",
  vpcConnectorEgressSettings: "ALL_TRAFFIC",
};
const siteOrigin = () => {
  const url = new URL(SITE_URL.value());
  if (url.protocol !== "https:") throw new Error("PAYMENT_SITE_URL must use HTTPS.");
  return url.origin;
};
const callbackUrl = () => {
  const project = process.env.GCLOUD_PROJECT || JSON.parse(process.env.FIREBASE_CONFIG || "{}").projectId;
  return `https://${REGION}-${project}.cloudfunctions.net/ccavenueResponse`;
};

const requireAuth = (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please sign in to continue.");
  }
  if (!request.auth.token.email_verified && request.auth.token.firebase?.sign_in_provider === "password") {
    throw new HttpsError("permission-denied", "Please verify your email before paying.");
  }
  return request.auth.uid;
};

/** Resolve pricing and the purchased registration snapshot on the server. */
const priceFor = async (uid, purpose, refId, requestedAmount) => {
  if (purpose === "membership") {
    const user = await db.doc(`users/${uid}`).get();
    if (!user.exists) throw new HttpsError("failed-precondition", "Please complete your profile before paying.");
    if (user.data().is_member === true) {
      throw new HttpsError("failed-precondition", "You are already an alumni member.");
    }
    const settings = await db.doc("websiteContent/membership").get();
    return {
      amount: membershipFee(settings.exists ? settings.data() : null),
      description: "BAA Alumni Membership",
    };
  }

  if ((purpose === "event" || purpose === "initiative") && !validId(refId)) {
    throw new HttpsError("invalid-argument", "Invalid payment reference.");
  }
  if (purpose === "event") {
    const regRef = db.doc(`eventRegistrations/${refId}`);
    const reg = await regRef.get();
    if (!reg.exists || reg.data().userId !== uid) {
      throw new HttpsError("not-found", "Registration not found.");
    }
    if (reg.data().payment_status === "paid") {
      throw new HttpsError("failed-precondition", "This registration is already paid.");
    }
    if (!validId(reg.data().eventId)) throw new HttpsError("invalid-argument", "Invalid event reference.");
    const event = await db.doc(`events/${reg.data().eventId}`).get();
    if (!event.exists) throw new HttpsError("not-found", "Event not found.");
    const amount = eventTotal(event.data(), reg.data());
    if (amount <= 0) throw new HttpsError("failed-precondition", "This event is free.");
    return {
      amount,
      description: `Registration: ${event.data().name || "Event"}`,
      registrationSnapshot: { ...reg.data(), total_amount: amount },
    };
  }

  if (purpose === "initiative") {
    const initiative = await db.doc(`initiatives/${refId}`).get();
    if (!initiative.exists) throw new HttpsError("not-found", "Initiative not found.");
    let amount;
    try {
      amount = contributionAmount(requestedAmount);
    } catch (e) {
      throw new HttpsError("invalid-argument", e.message);
    }
    return {
      amount,
      description: `Contribution: ${initiative.data().name || "Initiative"}`,
    };
  }

  throw new HttpsError("invalid-argument", "Unknown payment purpose.");
};

exports.createPaymentOrder = onCall(options, async (request) => {
  const uid = requireAuth(request);
  const environment = ENVIRONMENT.value();
  const endpoints = gatewayEndpoints(environment);
  const { purpose, refId = null, amount: requestedAmount, prefill = {} } = request.data || {};
  const { amount, description, registrationSnapshot } = await priceFor(uid, purpose, refId, requestedAmount);
  const orderId = `BAA${crypto.randomBytes(12).toString("hex")}`;
  const nonce = crypto.randomBytes(24).toString("hex");
  const order = {
    orderId, userId: uid, purpose, refId: purpose === "membership" ? null : refId, amount: Math.round(amount * 100) / 100,
    amountPaise: Math.round(amount * 100), currency: "INR", description,
    gateway: "ccavenue", environment, status: "created", createdAt: FieldValue.serverTimestamp(),
  };
  if (purpose === "event") {
    order.registrationSnapshot = registrationSnapshot;
  }
  // Store only the hash: paymentOrders are readable by their owner.
  await db.doc(`paymentOrders/${orderId}`).create({ ...order, nonceHash: crypto.createHash("sha256").update(nonce).digest("hex") });
  const text = (value, max) => typeof value === "string" ? value.slice(0, max) : "";
  const params = new URLSearchParams({
    merchant_id: MERCHANT_ID.value(), order_id: orderId, currency: "INR",
    amount: (order.amountPaise / 100).toFixed(2),
    redirect_url: callbackUrl(), cancel_url: callbackUrl(), language: "en",
    billing_name: text(prefill?.name, 60), billing_email: text(request.auth.token.email, 70),
    billing_tel: text(typeof prefill?.contact === "string" ? prefill.contact.replace(/\D/g, "") : "", 20), merchant_param1: nonce,
  });
  return { orderId, gatewayUrl: endpoints.checkout, encRequest: encrypt(params.toString(), WORKING_KEY.value()), accessCode: ACCESS_CODE.value() };
});

// Authenticate the final result independently with CCAvenue's status API.
const gatewayStatus = async (orderId, environment) => {
  if ((environment || "production") !== ENVIRONMENT.value()) throw new Error("Switch to the order environment to verify this payment.");
  const response = await fetch(gatewayEndpoints(environment).status, {
    method: "POST", signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      enc_request: encrypt(JSON.stringify({ order_no: orderId }), WORKING_KEY.value()),
      access_code: ACCESS_CODE.value(), command: "orderStatusTracker",
      request_type: "JSON", response_type: "JSON", version: "1.2",
    }).toString(),
  });
  if (!response.ok) throw Object.assign(new Error("Gateway status unavailable."), { gatewayReason: "http_error", httpStatus: response.status });
  const envelope = new URLSearchParams(await response.text());
  // On status=1 enc_response is plaintext, not encrypted. Keep the gateway's
  // numeric code for diagnostics without logging credentials or response bodies.
  if (envelope.get("status") !== "0") throw Object.assign(new Error("Gateway status unavailable."), {
    gatewayReason: "api_rejected", gatewayCode: safeGatewayCode(envelope.get("enc_error_code")),
  });
  // Live DoWebTrans responses append CRLF to the final enc_response field.
  // Remove surrounding transport whitespace before strict ciphertext validation.
  let decoded;
  try {
    decoded = JSON.parse(decrypt(envelope.get("enc_response")?.trim(), WORKING_KEY.value()));
  } catch (error) {
    throw Object.assign(new Error("Invalid gateway status response."), { gatewayReason: "invalid_status_response" });
  }
  const data = decoded.Order_Status_Result || decoded;
  if ((data.error_code && String(data.error_code).trim() !== "0") || (data.status !== undefined && String(data.status) !== "0")) {
    throw Object.assign(new Error("Gateway status unavailable."), {
      gatewayReason: "order_query_rejected", gatewayCode: safeGatewayCode(data.error_code),
    });
  }
  return {
    order_id: String(data.order_no || ""), amount: data.order_amt,
    // The API guide's field table and JSON example use different spellings.
    currency: data.order_currncy ?? data.order_curr, tracking_id: String(data.reference_no || ""),
    order_status: data.order_status,
  };
};

const safeGatewayCode = (code) => /^\d{1,10}$/.test(String(code || "").trim()) ? String(code).trim() : "unknown";
const reconciliationDetails = (orderId, error) => ({
  orderId, reason: error.gatewayReason || (error.name === "TimeoutError" ? "timeout" : "verification_failed"),
  ...(error.gatewayCode ? { gatewayCode: error.gatewayCode } : {}),
  ...(error.httpStatus ? { httpStatus: error.httpStatus } : {}),
});

const settleOrder = async (orderId, result) => db.runTransaction(async (tx) => {
  const orderRef = db.doc(`paymentOrders/${orderId}`);
  const snap = await tx.get(orderRef);
  if (!snap.exists) throw new Error("Order not found.");
  const order = snap.data();
  if (["paid", "test_paid"].includes(order.status)) return order.status;
  if (!matchesOrder(result, order)) throw Object.assign(new Error("Payment details do not match the order."), { gatewayReason: "order_details_mismatch" });
  const status = String(result.order_status).trim().toLowerCase();
  if (!["success", "successful", "shipped"].includes(status)) {
    const state = ["failure", "failed", "unsuccessful", "aborted", "cancelled", "invalid", "auto-cancelled", "auto-reversed", "refunded", "system refund", "chargeback", "fraud", "timeout"].includes(status) ? "failed" : "pending";
    tx.update(orderRef, { status: state, updatedAt: FieldValue.serverTimestamp() });
    return state;
  }
  if (!validId(result.tracking_id)) throw new Error("Invalid payment reference.");
  const isTest = order.environment === "test";
  const paymentId = `${isTest ? "cca_test" : "cca"}_${result.tracking_id}`;
  const paymentRef = db.doc(`payments/${paymentId}`);
  const previous = await tx.get(paymentRef);
  if (previous.exists) throw new Error("Payment already assigned to an order.");
  const uid = order.userId;
  const user = await tx.get(db.doc(`users/${uid}`));
  // All reads must precede writes. Recreate a cancelled pending registration from
  // its server-side snapshot so a successful payment is never silently lost.
  const registrationRef = order.purpose === "event" ? db.doc(`eventRegistrations/${order.refId}`) : null;
  const registration = registrationRef ? await tx.get(registrationRef) : null;
  const paidAt = FieldValue.serverTimestamp();
  tx.update(orderRef, { status: isTest ? "test_paid" : "paid", paymentId, paidAt });
  tx.create(paymentRef, {
    userId: uid, orderId, paymentId, purpose: order.purpose, refId: order.refId,
    amount: order.amount, currency: order.currency, gateway: "ccavenue", environment: order.environment || "production", status: isTest ? "test_completed" : "completed", createdAt: paidAt,
  });
  if (isTest) return "test_paid";
  if (order.purpose === "membership") {
    tx.set(db.doc(`users/${uid}`), { is_member: true, membershipDate: paidAt,
      paymentDetails: { orderId, paymentId, amount: order.amount } }, { merge: true });
  } else if (order.purpose === "event") {
    tx.set(registrationRef, {
      ...((registration.exists && registration.data().payment_status === "paid") ? {} : order.registrationSnapshot),
      status: "confirmed", payment_status: "paid", amount_paid: order.amount, paymentId, paidAt,
    }, { merge: true });
  } else if (order.purpose === "initiative") {
    tx.create(db.doc(`contributions/${paymentId}`), {
      userId: uid, username: user.exists ? user.data().username || "" : "",
      initiativeId: order.refId, amount: order.amount, paymentId, createdAt: paidAt,
    });
    tx.update(db.doc(`initiatives/${order.refId}`), {
      raised_amount: FieldValue.increment(order.amount), contributors_count: FieldValue.increment(1),
    });
  }
  return "paid";
});

exports.ccavenueResponse = onRequest({ ...options, invoker: "public" }, async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).set("Allow", "POST").send("Method not allowed.");
  let orderId;
  try {
    const body = typeof req.body === "string" ? Object.fromEntries(new URLSearchParams(req.body)) : req.body;
    const result = Object.fromEntries(new URLSearchParams(decrypt(body?.encResp, WORKING_KEY.value())));
    orderId = result.order_id;
    if (!validId(orderId)) throw new Error("Invalid order.");
    const snap = await db.doc(`paymentOrders/${orderId}`).get();
    if (!snap.exists || !matchesOrder(result, snap.data())) throw new Error("Invalid order.");
    const hash = crypto.createHash("sha256").update(result.merchant_param1 || "").digest("hex");
    if (hash !== snap.data().nonceHash) throw new Error("Invalid callback.");
    // Do not trust status from the browser-carried encrypted response alone.
    try {
      await settleOrder(orderId, await gatewayStatus(orderId, snap.data().environment));
    } catch (error) {
      logger.warn("CCAvenue reconciliation deferred", reconciliationDetails(orderId, error));
    }
    return res.redirect(303, `${siteOrigin()}/dashboard/payment-result?orderId=${encodeURIComponent(orderId)}`);
  } catch (error) {
    logger.warn("Invalid CCAvenue callback");
    return res.status(400).send("Payment response could not be verified. Return to the portal to check your payment status.");
  }
});

// Register this endpoint for Order Status Echo and Order Reconciliation Status.
// Notifications are server-to-server and require an HTTP acknowledgement,
// rather than the browser callback's redirect. Query the API before fulfilment.
exports.ccavenueNotification = onRequest({ ...options, invoker: "public" }, async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).set("Allow", "POST").send("Method not allowed.");
  let orderId;
  let order;
  try {
    const body = typeof req.body === "string" ? Object.fromEntries(new URLSearchParams(req.body)) : req.body;
    const result = Object.fromEntries(new URLSearchParams(decrypt(body?.encResp, WORKING_KEY.value())));
    orderId = result.order_id;
    if (!validId(orderId)) throw new Error("Invalid order.");
    const snap = await db.doc(`paymentOrders/${orderId}`).get();
    if (!snap.exists || !matchesOrder(result, snap.data())) throw new Error("Invalid order.");
    order = snap.data();
  } catch (error) {
    logger.warn("Invalid CCAvenue notification");
    return res.status(400).send("Invalid notification.");
  }
  if (["paid", "test_paid"].includes(order.status)) return res.status(200).send("OK");
  try {
    await settleOrder(orderId, await gatewayStatus(orderId, order.environment));
    return res.status(200).send("OK");
  } catch (error) {
    logger.warn("CCAvenue notification reconciliation deferred", reconciliationDetails(orderId, error));
    return res.status(503).send("Payment verification unavailable.");
  }
});

exports.verifyPayment = onCall(options, async (request) => {
  const uid = requireAuth(request);
  const { orderId } = request.data || {};
  if (!validId(orderId)) throw new HttpsError("invalid-argument", "Invalid payment order.");
  const snap = await db.doc(`paymentOrders/${orderId}`).get();
  if (!snap.exists || snap.data().userId !== uid) throw new HttpsError("not-found", "Payment order not found.");
  const order = snap.data();
  let status = order.status;
  if (!["paid", "test_paid"].includes(status)) {
    try {
      status = await settleOrder(orderId, await gatewayStatus(orderId, order.environment));
    } catch (error) {
      logger.warn("CCAvenue status check deferred", reconciliationDetails(orderId, error));
      throw new HttpsError("unavailable", "Payment confirmation is pending. Please check again shortly before making another payment.");
    }
  }
  return { status, purpose: order.purpose, refId: order.refId, amount: order.amount, environment: order.environment || "production" };
});
