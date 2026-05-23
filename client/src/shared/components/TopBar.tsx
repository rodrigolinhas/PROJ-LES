import { FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopBar() {
    return (
        <header className="bg-white border-b border-gray-200 w-full">
            <div className="w-full px-6 h-16 flex items-center">
                <Link
                    to="/home"
                    className="flex items-center gap-2 text-gray-900 font-semibold text-lg tracking-tight hover:opacity-80 transition-opacity"
                >
                    <FlaskConical size={22} strokeWidth={1.8} />
                    <span>SciEvents</span>
                </Link>
            </div>
        </header>
    );
}
