import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCookie } from "../../../shared/utils/getCookie.ts";
import { envHostBackend } from "@/shared/utils/env.ts";
import { User, Mail, Settings } from "lucide-react";
import BackButton from "@/shared/components/BackButton.tsx";
import TopBar from "@/shared/components/TopBar.tsx";

type UserDetails = {
    FirstName: string;
    LastName: string;
    Email: string;
    Role: string;
};

function roleLabel(role: string): string {
    if (role === "EventOrganizer") return "Event Organizer";
    return role;
}

function roleColor(role: string): string {
    switch (role) {
        case "Professor":
            return "bg-blue-50 text-blue-700 border-blue-100";
        case "EventOrganizer":
            return "bg-purple-50 text-purple-700 border-purple-100";
        case "Student":
        default:
            return "bg-green-50 text-green-700 border-green-100";
    }
}

function getInitials(first: string, last: string): string {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export default function ViewUserPage() {
    const [user, setUser] = useState<UserDetails | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const csrfToken = getCookie("csrf_token");
        fetch(`http://${envHostBackend()}/user/me`, {
            credentials: "include",
            headers: { "X-CSRF-Token": csrfToken },
        })
            .then((res) => {
                if (res.status === 200) return res.json();
                throw new Error("Unauthorized");
            })
            .then((data) => setUser(data))
            .catch(() => setError("Unable to load profile"))
            .finally(() => setLoading(false));
    }, []);

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Loading profile…</p>
                </div>
            </div>
        );
    }

    /* ── Error ── */
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">{error}</p>
                    <BackButton
                        to="/home"
                        label="Back to Home"
                        className="mt-4"
                    />
                </div>
            </div>
        );
    }

    if (!user) return null;

    const initials = getInitials(user.FirstName, user.LastName);
    const role = roleLabel(user.Role);
    const roleBadge = roleColor(user.Role);

    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar/>
            <BackButton to={`/home`}/>

            {/* ── Content ── */}
            <main className="flex justify-center px-4 py-12">
                <div className="w-full max-w-lg flex flex-col gap-4">

                    {/* Profile card */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">

                        {/* Avatar banner */}
                        <div className="bg-gray-900 px-8 py-8 flex flex-col items-center gap-3 rounded-t-2xl">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md">
                                <span className="text-2xl font-bold text-gray-900 tracking-tight select-none">
                                    {initials}
                                </span>
                            </div>
                            <div className="text-center">
                                <h1 className="text-xl font-bold text-white tracking-tight">
                                    {user.FirstName} {user.LastName}
                                </h1>
                                <span className={`mt-1.5 inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${roleBadge}`}>
                                    {role}
                                </span>
                            </div>
                        </div>

                        {/* Info rows */}
                        <div className="px-8 py-6 flex flex-col gap-4">
                            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                Account Details
                            </h2>

                            {/* Name */}
                            <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                                    <User size={15} className="text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400 font-medium">Full Name</p>
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user.FirstName} {user.LastName}
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                                    <Mail size={15} className="text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400 font-medium">Email</p>
                                    <p className="text-sm font-medium text-gray-900 truncate">{user.Email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer action */}
                        <div className="px-8 pb-6 flex justify-center">
                            <Link
                                to="/settings"
                                className="w-full h-12 box-border flex items-center justify-center gap-2 rounded-xl border border-slate-200 text-white bg-gray-900 hover:bg-gray-700 hover:border-slate-300 transition-colors duration-200 text-sm font-semibold text-slate-700"
                            >
                                <Settings size={15} />
                                Edit Account Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
