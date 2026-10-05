import {
  formatCurrency,
  formatDateRange,
  formatTime,
  formatTimeRange,
  imageOf,
  initials,
  isUpcoming,
  slugify,
  timeAgo,
  toDate,
  truncate,
  externalUrl,
} from "./format";

describe("toDate", () => {
  it("handles Firestore timestamps, {seconds}, strings and junk", () => {
    const d = new Date("2024-05-01T10:00:00Z");
    expect(toDate({ toDate: () => d })).toBe(d);
    expect(toDate({ seconds: d.getTime() / 1000 }).getTime()).toBe(d.getTime());
    expect(toDate("2024-05-01").getFullYear()).toBe(2024);
    expect(toDate("not a date")).toBeNull();
    expect(toDate(null)).toBeNull();
  });
});

describe("formatTime", () => {
  it("converts 24h to 12h", () => {
    expect(formatTime("18:30")).toBe("6:30 PM");
    expect(formatTime("00:05")).toBe("12:05 AM");
    expect(formatTime("12:00")).toBe("12:00 PM");
  });
  it("is safe with missing or odd values", () => {
    expect(formatTime(undefined)).toBe("");
    expect(formatTime("TBA")).toBe("TBA");
    expect(formatTimeRange("09:00", "")).toBe("9:00 AM");
  });
});

describe("formatDateRange", () => {
  it("collapses identical dates", () => {
    expect(formatDateRange("2024-05-01", "2024-05-01")).toBe(formatDateRange("2024-05-01"));
  });
  it("joins different dates", () => {
    expect(formatDateRange("2024-05-01", "2024-05-03")).toContain("–");
  });
});

describe("timeAgo", () => {
  const now = new Date("2024-05-10T12:00:00Z");
  it("buckets durations", () => {
    expect(timeAgo(new Date("2024-05-10T11:59:50Z"), now)).toBe("Just now");
    expect(timeAgo(new Date("2024-05-10T11:30:00Z"), now)).toBe("30m ago");
    expect(timeAgo(new Date("2024-05-10T07:00:00Z"), now)).toBe("5h ago");
    expect(timeAgo(new Date("2024-05-08T12:00:00Z"), now)).toBe("2d ago");
  });
  it("treats missing values as just now", () => {
    expect(timeAgo(null, now)).toBe("Just now");
  });
});

describe("slugify", () => {
  it("makes URL-safe slugs", () => {
    expect(slugify("Annual Reunion 2024!")).toBe("annual-reunion-2024");
    expect(slugify("  Bhavan's   Day ")).toBe("bhavans-day");
    expect(slugify("")).toBe("item");
  });
});

describe("isUpcoming", () => {
  const now = new Date("2024-05-10T12:00:00");
  it("uses the end date when present", () => {
    expect(isUpcoming({ start_date: "2024-05-01", end_date: "2024-05-12" }, now)).toBe(true);
    expect(isUpcoming({ start_date: "2024-05-01", end_date: "2024-05-02" }, now)).toBe(false);
  });
  it("counts today as upcoming and undated events as upcoming", () => {
    expect(isUpcoming({ start_date: "2024-05-10" }, now)).toBe(true);
    expect(isUpcoming({}, now)).toBe(true);
  });
});

describe("misc helpers", () => {
  it("picks whichever image key a document uses", () => {
    expect(imageOf({ imageUrl: "a" })).toBe("a");
    expect(imageOf({ image: "b" })).toBe("b");
    expect(imageOf({ image_url: "c" })).toBe("c");
    expect(imageOf(null)).toBe("");
  });
  it("formats rupees", () => {
    expect(formatCurrency(2500)).toBe("₹2,500");
    expect(formatCurrency("abc")).toBe("");
  });
  it("builds initials", () => {
    expect(initials("Asha Patel")).toBe("AP");
    expect(initials("jigar@example.com")).toBe("JE");
    expect(initials("")).toBe("?");
  });
  it("truncates with an ellipsis", () => {
    expect(truncate("hello world", 5)).toBe("hello…");
    expect(truncate("hi", 5)).toBe("hi");
  });
  it("adds https to bare links", () => {
    expect(externalUrl("linkedin.com/in/x")).toBe("https://linkedin.com/in/x");
    expect(externalUrl("http://a.b")).toBe("http://a.b");
  });
});
