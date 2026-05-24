import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCookie } from "../../../shared/utils/getCookie";
import { envHostBackend } from "../../../shared/utils/env";
import TopBar from "@/shared/components/TopBar.tsx";
import BackButton from "@/shared/components/BackButton.tsx";
import { mainDivStyle } from "@/shared/styles/formStyles";

type AppTag = {
    id: number;
    name: string;
    code: string;
};

function normalizeTag(tag: any): AppTag {
    return {
        id: tag.ID || tag.id,
        name: tag.Name || tag.name,
        code: tag.Code || tag.code,
    };
}

export default function ManageArticleTagsPage() {
    const { eventId, activityId, articleId } = useParams<{
        eventId: string;
        activityId: string;
        articleId: string;
    }>();

    const [articleTitle, setArticleTitle] = useState("");
    const [currentTags, setCurrentTags] = useState<AppTag[]>([]);
    const [availableTags, setAvailableTags] = useState<AppTag[]>([]);
    const [selectedTagId, setSelectedTagId] = useState<string>("");

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchArticleAndTags = async () => {
        setLoading(true);
        const csrfToken = getCookie("csrf_token");

        try {
            const articleRes = await fetch(`http://${envHostBackend()}/article/details?id=${articleId}`, {
                headers: { "X-CSRF-Token": csrfToken },
                credentials: "include"
            });

            if (articleRes.status === 200) {
                const articleData = await articleRes.json();
                setArticleTitle(articleData.title || `Article ${articleId}`);
                const tags = (articleData.tags || []).map(normalizeTag);
                setCurrentTags(tags);
            } else {
                setMessage("Failed to load article");
                setIsError(true);
            }

            const tagsRes = await fetch(`http://${envHostBackend()}/tags/list`, {
                headers: { "X-CSRF-Token": csrfToken },
                credentials: "include"
            });

            if (tagsRes.status === 200) {
                const tagsData = await tagsRes.json();
                setAvailableTags(tagsData.map(normalizeTag));
            } else {
                setMessage("Failed to load tags list");
                setIsError(true);
            }
        } catch {
            setMessage("Server error while fetching data");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticleAndTags();
    }, [articleId]);

    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        if (!selectedTagId) return;

        const csrfToken = getCookie("csrf_token");
        const formData = new FormData();
        formData.append("articleID", articleId || "");
        formData.append("tagsID", selectedTagId);

        try {
            const response = await fetch(`http://${envHostBackend()}/article/addTags`, {
                method: "POST",
                body: formData,
                headers: { "X-CSRF-Token": csrfToken },
                credentials: "include"
            });

            if (response.status === 200) {
                setMessage("Tag added successfully!");
                setIsError(false);
                fetchArticleAndTags();
                setSelectedTagId("");
            } else if (response.status === 401) {
                setMessage("Your session has expired. Please log in again.");
                setIsError(true);
            } else {
                const errorText = await response.text();
                setMessage(errorText || "Failed to add tag");
                setIsError(true);
            }
        } catch {
            setMessage("Server error adding tag");
            setIsError(true);
        }
    };

    const handleRemoveTag = async (tagId: number) => {
        setMessage("");
        const csrfToken = getCookie("csrf_token");
        const formData = new FormData();
        formData.append("articleID", articleId || "");
        formData.append("tagsID", tagId.toString());

        try {
            const response = await fetch(`http://${envHostBackend()}/article/removeTags`, {
                method: "POST",
                body: formData,
                headers: { "X-CSRF-Token": csrfToken },
                credentials: "include"
            });

            if (response.status === 200) {
                setMessage("Tag removed successfully!");
                setIsError(false);
                fetchArticleAndTags();
            } else if (response.status === 401) {
                setMessage("Your session has expired. Please log in again.");
                setIsError(true);
            } else {
                const errorText = await response.text();
                setMessage(errorText || "Failed to remove tag");
                setIsError(true);
            }
        } catch {
            setMessage("Server error removing tag");
            setIsError(true);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    const unattachedTags = availableTags.filter(
        (at) => !currentTags.find((ct) => ct.id === at.id)
    );

    return (
        <>
        <TopBar />
        <BackButton to={`/event/${eventId}/activity/${activityId}/article/view/${articleId}`}/>
        <div className={mainDivStyle + " bg-white"}>
            <h2>Manage Tags for Article</h2>
            <h3>{articleTitle}</h3>

            <div style={{ marginBottom: "20px" }}>
                <h4>Current Tags</h4>
                {currentTags.length === 0 ? (
                    <p>No tags currently associated with this article.</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {currentTags.map((tag) => (
                            <li
                                key={tag.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "10px",
                                    padding: "10px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px"
                                }}
                            >
                                <span><strong>{tag.name}</strong> ({tag.code})</span>
                                <button onClick={() => handleRemoveTag(tag.id)}>
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h4>Add New Tag</h4>
                {unattachedTags.length === 0 ? (
                    <p>All available tags are already added to this article.</p>
                ) : (
                    <form onSubmit={handleAddTag} style={{ display: "flex", gap: "10px" }}>
                        <select
                            value={selectedTagId}
                            onChange={(e) => setSelectedTagId(e.target.value)}
                            required
                            style={{ flex: 1, padding: "8px" }}
                        >
                            <option value="">Select a tag...</option>
                            {unattachedTags.map((tag) => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.name} ({tag.code})
                                </option>
                            ))}
                        </select>
                        <button type="submit">Add Tag</button>
                    </form>
                )}
            </div>

            {message && (
                <p className={isError ? "error" : "success"}>
                    {message}
                </p>
            )}

            {/*
            <div className={backLinkStyle} style={{ marginTop: "30px" }}>
                <Link to={`/event/${eventId}/activity/${activityId}/article/view/${articleId}`}>
                    Back to Article
                </Link>
            </div>
            */}
        </div>
        </>
    );
}
