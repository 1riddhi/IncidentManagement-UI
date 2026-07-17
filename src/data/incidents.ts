import type { Incident, IncidentStatus, Severity } from "../types/incident";

const catalog: Array<[string, string, Severity, IncidentStatus, string]> = [
  [
    "checkout-api",
    "API timeout surge during peak checkout traffic",
    "P1",
    "Open",
    "Connection Pool Exhaustion",
  ],
  [
    "payment-service",
    "Payment authorization requests failing intermittently",
    "P1",
    "Investigating",
    "Network Latency",
  ],
  [
    "auth-service",
    "JVM heap utilization above critical threshold",
    "P1",
    "Monitoring",
    "JVM OutOfMemory",
  ],
  [
    "mysql-cluster",
    "Order write transactions blocked by deadlocks",
    "P1",
    "Open",
    "Database Deadlock",
  ],
  [
    "kubernetes",
    "checkout worker pods in CrashLoopBackOff",
    "P1",
    "Investigating",
    "Deployment Failure",
  ],
  [
    "kafka-stream",
    "Consumer lag growing on order-events topic",
    "P2",
    "Open",
    "Kafka Consumer Lag",
  ],
  [
    "redis-cache",
    "Cache eviction rate exceeded operational threshold",
    "P2",
    "Monitoring",
    "Redis Cache Eviction",
  ],
  [
    "inventory-service",
    "Inventory reservation API response degradation",
    "P2",
    "Investigating",
    "High CPU",
  ],
  [
    "gateway-service",
    "TLS certificate approaching expiry window",
    "P2",
    "Open",
    "TLS Certificate Expiry",
  ],
  [
    "postgres-db",
    "Analytics query workload saturating primary database",
    "P2",
    "Monitoring",
    "High CPU",
  ],
  [
    "order-service",
    "Order confirmation requests intermittently timing out",
    "P2",
    "Investigating",
    "API Timeout",
  ],
  [
    "elasticsearch",
    "Search index volume crossed disk watermark",
    "P2",
    "Open",
    "Disk Full",
  ],
  [
    "notification-service",
    "Email notification queue processing delayed",
    "P3",
    "Open",
    "Kafka Consumer Lag",
  ],
  [
    "checkout-api",
    "Memory growth detected in checkout worker fleet",
    "P3",
    "Monitoring",
    "Memory Leak",
  ],
  [
    "auth-service",
    "Login token validation latency elevated",
    "P3",
    "Resolved",
    "Network Latency",
  ],
  [
    "payment-service",
    "Card gateway retry volume increased",
    "P3",
    "Resolved",
    "API Timeout",
  ],
  [
    "inventory-service",
    "Inventory sync deployment rolled back",
    "P3",
    "Resolved",
    "Deployment Failure",
  ],
  [
    "order-service",
    "Order event serializer CPU utilization high",
    "P3",
    "Monitoring",
    "High CPU",
  ],
  [
    "mysql-cluster",
    "Read replica connection pool nearing capacity",
    "P3",
    "Open",
    "Connection Pool Exhaustion",
  ],
  [
    "kubernetes",
    "Batch processing node disk pressure detected",
    "P3",
    "Resolved",
    "Disk Full",
  ],
  [
    "redis-cache",
    "Session cache hit rate below baseline",
    "P4",
    "Monitoring",
    "Redis Cache Eviction",
  ],
  [
    "gateway-service",
    "Upstream routing retry rate elevated",
    "P4",
    "Resolved",
    "Network Latency",
  ],
  [
    "postgres-db",
    "Long-running reporting query identified",
    "P4",
    "Resolved",
    "Database Deadlock",
  ],
  [
    "elasticsearch",
    "Indexing throughput below service objective",
    "P4",
    "Open",
    "High CPU",
  ],
  [
    "notification-service",
    "Push delivery worker memory threshold reached",
    "P4",
    "Monitoring",
    "Memory Leak",
  ],
  [
    "kafka-stream",
    "Consumer group rebalance frequency increased",
    "P4",
    "Resolved",
    "Kafka Consumer Lag",
  ],
  [
    "checkout-api",
    "Checkout canary deployment health check failed",
    "P3",
    "Resolved",
    "Deployment Failure",
  ],
  [
    "auth-service",
    "Authentication redis connection retries observed",
    "P4",
    "Open",
    "Connection Pool Exhaustion",
  ],
];
const dates = [
  17, 17, 17, 16, 16, 16, 15, 15, 14, 14, 13, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4,
  3, 2, 1, 1, 1, 1, 1,
];
const resolutions: Record<string, string> = {
  "Connection Pool Exhaustion":
    "Increase pool capacity, terminate stuck connections, and add saturation alerts.",
  "Network Latency":
    "Route traffic to healthy upstreams and tune timeout and retry budgets.",
  "JVM OutOfMemory":
    "Restart affected pods, raise heap limits, and capture heap dumps for remediation.",
  "Database Deadlock":
    "Terminate conflicting transactions and deploy ordered write retries.",
  "Deployment Failure":
    "Rollback the release, validate configuration, then restart progressive delivery.",
  "Kafka Consumer Lag":
    "Scale consumers, rebalance partitions, and inspect slow message handlers.",
  "Redis Cache Eviction":
    "Increase cache headroom and tune eviction policy for the workload.",
  "High CPU":
    "Scale replicas and profile the expensive request path before applying a code fix.",
  "TLS Certificate Expiry":
    "Rotate the certificate and automate renewal validation.",
  "API Timeout":
    "Increase capacity, isolate slow dependencies, and apply bounded retries.",
  "Disk Full":
    "Expand storage, remove stale indices, and configure watermark alerts.",
  "Memory Leak":
    "Recycle affected instances and prioritize the identified allocation leak.",
};
export const incidents: Incident[] = catalog.map(
  ([service, title, severity, status, root], index) => {
    const number = 1001 - index;
    const day = String(dates[index]).padStart(2, "0");
    const createdDate = `2026-07-${day}T${String(9 + (index % 10)).padStart(2, "0")}:${String((index * 7) % 60).padStart(2, "0")}:00Z`;
    return {
      id: `INC-${number}`,
      title,
      service,
      severity,
      status,
      createdDate,
      symptoms: `${service} telemetry shows elevated error rate, increased request latency, and breached service-level indicators.`,
      rootCause: `AI correlation indicates ${root.toLowerCase()} in ${service}, aligned with the onset of the production impact.`,
      resolution: resolutions[root],
      confidence: Math.max(72, 94 - (index % 19)),
      reasoning: [
        `Metrics changed immediately after a correlated ${service} signal.`,
        `Pattern matches prior ${root.toLowerCase()} incidents in the operational knowledge base.`,
        "No upstream dependency anomaly explains the full error signature.",
      ],
      timeline: [
        "Traffic spike detected",
        "Resource saturation observed",
        root,
        "Customer API timeouts",
        "Incident created",
        "Mitigation in progress",
      ].map((event, eventIndex) => ({
        title: event,
        description:
          eventIndex === 2
            ? `AI linked anomalous signals to ${root.toLowerCase()}.`
            : "Correlated signal recorded by the operations platform.",
        time: `${String(9 + eventIndex).padStart(2, "0")}:${String(10 + eventIndex * 7).padStart(2, "0")} UTC`,
      })),
      related: Array.from({ length: 3 }, (_, relatedIndex) => ({
        id: `INC-${912 - relatedIndex * 17}`,
        title: `${root} on ${service}`,
        similarity: 92 - relatedIndex * 6,
        status:
          relatedIndex === 0
            ? "Resolved"
            : relatedIndex === 1
              ? "Monitoring"
              : "Investigating",
      })),
    };
  },
);
export const trendData = [
  { day: "Mon", incidents: 8 },
  { day: "Tue", incidents: 12 },
  { day: "Wed", incidents: 15 },
  { day: "Thu", incidents: 10 },
  { day: "Fri", incidents: 18 },
];
export const severityData = [
  { name: "P1", value: 5 },
  { name: "P2", value: 9 },
  { name: "P3", value: 10 },
  { name: "P4", value: 18 },
];
