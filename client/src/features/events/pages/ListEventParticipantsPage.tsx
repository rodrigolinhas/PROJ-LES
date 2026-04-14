import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCookie } from "../../../shared/utils/getCookie";
import { envHostBackend } from "@/shared/utils/env";

type EventParticipant = {
    ID: number;
    FirstName: string;
    LastName: string;
    Email: string;
    Confirmed: boolean;
};

export default function ListEventParticipantsPage() {
    const { id } = useParams();
    const [participants, setParticipants] = useState<EventParticipant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchParticipants() {
            const csrfToken = getCookie("csrf_token");

            try {
                const response = await fetch(
                    `http://${envHostBackend()}/event/view/${id}/participants`,
                    {
                        credentials: "include",
                        headers: {
                            "X-CSRF-Token": csrfToken,
                        },
                    }
                );

                if (response.status === 200) {
                    const data = await response.json();
                    setParticipants(data);
                } else {
                    const text = await response.text();
                    setError(text || "Failed to load participants");
                }
            } catch {
                setError("Server error");
            } finally {
                setLoading(false);
            }
        }

        fetchParticipants();
    }, [id]);

    function handleExportCSV() {
        if (!participants || participants.length === 0) {
            alert("No participants to export.");
            return;
        }

        const headers = ["ID", "FirstName", "LastName", "Email", "Confirmed"];
        const csvRows = [headers.join(",")];

        participants.forEach((p) => {
            const row = [
                p.ID,
                `"${(p.FirstName || "").replace(/"/g, '""')}"`,
                `"${(p.LastName || "").replace(/"/g, '""')}"`,
                `"${(p.Email || "").replace(/"/g, '""')}"`,
                p.Confirmed,
            ];
            csvRows.push(row.join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `participants_event_${id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <h2>Participants</h2>

            <button onClick={handleExportCSV} style={{ marginBottom: "1rem" }}>
                Export as CSV
            </button>

            {participants.length === 0 ? (
                <p>No participants found.</p>
            ) : (
                <ul>
                    {participants.map((p) => (
                        <li key={p.ID}>
                            <strong>{p.FirstName} {p.LastName}</strong> — {p.Email} — {p.Confirmed ? "Confirmed" : "Pending"}
                        </li>
                    ))}
                </ul>
            )}

            <Link to={`/event/${id}`}>Back to Event</Link>
        </div>
    );
}