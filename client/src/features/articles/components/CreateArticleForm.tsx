import { envHostBackend } from '@/shared/utils/env';
import { getCookie } from '@/shared/utils/getCookie';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type AppUser = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
};

function normalizeUser(u: any): AppUser {
    return {
        id: u.ID || u.id,
        firstName: u.FirstName || u.firstName || u.first_name || "",
        lastName: u.LastName || u.lastName || u.last_name || "",
        email: u.Email || u.email || "",
    };
}

/**
 * Form component for creating a new article and associating it
 * with an event activity via the `/article/create` endpoint.
 */
export default function CreateArticleForm() {
    const [eventID, setEventID] = useState("");
    const [activityID, setActivityID] = useState("");
    const [title, setTitle] = useState("");
    const [firstAuthorID, setFirstAuthorID] = useState("");
    const [selectedCoAuthors, setSelectedCoAuthors] = useState<string[]>([]);
    const [publisher, setPublisher] = useState("");
    const [doi, setDoi] = useState("");
    const [isbn, setIsbn] = useState("");
    const [url, setUrl] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [createdArticleId, setCreatedArticleId] = useState<number | null>(null);

    const [participants, setParticipants] = useState<AppUser[]>([]);

    useEffect(() => {
        if (!eventID || isNaN(Number(eventID))) {
            setParticipants([]);
            return;
        }

        async function fetchParticipants() {
            const csrfToken = getCookie("csrf_token");
            try {
                const response = await fetch(
                    `http://${envHostBackend()}/event/view/${eventID}/participants`,
                    {
                        credentials: "include",
                        headers: { "X-CSRF-Token": csrfToken },
                    }
                );
                if (response.status === 200) {
                    const data = await response.json();
                    setParticipants(data.map(normalizeUser));
                } else {
                    setParticipants([]);
                }
            } catch {
                setParticipants([]);
            }
        }

        fetchParticipants();
    }, [eventID]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const csrfToken = getCookie("csrf_token");
        const formData = new FormData();

        formData.append("eventID", eventID);
        formData.append("activityID", activityID);
        formData.append("title", title);
        formData.append("firstAuthorID", firstAuthorID);
        formData.append("coAuthorsID", selectedCoAuthors.join(","));
        formData.append("publisher", publisher);
        formData.append("doi", doi);
        formData.append("isbn", isbn);
        formData.append("url", url);

        try {
            const response = await fetch(`http://${envHostBackend()}/article/create`, {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include"
            });

            if (response.status === 201) {
                const data = await response.json();
                setMessage(data.message || "Article created successfully!");
                setIsError(false);
                setCreatedArticleId(data.articleID);
            } else {
                const errorText = await response.text();
                setMessage(errorText);
                setIsError(true);
                setCreatedArticleId(null);
            }
        } catch {
            setMessage("Server error");
            setIsError(true);
            setCreatedArticleId(null);
        }
    }

    if (createdArticleId !== null) {
        return (
            <div style={{ textAlign: "center", margin: "100px" }}>
                <h2 style={{ color: "green" }}>Article created successfully!</h2>
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
                    <button type="button">
                        <Link to={`/event/${eventID}/activity/${activityID}/article/${createdArticleId}/tags`}>
                            Manage Tags for this Article
                        </Link>
                    </button>
                    <button type="button" style={{ backgroundColor: "#888" }}>
                        <Link to="/home" style={{ color: 'inherit', textDecoration: 'none' }}>
                            Go back to Home
                        </Link>
                    </button>
                </div>
            </div>
        );
    } else {
        return (
            <form onSubmit={handleSubmit}>
                <h2>Create Article</h2>

                <label className="required">Event ID</label>
                <input
                    type="text"
                    placeholder="Associated event ID"
                    value={eventID}
                    onChange={(e) => setEventID(e.target.value)}
                    required
                />

                <label className="required">Activity ID</label>
                <input
                    type="text"
                    placeholder="Associated activity ID"
                    value={activityID}
                    onChange={(e) => setActivityID(e.target.value)}
                    required
                />

                <label className="required">Title</label>
                <input
                    type="text"
                    placeholder="Article title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <label className="required">First Author</label>
                {participants.length > 0 ? (
                    <select
                        value={firstAuthorID}
                        onChange={(e) => setFirstAuthorID(e.target.value)}
                        required
                    >
                        <option value="">Select an author...</option>
                        {participants.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.firstName} {p.lastName} ({p.email})
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        placeholder={eventID ? "No participants found. Type ID manually." : "Enter Event ID first or type ID manually."}
                        value={firstAuthorID}
                        onChange={(e) => setFirstAuthorID(e.target.value)}
                        required
                    />
                )}

                <label>Co-Authors</label>
                {participants.length > 0 ? (
                    <select
                        multiple
                        value={selectedCoAuthors}
                        onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions, option => option.value);
                            setSelectedCoAuthors(values);
                        }}
                        style={{ height: "100px" }}
                    >
                        {participants.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.firstName} {p.lastName} ({p.email})
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        placeholder="Comma-separated co-author IDs (e.g. 1, 2, 3)"
                        value={selectedCoAuthors.join(",")}
                        onChange={(e) => setSelectedCoAuthors(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    />
                )}

                <label className="required">Publisher</label>
                <input
                    type="text"
                    placeholder="Publisher name"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    required
                />

                <label>DOI</label>
                <input
                    type="text"
                    placeholder="Digital Object Identifier"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                />

                <label>ISBN</label>
                <input
                    type="text"
                    placeholder="ISBN"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                />

                <label className="required">URL</label>
                <input
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                />

                <button type="submit">Create Article</button>
                <p className={isError ? "error" : "success"}>
                    {message}
                </p>
            </form>
        );
    }
}
