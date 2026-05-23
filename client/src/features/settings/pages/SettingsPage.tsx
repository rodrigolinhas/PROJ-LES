import SettingsForm from "../components/SettingsForm";
import TopBar from "@/shared/components/TopBar";
import BackButton from "@/shared/components/BackButton.tsx";

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
            <TopBar />
            <BackButton/>

            {/* ── Centered card ── */}
            <main className="flex justify-center px-4 py-12">
                <div className="w-full max-w-lg bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
                    <SettingsForm />
                </div>
            </main>
        </div>
    );
}
