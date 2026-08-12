import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  "MEDICATION",
  "REPLENISHMENT_REQUEST",
  "LAB_TEST_ORDER",
];

const PAGE_SIZE = 50;

function AuditLogs() {
  const navigate = useNavigate();
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
      return `${event.actor.firstName} ${event.actor.lastName}`;
    }
    if (event.actorUserId != null) {
      return `User #${event.actorUserId}`;
    }
    return "—";
  };

  const metadataLines = (metadata: AuditEvent["metadata"]) => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return null;
    }

    return Object.entries(metadata).map(([key, value]) => (
      <div key={key} className="audit-meta-line">
        <span className="audit-meta-key">{key}</span>
        <span className="audit-meta-value">
          {value === null || value === undefined
            ? "—"
            : String(value)}
        </span>
      </div>
    ));
  };

  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;
  const rangeStart = events.length === 0 ? 0 : offset + 1;
  const rangeEnd = offset + events.length;

  const applyFilters = () => {
    setOffset(0);
    loadEvents();
  };

  return (
    <div className="patients-page">
      <header className="patients-header">
        <div>
          <h1>Audit Logs</h1>
          <p>
            Operational trail of important clinical and business
            mutations. Events are append-only and cannot be edited.
          </p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="patients-content">
        <div className="patients-card">
          <section className="patient-details-section">
            <div className="section-heading-row">
              <div>
                <h3>Filters</h3>
                <p className="section-description">
                  Narrow the trail by action, entity, or actor. Apply
                  after editing ID fields.
                </p>
              </div>
            </div>

            <div className="patient-edit-grid audit-filter-grid">
              <div className="form-group">
                <label htmlFor="audit-action-filter">Action</label>
                <select
                  id="audit-action-filter"
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
              </div>

              <div className="form-group">
                <label htmlFor="audit-entity-filter">Entity type</label>
                <select
                  id="audit-entity-filter"
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
              </div>

              <div className="form-group">
                <label htmlFor="audit-entity-id-filter">Entity ID</label>
                <input
                  id="audit-entity-id-filter"
                  type="text"
                  inputMode="numeric"
                  value={entityIdFilter}
                  onChange={(e) => setEntityIdFilter(e.target.value)}
                  placeholder="e.g. 12"
                />
              </div>

              <div className="form-group">
                <label htmlFor="audit-actor-id-filter">Actor user ID</label>
                <input
                  id="audit-actor-id-filter"
                  type="text"
                  inputMode="numeric"
                  value={actorUserIdFilter}
                  onChange={(e) => setActorUserIdFilter(e.target.value)}
                  placeholder="e.g. 1"
                />
              </div>
            </div>

            <div className="audit-filter-actions">
              <button
                type="button"
                className="primary-button"
                onClick={applyFilters}
              >
                Apply filters
              </button>
            </div>
          </section>

          {error && (
            <div className="auth-error" style={{ margin: "0 30px 20px" }}>
              {error}
            </div>
          )}

          <section className="patient-details-section">
            <div className="section-heading-row">
              <div>
                <h3>Events</h3>
                <p className="section-description">
                  Newest first. Showing {rangeStart}–{rangeEnd} of {total}.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading audit events…</div>
            ) : events.length === 0 ? (
              <div className="empty-state">No audit events found.</div>
            ) : (
              <div className="table-container">
                <table>
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
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td>
                          {new Date(event.occurredAt).toLocaleString()}
                        </td>
                        <td>
                          <strong>{actorLabel(event)}</strong>
                          {event.actorUserId != null && (
                            <small>ID {event.actorUserId}</small>
                          )}
                        </td>
                        <td>
                          <span className="status-badge">
                            {event.actorRole}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge">
                            {event.action}
                          </span>
                        </td>
                        <td>{event.entityType}</td>
                        <td>
                          <strong>{event.entityId}</strong>
                        </td>
                        <td className="audit-details-cell">
                          {metadataLines(event.metadata) ?? (
                            <span className="audit-meta-empty">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && (
              <div className="audit-pagination">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={!canPrev}
                  onClick={() =>
                    setOffset(Math.max(0, offset - PAGE_SIZE))
                  }
                >
                  Previous
                </button>
                <span className="audit-pagination-label">
                  Page{" "}
                  {Math.floor(offset / PAGE_SIZE) + 1}
                  {total > 0
                    ? ` of ${Math.max(1, Math.ceil(total / PAGE_SIZE))}`
                    : ""}
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
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default AuditLogs;
