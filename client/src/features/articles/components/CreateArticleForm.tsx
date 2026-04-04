import { envHostBackend } from '@/shared/utils/env';
import { getCookie } from '@/shared/utils/getCookie';
import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Form component for creating a new article and associating it
 * with an event activity via the `/article/create` endpoint.
 *
 * Required fields: eventID, activityID, title, firstAuthorID, publisher, url.
 * Optional fields: coAuthorsID, doi, isbn.
 */
export default function CreateArticleForm() {
    const [eventID, setEventID] = useState("");
    const [activityID, setActivityID] = useState("");
    const [title, setTitle] = useState("");
    const [firstAuthorID, setFirstAuthorID] = useState("");
    const [coAuthorsID, setCoAuthorsID] = useState("");
    const [publisher, setPublisher] = useState("");
    const [doi, setDoi] = useState("");
    const [isbn, setIsbn] = useState("");
    const [url, setUrl] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [articleCreated, setArticleCreated] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const csrfToken = getCookie("csrf_token");
        const formData = new FormData();

        formData.append("eventID", eventID);
        formData.append("activityID", activityID);
        formData.append("title", title);
        formData.append("firstAuthorID", firstAuthorID);
        formData.append("coAuthorsID", coAuthorsID);
        formData.append("publisher", publisher);
        formData.append("doi", doi);
        formData.append("isbn", isbn);
        formData.append("url", url);

        try {
            const response = await fetch("http://" + envHostBackend() + "/article/create", {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include"
            });

            if (response.status === 201) {
                setMessage("Article created successfully!");
                setIsError(false);
                setArticleCreated(true);
            } else {
                const errorText = await response.text();
                setMessage(errorText);
                setIsError(true);
                setArticleCreated(false);
            }
        } catch {
            setMessage("Server error");
            setIsError(true);
            setArticleCreated(false);
        }
    }

    if (articleCreated) {
        return (
            <div style={{ textAlign: "center", margin: "100px" }}>
                <h2 style={{ color: "green" }}>Article created successfully!</h2>
                <Link to="/home">Go back to Home</Link>
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

                <label className="required">First Author ID</label>
                <input
                    type="text"
                    placeholder="ID of the first author"
                    value={firstAuthorID}
                    onChange={(e) => setFirstAuthorID(e.target.value)}
                    required
                />

                <label>Co-Authors IDs</label>
                <input
                    type="text"
                    placeholder="Comma-separated co-author IDs (e.g. 1, 2, 3)"
                    value={coAuthorsID}
                    onChange={(e) => setCoAuthorsID(e.target.value)}
                />

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
