import { useState } from "react";
import { getCookie } from "@/shared/utils/getCookie.ts";
import { envHostBackend } from "@/shared/utils/env.ts";

type Props = {
    articleID: number;
    onDeleted: () => void;
};

export default function DeleteArticleButton({ articleID, onDeleted }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleDelete() {
        const confirmDelete = window.confirm("Are you sure you want to delete this article?");
        if (!confirmDelete) return;

        setLoading(true);

        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();
        formData.append("articleID", String(articleID));

        try {
            const response = await fetch(`http://${envHostBackend()}/article/delete`, {
                method: "POST",
                body: formData,
                credentials: "include",
                headers: {
                    "X-CSRF-Token": csrfToken
                }
            });

            if (response.status === 200) {
                onDeleted();
            } else if (response.status === 401) {
                setError("Your session has expired. Please log in again.");
            } else {
                setError(await response.text());
            }
        } catch {
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button type="button" onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete Article"}
            </button>
            {error && <p className="error">{error}</p>}
        </>
    );
}