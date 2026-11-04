const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");
const { encrypt, decrypt } = require("../payments");
const key = "test-working-key";
const warnings = [];
let environment = "production";
const docs = new Map();
const ref = (path) => ({
  path,
  async get() { return snapshot(path); },
  async create(data) { assert.equal(docs.has(path), false); docs.set(path, data); },
});
const snapshot = (path) => ({ exists: docs.has(path), data: () => docs.get(path) });
const db = {
  doc: ref,
  async runTransaction(fn) {
    const writes = [];
    let wrote = false;
    const tx = {
      async get(r) { assert.equal(wrote, false, "transaction reads must precede writes"); return snapshot(r.path); },
      update(r, d) { wrote = true; writes.push(() => { assert.ok(docs.has(r.path)); docs.set(r.path, { ...docs.get(r.path), ...d }); }); },
      create(r, d) { wrote = true; writes.push(() => { assert.equal(docs.has(r.path), false); docs.set(r.path, d); }); },
      set(r, d) { wrote = true; writes.push(() => docs.set(r.path, { ...docs.get(r.path), ...d })); },
    };
    const result = await fn(tx);
    writes.forEach((write) => write());
    return result;
  },
};
const firestore = () => db;
firestore.FieldValue = { serverTimestamp: () => "timestamp", increment: (n) => ({ increment: n }) };
const originalLoad = Module._load;
Module._load = function (name, ...args) {
  if (name === "firebase-admin") return { initializeApp() {}, firestore };
  if (name === "firebase-functions/v2/https") return {
    onCall: (_, fn) => fn, onRequest: (_, fn) => fn,
    HttpsError: class extends Error { constructor(code, message) { super(message); this.code = code; } },
  };
  if (name === "firebase-functions/params") return {
    defineSecret: () => ({ value: () => key }),
    defineString: (param) => ({ value: () => param === "CCAVENUE_ENV" ? environment : ({ CCAVENUE_MERCHANT_ID: "12345", CCAVENUE_ACCESS_CODE: "test-access", PAYMENT_SITE_URL: "https://example.org" })[param] }),
  };
  if (name === "firebase-functions/logger") return { warn(message, details) { warnings.push({ message, details }); } };
  return originalLoad.call(this, name, ...args);
};
const handlers = require("../index");
Module._load = originalLoad;
const request = (data, uid = "user1") => ({ auth: { uid, token: { email: "user@example.org", email_verified: true } }, data });
let apiResult;
let apiEnvelope;
const originalFetch = global.fetch;
global.fetch = async (_url, opts) => {
  assert.equal(_url, environment === "test" ? "https://apitest.ccavenue.com/apis/servlet/DoWebTrans" : "https://api.ccavenue.com/apis/servlet/DoWebTrans");
  const body = new URLSearchParams(opts.body);
  assert.equal(body.get("command"), "orderStatusTracker");
  assert.equal(body.get("version"), "1.2");
  assert.equal(body.get("request_type"), "JSON");
  assert.equal(body.get("response_type"), "JSON");
  const query = JSON.parse(decrypt(body.get("enc_request"), key));
  assert.ok(query.order_no);
  if (apiResult instanceof Error) throw apiResult;
  // Match the live gateway's trailing CRLF after its last form field.
  return { ok: true, text: async () => apiEnvelope || `${new URLSearchParams({ status: "0", enc_response: encrypt(JSON.stringify(apiResult), key) })}\r\n` };
};
test.after(() => { global.fetch = originalFetch; });
const api = (order, extra = {}) => ({ order_no: order.orderId, order_amt: "2500.00", order_currncy: "INR", reference_no: "123456789", order_status: "Successful", status: 0, ...extra });
const response = () => ({
  code: 200, headers: {}, set(k, v) { this.headers[k] = v; return this; },
  status(n) { this.code = n; return this; }, send(body) { this.body = body; return this; },
  redirect(code, url) { this.code = code; this.url = url; return this; },
});

test("checkout lifecycle and failure boundaries", async (t) => {
  docs.set("users/user1", { username: "Alumnus", is_member: false });
  let checkout;
  await t.test("authentication and reference validation", async () => {
    await assert.rejects(handlers.createPaymentOrder({ data: {} }), { code: "unauthenticated" });
    await assert.rejects(handlers.createPaymentOrder(request({ purpose: "event", refId: "../../users/admin" })), { code: "invalid-argument" });
  });
  await t.test("server pricing and encrypted checkout", async () => {
    checkout = await handlers.createPaymentOrder(request({ purpose: "membership", amount: 1, prefill: { name: "Alumnus", contact: "+91 98765-43210" } }));
    const fields = new URLSearchParams(decrypt(checkout.encRequest, key));
    assert.equal(fields.get("amount"), "2500.00");
    assert.equal(fields.get("currency"), "INR");
    assert.equal(fields.get("merchant_id"), "12345");
    assert.match(fields.get("order_id"), /^[A-Za-z0-9_/-]{1,40}$/);
    assert.equal(fields.get("order_id"), checkout.orderId);
    assert.equal(fields.get("language"), "en");
    assert.equal(fields.get("billing_name"), "Alumnus");
    assert.equal(fields.get("billing_tel"), "919876543210");
    assert.equal(fields.get("billing_email"), "user@example.org");
    assert.equal(fields.has("integration_type"), false, "hosted billing does not request iframe flow");
    assert.ok(fields.get("redirect_url").length <= 100);
    assert.ok(fields.get("merchant_param1").length <= 100);
    assert.ok(fields.get("redirect_url").endsWith("/ccavenueResponse"));
    assert.equal(fields.get("redirect_url"), fields.get("cancel_url"));
    assert.equal(Object.hasOwn(checkout, "workingKey"), false);
  });
  await t.test("another user cannot verify an order", async () => {
    await assert.rejects(handlers.verifyPayment(request({ orderId: checkout.orderId }, "intruder")), { code: "not-found" });
  });
  await t.test("API failure leaves order unfulfilled and retryable", async () => {
    apiResult = new Error("timeout");
    await assert.rejects(handlers.verifyPayment(request({ orderId: checkout.orderId })), { code: "unavailable" });
    assert.equal(docs.get(`paymentOrders/${checkout.orderId}`).status, "created");
    assert.equal(docs.get("users/user1").is_member, false);
  });
  await t.test("API amount mismatch cannot grant membership", async () => {
    apiResult = api(checkout, { order_amt: 1 });
    await assert.rejects(handlers.verifyPayment(request({ orderId: checkout.orderId })), { code: "unavailable" });
    assert.equal(docs.get("users/user1").is_member, false);
  });
  await t.test("plaintext API rejection logs its code without exposing the response", async () => {
    apiEnvelope = "status=1&enc_response=Access_code%3A+Invalid+Parameter&enc_error_code=51407";
    await assert.rejects(handlers.verifyPayment(request({ orderId: checkout.orderId })), { code: "unavailable" });
    assert.equal(warnings.at(-1).details.gatewayCode, "51407");
    assert.equal(warnings.at(-1).details.reason, "api_rejected");
    assert.equal(JSON.stringify(warnings).includes("Access_code"), false);
    apiEnvelope = null;
  });
  await t.test("decrypted order-query errors stay retryable and log the application code", async () => {
    apiResult = { status: 1, error_code: "51313", error_desc: "No record found." };
    await assert.rejects(handlers.verifyPayment(request({ orderId: checkout.orderId })), { code: "unavailable" });
    assert.equal(warnings.at(-1).details.gatewayCode, "51313");
    assert.equal(warnings.at(-1).details.reason, "order_query_rejected");
    assert.equal(docs.get(`paymentOrders/${checkout.orderId}`).status, "created");
    assert.equal(docs.get("users/user1").is_member, false);
  });
  await t.test("transport whitespace is accepted but malformed ciphertext is rejected", async () => {
    apiResult = api(checkout, { order_status: "Initiated" });
    assert.equal((await handlers.verifyPayment(request({ orderId: checkout.orderId }))).status, "pending");
    apiEnvelope = new URLSearchParams({ status: "0", enc_response: `${encrypt(JSON.stringify(apiResult), key)}Z` }).toString();
    await assert.rejects(handlers.verifyPayment(request({ orderId: checkout.orderId })), { code: "unavailable" });
    assert.equal(warnings.at(-1).details.reason, "invalid_status_response");
    assert.equal(docs.get("users/user1").is_member, false);
    apiEnvelope = null;
  });
  await t.test("valid encrypted callback uses API and grants membership once", async () => {
    const fields = new URLSearchParams(decrypt(checkout.encRequest, key));
    apiResult = api(checkout);
    const callback = { order_id: checkout.orderId, amount: "2500.00", currency: "INR", order_status: "Success", merchant_param1: fields.get("merchant_param1") };
    const res = response();
    await handlers.ccavenueResponse({ method: "POST", body: { encResp: encrypt(new URLSearchParams(callback).toString(), key) } }, res);
    assert.equal(res.code, 303);
    assert.equal(new URL(res.url).searchParams.get("orderId"), checkout.orderId);
    assert.equal(docs.get("users/user1").is_member, true);
    apiResult = new Error("should not be called after paid");
    assert.equal((await handlers.verifyPayment(request({ orderId: checkout.orderId }))).status, "paid");
    assert.equal([...docs.keys()].filter((p) => p.startsWith("payments/")).length, 1);
  });
  await t.test("invalid encrypted callback and wrong nonce are rejected", async () => {
    const malformed = response();
    await handlers.ccavenueResponse({ method: "POST", body: { encResp: "invalid" } }, malformed);
    assert.equal(malformed.code, 400);
    const wrongNonce = response();
    await handlers.ccavenueResponse({ method: "POST", body: { encResp: encrypt(new URLSearchParams({ order_id: checkout.orderId, amount: "2500.00", currency: "INR", merchant_param1: "wrong" }).toString(), key) } }, wrongNonce);
    assert.equal(wrongNonce.code, 400);
  });
  await t.test("failed gateway payment never grants a contribution", async () => {
    docs.set("initiatives/fund1", { name: "Scholarships", raised_amount: 0 });
    const order = await handlers.createPaymentOrder(request({ purpose: "initiative", refId: "fund1", amount: 2500 }));
    apiResult = api(order, { order_status: "Aborted", reference_no: "987654321" });
    assert.equal((await handlers.verifyPayment(request({ orderId: order.orderId }))).status, "failed");
    assert.equal(docs.has("contributions/cca_987654321"), false);
    // Late successful status is recoverable; repeated checks cannot increment twice.
    apiResult = api(order, { reference_no: "987654321" });
    assert.equal((await handlers.verifyPayment(request({ orderId: order.orderId }))).status, "paid");
    assert.equal((await handlers.verifyPayment(request({ orderId: order.orderId }))).status, "paid");
    assert.equal([...docs.keys()].filter((p) => p.startsWith("contributions/")).length, 1);
    assert.deepEqual(docs.get("initiatives/fund1").raised_amount, { increment: 2500 });
  });
  await t.test("event fee comes from event and purchased guests survive cancellation", async () => {
    docs.set("events/event1", { name: "Reunion", amount: 500, guest_amount: 250 });
    docs.set("eventRegistrations/event1_user1", { eventId: "event1", userId: "user1", guest_count: 2, guests: [{ name: "Guest A" }, { name: "Guest B" }], payment_status: "pending", total_amount: 1 });
    const order = await handlers.createPaymentOrder(request({ purpose: "event", refId: "event1_user1", amount: 1 }));
    const fields = new URLSearchParams(decrypt(order.encRequest, key));
    assert.equal(fields.get("amount"), "1000.00");
    docs.delete("eventRegistrations/event1_user1");
    apiResult = api(order, { order_amt: 1000, reference_no: "eventpayment123" });
    assert.equal((await handlers.verifyPayment(request({ orderId: order.orderId }))).status, "paid");
    const reg = docs.get("eventRegistrations/event1_user1");
    assert.equal(reg.status, "confirmed");
    assert.equal(reg.payment_status, "paid");
    assert.equal(reg.guest_count, 2);
    assert.equal(reg.total_amount, 1000);
    assert.equal(reg.amount_paid, 1000);
    await assert.rejects(handlers.createPaymentOrder(request({ purpose: "event", refId: "event1_user1" })), { code: "failed-precondition" });
  });

  await t.test("server notification recovers a payment using order_curr and is idempotent", async () => {
    docs.set("users/notifyuser", { is_member: false });
    const order = await handlers.createPaymentOrder(request({ purpose: "membership" }, "notifyuser"));
    // The documented notification example does not include merchant_param1.
    const body = new URLSearchParams({ encResp: encrypt(new URLSearchParams({ order_id: order.orderId, currency: "INR", amount: "2500.00", order_status: "Success" }).toString(), key) }).toString();
    apiResult = api(order, { order_currncy: undefined, order_curr: "INR", reference_no: "notifypayment123" });
    const res = response();
    await handlers.ccavenueNotification({ method: "POST", body }, res);
    assert.equal(res.code, 200);
    assert.equal(res.body, "OK");
    assert.equal(docs.get("users/notifyuser").is_member, true);
    apiResult = new Error("duplicate must not query the API");
    const duplicate = response();
    await handlers.ccavenueNotification({ method: "POST", body }, duplicate);
    assert.equal(duplicate.code, 200);
    assert.equal([...docs.keys()].filter(p => p === "payments/cca_notifypayment123").length, 1);
  });

  await t.test("notification cannot grant benefits while the API is unavailable", async () => {
    docs.set("users/pendinguser", { is_member: false });
    const order = await handlers.createPaymentOrder(request({ purpose: "membership" }, "pendinguser"));
    const body = { encResp: encrypt(new URLSearchParams({ order_id: order.orderId, currency: "INR", amount: "2500.00", order_status: "Success" }).toString(), key) };
    apiResult = new Error("timeout");
    const res = response();
    await handlers.ccavenueNotification({ method: "POST", body }, res);
    assert.equal(res.code, 503);
    assert.equal(docs.get("users/pendinguser").is_member, false);
    const malformed = response();
    await handlers.ccavenueNotification({ method: "POST", body: { encResp: "invalid" } }, malformed);
    assert.equal(malformed.code, 400);
    const mismatch = response();
    await handlers.ccavenueNotification({ method: "POST", body: { encResp: encrypt(new URLSearchParams({ order_id: order.orderId, currency: "INR", amount: "1.00" }).toString(), key) } }, mismatch);
    assert.equal(mismatch.code, 400);
  });

  await t.test("unsuccessful and auto-reversed API statuses are failures", async () => {
    for (const orderStatus of ["Unsuccessful", "Auto-Reversed"]) {
      const order = await handlers.createPaymentOrder(request({ purpose: "membership" }, "pendinguser"));
      apiResult = api(order, { order_status: orderStatus });
      assert.equal((await handlers.verifyPayment(request({ orderId: order.orderId }, "pendinguser"))).status, "failed");
      assert.equal(docs.get("users/pendinguser").is_member, false);
    }
  });

  await t.test("test checkout routes to staging and cannot grant production benefits", async () => {
    environment = "test";
    docs.set("users/testuser", { username: "Test Alumnus", is_member: false });
    const order = await handlers.createPaymentOrder(request({ purpose: "membership" }, "testuser"));
    assert.equal(order.gatewayUrl, "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction");
    assert.equal(docs.get(`paymentOrders/${order.orderId}`).environment, "test");
    apiResult = api(order, { reference_no: "testpayment123" });
    environment = "production";
    await assert.rejects(handlers.verifyPayment(request({ orderId: order.orderId }, "testuser")), { code: "unavailable" });
    assert.equal(docs.get("users/testuser").is_member, false);
    environment = "test";
    const result = await handlers.verifyPayment(request({ orderId: order.orderId }, "testuser"));
    assert.equal(result.status, "test_paid");
    assert.equal(result.environment, "test");
    assert.equal(docs.get("users/testuser").is_member, false);
    assert.equal(docs.get("payments/cca_test_testpayment123").status, "test_completed");
    environment = "production";
  });

});
