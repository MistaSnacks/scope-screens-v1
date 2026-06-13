import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketPicker } from "./ticket-picker";

const TIERS = [
  { id: "ga", name: "General Admission", priceAmount: 22, priceLabel: "$22.00", currency: "USD", limit: 2, free: false },
];

describe("TicketPicker", () => {
  it("increments quantity up to the limit and reports changes", async () => {
    const onChange = vi.fn();
    render(<TicketPicker tiers={TIERS} quantities={{}} onChange={onChange} />);

    const plus = screen.getByRole("button", { name: /increase general admission/i });
    await userEvent.click(plus);
    expect(onChange).toHaveBeenLastCalledWith("ga", 1);
  });

  it("disables increment at the per-checkout limit", async () => {
    render(<TicketPicker tiers={TIERS} quantities={{ ga: 2 }} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /increase general admission/i })).toBeDisabled();
  });
});
