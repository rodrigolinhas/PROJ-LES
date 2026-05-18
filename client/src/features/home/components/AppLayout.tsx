import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import {
    FlaskConical,
    Home,
    CalendarDays,
    User,
    Settings,
    LogOut,
    PlusCircle,
    FileText,
    Menu,
    X,
    ChevronDown,
} from "lucide-react";

type NavItem = {
    label: string;
    to: string;
    icon: React.ElementType;
};

const MAIN_NAV: NavItem[] = [
    { label: "Home", to: "/home", icon: Home },
    { label: "Events", to: "/events", icon: CalendarDays },
    { label: "Profile", to: "/user/me", icon: User },
    { label: "Settings", to: "/settings", icon: Settings },
];

/**
 * Persistent application shell for authenticated pages.
 *
 * Provides a collapsible sidebar with navigation, role-conditional
 * actions, and a top bar with the user greeting.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user } = useCurrentUser();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const isOrganizer = user?.Role === "EventOrganizer";

    const initials = user
        ? `${(user.FirstName?.[0] ?? "").toUpperCase()}${(user.LastName?.[0] ?? "").toUpperCase()}`
        : "";

    function handleLogout() {
        localStorage.removeItem("userEmail");
        navigate("/");
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* ── Overlay for mobile sidebar ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={[
                    "fixed z-40 top-0 left-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out",
                    "md:translate-x-0 md:static md:z-auto",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                {/* Brand */}
                <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100 shrink-0">
                    <FlaskConical size={22} strokeWidth={1.8} className="text-gray-900" />
                    <span className="font-semibold text-lg tracking-tight text-gray-900">
                        SciEvents
                    </span>
                </div>

                {/* Nav links */}
                <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
                    {MAIN_NAV.map(({ label, to, icon: Icon }) => {
                        const active = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setSidebarOpen(false)}
                                className={[
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                                    active
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                                ].join(" ")}
                            >
                                <Icon size={18} strokeWidth={1.8} />
                                {label}
                            </Link>
                        );
                    })}

                    {/* Organizer-only: Create dropdown */}
                    {isOrganizer && (
                        <div className="mt-2">
                            <button
                                onClick={() => setCreateOpen(!createOpen)}
                                className={[
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                                    "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                                ].join(" ")}
                            >
                                <PlusCircle size={18} strokeWidth={1.8} />
                                <span className="flex-1 text-left">Create</span>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${createOpen ? "rotate-180" : ""}`}
                                />
                            </button>
                            {createOpen && (
                                <div className="ml-8 mt-1 flex flex-col gap-0.5">
                                    <Link
                                        to="/event/create"
                                        onClick={() => setSidebarOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                                    >
                                        <CalendarDays size={15} strokeWidth={1.8} />
                                        Event
                                    </Link>
                                    <Link
                                        to="/article/create"
                                        onClick={() => setSidebarOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                                    >
                                        <FileText size={15} strokeWidth={1.8} />
                                        Article
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-gray-100 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors duration-150"
                    >
                        <LogOut size={18} strokeWidth={1.8} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* ── Main content area ── */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5 shrink-0 sticky top-0 z-20">
                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* Spacer for desktop */}
                    <div className="hidden md:block" />

                    {/* User badge */}
                    {user && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 hidden sm:inline">
                                {user.FirstName} {user.LastName}
                            </span>
                            <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                                {initials}
                            </div>
                        </div>
                    )}
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
