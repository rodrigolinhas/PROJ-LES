import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../../../assets/hero.png";

export default function HeroSection() {
    return (
        <section className="min-h-screen pt-16 flex items-center bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 w-full py-16 md:py-24 grid md:grid-cols-2 gap-12 md:gap-16 items-center">

                {/* ── Left column: text content ── */}
                <div className="flex flex-col gap-6">
                    {/* Main headline */}
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                        Scientific Event Management
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base text-gray-500 leading-relaxed max-w-md">
                        This system is designed to manage scientific events locally.
                        It can organize activities held during the events as well as the papers that will be presented during those activities.
                        It is responsible for handling all aspects of event management.
                    </p>

                    {/* CTA buttons — mirroring WristCo's two-button pattern */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Link
                            to="/user/register"
                            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors duration-200 px-5 py-2.5 rounded-md"
                        >
                            Get Started
                            <ArrowRight size={15} />
                        </Link>
                        <Link
                            to="/user/login"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 border border-gray-300 hover:border-gray-500 transition-colors duration-200 px-5 py-2.5 rounded-md"
                        >
                            Already have an account
                        </Link>
                    </div>

                </div>

                {/* ── Right column: hero image ── */}
                <div className="relative flex justify-center md:justify-end">
                    {/* Image card with rounded corners — same aesthetic as WristCo */}
                    <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-xl">
                        <img
                            src={heroImage}
                            alt="Investigadores a colaborar numa sessão científica"
                            className="w-full h-full object-cover"
                            style={{ aspectRatio: "4/3" }}
                        />
                    </div>

                    {/* Subtle decorative ring behind the card */}
                    <div
                        className="absolute -z-10 rounded-full bg-gray-50"
                        style={{
                            width: "80%",
                            height: "80%",
                            top: "10%",
                            right: "-5%",
                        }}
                    />
                </div>
            </div>
        </section>
    );
}