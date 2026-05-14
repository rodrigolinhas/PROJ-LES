import { FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import SettingsForm from "../components/SettingsForm";

/**
 * Page for editing the authenticated user's account settings.
 *
 * Renders the SettingsForm component inside the SciEvents shared
 * page layout (matching the auth pages design system).
 */
export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Top bar (same style as AuthLayout / Landing Navbar) ── */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-gray-900 font-semibold text-lg tracking-tight hover:opacity-80 transition-opacity"
                    >
                        <FlaskConical size={22} strokeWidth={1.8} />
                        <span>SciEvents</span>
                    </Link>
                </div>
            </header>

            {/* ── Centered card ── */}
            <main className="flex justify-center px-4 py-12">
                <div className="w-full max-w-lg bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
                    <SettingsForm />
                </div>
            </main>
        </div>
    );
}
