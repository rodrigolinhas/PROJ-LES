import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type BackButtonProps = {
    to?: string;
    label?: string;
    className?: string;
    iconSize?: number;
    fallbackTo?: string;
};

export default function BackButton({
                                       to,
                                       label = "Back",
                                       className = "",
                                       iconSize = 14,
                                       fallbackTo = "/home",
                                   }: BackButtonProps) {
    const navigate = useNavigate();

    const baseClassName =
        "inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition bg-transparent border-0 p-0 cursor-pointer appearance-none";

    const content = (
        <>
            <ArrowLeft size={iconSize} />
            {label}
        </>
    );

    function handleBack() {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(fallbackTo);
        }
    }

    if (to) {
        return (
            <Link
                to={to}
                className={`${baseClassName} ${className}`}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={handleBack}
            className={`${baseClassName} ${className}`}
        >
            {content}
        </button>
    );
}