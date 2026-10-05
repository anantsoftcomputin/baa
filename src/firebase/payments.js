import { httpsCallable } from "firebase/functions";
import { functions } from "./config";

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise = null;
const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_SRC;
      script.onload = () => resolve(true);
      script.onerror = () => {
        scriptPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
};

/** Friendly message for errors coming back from the payment Cloud Functions. */
export const paymentErrorMessage = (error) => {
  const code = error?.code || "";
  if (code === "functions/not-found" || code === "functions/unimplemented") {
    return "Online payments aren't switched on yet. Please contact the association office.";
  }
  if (code === "functions/internal" && /not.?found|cors|failed to fetch/i.test(error?.message || "")) {
    return "Online payments aren't switched on yet. Please contact the association office.";
  }
  if (code === "functions/unauthenticated") return "Please sign in again to continue.";
  if (error?.message && code.startsWith("functions/")) return error.message;
  return "Payment could not be completed. Please try again.";
};

/**
 * Runs a Razorpay checkout. The amount is always decided by the server.
 *
 * @param {object} opts
 * @param {"membership"|"event"|"initiative"} opts.purpose
 * @param {string} [opts.refId]   registration id (event) or initiative id
 * @param {number} [opts.amount]  only for initiative contributions (rupees)
 * @param {object} [opts.prefill] { name, email, contact }
 * @returns {Promise<{status: "paid"|"cancelled"}>}
 */
export const startPayment = async ({ purpose, refId, amount, prefill = {} }) => {
  const loaded = await loadRazorpay();
  if (!loaded) {
    throw Object.assign(new Error("Could not load the payment window. Are you online?"), {
      code: "payments/script",
    });
  }

  const createOrder = httpsCallable(functions, "createPaymentOrder");
  const verify = httpsCallable(functions, "verifyPayment");

  const { data: order } = await createOrder({ purpose, refId, amount });

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "Bhavan's Alumni Association",
      description: order.description,
      image: `${window.location.origin}/logo192.png`,
      prefill,
      theme: { color: "#E8772E" },
      handler: async (response) => {
        try {
          await verify({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          resolve({ status: "paid" });
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => resolve({ status: "cancelled" }),
      },
    });
    // On a failed attempt Razorpay keeps its window open so the user can retry;
    // closing the window resolves as "cancelled" via ondismiss above.
    checkout.open();
  });
};
