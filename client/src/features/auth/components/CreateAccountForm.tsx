import { envHostBackend } from "@/shared/utils/env";
import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function CreateAccountForm() {
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [passConfirm, setPassConfirm] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [accountCreated, setAccountCreated] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        if (pass !== passConfirm) {
            setMessage("Passwords do not match");
            setIsError(true);
            return;
        }
        if (pass.length < 8) {
            setMessage("Password must have at least 8 characters");
            setIsError(true);
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("firstName", name);
        formData.append("lastName", lastName);
        formData.append("role", role);
        formData.append("email", email);
        formData.append("pass", pass);

        try {
            const response = await fetch("http://" + envHostBackend() + "/user/register", {
                method: "POST",
                body: formData,
            });

            if (response.status === 201) {
                setIsError(false);
                setAccountCreated(true);
            }
            else if (response.status === 409) {
                setMessage("An account with this email already exists. Please use a different email or login to your existing account.");
                setIsError(true);
                setAccountCreated(false);
            }
            else {
                const errorText = await response.text();
                setMessage(errorText);
                setIsError(true);
            }
        } catch {
            setMessage("Server Error");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    }

    /* ── Success state ── */
    if (accountCreated) {
        return (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-green-600" strokeWidth={1.8} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Account created!</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Your account is ready. You can now log in.
                    </p>
                </div>
                <Link
                    to="/user/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors duration-200 px-5 py-2.5 rounded-lg"
                >
                    Go to Login
                </Link>
            </div>
        );
    }

    /* ── Form ── */
    return (
        <>
            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Create Account
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Join SciEvents and start managing scientific events.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* First + Last name row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="register-firstname" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
                            <User size={14} className="text-gray-400 flex-shrink-0" />
                            <input
                                id="register-firstname"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="flex-1 py-2.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none min-w-0"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="register-lastname" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
                            <User size={14} className="text-gray-400 flex-shrink-0" />
                            <input
                                id="register-lastname"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="flex-1 py-2.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none min-w-0"
                            />
                        </div>
                    </div>
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="register-role" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="register-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition appearance-none cursor-pointer"
                    >
                        <option value="" disabled>
                            Select Role
                        </option>
                        <option value="Student">Student</option>
                        <option value="Professor">Professor</option>
                        <option value="EventOrganizer">Event Organizer</option>
                    </select>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="register-email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
                        <Mail size={15} className="text-gray-400 flex-shrink-0" />
                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-1 py-2.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none min-w-0"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="register-password" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
                        <Lock size={15} className="text-gray-400 flex-shrink-0" />
                        <input
                            id="register-password"
                            type="password"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            required
                            className="flex-1 py-2.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none min-w-0"
                        />
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="register-confirm-password" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
                        <Lock size={15} className="text-gray-400 flex-shrink-0" />
                        <input
                            id="register-confirm-password"
                            type="password"
                            value={passConfirm}
                            onChange={(e) => setPassConfirm(e.target.value)}
                            required
                            className="flex-1 py-2.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none min-w-0"
                        />
                    </div>
                </div>

                {/* Error / success message */}
                {message && (
                    <div
                        className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg ${isError
                            ? "bg-red-50 text-red-700 border border-red-100"
                            : "bg-green-50 text-green-700 border border-green-100"
                            }`}
                    >
                        {isError && <AlertCircle size={14} />}
                        {message}
                    </div>
                )}

                {/* Submit */}
                <button
                    id="register-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 disabled:opacity-60 transition-colors duration-200 px-5 py-2.5 rounded-lg"
                >
                    {loading ? "Creating account…" : "Create Account"}
                </button>

                {/* Footer link */}
                <p className="text-center text-sm text-gray-500 mt-1">
                    Already have an account?{" "}
                    <Link
                        to="/user/login"
                        className="text-gray-900 font-medium hover:underline transition"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </>
    );
}
