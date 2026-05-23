import TopBar from "@/shared/components/TopBar";

interface AuthLayoutProps {
    children: React.ReactNode;
}

/**
 * Shared layout wrapper for all auth pages (Login, Register).
 * Mirrors the landing page design system: bg-gray-50, Inter font,
 * white card, SciEvents top-left branding.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Top bar (same style as Landing Navbar) ── */}
            <TopBar />

            {/* ── Centered card — always fully rendered, scrolls on small viewports ── */}
            <main className="flex justify-center px-4 py-12">
                <div className="w-full max-w-lg bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
