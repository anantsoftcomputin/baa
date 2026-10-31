/**
 * Pure payment helpers. Kept free of Firebase imports so they can be unit tested.
 */
const crypto = require("crypto");

const DEFAULT_MEMBERSHIP_FEE = 2500;
const MIN_CONTRIBUTION = 1;
const MAX_CONTRIBUTION = 1000000;

const toAmount = (value) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Membership fee in rupees, from `websiteContent/membership.amount` with a safe default. */
const membershipFee = (settings) => toAmount(settings && settings.amount) || DEFAULT_MEMBERSHIP_FEE;

/** Event registration total in rupees: base fee + per-guest fee x number of guests. */
const eventTotal = (event, registration) => {
  const base = toAmount(event && event.amount);
  const perGuest = toAmount(event && event.guest_amount);
  const guests = Math.max(0, parseInt((registration && registration.guest_count) || 0, 10) || 0);
  return Math.round((base + perGuest * guests) * 100) / 100;
};

/** Validates a user-chosen contribution amount (rupees). Returns the rounded amount or throws. */
const contributionAmount = (value) => {
  const n = toAmount(value);
  if (n < MIN_CONTRIBUTION || n > MAX_CONTRIBUTION) {
    throw new RangeError(`Contribution must be between ₹${MIN_CONTRIBUTION} and ₹${MAX_CONTRIBUTION}.`);
  }
  return Math.round(n * 100) / 100;
};

// CCAvenue's integration kit uses an MD5-derived AES-128 key and IV bytes 0..15.
const cipherKey = (workingKey) => {
  if (!workingKey) throw new Error("CCAvenue working key is missing.");
  return crypto.createHash("md5").update(workingKey).digest();
};
const IV = Buffer.from(Array.from({ length: 16 }, (_, i) => i));
const encrypt = (plainText, workingKey) => {
  const cipher = crypto.createCipheriv("aes-128-cbc", cipherKey(workingKey), IV);
  return Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]).toString("hex");
};
const decrypt = (encrypted, workingKey) => {
  if (typeof encrypted !== "string" || !/^[a-f0-9]+$/i.test(encrypted) || encrypted.length % 32 !== 0 || encrypted.length > 65536) {
    throw new Error("Invalid encrypted payment response.");
  }
  const cipher = crypto.createDecipheriv("aes-128-cbc", cipherKey(workingKey), IV);
  return Buffer.concat([cipher.update(Buffer.from(encrypted, "hex")), cipher.final()]).toString("utf8");
};
const validId = (value) => typeof value === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(value);
const matchesOrder = (response, order) =>
  response.order_id === order.orderId && response.currency === order.currency &&
  /^\d+(\.\d{1,2})?$/.test(String(response.amount)) &&
  Math.round(Number(response.amount) * 100) === order.amountPaise;

const gatewayEndpoints = (environment = "production") => {
  if (environment === "production") return {
    checkout: "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
    status: "https://api.ccavenue.com/apis/servlet/DoWebTrans",
  };
  if (environment === "test") return {
    checkout: "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
    status: "https://apitest.ccavenue.com/apis/servlet/DoWebTrans",
  };
  throw new Error("CCAVENUE_ENV must be production or test.");
};

module.exports = {
  DEFAULT_MEMBERSHIP_FEE, membershipFee, eventTotal, contributionAmount,
  encrypt, decrypt, validId, matchesOrder, gatewayEndpoints,
};
