/** Formatting helpers shared across the site. All are tolerant of missing/legacy data. */

/** Accepts a Firestore Timestamp, {seconds}, Date, ISO string or millis. */
export const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value === "object" && "seconds" in value) return new Date(value.seconds * 1000);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value, options = { day: "numeric", month: "short", year: "numeric" }) => {
  const d = toDate(value);
  return d ? d.toLocaleDateString("en-IN", options) : "";
};

export const formatDateRange = (start, end) => {
  const s = formatDate(start);
  const e = formatDate(end);
  if (!s) return e;
  if (!e || s === e) return s;
  return `${s} – ${e}`;
};

/** "18:30" -> "6:30 PM". Leaves anything it can't parse untouched. */
export const formatTime = (value) => {
  if (!value || typeof value !== "string") return "";
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;
  const hour = parseInt(match[1], 10);
  const minute = match[2];
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minute} ${suffix}`;
};

export const formatTimeRange = (start, end) => {
  const s = formatTime(start);
  const e = formatTime(end);
  if (!s) return e;
  return e ? `${s} – ${e}` : s;
};

export const timeAgo = (value, now = new Date()) => {
  const past = toDate(value);
  if (!past) return "Just now";
  const seconds = Math.max(0, Math.floor((now - past) / 1000));
  if (seconds < 45) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(past);
};

export const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "item";

/** Content items store their picture under different keys depending on who created them. */
export const imageOf = (item) =>
  item?.imageUrl || item?.image || item?.image_url || item?.event_banner || "";

export const formatCurrency = (value) => {
  const n = typeof value === "number" ? value : parseFloat(value);
  if (!Number.isFinite(n)) return "";
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

export const initials = (name) =>
  String(name || "?")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

/** Whether an event's start date is today or later. Events without a date count as upcoming. */
export const isUpcoming = (event, now = new Date()) => {
  const d = toDate(event?.end_date || event?.start_date);
  if (!d) return true;
  const endOfDay = new Date(d);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay >= now;
};

export const truncate = (text, max = 160) => {
  const s = String(text || "");
  return s.length > max ? `${s.slice(0, max).trimEnd()}…` : s;
};

/** Ensures a link opens externally even if an admin typed it without https://. */
export const externalUrl = (url) => {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};
