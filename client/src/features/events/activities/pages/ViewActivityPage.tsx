import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCookie } from "../../../../shared/utils/getCookie";
import TopBar from "@/shared/components/TopBar.tsx";
import { envHostBackend } from "@/shared/utils/env";
import {
    Clock,
    MapPin,
    ArrowLeft,
    Pencil,
    FileText,
} from "lucide-react";
import BackButton from "@/shared/components/BackButton.tsx";

type Activity = {
    ID: number;
    Name: string;
    Description: string;
    Place: string;
    StartDate: string;
    EndDate: string;
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ViewActivityPage() {
    const { id, eventId } = useParams();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivity() {
            const csrfToken = getCookie("csrf_token");

            try {
                const response = await fetch(
                    `http://${envHostBackend()}/event/${eventId}/activity/view/${id}`,
                    {
                        credentials: "include",
                        headers: { "X-CSRF-Token": csrfToken }
                    }
                );

                if (response.status === 200) {
                    const data = await response.json();
                    setActivity(data);
                } else {
                    const text = await response.text();
                    setError(text || "Activity not found");
                }
            } catch {
                setError("Server error");
            } finally {
                setLoading(false);
            }
        }

        fetchActivity();
    }, [id]);

    /* ── Loading skeleton ── */
    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
        );
    }

    /* ── Error state ── */
    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-5 text-sm">
                    {error}
                </div>
            </div>
        );
    }

    if (!activity) return null;

    return (
        <>
        <TopBar />
        <BackButton />
        <div className="max-w-3xl mx-auto px-4 py-10">
            {/* ── Header card ── */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Title section */}
                <div className="px-6 pt-6 pb-5 border-b border-gray-100">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        {activity.Name}
                    </h1>
                </div>

                {/* Meta info */}
                <div className="px-6 py-5 flex flex-wrap gap-6">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Clock size={16} strokeWidth={1.8} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Schedule</p>
                            <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                {formatDate(activity.StartDate)}
                            </p>
                            <p className="text-sm text-gray-500">
                                {formatTime(activity.StartDate)} – {formatTime(activity.EndDate)}
                            </p>
                        </div>
                    </div>

                    {activity.Place && (
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin size={16} strokeWidth={1.8} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Location</p>
                                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                    {activity.Place}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Description */}
                {activity.Description && (
                    <div className="px-6 py-5 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Description</p>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {activity.Description}
                        </p>
                    </div>
                )}

                {/* Action buttons */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
                    <Link
                        to={`/event/${eventId}/activity/${id}/article/list`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-lg px-4 py-2.5 transition-colors duration-150"
                    >
                        <FileText size={15} strokeWidth={1.8} />
                        View Articles
                    </Link>
                    <Link
                        to={`/event/${eventId}/activity/edit/${id}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg px-4 py-2.5 transition-colors duration-150"
                    >
                        <Pencil size={15} strokeWidth={1.8} />
                        Edit Activity
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
}
