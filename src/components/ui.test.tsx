import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Header } from "./ui";

vi.mock("../hooks/useIncidents", () => ({
  useIncidents: () => ({
    incidents: [{
      id: "INC123", title: "Payment validation failure", service: "payment-service", severity: "P1", status: "Open",
      symptoms: "Validation error", rootCause: null, resolution: null, logs: null, createdAt: "2026-07-22 10:00:00",
      updatedAt: "2026-07-22 10:00:00", resolvedAt: null, attachments: [], source: "active",
    }],
  }),
}));

function LocationDisplay() {
  const location = useLocation();
  return <output>{`${location.pathname}${location.search}`}</output>;
}

describe("Header search", () => {
  it("hydrates from the URL and opens a selected result directly", () => {
    render(
      <MemoryRouter initialEntries={["/incident/INC123?q=payment"]}>
        <Routes>
          <Route path="*" element={<><Header /><LocationDisplay /></>} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText("Search incidents") as HTMLInputElement;
    expect(input.value).toBe("payment");
    expect(screen.getByRole("listbox", { name: "Incident search results" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /INC123.*Payment validation failure/i }));
    expect(screen.getByText("/incident/INC123")).toBeTruthy();
  });
});
