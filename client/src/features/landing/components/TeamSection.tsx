import { Github, Linkedin } from "lucide-react";

const TEAM = [
    {
        initials: "NR",
        name: "Nicole Reis",
        role: "Computer Science Student",
        bio: "SESCREVAM VCS SE QUISEREM SENAO APAGA-SE",
        github: "https://github.com/nicoleacreis",
        linkedin: "https://www.linkedin.com/in/nicoleacreis/",
        color: "bg-blue-50 text-blue-700",
    },
    {
        initials: "RL",
        name: "Rodrigo Linhas",
        role: "Computer Science Student",
        bio: "SESCREVAM VCS SE QUISEREM SENAO APAGA-SE",
        github: "https://github.com/rodrigolinhas",
        linkedin: "https://www.linkedin.com/in/rodrigolinhas/",
        color: "bg-violet-50 text-violet-700",
    },
    {
        initials: "RR",
        name: "Ricardo Rodrigues",
        role: "Computer Science Student",
        bio: "SESCREVAM VCS SE QUISEREM SENAO APAGA-SE",
        github: "https://github.com/ricardoorodriguess",
        linkedin: "https://www.linkedin.com/in/ricardoroodriguess/",
        color: "bg-emerald-50 text-emerald-700",
    },
    {
        initials: "MA",
        name: "Miguel Alvito",
        role: "Computer Science Student",
        bio: "SESCREVAM VCS SE QUISEREM SENAO APAGA-SE",
        github: "https://github.com/m-alvito",
        linkedin: "https://www.linkedin.com/in/miguel-alvito/",
        color: "bg-amber-50 text-amber-700",
    },
];

export default function TeamSection() {
    return (
        <section id="team" className="bg-white py-24">
            <div className="max-w-7xl mx-auto px-6">

                {/* ── Section header ── */}
                <div className="mb-14 max-w-xl">
                    <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                        Team
                    </span>
                    <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                        Meet the Team
                    </h2>
                    <p className="mt-4 text-base text-gray-500 leading-relaxed">
                        A group of Software Engineering students that need to make a project to LES.
                    </p>
                </div>

                {/* ── Team grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {TEAM.map(({ initials, name, role, bio, github, linkedin, color }) => (
                        <div
                            key={name}
                            className="flex flex-col gap-4 border border-gray-100 rounded-xl p-6 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                        >
                            {/* Avatar */}
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${color}`}
                            >
                                {initials}
                            </div>

                            {/* Info */}
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{role}</p>
                            </div>

                            <p className="text-sm text-gray-500 leading-relaxed flex-1">{bio}</p>

                            {/* Social links */}
                            <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
                                <a
                                    href={github}
                                    aria-label={`GitHub de ${name}`}
                                    className="text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <Github size={15} strokeWidth={1.8} />
                                </a>
                                <a
                                    href={linkedin}
                                    aria-label={`LinkedIn de ${name}`}
                                    className="text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <Linkedin size={15} strokeWidth={1.8} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}