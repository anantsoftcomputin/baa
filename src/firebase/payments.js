import { httpsCallable } from "firebase/functions";
import { functions } from "./config";

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

export const verifyPaymentOrder = async (orderId) => {
  const { data } = await httpsCallable(functions, "verifyPayment")({ orderId });
  return data;
};

/** Server decides the amount; browser posts only the encrypted checkout fields. */
export const startPayment = async ({ purpose, refId, amount, prefill = {} }) => {
  const { data: order } = await httpsCallable(functions, "createPaymentOrder")({ purpose, refId, amount, prefill });
  const allowedGateways = [
    "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
    "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
  ];
  if (!allowedGateways.includes(order.gatewayUrl) ||
      !order.encRequest || !order.accessCode || !order.orderId) {
    throw new Error("Invalid payment checkout response.");
  }
  localStorage.setItem("baaPendingPaymentOrder", order.orderId);
  const form = document.createElement("form");
  form.method = "POST";
  form.action = order.gatewayUrl;
  for (const [name, value] of Object.entries({ encRequest: order.encRequest, access_code: order.accessCode })) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  form.remove();
  return { status: "redirecting" };
};
