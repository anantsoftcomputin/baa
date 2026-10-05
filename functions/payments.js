/**
 * Pure payment helpers. Kept free of Firebase imports so they can be unit tested.
 */
const crypto = require("crypto");

const DEFAULT_MEMBERSHIP_FEE = 2500;
const MIN_CONTRIBUTION = 1;
const MAX_CONTRIBUTION = 1000000;

const toAmount = (value) => {
  const n = typeof value === "number" ? value : parseFloat(value);
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

/** Razorpay signature check: HMAC-SHA256(order_id + "|" + payment_id, key_secret). */
const isValidSignature = (orderId, paymentId, signature, secret) => {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(signature), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

module.exports = {
  DEFAULT_MEMBERSHIP_FEE,
  membershipFee,
  eventTotal,
  contributionAmount,
  isValidSignature,
};
