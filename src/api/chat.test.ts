import { describe, expect, it } from "vitest";
import { requestChatResponse } from "./chat";

describe("requestChatResponse", () => {
  it("returns the supplied chat response contract", async () => {
    const response = await requestChatResponse("What should I change?");
    expect(response.answer).toContain("RuleResponseMapper");
    expect(response.sources).toEqual(expect.arrayContaining(["INC-BNK-1001"]));
    expect(response.newFindings[0]).toMatchObject({ agentName: "CodeChangeImpactAgent", status: "CODE_IMPACT_FOUND" });
    expect(response.agentCalls).toEqual(["inspect_code_change_impact"]);
  });
});
