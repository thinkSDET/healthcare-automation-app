import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface AuditActor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuditEvent {
  id: number;
  occurredAt: string;
  actorUserId: number | null;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: number;
  metadata?: Record<string, unknown> | null;
  actor?: AuditActor | null;
}

const ACTIONS = [
  "ALL",
  "CREATE",
  "UPDATE",
  "STATUS_CHANGE",
  "APPROVE",
  "REJECT",
  "CANCEL",
  "DELETE",
];

const ENTITY_TYPES = [
  "ALL",
  "PATIENT",
  "APPOINTMENT",
  "APPOINTMENT_REQUEST",
  "PRESCRIPTION",
  "REFILL_REQUEST",
  "ORDER",
];

const PAGE_SIZE = 50;

function AuditLogs() {
  const { token } = useAuth();

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityTypeFilter, setEntityTypeFilter] = useState("ALL");
  const [entityIdFilter, setEntityIdFilter] = useState("");
  const [actorUserIdFilter, setActorUserIdFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () =>
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));

      if (actionFilter !== "ALL") {
        params.set("action", actionFilter);
      }
      if (entityTypeFilter !== "ALL") {
        params.set("entityType", entityTypeFilter);
      }
      if (entityIdFilter.trim()) {
        params.set("entityId", entityIdFilter.trim());
      }
      if (actorUserIdFilter.trim()) {
        params.set("actorUserId", actorUserIdFilter.trim());
      }

      const response = await fetch(
        `http://localhost:4000/api/audit-events?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load audit events"
        );
      }

      setEvents(result.data || []);
      setTotal(result.meta?.total ?? 0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load audit events"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [offset, actionFilter, entityTypeFilter]);

  const actorLabel = (event: AuditEvent) => {
    if (event.actor) {
      return `${event.actor.firstName} ${event.actor.lastName} (#${event.actorUserId})`;
    }
    if (event.actorUserId != null) {
      return `User #${event.actorUserId}`;
    }
    return "—";
  };

  const metadataText = (metadata: AuditEvent["metadata"]) => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return "—";
    }
    return JSON.stringify(metadata);
  };

  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Audit Logs</h1>
        <p>Operational trail of important clinical and business mutations</p>
      </header>

      <main className="page-content">
        <div className="filter-row" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <label>
            Action{" "}
            <select
              value={actionFilter}
              onChange={(e) => {
                setOffset(0);
                setActionFilter(e.target.value);
              }}
            >
              {ACTIONS.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </label>

          <label>
            Entity{" "}
            <select
              value={entityTypeFilter}
              onChange={(e) => {
                setOffset(0);
                setEntityTypeFilter(e.target.value);
              }}
            >
              {ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Entity ID{" "}
            <input
              value={entityIdFilter}
              onChange={(e) => setEntityIdFilter(e.target.value)}
              placeholder="e.g. 12"
              style={{ width: "6rem" }}
            />
          </label>

          <label>
            Actor User ID{" "}
            <input
              value={actorUserIdFilter}
              onChange={(e) => setActorUserIdFilter(e.target.value)}
              placeholder="e.g. 1"
              style={{ width: "6rem" }}
            />
          </label>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setOffset(0);
              loadEvents();
            }}
          >
            Apply
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
        {loading && <p>Loading audit events…</p>}

        {!loading && !error && (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Actor</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Entity ID</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No audit events found</td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event.id}>
                        <td>{new Date(event.occurredAt).toLocaleString()}</td>
                        <td>{actorLabel(event)}</td>
                        <td>{event.actorRole}</td>
                        <td>{event.action}</td>
                        <td>{event.entityType}</td>
                        <td>{event.entityId}</td>
                        <td>
                          <code style={{ fontSize: "0.85em" }}>
                            {metadataText(event.metadata)}
                          </code>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                marginTop: "1rem",
              }}
            >
              <button
                type="button"
                className="secondary-button"
                disabled={!canPrev}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </button>
              <span>
                Showing {events.length === 0 ? 0 : offset + 1}–
                {offset + events.length} of {total}
              </span>
              <button
                type="button"
                className="secondary-button"
                disabled={!canNext}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AuditLogs;
