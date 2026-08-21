/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ContextualBackLink from "../components/ContextualBackLink";

interface RegistrationRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  createdAt: string;
}

function DoctorRegistrationRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rejectingRequest, setRejectingRequest] =
    useState<RegistrationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/doctors/registration-requests");
      setRequests(response.data?.data ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load doctor registration requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const approveRequest = async (requestId: number) => {
    try {
      setActionId(requestId);
      setError("");
      setSuccess("");

      await api.patch(
        `/doctors/registration-requests/${requestId}/approve`
      );

      setSuccess("Doctor registration approved successfully.");
      await fetchRequests();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to approve doctor registration."
      );
    } finally {
      setActionId(null);
    }
  };

  const rejectRequest = async () => {
    if (!rejectingRequest) return;

    try {
      setActionId(rejectingRequest.id);
      setError("");
      setSuccess("");

      await api.patch(
        `/doctors/registration-requests/${rejectingRequest.id}/reject`,
        {
          rejectionReason: rejectionReason.trim() || undefined,
        }
      );

      setSuccess("Doctor registration rejected.");
      setRejectingRequest(null);
      setRejectionReason("");
      await fetchRequests();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to reject doctor registration."
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#f5f7fa",
        padding: "28px 32px 40px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "24px",
            marginBottom: "28px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/doctors")}
                style={{
                  border: 0,
                  background: "transparent",
                  padding: 0,
                  color: "#0f766e",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Doctors
              </button>
              <span>/</span>
              <span>Registration Requests</span>
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                lineHeight: 1.2,
                color: "#0f172a",
                fontWeight: 700,
              }}
            >
              Doctor Registration Requests
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Review and approve doctors who created an account themselves.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/doctors")}
            style={{
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              borderRadius: "7px",
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ← Back to Doctors
          </button>
        </div>

        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              fontSize: "14px",
            }}
          >
            {success}
          </div>
        )}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "17px",
                  fontWeight: 700,
                }}
              >
                Pending Registrations
              </h2>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Approve to create the Doctor record and activate the user.
              </p>
            </div>

            <div
              style={{
                padding: "7px 11px",
                borderRadius: "999px",
                background: "#f0fdfa",
                color: "#0f766e",
                fontSize: "12px",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {requests.filter((request) => request.status === "PENDING").length}{" "}
              Pending
            </div>
          </div>

          {loading ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Loading doctor registration requests...
            </div>
          ) : requests.length === 0 ? (
            <div
              style={{
                padding: "56px 24px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                No registration requests
              </div>
              <div style={{ fontSize: "13px" }}>
                New doctor self-registrations will appear here.
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  minWidth: "1000px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {[
                      "Doctor",
                      "Contact",
                      "Specialization",
                      "License",
                      "Experience",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          textAlign: "left",
                          padding: "13px 16px",
                          borderBottom: "1px solid #e2e8f0",
                          color: "#64748b",
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {requests.map((request) => {
                    const isPending = request.status === "PENDING";

                    return (
                      <tr
                        key={request.id}
                        style={{
                          borderBottom: "1px solid #eef2f7",
                        }}
                      >
                        <td style={{ padding: "16px" }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#0f172a",
                              fontSize: "13px",
                            }}
                          >
                            {request.firstName} {request.lastName}
                          </div>
                          <div
                            style={{
                              marginTop: "4px",
                              color: "#94a3b8",
                              fontSize: "11px",
                            }}
                          >
                            Request #{request.id}
                          </div>
                        </td>

                        <td style={{ padding: "16px" }}>
                          <div
                            style={{
                              color: "#334155",
                              fontSize: "12px",
                            }}
                          >
                            {request.email}
                          </div>
                          <div
                            style={{
                              marginTop: "4px",
                              color: "#64748b",
                              fontSize: "12px",
                            }}
                          >
                            {request.phone}
                          </div>
                        </td>

                        <td
                          style={{
                            padding: "16px",
                            color: "#334155",
                            fontSize: "12px",
                          }}
                        >
                          {request.specialization}
                        </td>

                        <td
                          style={{
                            padding: "16px",
                            color: "#334155",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {request.licenseNumber}
                        </td>

                        <td
                          style={{
                            padding: "16px",
                            color: "#334155",
                            fontSize: "12px",
                          }}
                        >
                          {request.experience} years
                        </td>

                        <td style={{ padding: "16px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "5px 9px",
                              borderRadius: "999px",
                              fontSize: "10px",
                              fontWeight: 800,
                              letterSpacing: "0.03em",
                              background:
                                request.status === "PENDING"
                                  ? "#fff7ed"
                                  : request.status === "APPROVED"
                                    ? "#ecfdf5"
                                    : "#fef2f2",
                              color:
                                request.status === "PENDING"
                                  ? "#c2410c"
                                  : request.status === "APPROVED"
                                    ? "#047857"
                                    : "#b91c1c",
                            }}
                          >
                            {request.status}
                          </span>
                        </td>

                        <td style={{ padding: "16px" }}>
                          {isPending ? (
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                              }}
                            >
                              <button
                                type="button"
                                disabled={actionId === request.id}
                                onClick={() => approveRequest(request.id)}
                                style={{
                                  border: 0,
                                  background: "#0f8f87",
                                  color: "#ffffff",
                                  borderRadius: "6px",
                                  padding: "8px 13px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  cursor:
                                    actionId === request.id
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    actionId === request.id ? 0.65 : 1,
                                }}
                              >
                                {actionId === request.id
                                  ? "Processing..."
                                  : "Approve"}
                              </button>

                              <button
                                type="button"
                                disabled={actionId === request.id}
                                onClick={() => {
                                  setRejectingRequest(request);
                                  setRejectionReason("");
                                }}
                                style={{
                                  border: "1px solid #fecaca",
                                  background: "#ffffff",
                                  color: "#dc2626",
                                  borderRadius: "6px",
                                  padding: "7px 13px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  cursor:
                                    actionId === request.id
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    actionId === request.id ? 0.65 : 1,
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              style={{
                                color: "#94a3b8",
                                fontSize: "12px",
                              }}
                            >
                              Reviewed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {rejectingRequest && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "20px",
              }}
            >
              Reject Doctor Registration
            </h2>

            <p
              style={{
                margin: "10px 0 20px",
                color: "#64748b",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              Reject registration for{" "}
              <strong style={{ color: "#334155" }}>
                {rejectingRequest.firstName} {rejectingRequest.lastName}
              </strong>
              ?
            </p>

            <label
              htmlFor="rejectionReason"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#334155",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              Rejection reason
            </label>

            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={4}
              placeholder="Enter a reason for rejecting this registration..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "7px",
                resize: "vertical",
                fontSize: "13px",
                outline: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setRejectingRequest(null);
                  setRejectionReason("");
                }}
                style={{
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  borderRadius: "7px",
                  padding: "9px 15px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionId === rejectingRequest.id}
                onClick={rejectRequest}
                style={{
                  border: 0,
                  background: "#dc2626",
                  color: "#ffffff",
                  borderRadius: "7px",
                  padding: "9px 15px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {actionId === rejectingRequest.id
                  ? "Rejecting..."
                  : "Reject Registration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorRegistrationRequests;