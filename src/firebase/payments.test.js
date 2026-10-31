import { httpsCallable } from "firebase/functions";
import { startPayment, verifyPaymentOrder } from "./payments";

jest.mock("./config", () => ({ functions: {} }));
jest.mock("firebase/functions", () => ({ httpsCallable: jest.fn() }));

const order = {
  orderId: "BAA123",
  gatewayUrl: "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
  encRequest: "encrypted-checkout",
  accessCode: "public-access-code",
};
afterEach(() => { jest.restoreAllMocks(); jest.clearAllMocks(); localStorage.clear(); });

test.each(["secure", "test"])("checkout POSTs encrypted server fields to %s CCAvenue and saves recovery reference", async (host) => {
  const checkout = { ...order, gatewayUrl: order.gatewayUrl.replace("secure.ccavenue.com", `${host}.ccavenue.com`) };
  const create = jest.fn().mockResolvedValue({ data: checkout });
  httpsCallable.mockReturnValue(create);
  let submitted;
  jest.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(function () {
    submitted = { method: this.method, action: this.action, fields: Object.fromEntries(new FormData(this)) };
  });
  const result = await startPayment({ purpose: "membership", prefill: { name: "Alumnus" } });
  expect(create).toHaveBeenCalledWith({ purpose: "membership", prefill: { name: "Alumnus" } });
  expect(result.status).toBe("redirecting");
  expect(submitted).toEqual({ method: "post", action: checkout.gatewayUrl, fields: { encRequest: order.encRequest, access_code: order.accessCode } });
  expect(localStorage.getItem("baaPendingPaymentOrder")).toBe(order.orderId);
  expect(document.querySelector("form")).toBeNull();
});

test("checkout rejects an unexpected gateway destination before posting", async () => {
  httpsCallable.mockReturnValue(jest.fn().mockResolvedValue({ data: { ...order, gatewayUrl: "https://example.org" } }));
  const submit = jest.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(() => {});
  await expect(startPayment({ purpose: "membership" })).rejects.toThrow("Invalid payment checkout response");
  expect(submit).not.toHaveBeenCalled();
});

test("verification sends only the order reference and trusts the backend status", async () => {
  const verify = jest.fn().mockResolvedValue({ data: { status: "pending" } });
  httpsCallable.mockReturnValue(verify);
  await expect(verifyPaymentOrder("BAA123")).resolves.toEqual({ status: "pending" });
  expect(httpsCallable).toHaveBeenCalledWith({}, "verifyPayment");
  expect(verify).toHaveBeenCalledWith({ orderId: "BAA123" });
});
