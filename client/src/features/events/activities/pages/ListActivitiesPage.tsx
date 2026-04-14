import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCookie } from "../../../../shared/utils/getCookie";

type Activity = {
    ID: number;
    Name: string;
    Description: string;
    Place: string;
    StartDate: string;
    EndDate: string;
};

export default function ListActivityPage() {
    const { eventId } = useParams();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivities() {
            const csrfToken = getCookie("csrf_token");

            const response = await fetch(
                `http://localhost:8080/event/${eventId}/activity/list`,
                {
                    credentials: "include",
                    headers: { "X-CSRF-Token": csrfToken }
                }
            );

            if (response.status === 200) {
                const data = await response.json();
                setActivities(data);
            }

            setLoading(false);
        }

        fetchActivities();
    }, [eventId]);

    const handleExportCSV = () => {
        if (!activities || activities.length === 0) {
            alert("No activities to export.");
            return;
        }

        const headers = ["ID", "Name", "Description", "Start Date", "End Date", "Location"];
        const csvRows = [headers.join(",")];

        activities.forEach((a) => {
            const row = [
                a.ID,
                `"${(a.Name || "").replace(/"/g, '""')}"`,
                `"${(a.Description || "").replace(/"/g, '""')}"`,
                `"${a.StartDate || ""}"`,
                `"${a.EndDate || ""}"`,
                `"${(a.Place || "").replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `activities_event_${eventId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Activities</h2>

            <button onClick={handleExportCSV} style={{ marginBottom: "1rem" }}>
                Export as CSV
            </button>

            <ul>
                {activities.map(a => (
                    <li key={a.ID}>
                        <Link to={`/event/${eventId}/activity/view/${a.ID}`}>
                            {a.Name}
                        </Link>
                    </li>
                ))}
            </ul>

            <Link to={`/event/${eventId}`}>Back to Event</Link>
        </div>
    );
}
