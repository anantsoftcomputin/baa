import { useEffect, useState } from "react";
import { getWebsiteContent } from "../../../../firebase/firestore";

/**
 * The Association's statutory details, as on its GST Registration Certificate
 * (Form GST REG-06, issued 12/02/2025). Used by the legal pages and the footer.
 */
export const ORGANISATION = {
  legalName: "BVB SCHOOL VADODARA ALUMNI ASSOCIATION",
  displayName: "BVB School Vadodara Alumni Association",
  shortName: "the Association",
  gstin: "24AAMCB2929C1ZX",
  constitution: "Private Limited Company",
  addressLines: [
    "Office 1-2, Lal Bhai Park Society",
    "Makarpura Road, Opp. Air Force Main Gate",
    "Makarpura, Vadodara, Gujarat 390014, India",
  ],
  jurisdiction: "Vadodara, Gujarat",
  website: "the BAA Alumni Portal",
};

export const REGISTERED_ADDRESS = ORGANISATION.addressLines.join(", ");

/** Date the current versions of the legal documents took effect. */
export const LEGAL_LAST_UPDATED = "5 October 2026";

export const LEGAL_PAGES = [
  { path: "/privacy-policy", label: "Privacy Policy" },
  { path: "/terms-and-conditions", label: "Terms & Conditions" },
  { path: "/refund-policy", label: "Refund & Cancellation Policy" },
];

/**
 * Official contact details, managed in Admin → Website content → Contact.
 * Empty fields stay empty: we never show placeholder contact data.
 */
export const useContactDetails = () => {
  const [contact, setContact] = useState({ email: "", phone: "", address: REGISTERED_ADDRESS, grievance_officer: "" });

  useEffect(() => {
    let alive = true;
    getWebsiteContent("contact")
      .then((c) => {
        if (!alive || !c) return;
        setContact((prev) => ({
          ...prev,
          email: (c.email || "").trim(),
          phone: (c.phone || "").trim(),
          address: (c.address || "").trim() || REGISTERED_ADDRESS,
          grievance_officer: (c.grievance_officer || "").trim(),
        }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return contact;
};
