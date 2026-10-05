import React from "react";
import { Link as RouterLink } from "react-router-dom";
import LegalPage from "../../../common/LegalPage";
import ContactBlock from "./ContactBlock";
import { ORGANISATION, useContactDetails } from "./organisation";

const TermsAndConditions = () => {
  const contact = useContactDetails();

  const sections = [
    {
      id: "agreement",
      title: "About this agreement",
      content: (
        <>
          <p>
            These Terms &amp; Conditions (the <strong>“Terms”</strong>) form a binding agreement between you and{" "}
            <strong>{ORGANISATION.legalName}</strong>, GSTIN {ORGANISATION.gstin}, having its principal place of business at{" "}
            {contact.address} (<strong>“the Association”</strong>, <strong>“we”</strong>, <strong>“us”</strong>). They govern your
            access to and use of this website and member portal (the <strong>“Platform”</strong>) and every service, membership,
            event registration and contribution offered through it.
          </p>
          <p>
            By creating an account, ticking the acceptance box, making a payment or otherwise using the Platform, you confirm that you
            have read, understood and agree to these Terms, our <RouterLink to="/privacy-policy">Privacy Policy</RouterLink> and our{" "}
            <RouterLink to="/refund-policy">Refund &amp; Cancellation Policy</RouterLink>, which form part of these Terms. If you do
            not agree, please do not use the Platform.
          </p>
          <p>This document is an electronic record under the Information Technology Act, 2000 and does not require a physical signature.</p>
        </>
      ),
    },
    {
      id: "eligibility",
      title: "Eligibility",
      content: (
        <ul>
          <li>You must be at least 18 years old and competent to contract under the Indian Contract Act, 1872.</li>
          <li>
            Member accounts are intended for alumni of Bharatiya Vidya Bhavan's school, Vadodara. The Association may ask you to verify
            your alumni status and may refuse, suspend or close accounts that do not meet this requirement.
          </li>
          <li>The public pages of the Platform may be viewed by anyone.</li>
        </ul>
      ),
    },
    {
      id: "accounts",
      title: "Your account",
      content: (
        <ul>
          <li>You must give accurate, current and complete information and keep it up to date.</li>
          <li>Accounts registered with email and password must be verified through the link sent to that email before use.</li>
          <li>
            You are responsible for keeping your login credentials confidential and for all activity under your account. Tell us
            promptly if you suspect unauthorised use.
          </li>
          <li>Each account is personal to one individual and may not be shared, sold or transferred.</li>
        </ul>
      ),
    },
    {
      id: "membership",
      title: "Lifetime membership",
      content: (
        <ul>
          <li>
            Lifetime membership is available on payment of the one-time membership fee displayed on the Platform at the time of
            payment. The Association may revise the fee for future purchases; a revision does not affect memberships already paid
            for.
          </li>
          <li>Membership is personal to the member and cannot be transferred, assigned or shared.</li>
          <li>
            Membership takes effect when the payment is successfully confirmed by our payment gateway. Membership benefits are as
            described on the Platform from time to time.
          </li>
          <li>
            The Association may suspend or terminate a membership for breach of these Terms or conduct that harms the Association or
            its members. Membership fees are not refundable in any such case.
          </li>
        </ul>
      ),
    },
    {
      id: "events",
      title: "Events",
      content: (
        <ul>
          <li>
            Event details, fees (including any fee per guest), schedules and venues are as published on the Platform for each event.
          </li>
          <li>
            A registration for a paid event is confirmed only after the full payment is successfully received. Registrations awaiting
            payment are not confirmed and may be cancelled by you or by the Association.
          </li>
          <li>
            You are responsible for the guests you register and for the accuracy of their details, and for ensuring that they follow
            these Terms and any event rules.
          </li>
          <li>
            The Association may change an event's programme, timing or venue, or postpone or cancel an event, for reasons including
            low participation, venue availability, safety or circumstances beyond its control. Registered participants will be
            informed through the contact details on their account.
          </li>
          <li>
            Attendees must follow the event rules and the instructions of the organisers and venue. The Association may refuse entry
            to, or remove, anyone whose conduct is unsafe, unlawful or disruptive, without refund.
          </li>
          <li>
            Photographs and videos may be taken at events and used by the Association on the Platform and in its communications. If
            you do not wish to be photographed, please tell the organisers at the event.
          </li>
        </ul>
      ),
    },
    {
      id: "contributions",
      title: "Contributions to initiatives",
      content: (
        <ul>
          <li>Contributions to the Association's initiatives are voluntary and may be of any amount you choose, subject to the limits shown at checkout.</li>
          <li>
            Contributions are applied by the Association towards the stated initiative. If an initiative is fully funded, completed
            or cannot proceed, the Association may apply the funds to similar initiatives consistent with its objectives.
          </li>
          <li>
            Unless a receipt issued by the Association expressly states otherwise, no tax exemption or deduction is represented or
            guaranteed for any contribution.
          </li>
        </ul>
      ),
    },
    {
      id: "payments",
      title: "Payments",
      content: (
        <ul>
          <li>All amounts are payable in Indian Rupees (INR). Any applicable taxes will be shown at the time of payment.</li>
          <li>
            Payments are processed by Razorpay Software Private Limited, a third-party payment gateway, through the payment methods
            it supports (such as cards, UPI, net banking and wallets). Your use of the payment gateway is also subject to its terms.
            The Association does not receive or store your card or bank credentials.
          </li>
          <li>
            The amount payable is calculated and verified by the Association's systems. A payment is complete only when it is
            confirmed by the payment gateway and the Association.
          </li>
          <li>
            The Association is not liable for delays or failures caused by banks, card networks, UPI apps or the payment gateway.
            If money is debited but the payment fails, the amount is reversed by your bank or the payment gateway as set out in our{" "}
            <RouterLink to="/refund-policy">Refund &amp; Cancellation Policy</RouterLink>.
          </li>
        </ul>
      ),
    },
    {
      id: "refunds",
      title: "No refunds",
      content: (
        <p>
          <strong>
            All payments made on the Platform, including membership fees, event registration fees and contributions, are final and
            non-refundable.
          </strong>{" "}
          Please read our <RouterLink to="/refund-policy">Refund &amp; Cancellation Policy</RouterLink> before making a payment.
        </p>
      ),
    },
    {
      id: "user-content",
      title: "Content you post",
      content: (
        <>
          <p>
            You keep ownership of the posts, photographs, comments and other content you submit (<strong>“User Content”</strong>). You
            grant the Association a non-exclusive, royalty-free, worldwide licence to host, store, display, reproduce and distribute
            your User Content on the Platform and in the Association's communications, for as long as it remains on the Platform.
          </p>
          <p>
            You are solely responsible for your User Content and confirm that you have all rights needed to share it, including the
            consent of people shown in photographs you upload.
          </p>
        </>
      ),
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      content: (
        <>
          <p>You agree not to use the Platform to:</p>
          <ul>
            <li>post anything unlawful, defamatory, obscene, harassing, hateful, threatening, or that invades another person's privacy;</li>
            <li>impersonate any person or misrepresent your identity or alumni status;</li>
            <li>infringe any copyright, trademark or other intellectual-property right;</li>
            <li>
              copy, scrape or export the alumni directory or members' contact details, or use them for spam, marketing, recruitment or
              any commercial solicitation without the member's consent;
            </li>
            <li>upload viruses or malicious code, or attempt to gain unauthorised access to accounts, data or systems;</li>
            <li>interfere with the Platform's security, operation or other users' use of it; or</li>
            <li>violate the Information Technology Act, 2000, the rules made under it, or any other applicable law.</li>
          </ul>
          <p>
            The Association may remove any content and suspend or terminate any account that it reasonably believes breaches these
            Terms, and may report unlawful activity to the authorities.
          </p>
        </>
      ),
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      content: (
        <p>
          The Platform, its design and its content (other than User Content), including the Association's name and logo, belong to the
          Association or its licensors. You may not copy, modify, distribute or use them for any purpose other than your personal use
          of the Platform without our prior written permission.
        </p>
      ),
    },
    {
      id: "third-parties",
      title: "Third-party services and links",
      content: (
        <p>
          The Platform relies on third-party services such as Google Firebase and Razorpay, and may contain links to third-party
          websites. The Association does not control and is not responsible for those services or websites, their content or their
          practices.
        </p>
      ),
    },
    {
      id: "disclaimer",
      title: "Disclaimer",
      content: (
        <p>
          The Platform is provided on an “as is” and “as available” basis. While we work to keep it accurate and available, the
          Association makes no warranty that it will be uninterrupted, error-free or free of harmful components. Views expressed by
          members are their own and not those of the Association. Information shared by members, including profiles and posts, is
          not verified by the Association.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Limitation of liability",
      content: (
        <p>
          To the fullest extent permitted by law, the Association, its office-bearers, volunteers and members will not be liable for
          any indirect, incidental, special or consequential loss, or for loss of data, arising from your use of, or inability to use,
          the Platform or any event. The Association's total liability for any claim relating to the Platform or a paid service is
          limited to the amount you paid to the Association for that service.
        </p>
      ),
    },
    {
      id: "indemnity",
      title: "Indemnity",
      content: (
        <p>
          You agree to indemnify and hold harmless the Association, its office-bearers and volunteers from any claim, loss, liability
          or expense (including reasonable legal fees) arising from your breach of these Terms, your User Content or your misuse of the
          Platform.
        </p>
      ),
    },
    {
      id: "termination",
      title: "Suspension and termination",
      content: (
        <p>
          You may stop using the Platform and ask us to delete your account at any time. The Association may suspend or terminate your
          access, with or without notice, if you breach these Terms or if required by law. Sections that by their nature should
          survive termination, including those on payments, refunds, intellectual property, limitation of liability, indemnity and
          governing law, will survive.
        </p>
      ),
    },
    {
      id: "governing-law",
      title: "Governing law and disputes",
      content: (
        <p>
          These Terms are governed by the laws of India. Subject to applicable law, the courts at {ORGANISATION.jurisdiction} have
          exclusive jurisdiction over any dispute arising out of or in connection with these Terms or the Platform. Before starting
          legal proceedings, please contact us so that we can try to resolve the matter amicably.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to these Terms",
      content: (
        <p>
          The Association may update these Terms from time to time. The “Last updated” date shows the latest revision. Continued use of
          the Platform after an update means you accept the revised Terms. Payments already made are governed by the Terms in force
          when the payment was made.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact and grievances",
      content: (
        <>
          <p>For any question or complaint about these Terms or the Platform, please contact:</p>
          <ContactBlock contact={contact} heading={contact.grievance_officer ? `Grievance Officer: ${contact.grievance_officer}` : "Grievance Officer"} />
        </>
      ),
    },
  ];

  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle="The user agreement for the website, member portal, memberships, events and contributions."
      intro={
        <p>
          Please read these Terms carefully. They explain your rights and obligations when you use the Platform and when you pay for a
          membership, an event or make a contribution.
        </p>
      }
      sections={sections}
    />
  );
};

export default TermsAndConditions;
