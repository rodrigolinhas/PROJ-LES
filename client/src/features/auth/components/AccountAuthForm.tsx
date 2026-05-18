import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import GoogleIcon from "../../../assets/icons/google-svgrepo-com.svg";
import { envHostBackend } from "@/shared/utils/env";

export default function AccountAuthForm() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("pass", pass);

            const response = await fetch("http://" + envHostBackend() + "/user/login", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (response.status === 200) {
                setMessage("Successfully logged in!");
                setIsError(false);
                localStorage.setItem("userEmail", email);
                navigate("/home");
            }
            else if (response.status === 401) {
                const errorText = await response.text();
                if (errorText.includes("SSO")) {
                    setMessage(errorText);
                } else {
                    setMessage("Incorrect email or password. Please try again.");
                }
                setIsError(true);
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

    return (
        <>
            {/* ── Heading ── */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Login to your account
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Welcome back — sign in to continue.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="login-email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Email
                        <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
                        <Mail size={15} className="text-gray-400 flex-shrink-0" />
                        <input
                            id="login-email"
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
                    <label htmlFor="login-password" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Password
                        <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
                        <Lock size={15} className="text-gray-400 flex-shrink-0" />
                        <input
                            id="login-password"
                            type="password"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            required
                            className="flex-1 py-2.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none min-w-0"
                        />
                    </div>
                </div>

                {/* Error message */}
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
                    id="login-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 disabled:opacity-60 transition-colors duration-200 px-5 py-2.5 rounded-lg"
                >
                    {loading ? "Logging in…" : "Login"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-100" />
                    <span className="text-xs text-gray-400 font-medium">or</span>
                    <div className="h-px flex-1 bg-gray-100" />
                </div>

                {/* Google */}
                <button
                    id="login-google"
                    type="button"
                    onClick={() => {
                        window.location.href =
                            "http://" + envHostBackend() + "/auth/google?provider=google";
                    }}
                    className="w-full inline-flex items-center justify-center gap-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 px-5 py-2.5 rounded-lg"
                >
                    <img src={GoogleIcon} alt="Google logo" width={18} height={18} />
                    Continue with Google
                </button>

                {/* Footer link */}
                <p className="text-center text-sm text-gray-500 mt-1">
                    Don't have an account?{" "}
                    <Link
                        to="/user/register"
                        className="text-gray-900 font-medium hover:underline transition"
                    >
                        Create Account
                    </Link>
                </p>
            </form>
        </>
    );
}
