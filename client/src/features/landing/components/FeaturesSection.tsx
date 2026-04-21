import {
    CalendarDays,
    Users,
    ShieldCheck,
    Globe,
    Layers,
} from "lucide-react";

const FEATURES = [
    {
        icon: CalendarDays,
        title: "Event Management",
        description:
            "Create and manage events, activities and articles in one place.",
    },
    {
        icon: Users,
        title: "Registration",
        description:
            "Control participant registration, access types and attendance lists automatically.",
    },
    {
        icon: Layers,
        title: "Activities and Sessions",
        description:
            "Organize activities and articles within each event.",
    },
    {
        icon: Globe,
        title: "Remote Access",
        description:
            "Fully online — access and manage your projects from anywhere.",
    },
    {
        icon: ShieldCheck,
        title: "Security and Privacy",
        description:
            "Secure authentication and role-based permission control.",
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="bg-white py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16 max-w-xl">
                    <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                        Features
                    </span>
                    <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                        Everything you need to manage science
                    </h2>
                    <p className="mt-4 text-base text-gray-500 leading-relaxed">
                        A complete platform, designed for academic teams that
                        want to focus on research with events, activities, and articles.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {FEATURES.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="flex flex-col gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Icon size={18} strokeWidth={1.8} className="text-gray-700" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}