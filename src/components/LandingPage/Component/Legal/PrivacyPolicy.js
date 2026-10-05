import React from "react";
import { Link as RouterLink } from "react-router-dom";
import LegalPage from "../../../common/LegalPage";
import ContactBlock from "./ContactBlock";
import { ORGANISATION, useContactDetails } from "./organisation";

const PrivacyPolicy = () => {
  const contact = useContactDetails();

  const sections = [
    {
      id: "who-we-are",
      title: "Who we are",
      content: (
        <>
          <p>
            This website and member portal (the <strong>“Platform”</strong>) is operated by{" "}
            <strong>{ORGANISATION.legalName}</strong>, GSTIN {ORGANISATION.gstin}, having its principal place of business at{" "}
            {contact.address} (<strong>“the Association”</strong>, <strong>“we”</strong>, <strong>“us”</strong> or{" "}
            <strong>“our”</strong>).
          </p>
          <p>
            For the purposes of the Digital Personal Data Protection Act, 2023 (<strong>“DPDP Act”</strong>), the Association is the
            Data Fiduciary for the personal data described in this policy.
          </p>
        </>
      ),
    },
    {
      id: "scope",
      title: "Scope of this policy",
      content: (
        <p>
          This policy explains how we collect, use, share, store and protect personal data when you visit the Platform, create an
          account, maintain an alumni profile, post content, register for events, purchase a lifetime membership, make a contribution
          to an initiative, or contact us. It should be read together with our{" "}
          <RouterLink to="/terms-and-conditions">Terms &amp; Conditions</RouterLink> and{" "}
          <RouterLink to="/refund-policy">Refund &amp; Cancellation Policy</RouterLink>.
        </p>
      ),
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      content: (
        <>
          <h3>Information you give us</h3>
          <ul>
            <li>
              <strong>Account details:</strong> your name, email address and school batch year. If you register with email and
              password, your password is handled by our authentication provider (Google Firebase Authentication) and is never visible
              to us. If you sign in with Google, we receive your name, email address and profile photograph from Google.
            </li>
            <li>
              <strong>Profile details (optional):</strong> profile photograph, bio, date of birth, phone number, alternate email,
              postal address, city, state, country, education, employer, job title, industry, links to social-media profiles, skills,
              interests, achievements, publications and mentorship preferences.
            </li>
            <li>
              <strong>Content you share:</strong> posts, photographs, comments, likes, shares and the alumni you choose to follow.
            </li>
            <li>
              <strong>Event registrations:</strong> the events you register for and, where you add them, the names and phone numbers
              of guests accompanying you. By providing a guest's details you confirm that the guest has agreed to share them with us
              for that event.
            </li>
            <li>
              <strong>Payments:</strong> when you pay for a membership, an event or make a contribution, we record the purpose and
              amount of the payment, the order and payment reference numbers, and the payment status.{" "}
              <strong>Card, UPI, net-banking and wallet details are collected and processed directly by our payment gateway, Razorpay
              Software Private Limited, and are not received or stored by us.</strong>
            </li>
            <li>
              <strong>Messages:</strong> the name, email address, phone number, address, topic and message you submit through the
              contact form, and the details you submit through the feedback form.
            </li>
          </ul>
          <h3>Information collected automatically</h3>
          <ul>
            <li>
              <strong>Usage and device data:</strong> pages viewed, features used, approximate location derived from IP address,
              browser and device type, collected through Google Analytics for Firebase to understand how the Platform is used.
            </li>
            <li>
              <strong>Session data:</strong> your browser's local storage keeps you signed in. See “Cookies and similar technologies”
              below.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "How we use your information",
      content: (
        <>
          <p>We use personal data only for the following purposes:</p>
          <ul>
            <li>to create and secure your account, verify your email address and let you sign in;</li>
            <li>to show your alumni profile to other signed-in members and help batchmates find and connect with you;</li>
            <li>to publish and display the posts, comments and other content you choose to share;</li>
            <li>to register you (and any guests) for events, manage attendance and communicate event information;</li>
            <li>to process membership fees, event fees and contributions, issue confirmations and maintain financial records;</li>
            <li>to respond to your messages, feedback and requests;</li>
            <li>to send you service communications about your account, registrations and payments;</li>
            <li>to keep the Platform safe, prevent misuse and fraud, and enforce our Terms &amp; Conditions;</li>
            <li>to understand usage and improve the Platform; and</li>
            <li>to comply with applicable law, including tax and accounting obligations.</li>
          </ul>
          <p>We do not sell or rent your personal data, and we do not use it for third-party advertising.</p>
        </>
      ),
    },
    {
      id: "consent",
      title: "Consent and legal basis",
      content: (
        <p>
          We process your personal data on the basis of the consent you give when you create an account, submit a form or make a
          payment, and for the legitimate uses permitted under the DPDP Act, such as complying with law. You may withdraw your consent
          at any time by contacting us (see “Your rights” below). Withdrawal does not affect processing already carried out, and we
          may be unable to continue providing services that depend on that data, such as your account or a registration.
        </p>
      ),
    },
    {
      id: "who-can-see",
      title: "Who can see your information",
      content: (
        <ul>
          <li>
            <strong>Other members:</strong> signed-in members can see your name, photograph, batch year, bio, education, work,
            location, skills, interests, posts and follower counts. Your email address and phone number are shown to other members only
            if you turn on the corresponding setting in your profile.
          </li>
          <li>
            <strong>The public:</strong> your profile and posts are not shown on the public website. Information about committee
            members, testimonials and achievements is published on the public website only with the consent of the person concerned.
          </li>
          <li>
            <strong>Association administrators:</strong> authorised office-bearers can access member records, event registrations,
            payment records and messages to administer the Association.
          </li>
        </ul>
      ),
    },
    {
      id: "sharing",
      title: "Sharing with service providers and others",
      content: (
        <>
          <p>We share personal data only as needed with:</p>
          <ul>
            <li>
              <strong>Google LLC (Google Firebase / Google Cloud):</strong> authentication, database, file storage, server functions and
              analytics;
            </li>
            <li>
              <strong>Razorpay Software Private Limited:</strong> processing of payments;
            </li>
            <li>
              <strong>Our website hosting provider:</strong> delivery of the website;
            </li>
            <li>
              <strong>Government and law-enforcement authorities:</strong> where required by law, court order or to protect the rights,
              safety or property of the Association, our members or others.
            </li>
          </ul>
          <p>
            These providers process data on our behalf under their own terms and security safeguards. Some of them may store or process
            data on servers located outside India. Where that happens, we rely on providers that apply appropriate safeguards, and such
            transfers are made in accordance with applicable Indian law.
          </p>
        </>
      ),
    },
    {
      id: "retention",
      title: "How long we keep information",
      content: (
        <ul>
          <li>Account and profile data is kept while your account is active and deleted or anonymised after you ask us to delete it.</li>
          <li>Posts and comments are kept until you or an administrator delete them, or your account is deleted.</li>
          <li>
            Payment, membership and contribution records are kept for as long as required under applicable tax, accounting and other
            laws, even after an account is deleted.
          </li>
          <li>Contact-form messages and feedback are kept for as long as needed to address them and for reasonable record-keeping.</li>
        </ul>
      ),
    },
    {
      id: "security",
      title: "How we protect information",
      content: (
        <p>
          We use reasonable security practices and procedures, including encrypted (HTTPS) connections, access controls enforced by
          database security rules, role-based access for administrators, and payment processing through a PCI-DSS compliant payment
          gateway. No method of transmission or storage is completely secure, however, and we cannot guarantee absolute security. If
          a personal-data breach occurs, we will notify affected users and authorities as required by law.
        </p>
      ),
    },
    {
      id: "your-rights",
      title: "Your rights",
      content: (
        <>
          <p>Subject to applicable law, you have the right to:</p>
          <ul>
            <li>obtain a summary of the personal data we hold about you and how it is processed;</li>
            <li>correct, complete or update your personal data. Most profile details can be edited directly in your profile;</li>
            <li>request erasure of your personal data and deletion of your account;</li>
            <li>withdraw consent you have given;</li>
            <li>nominate another person to exercise your rights in the event of your death or incapacity; and</li>
            <li>have your grievances redressed (see below).</li>
          </ul>
          <p>
            To exercise these rights, write to us using the details in “Grievance Officer and contact”. We may need to verify your
            identity before acting on a request, and we will respond within the time required by law.
          </p>
        </>
      ),
    },
    {
      id: "children",
      title: "Children",
      content: (
        <p>
          The Platform is intended for alumni aged 18 years or older. We do not knowingly create accounts for, or collect personal data
          from, anyone under 18. If you believe a child has provided us with personal data, please contact us and we will delete it.
        </p>
      ),
    },
    {
      id: "cookies",
      title: "Cookies and similar technologies",
      content: (
        <p>
          We use your browser's local storage and similar technologies to keep you signed in and to remember basic preferences, and
          Google Analytics for Firebase to measure usage. Our payment gateway may set its own cookies during checkout. You can clear or
          block these through your browser settings, but parts of the Platform, such as signing in, may then not work.
        </p>
      ),
    },
    {
      id: "third-party-links",
      title: "Third-party websites",
      content: (
        <p>
          The Platform may link to websites we do not operate, such as social-media profiles shared by members or map services. We are
          not responsible for the privacy practices of those websites and encourage you to read their policies.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
      content: (
        <p>
          We may update this policy from time to time. The “Last updated” date at the top shows when it was last revised. Material
          changes will be notified on the Platform. Your continued use of the Platform after an update means you accept the revised
          policy.
        </p>
      ),
    },
    {
      id: "grievance-officer",
      title: "Grievance Officer and contact",
      content: (
        <>
          <p>
            In accordance with the Information Technology Act, 2000, the rules made under it, and the DPDP Act, questions, requests and
            complaints about this policy or your personal data may be addressed to our Grievance Officer:
          </p>
          <ContactBlock contact={contact} heading={contact.grievance_officer ? `Grievance Officer: ${contact.grievance_officer}` : "Grievance Officer"} />
          <p>
            We will acknowledge your complaint and try to resolve it within the time prescribed by law. If you are not satisfied with
            our response, you may approach the Data Protection Board of India once it is operational.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How the BVB School Vadodara Alumni Association collects, uses and protects your personal data."
      intro={
        <p>
          Your privacy matters to us. This Privacy Policy describes the personal data we collect through this Platform, why we collect
          it, who we share it with and the choices and rights you have. By using the Platform you agree to the practices described
          here.
        </p>
      }
      sections={sections}
    />
  );
};

export default PrivacyPolicy;
