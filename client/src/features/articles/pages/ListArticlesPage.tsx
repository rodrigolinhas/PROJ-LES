import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie.ts";
import { envHostBackend } from "@/shared/utils/env.ts";
import {
    FileText,
    ArrowRight,
    ArrowLeft,
    Tag,
} from "lucide-react";

type Article = {
    id: number;
    title: string;
    publisher: string;
    doi: string;
    isbn: string;
    url: string;
    tags: string[];
};

export default function ListArticlesPage() {
    const { eventId, activityId } = useParams();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchArticles() {
            const csrfToken = getCookie("csrf_token") || "";

            try {
                const response = await fetch(
                    `http://${envHostBackend()}/article/list?activityID=${activityId}`,
                    {
                        credentials: "include",
                        headers: {
                            "X-CSRF-Token": csrfToken
                        }
                    }
                );

                if (response.status === 200) {
                    const data = await response.json();
                    setArticles(data);
                } else if (response.status === 404) {
                    setArticles([]);
                } else {
                    const text = await response.text();
                    setError(text || "Failed to load articles");
                }
            } catch {
                setError("Server error");
            } finally {
                setLoading(false);
            }
        }

        fetchArticles();
    }, [activityId]);

    /* ── Loading skeleton ── */
    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-6" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
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

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            {/* ── Back link ── */}
            <Link
                to={`/event/${eventId}/activity/view/${activityId}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
            >
                <ArrowLeft size={15} />
                Back to Activity
            </Link>

            {/* ── Page header ── */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    {articles.length} {articles.length === 1 ? "article" : "articles"}
                </span>
            </div>

            {/* ── Articles list ── */}
            {articles.length === 0 ? (
                <div className="text-center py-14 border border-dashed border-gray-200 rounded-xl">
                    <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No articles found for this activity.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            to={`/event/${eventId}/activity/${activityId}/article/view/${article.id}`}
                            className="group flex items-center gap-4 bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            {/* Icon */}
                            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                                <FileText size={18} strokeWidth={1.8} className="text-violet-600" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                                    {article.title}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {article.publisher && (
                                        <span className="text-xs text-gray-400">
                                            {article.publisher}
                                        </span>
                                    )}
                                    {article.tags && article.tags.length > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <Tag size={10} />
                                            {article.tags.length} {article.tags.length === 1 ? "tag" : "tags"}
                                        </span>
                                    )}
                                    {article.doi && (
                                        <span className="text-xs text-gray-300">
                                            DOI: {article.doi}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ArrowRight
                                size={16}
                                className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors"
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}