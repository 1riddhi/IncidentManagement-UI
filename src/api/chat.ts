import type { ChatResponse } from "../types/incident";

const mockResponse: ChatResponse = {
  answer: "Update RuleResponseMapper to resolve rules by rule name instead of a positional index. Add tests for an empty rule list, an unknown rule name, and reordered rule responses.",
  sources: ["INC-BNK-1001", "transaction-validation-service/src/main/java/.../RuleResponseMapper.java"],
  newFindings: [{ agentName: "CodeChangeImpactAgent", status: "CODE_IMPACT_FOUND", summary: "Potentially affected approved files: RuleResponseMapper.java." }],
  agentCalls: ["inspect_code_change_impact"],
};

/** Temporary chat transport until the incident chat backend is available. */
export function requestChatResponse(_question: string): Promise<ChatResponse> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(mockResponse)), 350);
  });
}
