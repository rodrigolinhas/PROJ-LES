import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FlaskConical } from "lucide-react";

const NAV_LINKS = [
    { label: "Features", href: "#features" },
    { label: "Team", href: "#team" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={[
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200"
                    : "bg-white border-b border-gray-200",
            ].join(" ")}
        >
            <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <a
                    href="/"
                    className="flex items-center gap-2 text-gray-900 font-semibold text-lg tracking-tight hover:opacity-80 transition-opacity"
                >
                    <FlaskConical size={22} strokeWidth={1.8} />
                    <span>SciEvents</span>
                </a>

                <ul className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map(({ label, href }) => (
                        <li key={href}>
                            <a
                                href={href}
                                className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
                            >
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="hidden md:flex items-center gap-3">
                    <Link
                        to="/user/login"
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 px-3 py-1.5"
                    >
                        Login
                    </Link>
                    <Link
                        to="/user/register"
                        className="text-sm font-medium text-gray-900 border border-gray-800 hover:bg-gray-50 transition-colors duration-200 px-4 py-1.5 rounded-md"
                    >
                        Register
                    </Link>
                </div>
            </nav>
        </header>
    );
}
