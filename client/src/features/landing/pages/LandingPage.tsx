import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import TeamSection from "../components/TeamSection";
import Footer from "../components/Footer";

function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY > 80);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Voltar ao topo"
            className={[
                "fixed bottom-6 right-6 z-50",
                "w-10 h-10 rounded-full bg-gray-900 text-white shadow-lg",
                "flex items-center justify-center",
                "hover:bg-gray-700 transition-all duration-300",
                visible
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-4 pointer-events-none",
            ].join(" ")}
        >
            <ArrowUp size={16} strokeWidth={2} />
        </button>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <TeamSection />
            <Footer />
            <ScrollToTopButton />
        </div>
    );
}
