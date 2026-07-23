import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IncidentChat } from "./IncidentChat";

const { requestChatResponse } = vi.hoisted(() => ({ requestChatResponse: vi.fn() }));
vi.mock("../api/chat", () => ({ requestChatResponse }));
vi.mock("../hooks/useIncidents", () => ({ useIncidents: () => ({ analysis: { "INC-BNK-1001": { status: "success", response: { analysisId: "analysis-1" } } } }) }));
vi.mock("react-router-dom", () => ({ useParams: () => ({ id: "INC-BNK-1001" }) }));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("IncidentChat", () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it("sends messages to the analysis session and renders the assistant answer", async () => {
    requestChatResponse.mockResolvedValue({ answer: "Check the release.", agentSummary: "No release found.", evidenceSummary: "CI/CD logs are missing.", codeChanges: "public void validate() {}" });
    render(<IncidentChat/>);
    const input = screen.getByLabelText("Ask the incident assistant");
    fireEvent.change(input, { target: { value: "What should I check?" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("Incident assistant is thinking…")).toBeTruthy();
    await act(async () => {});
    expect(requestChatResponse).toHaveBeenCalledWith("analysis-1", "What should I check?");
    expect(screen.getByText("Check the release.")).toBeTruthy();
    expect(screen.getByText("What the system checked")).toBeTruthy();
    expect(screen.getByText("public void validate() {}")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copy code changes" })).toBeTruthy();
    expect(screen.queryByText("Evidence summary")).toBeNull();
  });

  it("keeps chat locked when analysis is not complete", () => {
    render(<IncidentChat isEnabled={false}/>);
    expect(screen.getByText(/Complete “Analyze with AI”/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Send" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("expands into a floating window and minimizes back to the sidebar", async () => {
    vi.useFakeTimers();
    render(<IncidentChat isEnabled />);
    fireEvent.click(screen.getByRole("button", { name: "Expand assistant window" }));
    expect(screen.getByRole("button", { name: "Minimize assistant window" })).toBeTruthy();
    expect(screen.getByLabelText("Incident assistant window").getAttribute("aria-modal")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Minimize assistant window" }));
    await act(async () => { await vi.advanceTimersByTimeAsync(220); });
    expect(screen.getByRole("button", { name: "Expand assistant window" })).toBeTruthy();
  });
});
