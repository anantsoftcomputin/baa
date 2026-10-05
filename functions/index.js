/**
 * BAA Alumni Portal – Cloud Functions
 *
 * Payments are the one thing the browser must never be trusted with, so the
 * whole Razorpay flow lives here:
 *   1. createPaymentOrder – works out the amount server-side and opens a Razorpay order.
 *   2. verifyPayment      – checks Razorpay's signature, then grants what was paid for
 *                           (membership, an event registration, or an initiative contribution).
 *
 * Configuration (see README "Payments"):
 *   firebase functions:secrets:set RAZORPAY_KEY_SECRET
 *   RAZORPAY_KEY_ID goes in functions/.env  (e.g. RAZORPAY_KEY_ID=rzp_live_xxx)
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const {
  membershipFee,
  eventTotal,
  contributionAmount,
  isValidSignature,
} = require("./payments");

admin.initializeApp();
const db = admin.firestore();
const { FieldValue } = admin.firestore;

const REGION = "asia-south1";
const RAZORPAY_KEY_ID = defineString("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = defineSecret("RAZORPAY_KEY_SECRET");

const callableOptions = { region: REGION, secrets: [RAZORPAY_KEY_SECRET] };

const requireAuth = (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please sign in to continue.");
  }
  return request.auth.uid;
};

/** Returns { amount (rupees), description, notes } for the thing being paid for. */
const priceFor = async (uid, purpose, refId, requestedAmount) => {
  if (purpose === "membership") {
    const user = await db.doc(`users/${uid}`).get();
    if (user.exists && user.data().is_member === true) {
      throw new HttpsError("failed-precondition", "You are already a lifetime member.");
    }
    const settings = await db.doc("websiteContent/membership").get();
    return {
      amount: membershipFee(settings.exists ? settings.data() : null),
      description: "BAA Lifetime Membership",
      notes: { purpose },
    };
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
    const event = await db.doc(`events/${reg.data().eventId}`).get();
    if (!event.exists) throw new HttpsError("not-found", "Event not found.");
    const amount = eventTotal(event.data(), reg.data());
    if (amount <= 0) throw new HttpsError("failed-precondition", "This event is free.");
    return {
      amount,
      description: `Registration: ${event.data().name || "Event"}`,
      notes: { purpose, eventId: reg.data().eventId },
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
      notes: { purpose, initiativeId: refId },
    };
  }

  throw new HttpsError("invalid-argument", "Unknown payment purpose.");
};

const createRazorpayOrder = async ({ amountPaise, receipt, notes }) => {
  const auth = Buffer.from(`${RAZORPAY_KEY_ID.value()}:${RAZORPAY_KEY_SECRET.value()}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.id) {
    logger.error("Razorpay order creation failed", { status: res.status, body });
    throw new HttpsError("unavailable", "Payment gateway is unavailable. Please try again later.");
  }
  return body;
};

exports.createPaymentOrder = onCall(callableOptions, async (request) => {
  const uid = requireAuth(request);
  const { purpose, refId = null, amount: requestedAmount } = request.data || {};

  const { amount, description, notes } = await priceFor(uid, purpose, refId, requestedAmount);
  const amountPaise = Math.round(amount * 100);
  const receipt = `${purpose}_${Date.now()}`.slice(0, 40);

  const order = await createRazorpayOrder({ amountPaise, receipt, notes: { ...notes, uid } });

  await db.doc(`paymentOrders/${order.id}`).set({
    userId: uid,
    purpose,
    refId,
    amount,
    amountPaise,
    currency: "INR",
    description,
    status: "created",
    createdAt: FieldValue.serverTimestamp(),
  });

  return {
    orderId: order.id,
    amount: amountPaise,
    currency: "INR",
    keyId: RAZORPAY_KEY_ID.value(),
    description,
  };
});

exports.verifyPayment = onCall(callableOptions, async (request) => {
  const uid = requireAuth(request);
  const { orderId, paymentId, signature } = request.data || {};

  if (!isValidSignature(orderId, paymentId, signature, RAZORPAY_KEY_SECRET.value())) {
    throw new HttpsError("permission-denied", "Payment could not be verified.");
  }

  const orderRef = db.doc(`paymentOrders/${orderId}`);

  await db.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) throw new HttpsError("not-found", "Order not found.");
    const order = orderSnap.data();
    if (order.userId !== uid) throw new HttpsError("permission-denied", "This order belongs to someone else.");
    if (order.status === "paid") return; // idempotent: already applied

    // Transactions require every read to happen before the first write.
    const userSnap = order.purpose === "initiative" ? await tx.get(db.doc(`users/${uid}`)) : null;

    const paidAt = FieldValue.serverTimestamp();
    const paymentRef = db.collection("payments").doc(paymentId);

    tx.update(orderRef, { status: "paid", paymentId, paidAt });
    tx.set(paymentRef, {
      userId: uid,
      orderId,
      paymentId,
      purpose: order.purpose,
      refId: order.refId,
      amount: order.amount,
      currency: order.currency,
      status: "completed",
      createdAt: paidAt,
    });

    if (order.purpose === "membership") {
      tx.update(db.doc(`users/${uid}`), {
        is_member: true,
        membershipDate: paidAt,
        paymentDetails: { orderId, paymentId, amount: order.amount },
      });
    } else if (order.purpose === "event") {
      tx.update(db.doc(`eventRegistrations/${order.refId}`), {
        status: "confirmed",
        payment_status: "paid",
        amount_paid: order.amount,
        paymentId,
        paidAt,
      });
    } else if (order.purpose === "initiative") {
      tx.set(db.collection("contributions").doc(paymentId), {
        userId: uid,
        username: (userSnap && userSnap.exists && userSnap.data().username) || "",
        initiativeId: order.refId,
        amount: order.amount,
        paymentId,
        createdAt: paidAt,
      });
      tx.update(db.doc(`initiatives/${order.refId}`), {
        raised_amount: FieldValue.increment(order.amount),
        contributors_count: FieldValue.increment(1),
      });
    }
  });

  return { success: true };
});
