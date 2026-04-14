import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie.ts";
import {envHostBackend} from "@/shared/utils/env.ts";

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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Articles</h2>

            {articles.length === 0 ? (
                <p>No articles found for this activity.</p>
            ) : (
                <ul>
                    {articles.map((article) => (
                        <li key={article.id}>
                            <Link
                                to={`/event/${eventId}/activity/${activityId}/article/view/${article.id}`}
                            >
                                {article.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            <Link to={`/event/${eventId}/activity/view/${activityId}`}>
                Back to Activity
            </Link>
        </div>
    );
}