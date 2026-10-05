import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { ORGANISATION } from "./organisation";

/**
 * The Association's contact particulars for use inside legal text. Only details
 * that have actually been configured are shown; the contact form is always offered.
 */
const ContactBlock = ({ contact, heading }) => (
  <p>
    {heading && (
      <>
        <strong>{heading}</strong>
        <br />
      </>
    )}
    {ORGANISATION.legalName}
    <br />
    {contact.address}
    <br />
    {contact.email && (
      <>
        Email: <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <br />
      </>
    )}
    {contact.phone && (
      <>
        Phone: <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
        <br />
      </>
    )}
    Online: <RouterLink to="/contact">Contact form</RouterLink>
  </p>
);

export default ContactBlock;
