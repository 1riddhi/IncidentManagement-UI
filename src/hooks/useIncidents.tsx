import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  analyzeIncident,
  fetchActiveIncidents,
  fetchHistoricalIncidents,
  toTimestamp,
} from "../api/incidents";
import type {
  Incident,
  IncidentAnalysisState,
  IncidentSource,
  ServiceNowIncident,
} from "../types/incident";

type SourceErrors = Partial<Record<"active" | "historical", string>>;
interface IncidentStore {
  incidents: Incident[];
  loading: boolean;
  errors: SourceErrors;
  analysis: Record<string, IncidentAnalysisState>;
  runAnalysis: (incident: Incident) => Promise<void>;
  refetch: () => void;
}
const IncidentContext = createContext<IncidentStore | undefined>(undefined);

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [errors, setErrors] = useState<SourceErrors>({});
  const [loading, setLoading] = useState(true);
  const [requestId, setRequestId] = useState(0);
  const [analysis, setAnalysis] = useState<Record<string, IncidentAnalysisState>>({});
  const pendingAnalysis = useRef(new Set<string>());
  const refetch = useCallback(() => setRequestId((value) => value + 1), []);

  const runAnalysis = useCallback(async (incident: Incident) => {
    if (pendingAnalysis.current.has(incident.id)) return;
    pendingAnalysis.current.add(incident.id);

    setAnalysis((prev) => ({
      ...prev,
      [incident.id]: { status: "loading" },
    }));

    try {
      const { status, source, ...serviceNowPayload } = incident;
      const response = await analyzeIncident(
        serviceNowPayload as ServiceNowIncident,
        3,
      );

      setAnalysis((prev) => ({
        ...prev,
        [incident.id]: { status: "success", response },
      }));
    } catch (error) {
      setAnalysis((prev) => ({
        ...prev,
        [incident.id]: {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Unable to analyze incident",
        },
      }));
    } finally {
      pendingAnalysis.current.delete(incident.id);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setErrors({});
    Promise.allSettled([
      fetchActiveIncidents(controller.signal),
      fetchHistoricalIncidents(controller.signal),
    ]).then((results) => {
      if (controller.signal.aborted) return;
      const nextErrors: SourceErrors = {};
      const loaded = results.flatMap((result, index) => {
        const source = index === 0 ? "active" : "historical";
        if (result.status === "fulfilled") return result.value;
        nextErrors[source] = result.reason instanceof Error ? result.reason.message : `Unable to load ${source} incidents`;
        return [];
      });
      setIncidents(loaded.sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)));
      setErrors(nextErrors);
      setLoading(false);
    });
    return () => controller.abort();
  }, [requestId]);

  const value = useMemo(
    () => ({ incidents, loading, errors, analysis, runAnalysis, refetch }),
    [incidents, loading, errors, analysis, runAnalysis, refetch],
  );
  return <IncidentContext.Provider value={value}>{children}</IncidentContext.Provider>;
}

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (!context) throw new Error("useIncidents must be used within IncidentProvider");
  return context;
}
