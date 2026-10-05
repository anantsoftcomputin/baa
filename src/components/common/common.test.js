import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme";
import EmptyState from "./EmptyState";
import SectionHeader from "./SectionHeader";
import EventCard, { eventFee } from "./EventCard";
import InitiativeCard, { fundingProgress } from "./InitiativeCard";

const wrap = (ui) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("EmptyState", () => {
  it("renders title, description and action", () => {
    wrap(<EmptyState title="Nothing here" description="Come back later" action={<button>Go</button>} />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Come back later")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
  });
});

describe("SectionHeader", () => {
  it("renders the heading as an h2", () => {
    wrap(<SectionHeader eyebrow="About" title="Who we are" subtitle="Since forever" />);
    expect(screen.getByRole("heading", { level: 2, name: "Who we are" })).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });
});

describe("EventCard", () => {
  const event = { id: "e1", name: "Annual Reunion", start_date: "2099-01-15", location: "Main Hall", amount: 500 };

  it("shows event details and fee, and opens on click", () => {
    const onOpen = jest.fn();
    wrap(<EventCard event={event} onOpen={onOpen} />);
    expect(screen.getByText("Annual Reunion")).toBeInTheDocument();
    expect(screen.getByText("Main Hall")).toBeInTheDocument();
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getByText("₹500")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View details" }));
    expect(onOpen).toHaveBeenCalled();
  });

  it("labels free and past events", () => {
    expect(eventFee({})).toBe("Free");
    wrap(<EventCard event={{ id: "e2", name: "Old Meetup", start_date: "2001-01-01" }} onOpen={() => {}} />);
    expect(screen.getByText("Past event")).toBeInTheDocument();
  });
});

describe("InitiativeCard", () => {
  it("computes and shows funding progress", () => {
    expect(fundingProgress({ total_funds_required: 1000, raised_amount: 250 })).toEqual({ goal: 1000, raised: 250, percent: 25 });
    expect(fundingProgress({ total_funds_required: 100, raised_amount: 500 }).percent).toBe(100);
    wrap(<InitiativeCard initiative={{ id: "i1", name: "Library Fund", purpose: "Books", total_funds_required: 1000, raised_amount: 250 }} onSupport={() => {}} />);
    expect(screen.getByText("Library Fund")).toBeInTheDocument();
    expect(screen.getByText("₹250")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /support this cause/i })).toBeInTheDocument();
  });
});
