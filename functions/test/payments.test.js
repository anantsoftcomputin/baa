const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const {
  membershipFee,
  eventTotal,
  contributionAmount,
  isValidSignature,
  DEFAULT_MEMBERSHIP_FEE,
} = require("../payments");

test("membership fee falls back to the default", () => {
  assert.equal(membershipFee(null), DEFAULT_MEMBERSHIP_FEE);
  assert.equal(membershipFee({ amount: "" }), DEFAULT_MEMBERSHIP_FEE);
  assert.equal(membershipFee({ amount: 3000 }), 3000);
  assert.equal(membershipFee({ amount: "1500" }), 1500);
});

test("event total adds the per-guest fee", () => {
  assert.equal(eventTotal({ amount: 500, guest_amount: 300 }, { guest_count: 2 }), 1100);
  assert.equal(eventTotal({ amount: "500" }, { guest_count: 4 }), 500);
  assert.equal(eventTotal({}, {}), 0);
  assert.equal(eventTotal({ amount: 100, guest_amount: 50 }, { guest_count: -3 }), 100);
});

test("contribution amount is validated", () => {
  assert.equal(contributionAmount("250.555"), 250.56);
  assert.throws(() => contributionAmount(0), RangeError);
  assert.throws(() => contributionAmount("abc"), RangeError);
  assert.throws(() => contributionAmount(5000000), RangeError);
});

test("razorpay signature check", () => {
  const secret = "test_secret";
  const sig = crypto.createHmac("sha256", secret).update("order_1|pay_1").digest("hex");
  assert.equal(isValidSignature("order_1", "pay_1", sig, secret), true);
  assert.equal(isValidSignature("order_1", "pay_2", sig, secret), false);
  assert.equal(isValidSignature("order_1", "pay_1", "short", secret), false);
  assert.equal(isValidSignature("order_1", "pay_1", sig, ""), false);
});
