import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie.ts";
import { envHostBackend } from "@/shared/utils/env.ts";
import {
    ArrowLeft,
    Pencil,
    Tag,
    ExternalLink,
    BookOpen,
    Hash,
    Globe,
    Users,
    User,
} from "lucide-react";

type ArticleTag = {
    Name?: string;
    name?: string;
    Code?: string;
    code?: string;
};

type AuthorRef = {
    id?: number;
};

type ArticleDetails = {
    id: number;
    title: string;
    firstAuthor?: AuthorRef | number;
    coAuthors?: Array<AuthorRef | number>;
    publisher: string;
    doi: string;
    isbn: string;
    url: string;
    tags?: ArticleTag[] | string[];
    createdAt?: string;
    updatedAt?: string;
};

function getAuthorId(author: AuthorRef | number | undefined): string {
    if (typeof author === "number") return String(author);
    if (author?.id) return String(author.id);
    return "";
}

function getTagLabel(tag: ArticleTag | string): string {
    if (typeof tag === "string") return tag;
    return tag.Name || tag.name || tag.Code || tag.code || "";
}

export default function ViewArticlePage() {
    const { eventId, activityId, articleId } = useParams();
    const [article, setArticle] = useState<ArticleDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchArticle() {
            const csrfToken = getCookie("csrf_token") || "";

            try {
                const response = await fetch(
                    `http://${envHostBackend()}/article/details?id=${articleId}`,
                    {
                        credentials: "include",
                        headers: {
                            "X-CSRF-Token": csrfToken
                        }
                    }
                );

                if (response.status === 200) {
                    const data = await response.json();
                    setArticle(data);
                } else {
                    const text = await response.text();
                    setError(text || "Article not found");
                }
            } catch {
                setError("Server error");
            } finally {
                setLoading(false);
            }
        }

        fetchArticle();
    }, [articleId]);

    /* ── Loading skeleton ── */
    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="h-8 w-72 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
            </div>
        );
    }

    /* ── Error state ── */
    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-5 text-sm">
                    {error}
                </div>
            </div>
        );
    }

    if (!article) return null;

    const tags = article.tags?.map(getTagLabel).filter(Boolean) ?? [];
    const coAuthorIds = article.coAuthors?.map(getAuthorId).filter(Boolean) ?? [];
    const firstAuthorId = getAuthorId(article.firstAuthor);

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            {/* ── Back link ── */}
            <Link
                to={`/event/${eventId}/activity/${activityId}/article/list`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
            >
                <ArrowLeft size={15} />
                Back to articles
            </Link>

            {/* ── Main card ── */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Title section */}
                <div className="px-6 pt-6 pb-5 border-b border-gray-100">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        {article.title}
                    </h1>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 text-xs font-medium bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full"
                                >
                                    <Tag size={10} />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Metadata grid */}
                <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Publisher */}
                    <InfoRow
                        icon={<BookOpen size={15} className="text-blue-600" />}
                        iconBg="bg-blue-50"
                        label="Publisher"
                        value={article.publisher || "—"}
                    />

                    {/* First Author */}
                    <InfoRow
                        icon={<User size={15} className="text-emerald-600" />}
                        iconBg="bg-emerald-50"
                        label="First Author ID"
                        value={firstAuthorId || "—"}
                    />

                    {/* Co-Authors */}
                    <InfoRow
                        icon={<Users size={15} className="text-amber-600" />}
                        iconBg="bg-amber-50"
                        label="Co-Authors"
                        value={coAuthorIds.length > 0 ? coAuthorIds.join(", ") : "—"}
                    />

                    {/* DOI */}
                    <InfoRow
                        icon={<Hash size={15} className="text-gray-600" />}
                        iconBg="bg-gray-100"
                        label="DOI"
                        value={article.doi || "—"}
                    />

                    {/* ISBN */}
                    <InfoRow
                        icon={<BookOpen size={15} className="text-gray-600" />}
                        iconBg="bg-gray-100"
                        label="ISBN"
                        value={article.isbn || "—"}
                    />

                    {/* URL */}
                    {article.url ? (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                <Globe size={15} className="text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">URL</p>
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors truncate block mt-0.5"
                                >
                                    {article.url}
                                    <ExternalLink size={11} className="inline ml-1 -mt-0.5" />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <InfoRow
                            icon={<Globe size={15} className="text-gray-600" />}
                            iconBg="bg-gray-100"
                            label="URL"
                            value="—"
                        />
                    )}
                </div>

                {/* Action buttons */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
                    <Link
                        to={`/event/${eventId}/activity/${activityId}/article/edit/${articleId}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-lg px-4 py-2.5 transition-colors duration-150"
                    >
                        <Pencil size={15} strokeWidth={1.8} />
                        Edit Article
                    </Link>
                    <Link
                        to={`/event/${eventId}/activity/${activityId}/article/${articleId}/tags`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg px-4 py-2.5 transition-colors duration-150"
                    >
                        <Tag size={15} strokeWidth={1.8} />
                        Manage Tags
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ── Reusable metadata row ── */
function InfoRow({
    icon,
    iconBg,
    label,
    value,
}: {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5 break-words">{value}</p>
            </div>
        </div>
    );
}