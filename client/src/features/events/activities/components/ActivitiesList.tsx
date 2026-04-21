import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCookie } from "../../../../shared/utils/getCookie";

type Props = {
    eventId: number;
};

type Activity = {
    ID: number;
    Name: string;
    Description: string;
    Place: string;
    StartDate: string;
    EndDate: string;
};

export default function ActivitiesList({ eventId }: Props) {
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
                {(!activities || activities.length == 0) ? (
                    <p>This event does not have any activities</p>
                ) :
                <>
                    <ul className="list-disc pl-6">
                        {activities.map(a => (
                            <li key={a.ID} className="my-1">
                                <Link to={`/event/${eventId}/activity/view/${a.ID}`}>
                                    {a.Name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleExportCSV} className="mr-3 mt-5 mb-1 w-40 border-2 border-black gap-2 rounded-md bg-white px-5 py-3 text-black">
                        Export as CSV
                    </button>
                </>}
        </div>
    );
}
