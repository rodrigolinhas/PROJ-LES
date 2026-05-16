import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCookie } from "../../../../shared/utils/getCookie";
import {
    Clock,
    MapPin,
    ArrowRight,
    Download,
    CalendarDays,
} from "lucide-react";

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

function shortDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function shortTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

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

    if (loading) {
        return (
            <div className="py-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Activities</h2>
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Activities</h2>
                {activities && activities.length > 0 && (
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-1.5 transition-colors duration-150"
                    >
                        <Download size={13} strokeWidth={1.8} />
                        Export CSV
                    </button>
                )}
            </div>

            {(!activities || activities.length === 0) ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
                    <CalendarDays size={28} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">This event does not have activities yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activities.map((a) => (
                        <Link
                            key={a.ID}
                            to={`/event/${eventId}/activity/view/${a.ID}`}
                            className="group flex items-center gap-4 bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-4 transition-all duration-200 hover:shadow-sm"
                        >
                            {/* Date block */}
                            <div className="w-12 h-12 rounded-lg bg-gray-900 text-white flex flex-col items-center justify-center shrink-0 leading-none">
                                <span className="text-base font-bold">
                                    {new Date(a.StartDate).getDate()}
                                </span>
                                <span className="text-[9px] uppercase tracking-wider opacity-70">
                                    {new Date(a.StartDate).toLocaleString("en-GB", { month: "short" })}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                                    {a.Name}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock size={11} />
                                        {shortDate(a.StartDate)} · {shortTime(a.StartDate)} – {shortTime(a.EndDate)}
                                    </span>
                                    {a.Place && (
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <MapPin size={11} />
                                            {a.Place}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ArrowRight
                                size={16}
                                className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors"
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
