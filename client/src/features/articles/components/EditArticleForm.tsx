import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie.ts";
import DeleteArticleButton from "../components/DeleteArticleButton";
import {envHostBackend} from "@/shared/utils/env.ts";
import {
    buttonsDivStyle,
    descriptionStyle, errorMessageStyle,
    goHomeStyle, inputStyle, labelStyle,
    mainDivStyle, submitButtonStyle,
    successDivStyle,
    successMessageStyle,
    successOutDivStyle, titleStyle
} from "@/shared/styles/formStyles.ts";

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
                    setMessage("Failed to load article data");
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
            const response = await fetch(`http://${envHostBackend()}/article/edit`, {
                method: "POST",
                body: formData,
                credentials: "include",
                headers: {
                    "X-CSRF-Token": csrfToken
                }
            });

            if (response.status === 200) {
                setMessage("Article updated successfully!");
                setIsError(false);
            } else if (response.status === 401) {
                setMessage("Your session has expired. Please log in again.");
                setIsError(true);
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
            <div className={successOutDivStyle}>
                <div className={successDivStyle}>
                    <h2 className={successMessageStyle}>Article deleted successfully!</h2>
                    <Link to ={`/event/${eventId}/activity/${activityId}/article/list`} className={goHomeStyle}>Back to Articles</Link>
                </div>
            </div>
        );
    }

    if (!form) return <p>Loading...</p>;

    return (
        <div className={mainDivStyle}>
            <div>
                <h2 className={titleStyle}>✎ Edit Article</h2>
                <p className={descriptionStyle}>
                    Edit the article fields you want to change.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div>
                    <label className={labelStyle}>Title</label>
                    <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelStyle}>First Author ID</label>
                    <input
                        value={form.firstAuthorID}
                        onChange={(e) => setForm({ ...form, firstAuthorID: e.target.value })}
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelStyle}>Publisher</label>
                    <input
                        value={form.publisher}
                        onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                        required
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelStyle}>DOI</label>
                    <input
                        value={form.doi}
                        onChange={(e) => setForm({ ...form, doi: e.target.value })}
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelStyle}>ISBN</label>
                    <input
                        value={form.isbn}
                        onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelStyle}>URL</label>
                    <input
                        value={form.url}
                        onChange={(e) => setForm({ ...form, url: e.target.value })}
                        required
                        className={inputStyle}
                    />
                </div>

                <div className={buttonsDivStyle}>
                    <button type = "submit" className={submitButtonStyle}>
                        Save Changes
                    </button>

                    <DeleteArticleButton
                        articleID={articleId}
                        onDeleted={() => setDeleted(true)}
                    />
                </div>

                {message && isError && (
                    <p className={errorMessageStyle}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}