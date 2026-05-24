import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie";
import { envHostBackend } from "@/shared/utils/env";
import TopBar from "@/shared/components/TopBar.tsx";
import BackButton from "@/shared/components/BackButton.tsx";

import UserSearchInput from "@/shared/components/UserSearchInput";
import { mainDivStyle } from "@/shared/styles/formStyles";

export default function ManageArticleAuthorsPage() {
    const { eventId, activityId, articleId } = useParams<{
        eventId: string;
        activityId: string;
        articleId: string;
    }>();

    const [articleTitle, setArticleTitle] = useState("");
    const [currentAuthors, setCurrentAuthors] = useState<any[]>([]);
    const [firstAuthor, setFirstAuthor] = useState<any | null>(null);

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const csrfToken = getCookie("csrf_token");

        try {
            // Fetch article details (includes coAuthors and firstAuthor)
            const articleRes = await fetch(
                `http://${envHostBackend()}/article/details?id=${articleId}`,
                {
                    headers: { "X-CSRF-Token": csrfToken },
                    credentials: "include",
                }
            );

            if (articleRes.status === 200) {
                const articleData = await articleRes.json();
                setArticleTitle(articleData.title || `Article ${articleId}`);

                // Extract first author
                setFirstAuthor(articleData.firstAuthor);

                // Extract co-authors
                setCurrentAuthors(articleData.coAuthors || []);
            } else {
                setMessage("Failed to load article");
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
        fetchData();
    }, [articleId]);

    const handleAddAuthor = async (userId: string) => {
        setMessage("");

        const csrfToken = getCookie("csrf_token");
        const formData = new FormData();
        formData.append("articleID", articleId || "");
        formData.append("coAuthorsID", userId);

        try {
            const response = await fetch(
                `http://${envHostBackend()}/article/add-auhors`,
                {
                    method: "POST",
                    body: formData,
                    headers: { "X-CSRF-Token": csrfToken },
                    credentials: "include",
                }
            );

            if (response.status === 200) {
                setMessage("Author added successfully!");
                setIsError(false);
                fetchData();
            } else {
                const errorText = await response.text();
                setMessage(errorText || "Failed to add author");
                setIsError(true);
            }
        } catch {
            setMessage("Server error adding author");
            setIsError(true);
        }
    };

    const handleRemoveAuthor = async (userId: number) => {
        setMessage("");
        const csrfToken = getCookie("csrf_token");
        const formData = new FormData();
        formData.append("articleID", articleId || "");
        formData.append("coAuthorsID", userId.toString());

        try {
            const response = await fetch(
                `http://${envHostBackend()}/article/delete-auhors`,
                {
                    method: "POST",
                    body: formData,
                    headers: { "X-CSRF-Token": csrfToken },
                    credentials: "include",
                }
            );

            if (response.status === 200) {
                setMessage("Author removed successfully!");
                setIsError(false);
                fetchData();
            } else {
                const errorText = await response.text();
                setMessage(errorText || "Failed to remove author");
                setIsError(true);
            }
        } catch {
            setMessage("Server error removing author");
            setIsError(true);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    // Filter out users already assigned as co-authors or first author
    const currentAuthorIds = currentAuthors.map((a) => a.id);

    return (
        <>
        <TopBar />
        <BackButton to={`/event/${eventId}/activity/${activityId}/article/view/${articleId}`}/>
        <div className={mainDivStyle}>
            <h2>Manage Authors for Article</h2>
            <h3>{articleTitle}</h3>

            {firstAuthor && (
                <div style={{ marginBottom: "20px" }}>
                    <h4>First Author</h4>
                    <p style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        backgroundColor: "#f9f9f9"
                    }}>
                        <strong>{firstAuthor.firstName || firstAuthor.first_name} {firstAuthor.lastName || firstAuthor.last_name}</strong> ({firstAuthor.email})
                    </p>
                </div>
            )}

            <div style={{ marginBottom: "20px" }}>
                <h4>Co-Authors</h4>
                {currentAuthors.length === 0 ? (
                    <p>No co-authors currently associated with this article.</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {currentAuthors.map((author) => (
                            <li
                                key={author.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "10px",
                                    padding: "10px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                }}
                            >
                                <span>
                                    <strong>{author.firstName || author.first_name} {author.lastName || author.last_name}</strong> ({author.email})
                                </span>
                                <button onClick={() => handleRemoveAuthor(author.id)}>
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h4>Add Co-Author</h4>
                <UserSearchInput 
                    onSelectUser={(u) => handleAddAuthor(u.id.toString())}
                    buttonText="Add Author" 
                    excludeUserIds={[...(firstAuthor ? [firstAuthor.id] : []), ...currentAuthorIds]}
                />
            </div>

            {message && (
                <p className={isError ? "error" : "success"}>
                    {message}
                </p>
            )}

            {/*
            <div style={{ marginTop: "30px" }}>
                <Link to={`/event/${eventId}/activity/${activityId}/article/view/${articleId}`}>
                    Back to Article
                </Link>
            </div>
            */}
        </div>
        </>
    );
}
