import { envHostBackend } from "@/shared/utils/env";
import { getCookie } from "@/shared/utils/getCookie";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Save,
} from "lucide-react";

/**
 * Form component for editing authenticated user's account information.
 *
 * Fetches current user data on mount and pre-fills the form fields.
 * Sends only changed fields to `POST /user/account/edit`.
 */
export default function SettingsForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [originalData, setOriginalData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const csrfToken = getCookie("csrf_token");
            try {
                const res = await fetch("http://" + envHostBackend() + "/user/me", {
                    credentials: "include",
                    headers: { "X-CSRF-Token": csrfToken },
                });
                if (res.ok) {
                    const data = await res.json();
                    setFirstName(data.FirstName);
                    setLastName(data.LastName);
                    setEmail(data.Email);
                    setRole(data.Role);
                    setOriginalData({
                        firstName: data.FirstName,
                        lastName: data.LastName,
                        email: data.Email,
                        role: data.Role,
                    });
                } else {
                    setMessage("Failed to load user data");
                    setIsError(true);
                }
            } catch {
                setMessage("Server Error");
                setIsError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        if (password !== "" && password !== passwordConfirm) {
            setMessage("Passwords do not match");
            setIsError(true);
            return;
        }

        if (password !== "" && password.length < 8) {
            setMessage("Password must have at least 8 characters");
            setIsError(true);
            return;
        }

        const formData = new FormData();

        // Only send changed fields
        if (firstName !== originalData.firstName) formData.append("firstName", firstName);
        if (lastName !== originalData.lastName) formData.append("lastName", lastName);
        if (email !== originalData.email) formData.append("email", email);
        if (role !== originalData.role) formData.append("role", role);
        if (password !== "") formData.append("password", password);

        const csrfToken = getCookie("csrf_token");
        setSaving(true);

        try {
            const response = await fetch("http://" + envHostBackend() + "/user/account/edit", {
                method: "POST",
                credentials: "include",
                headers: { "X-CSRF-Token": csrfToken },
                body: formData,
            });

            if (response.ok) {
                setMessage("Settings updated successfully!");
                setIsError(false);
                setPassword("");
                setPasswordConfirm("");
                setOriginalData({ firstName, lastName, email, role });
            } else {
                const errorText = await response.text();
                setMessage(errorText || "Failed to update settings");
                setIsError(true);
            }
        } catch {
            setMessage("Server Error");
            setIsError(true);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading your settings…</p>
            </div>
        );
    }

    return (
        <>
            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Update your personal information and password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* ── Personal Info section ── */}
                <div className="flex flex-col gap-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Personal Information
                    </p>

                    {/* First + Last name row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="settings-firstname"
                                className="text-sm font-medium text-gray-700 flex items-center gap-1"
                            >
                                First Name
                            </label>
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
                                <User size={14} className="text-gray-400 flex-shrink-0" />
                                <input
                                    id="settings-firstname"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="flex-1 py-2.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none min-w-0"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="settings-lastname"
                                className="text-sm font-medium text-gray-700 flex items-center gap-1"
                            >
                                Last Name
                            </label>
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
                                <User size={14} className="text-gray-400 flex-shrink-0" />
                                <input
                                    id="settings-lastname"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="flex-1 py-2.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none min-w-0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="settings-email"
                            className="text-sm font-medium text-gray-700 flex items-center gap-1"
                        >
                            Email
                        </label>
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
                            <Mail size={15} className="text-gray-400 flex-shrink-0" />
                            <input
                                id="settings-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 py-2.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none min-w-0"
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="settings-role"
                            className="text-sm font-medium text-gray-700"
                        >
                            Role
                        </label>
                        <select
                            id="settings-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition cursor-pointer"
                        >
                            <option value="None">None</option>
                            <option value="Student">Student</option>
                            <option value="Professor">Professor</option>
                            <option value="EventOrganizer">Event Organizer</option>
                        </select>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100" />

                {/* ── Password section ── */}
                <div className="flex flex-col gap-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Change Password
                    </p>

                    {/* New Password */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="settings-password"
                            className="text-sm font-medium text-gray-700"
                        >
                            New Password
                        </label>
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
                            <Lock size={15} className="text-gray-400 flex-shrink-0" />
                            <input
                                id="settings-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Leave blank to keep current"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 py-2.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none min-w-0"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-1 rounded bg-transparent border-0 outline-none text-gray-400 hover:text-gray-600 transition flex-shrink-0 cursor-pointer"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password — only visible when password is being typed */}
                    {password !== "" && (
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="settings-confirm-password"
                                className="text-sm font-medium text-gray-700"
                            >
                                Confirm New Password
                            </label>
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
                                <Lock size={15} className="text-gray-400 flex-shrink-0" />
                                <input
                                    id="settings-confirm-password"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    className="flex-1 py-2.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none min-w-0"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="p-1 rounded bg-transparent border-0 outline-none text-gray-400 hover:text-gray-600 transition flex-shrink-0 cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Feedback message ── */}
                {message && (
                    <div
                        className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg ${isError
                                ? "bg-red-50 text-red-700 border border-red-100"
                                : "bg-green-50 text-green-700 border border-green-100"
                            }`}
                    >
                        {isError ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                        {message}
                    </div>
                )}

                {/* ── Actions ── */}
                <div className="flex flex-col gap-3 pt-2 w-full">
                    <button
                        id="settings-save"
                        type="submit"
                        disabled={saving}
                        className="w-full h-12 flex items-center justify-center gap-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 disabled:opacity-60 transition-colors duration-200 px-5 py-2.5 rounded-lg"
                    >
                        <Save size={15} />
                        {saving ? "Saving…" : "Save Changes"}
                    </button>

                    <Link
                        to="/user/me"
                        className="w-full h-12 box-border flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors duration-200 text-sm font-semibold text-slate-700"
                    >
                        <ArrowLeft size={14} />
                        Back to Profile
                    </Link>
                </div>
            </form>
        </>
    );
}
