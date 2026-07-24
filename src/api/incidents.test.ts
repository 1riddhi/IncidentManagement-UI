import { describe, expect, it, vi } from "vitest";
import { analyzeIncident, normalizeIncident } from "./incidents";
import { confidenceLevel, filterIncidents } from "../utils/incident";
import type { Incident, ServiceNowIncident } from "../types/incident";

const fixture: ServiceNowIncident = {
  id: "INC0010009", title: "Payment latency", service: "payment-service", severity: "P2",
  symptoms: "Timeouts", createdAt: "2026-07-20 00:29:28", updatedAt: "2026-07-20 01:29:28",
  resolvedAt: null, rootCause: null, resolution: null, logs: null, attachments: [],
};

describe("live incident normalization", () => {
  it("derives operational status by API source and preserves raw API fields", () => {
    const active = normalizeIncident(fixture, "active");
    const historical = normalizeIncident({ ...fixture, resolvedAt: "2026-07-20 02:00:00" }, "historical");
    expect(active.status).toBe("Open");
    expect(historical.status).toBe("Resolved");
    expect(historical.resolvedAt).toBe("2026-07-20 02:00:00");
  });

  it("supports current time ranges and all-time history", () => {
    const recent = normalizeIncident(fixture, "active");
    const archived: Incident = normalizeIncident({ ...fixture, id: "INC0000060", createdAt: "2016-12-12 07:19:57" }, "historical");
    expect(filterIncidents([recent, archived], "", "all")).toHaveLength(2);
    expect(filterIncidents([recent, archived], "", 30)).toHaveLength(1);
    expect(filterIncidents([recent], "payment", "all")).toHaveLength(1);
  });

  it("matches all search words across operational fields and bypasses the date range", () => {
    const archived = normalizeIncident({
      ...fixture,
      id: "INC0000060",
      createdAt: "2016-12-12 07:19:57",
      logs: "Risk engine rejected payment 123",
      rootCause: "Upstream payment validation timeout",
    } as ServiceNowIncident, "historical");

    expect(filterIncidents([archived], "PAYMENT TIMEOUT", 5)).toEqual([archived]);
    expect(filterIncidents([archived], "P2 resolved", 5)).toEqual([archived]);
    expect(filterIncidents([archived], "payment missing", "all")).toEqual([]);
    expect(filterIncidents([archived], "risk 123", "all")).toEqual([archived]);
  });

  it("maps confidence score thresholds to the intended labels", () => {
    expect(confidenceLevel(3).label).toBe("Low");
    expect(confidenceLevel(4).label).toBe("Moderate");
    expect(confidenceLevel(7).label).toBe("High");
    expect(confidenceLevel(9).label).toBe("Very high");
  });

  it("accepts the current analyze API response and derives a recommendation from its summary", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      analysisId: "analysis-1",
      incomingIncident: { id: "INC456", logs: "Validation failed" },
      similarIncidents: [],
      agentFindings: [{ agentName: "RcaGraphAgent", status: "RCA_COMPLETED", summary: "RCA completed", evidence: "Log evidence" }],
      summary: "The validation service contains a hardcoded failure.",
      nextActionSteps: ["Verify the deployed image."],
      rca: ["A hardcoded conditional throws the validation exception."],
      codeChanges: {
        repository: "owner/validation-service",
        filePath: "src/Validator.java",
        baseBranch: "main",
        proposedCode: "class Validator { void validate() {} }",
        codeChanges: "--- a/src/Validator.java\n+++ b/src/Validator.java\n@@ -1 +1 @@\n-class Validator {}\n+class Validator { void validate() {} }\n",
      },
      evidenceSummary: "Repository evidence matches the incident log.",
      agentFlow: [{ agentName: "RcaGraphAgent", status: "COMPLETED" }],
      confidence: {
        rca: { score: 8, reason: "Logs and deployment evidence agree." },
        recommendation: { score: 11, reason: "Invalid score should be ignored." },
      },
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await analyzeIncident(fixture);

    expect(response.analysisId).toBe("analysis-1");
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8000/api/v1/incidents/analyze");
    expect(response.recommendation).toContain("The validation service contains a hardcoded failure.");
    expect(response.recommendation).toContain("Verify the deployed image.");
    expect(response.rca).toHaveLength(1);
    expect(response.codeChanges).toMatchObject({ repository: "owner/validation-service", filePath: "src/Validator.java", baseBranch: "main" });
    expect(response.agentFlow).toEqual([{ agentName: "RcaGraphAgent", status: "COMPLETED" }]);
    expect(response.confidence).toEqual({ rca: { score: 8, reason: "Logs and deployment evidence agree." }, recommendation: undefined });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      incident: {
        id: fixture.id,
        title: fixture.title,
        service: fixture.service,
        severity: fixture.severity,
        symptoms: fixture.symptoms,
        logs: "",
      },
      limit: 3,
    });
    vi.unstubAllGlobals();
  });
});
