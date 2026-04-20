import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie.ts";
import {envHostBackend} from "@/shared/utils/env.ts";

type ArticleTag = {
    Name?: string;
    name?: string;
    Code?: string;
    code?: string;
};

type AuthorRef = {
    id?: number;
    first_name?: string;
    last_name?: string;
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

function getAuthorName(author: AuthorRef | number | undefined): string {
    if (typeof author === "number") return `ID ${author}`;
    if (!author) return "";
    const name = [author.first_name, author.last_name].filter(Boolean).join(" ");
    return name || (author.id ? `ID ${author.id}` : "");
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!article) return null;

    return (
        <div>
            <h1>{article.title}</h1>

            <p><strong>Publisher:</strong> {article.publisher}</p>
            <p><strong>First Author:</strong> {getAuthorName(article.firstAuthor) || "-"}</p>
            <p>
                <strong>Co-Authors:</strong>{" "}
                {article.coAuthors && article.coAuthors.length > 0
                    ? article.coAuthors.map(getAuthorName).join(", ")
                    : "-"}
            </p>
            <p><strong>DOI:</strong> {article.doi || "-"}</p>
            <p><strong>ISBN:</strong> {article.isbn || "-"}</p>
            <p>
                <strong>URL:</strong>{" "}
                {article.url ? (
                    <a href={article.url} target="_blank" rel="noreferrer">
                        {article.url}
                    </a>
                ) : (
                    "-"
                )}
            </p>

            <p>
                <strong>Tags:</strong>{" "}
                {article.tags && article.tags.length > 0
                    ? article.tags.map(getTagLabel).filter(Boolean).join(", ")
                    : "-"}
            </p>

            <Link to={`/event/${eventId}/activity/${activityId}/article/edit/${articleId}`}>
                Edit
            </Link>

            <br />
            <Link to={`/event/${eventId}/activity/${activityId}/article/${articleId}/tags`}>
                Edit Tags
            </Link>

            <br />
            <Link to={`/event/${eventId}/activity/${activityId}/article/list`}>
                Back to list
            </Link>
        </div>
    );
}