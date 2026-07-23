import { afterEach, describe, expect, it, vi } from "vitest";
import { requestChatResponse } from "./chat";

describe("requestChatResponse", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("posts the message to the analysis-specific session and returns only chat fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      answer: "Investigate the release pipeline.",
      agentSummary: "No successful deployment was found.",
      evidenceSummary: "Deployment evidence is incomplete.",
      sources: ["ignored"],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestChatResponse("analysis/test", "What should I check?")).resolves.toEqual({
      answer: "Investigate the release pipeline.",
      agentSummary: "No successful deployment was found.",
      evidenceSummary: "Deployment evidence is incomplete.",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/analysis-sessions/analysis%2Ftest/chat"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ message: "What should I check?" }) }),
    );
  });

  it("rejects malformed responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ agentSummary: "missing answer" }), { status: 200 })));
    await expect(requestChatResponse("analysis-1", "Hello")).rejects.toThrow("invalid response");
  });
});
