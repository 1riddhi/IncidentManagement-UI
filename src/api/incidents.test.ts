import { describe, expect, it } from "vitest";
import { normalizeIncident } from "./incidents";
import { filterIncidents } from "../utils/incident";
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
});
