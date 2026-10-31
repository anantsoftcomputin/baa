const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const {
  membershipFee,
  eventTotal,
  contributionAmount,
  encrypt, decrypt, validId, matchesOrder, gatewayEndpoints,
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
  assert.throws(() => contributionAmount("100junk"), RangeError);
  assert.throws(() => contributionAmount(5000000), RangeError);
});

test("CCAvenue encryption matches an independent AES vector and round trips UTF-8", () => {
  const key = "test_working_key";
  const plain = "order_id=BAA123&amount=2500.00&currency=INR";
  const cipher = crypto.createCipheriv("aes-128-cbc", crypto.createHash("md5").update(key).digest(), Buffer.from("000102030405060708090a0b0c0d0e0f", "hex"));
  const expected = Buffer.concat([cipher.update(plain), cipher.final()]).toString("hex");
  assert.equal(encrypt(plain, key), expected);
  assert.equal(decrypt(expected, key), plain);
  assert.equal(decrypt(encrypt("Bhavan's ₹2500 & +", key), key), "Bhavan's ₹2500 & +");
  for (const bad of ["", "abc", "z".repeat(32), null, "0".repeat(65568)]) assert.throws(() => decrypt(bad, key));
  assert.throws(() => decrypt(expected, "wrong-key"));
});

test("payment must match server order, currency and exact minor units", () => {
  const order = { orderId: "BAA1", amountPaise: 250000, currency: "INR" };
  const result = { order_id: "BAA1", amount: "2500.00", currency: "INR" };
  assert.equal(matchesOrder(result, order), true);
  for (const change of [{ order_id: "BAA2" }, { amount: "1.00" }, { amount: "2500oops" }, { amount: "2500.001" }, { currency: "USD" }]) {
    assert.equal(matchesOrder({ ...result, ...change }, order), false);
  }
});

test("Firestore references cannot contain paths or other malformed values", () => {
  assert.equal(validId("event123_user456"), true);
  for (const bad of [undefined, "", "../users/admin", "a/b", {}, "a".repeat(129)]) assert.equal(validId(bad), false);
});

test("checkout and status endpoints use the same explicit environment", () => {
  assert.equal(new URL(gatewayEndpoints().checkout).hostname, "secure.ccavenue.com");
  assert.equal(new URL(gatewayEndpoints("production").status).hostname, "api.ccavenue.com");
  assert.equal(new URL(gatewayEndpoints("test").checkout).hostname, "test.ccavenue.com");
  assert.equal(new URL(gatewayEndpoints("test").status).hostname, "apitest.ccavenue.com");
  for (const invalid of ["", "live", "staging", "PRODUCTION"]) assert.throws(() => gatewayEndpoints(invalid));
});
