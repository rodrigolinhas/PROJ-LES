import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    CalendarDays,
    FileText,
    User,
    Settings,
    ArrowRight,
    Clock,
    MapPin,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { getCookie } from "@/shared/utils/getCookie";
import { envHostBackend } from "@/shared/utils/env";

/* ── Types ── */
type EventSummary = {
    ID: number;
    Name: string;
    Theme: string;
    Location: string;
    StartDate: string;
    EndDate: string;
};

type QuickAction = {
    label: string;
    description: string;
    to: string;
    icon: React.ElementType;
    accent: string;       // bg color for icon box
    accentText: string;   // text color for icon
};

/* ── Role display helper ── */
function roleBadge(role: string) {
    const map: Record<string, { label: string; cls: string }> = {
        EventOrganizer: { label: "Organizer", cls: "bg-violet-100 text-violet-700" },
        Professor: { label: "Professor", cls: "bg-blue-100 text-blue-700" },
        Student: { label: "Student", cls: "bg-emerald-100 text-emerald-700" },
    };
    const badge = map[role] ?? { label: role, cls: "bg-gray-100 text-gray-700" };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
            {badge.label}
        </span>
    );
}

/**
 * Main home page displayed after authentication.
 *
 * Shows a welcome banner, role-aware quick-action cards, and
 * a preview of the next upcoming published events.
 */
export default function HomePage() {
    const { user, loading: userLoading } = useCurrentUser();
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);

    const isOrganizer = user?.Role === "EventOrganizer";

    /* ── Fetch upcoming events ── */
    useEffect(() => {
        let cancelled = false;

        async function fetchEvents() {
            const csrfToken = getCookie("csrf_token");
            try {
                const res = await fetch(
                    `http://${envHostBackend()}/event/list`,
                    {
                        credentials: "include",
                        headers: { "X-CSRF-Token": csrfToken },
                    }
                );
                if (!cancelled && res.ok) {
                    const data: EventSummary[] = await res.json();
                    // Sort by start date ascending and keep only the next 5
                    const sorted = data
                        .sort((a, b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime())
                        .slice(0, 5);
                    setEvents(sorted);
                }
            } catch {
                // silently ignore — section just stays empty
            } finally {
                if (!cancelled) setEventsLoading(false);
            }
        }

        fetchEvents();
        return () => { cancelled = true; };
    }, []);

    /* ── Build quick-action list (role-aware) ── */
    const quickActions: QuickAction[] = [
        {
            label: "View Events",
            description: "Browse all published events",
            to: "/events",
            icon: CalendarDays,
            accent: "bg-blue-50",
            accentText: "text-blue-600",
        },
        ...(isOrganizer
            ? [
                  {
                      label: "Create Event",
                      description: "Start organizing a new event",
                      to: "/event/create",
                      icon: CalendarDays,
                      accent: "bg-violet-50",
                      accentText: "text-violet-600",
                  },
                  {
                      label: "Create Article",
                      description: "Write a new article",
                      to: "/article/create",
                      icon: FileText,
                      accent: "bg-amber-50",
                      accentText: "text-amber-600",
                  },
              ]
            : []),
        {
            label: "My Profile",
            description: "View your account details",
            to: "/user/me",
            icon: User,
            accent: "bg-emerald-50",
            accentText: "text-emerald-600",
        },
    ];

    /* ── Date formatting helper ── */
    function shortDate(iso: string) {
        return new Date(iso).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto flex flex-col gap-8">

                {/* ── Welcome Hero ── */}
                <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 shadow-sm">
                    {/* Avatar */}
                    {user && (
                        <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-semibold shrink-0">
                            {(user.FirstName?.[0] ?? "").toUpperCase()}
                            {(user.LastName?.[0] ?? "").toUpperCase()}
                        </div>
                    )}
                    <div className="flex-1">
                        {userLoading ? (
                            <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
                        ) : user ? (
                            <>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                    Welcome back, {user.FirstName}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    {roleBadge(user.Role)}
                                    <span className="text-sm text-gray-400">{user.Email}</span>
                                </div>
                            </>
                        ) : (
                            <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
                        )}
                    </div>
                </section>

                {/* ── Quick Actions ── */}
                <section>
                    <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickActions.map(({ label, description, to, icon: Icon, accent, accentText }) => (
                            <Link
                                key={to + label}
                                to={to}
                                className="group flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
                            >
                                <div className={`w-10 h-10 rounded-lg ${accent} flex items-center justify-center shrink-0`}>
                                    <Icon size={18} strokeWidth={1.8} className={accentText} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                        {label}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                                <ArrowRight
                                    size={16}
                                    className="text-gray-300 group-hover:text-gray-500 mt-0.5 shrink-0 transition-colors"
                                />
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ── Upcoming Events ── */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
                            Upcoming Events
                        </h2>
                        <Link
                            to="/events"
                            className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
                        >
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>

                    {eventsLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 bg-white border border-gray-200 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                            <CalendarDays size={32} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">No upcoming events yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {events.map((event) => (
                                <Link
                                    key={event.ID}
                                    to={`/event/${event.ID}`}
                                    className="group flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
                                >
                                    {/* Date block */}
                                    <div className="w-14 h-14 rounded-lg bg-gray-900 text-white flex flex-col items-center justify-center shrink-0 leading-none">
                                        <span className="text-lg font-bold">
                                            {new Date(event.StartDate).getDate()}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider opacity-70">
                                            {new Date(event.StartDate).toLocaleString("en-GB", { month: "short" })}
                                        </span>
                                    </div>

                                    {/* Event info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                                            {event.Name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                            {event.Theme && (
                                                <span className="text-xs text-gray-400">{event.Theme}</span>
                                            )}
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Clock size={11} /> {shortDate(event.StartDate)} – {shortDate(event.EndDate)}
                                            </span>
                                            {event.Location && (
                                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                                    <MapPin size={11} /> {event.Location}
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
                </section>
            </div>
        </AppLayout>
    );
}
