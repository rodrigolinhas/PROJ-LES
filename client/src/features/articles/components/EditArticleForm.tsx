import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie.ts";
import DeleteArticleButton from "../components/DeleteArticleButton";
import {envHostBackend} from "@/shared/utils/env.ts";

type Props = {
    eventId: number;
    activityId: number;
    articleId: number;
};

type ArticleDetails = {
    id: number;
    title: string;
    firstAuthor?: { id?: number } | number;
    publisher: string;
    doi: string;
    isbn: string;
    url: string;
};

type FormState = {
    title: string;
    firstAuthorID: string;
    publisher: string;
    doi: string;
    isbn: string;
    url: string;
};

function getAuthorId(author: { id?: number } | number | undefined): string {
    if (typeof author === "number") return String(author);
    if (author?.id) return String(author.id);
    return "";
}

export default function EditArticleForm({ eventId, activityId, articleId }: Props) {
    const [form, setForm] = useState<FormState | null>(null);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [deleted, setDeleted] = useState(false);

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
                    const data: ArticleDetails = await response.json();

                    setForm({
                        title: data.title || "",
                        firstAuthorID: getAuthorId(data.firstAuthor),
                        publisher: data.publisher || "",
                        doi: data.doi || "",
                        isbn: data.isbn || "",
                        url: data.url || ""
                    });
                } else {
                    setIsError(true);
                    setMessage(await response.text());
                }
            } catch {
                setIsError(true);
                setMessage("Server error");
            }
        }

        fetchArticle();
    }, [articleId]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!form) return;

        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();

        formData.append("articleID", String(articleId));
        formData.append("title", form.title);
        formData.append("publisher", form.publisher);
        formData.append("doi", form.doi);
        formData.append("isbn", form.isbn);
        formData.append("url", form.url);

        if (form.firstAuthorID.trim() !== "") {
            formData.append("firstAuthorID", form.firstAuthorID);
        }

        try {
            const response = await fetch("http://${envHostBackend()}/article/edit", {
                method: "POST",
                body: formData,
                credentials: "include",
                headers: {
                    "X-CSRF-Token": csrfToken
                }
            });

            if (response.status === 200) {
                setMessage("Article updated!");
                setIsError(false);
            } else {
                setMessage(await response.text());
                setIsError(true);
            }
        } catch {
            setMessage("Server error");
            setIsError(true);
        }
    }

    if (deleted) {
        return (
            <div>
                <h2>Article deleted successfully!</h2>
                <Link to={`/event/${eventId}/activity/${activityId}/article/list`}>
                    Back to Articles
                </Link>
            </div>
        );
    }

    if (!form) return <p>Loading...</p>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>Edit Article</h2>

            <label>Title</label>
            <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
            />

            <label>First Author ID</label>
            <input
                value={form.firstAuthorID}
                onChange={(e) => setForm({ ...form, firstAuthorID: e.target.value })}
            />

            <label>Publisher</label>
            <input
                value={form.publisher}
                onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                required
            />

            <label>DOI</label>
            <input
                value={form.doi}
                onChange={(e) => setForm({ ...form, doi: e.target.value })}
            />

            <label>ISBN</label>
            <input
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
            />

            <label>URL</label>
            <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
            />

            <button type="submit">Save</button>

            <p className={isError ? "error" : "success"}>
                {message}
            </p>

            <hr />

            <DeleteArticleButton
                articleID={articleId}
                onDeleted={() => setDeleted(true)}
            />

            <br />
            <Link to={`/event/${eventId}/activity/${activityId}/article/view/${articleId}`}>
                Back
            </Link>
        </form>
    );
}