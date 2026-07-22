import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IncidentChat } from "./IncidentChat";

vi.mock("../hooks/useIncidents", () => ({ useIncidents: () => ({ analysis: {} }) }));
vi.mock("react-router-dom", () => ({ useParams: () => ({ id: "INC-BNK-1001" }) }));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("IncidentChat", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("adds a question, waits for a response, then shows its expandable details", async () => {
    vi.useFakeTimers();
    render(<IncidentChat isEnabled />);
    const input = screen.getByLabelText("Ask the incident assistant");
    const send = screen.getByRole("button", { name: "Send" });
    expect((send as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(input, { target: { value: "What should I change?" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("What should I change?")).toBeTruthy();
    expect(screen.getByText("Incident assistant is thinking…")).toBeTruthy();
    expect((send as HTMLButtonElement).disabled).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(350); });
    expect(screen.getByText(/Update RuleResponseMapper/)).toBeTruthy();
    fireEvent.click(screen.getByText("Response details"));
    expect(screen.getByText("INC-BNK-1001")).toBeTruthy();
    expect(screen.getByText("inspect_code_change_impact")).toBeTruthy();
  });

  it("does not submit whitespace or when Enter is used with Shift", () => {
    render(<IncidentChat isEnabled />);
    const input = screen.getByLabelText("Ask the incident assistant");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.queryByText("Incident assistant is thinking…")).toBeNull();
    fireEvent.change(input, { target: { value: "Line one" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(screen.queryByText("Incident assistant is thinking…")).toBeNull();
  });

  it("remains locked until AI analysis completes", () => {
    render(<IncidentChat isEnabled={false} />);
    expect(screen.getByText(/Complete “Analyze with AI”/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Send" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
