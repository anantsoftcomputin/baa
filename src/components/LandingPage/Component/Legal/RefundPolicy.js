import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert } from "@mui/material";
import LegalPage from "../../../common/LegalPage";
import ContactBlock from "./ContactBlock";
import { ORGANISATION, useContactDetails } from "./organisation";

const RefundPolicy = () => {
  const contact = useContactDetails();

  const sections = [
    {
      id: "no-refunds",
      title: "No refunds",
      content: (
        <>
          <p>
            <strong>
              {ORGANISATION.legalName} does not issue refunds. Every payment made on the Platform is final and non-refundable once it
              has been successfully completed.
            </strong>
          </p>
          <p>This applies to all payments, including:</p>
          <ul>
            <li>
              <strong>Lifetime membership fees.</strong> Membership is activated as soon as payment is confirmed, and the fee is not
              refundable in whole or in part, including if membership is later suspended or terminated under our{" "}
              <RouterLink to="/terms-and-conditions">Terms &amp; Conditions</RouterLink>.
            </li>
            <li>
              <strong>Event registration fees,</strong> including fees paid for guests. These are not refundable if you are unable to
              attend, attend only part of an event, or change your plans.
            </li>
            <li>
              <strong>Contributions to initiatives.</strong> Contributions are voluntary and are not refundable.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "cancellations",
      title: "Cancellations",
      content: (
        <ul>
          <li>
            A completed payment cannot be cancelled. Please review the item, the amount and the number of guests carefully before
            paying.
          </li>
          <li>
            An event registration that is still awaiting payment can be cancelled by you at any time from the event page on the
            Platform. No amount is charged for an unpaid registration.
          </li>
          <li>
            If the Association postpones, reschedules or cancels an event, registered participants will be informed of the revised
            arrangements through the contact details on their account. Fees paid are not refundable.
          </li>
        </ul>
      ),
    },
    {
      id: "failed-transactions",
      title: "Failed transactions",
      content: (
        <>
          <p>
            Sometimes money is debited from your bank account, card or UPI app but the payment is not completed and no confirmation is
            shown on the Platform. Such a payment has not been received by the Association. The amount is reversed to your original
            payment method by your bank or by our payment gateway, Razorpay Software Private Limited, usually within 5–7 working days
            and in line with the timelines prescribed by the Reserve Bank of India. This reversal is processed by the bank or the
            payment gateway and is not a refund by the Association.
          </p>
          <p>
            If the reversal has not reached you within that time, please contact us with your registered email address, the date and
            amount of the transaction and the bank or UPI reference number, and we will take it up with the payment gateway.
          </p>
        </>
      ),
    },
    {
      id: "chargebacks",
      title: "Chargebacks",
      content: (
        <p>
          If you raise a chargeback or payment dispute with your bank for a payment that was successfully completed, the Association
          may share the transaction and service details with the bank and the payment gateway to contest it, and may suspend the
          related membership or registration while the dispute is open.
        </p>
      ),
    },
    {
      id: "delivery",
      title: "Delivery of services",
      content: (
        <p>
          The Association does not sell or ship physical goods. Lifetime membership is activated online immediately after successful
          payment. Event registrations are confirmed online immediately after successful payment, and the event is delivered on the
          date and at the venue published for it. Contributions are acknowledged online immediately after successful payment.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Questions about a payment",
      content: (
        <>
          <p>For any question about a payment, please contact:</p>
          <ContactBlock contact={contact} />
        </>
      ),
    },
  ];

  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      subtitle="Our policy on refunds and cancellations for memberships, event registrations and contributions."
      intro={
        <>
          <Alert severity="warning" sx={{ mb: 2 }}>
            All payments are final. The Association does not issue refunds for memberships, event registrations or contributions.
          </Alert>
          <p>
            This Refund &amp; Cancellation Policy applies to all payments made on this Platform to {ORGANISATION.legalName} (GSTIN{" "}
            {ORGANISATION.gstin}). It forms part of our <RouterLink to="/terms-and-conditions">Terms &amp; Conditions</RouterLink>.
          </p>
        </>
      }
      sections={sections}
    />
  );
};

export default RefundPolicy;
