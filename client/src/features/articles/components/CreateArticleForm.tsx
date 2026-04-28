import { envHostBackend } from '@/shared/utils/env';
import { getCookie } from '@/shared/utils/getCookie';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserSearchInput, { AppUser } from '@/shared/components/UserSearchInput';

type EventOption = {
    ID: number;
    Name: string;
};

type ActivityOption = {
    ID: number;
    Name: string;
};

/**
 * Form component for creating a new article and associating it
 * with an event activity via the `/article/create` endpoint.
 * Event and Activity are selected via dropdown menus.
 */
export default function CreateArticleForm() {
    const [selectedEventId, setSelectedEventId] = useState("");
    const [selectedActivityId, setSelectedActivityId] = useState("");

    const [events, setEvents] = useState<EventOption[]>([]);
    const [activities, setActivities] = useState<ActivityOption[]>([]);

    const [title, setTitle] = useState("");
    const [firstAuthor, setFirstAuthor] = useState<AppUser | null>(null);
    const [coAuthors, setCoAuthors] = useState<AppUser[]>([]);
    const [publisher, setPublisher] = useState("");
    const [doi, setDoi] = useState("");
    const [isbn, setIsbn] = useState("");
    const [url, setUrl] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [createdArticleId, setCreatedArticleId] = useState<number | null>(null);

    // Fetch user's events
    useEffect(() => {
        async function fetchEvents() {
            const csrfToken = getCookie("csrf_token");
            try {
                const response = await fetch(
                    `http://${envHostBackend()}/event/my`,
                    {
                        credentials: "include",
                        headers: { "X-CSRF-Token": csrfToken },
                    }
                );
                if (response.status === 200) {
                    const data = await response.json();
                    setEvents(data.map((e: any) => ({
                        ID: e.ID || e.id,
                        Name: e.Name || e.name || e.Title || e.title || `Event ${e.ID || e.id}`,
                    })));
                }
            } catch {
                // silently fail
            }
        }

        fetchEvents();
    }, []);

    // Fetch activities for selected event
    useEffect(() => {
        if (!selectedEventId || isNaN(Number(selectedEventId))) {
            setActivities([]);
            return;
        }

        async function fetchActivities() {
            const csrfToken = getCookie("csrf_token");
            try {
                const response = await fetch(
                    `http://${envHostBackend()}/event/${selectedEventId}/activity/list`,
                    {
                        credentials: "include",
                        headers: { "X-CSRF-Token": csrfToken },
                    }
                );
                if (response.status === 200) {
                    const data = await response.json();
                    setActivities(data.map((a: any) => ({
                        ID: a.ID || a.id,
                        Name: a.Name || a.name || `Activity ${a.ID || a.id}`,
                    })));
                } else {
                    setActivities([]);
                }
            } catch {
                setActivities([]);
            }
        }

        fetchActivities();
    }, [selectedEventId]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!firstAuthor) {
            setMessage("Please select a first author");
            setIsError(true);
            return;
        }

        if (!selectedEventId || !selectedActivityId) {
            setMessage("Please select an event and activity");
            setIsError(true);
            return;
        }

        const csrfToken = getCookie("csrf_token");
        const formData = new FormData();

        formData.append("eventID", selectedEventId);
        formData.append("activityID", selectedActivityId);
        formData.append("title", title);
        formData.append("firstAuthorID", firstAuthor.id.toString());
        formData.append("coAuthorsID", coAuthors.map(a => a.id).join(","));
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

    const handleRemoveCoAuthor = (userId: number) => {
        setCoAuthors(prev => prev.filter(a => a.id !== userId));
    };

    // IDs to exclude from search results (already selected)
    const excludeIds = [
        ...(firstAuthor ? [firstAuthor.id] : []),
        ...coAuthors.map(a => a.id)
    ];

    if (createdArticleId !== null) {
        return (
            <div style={{ textAlign: "center", margin: "100px" }}>
                <h2 style={{ color: "green" }}>Article created successfully!</h2>
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
                    <button type="button">
                        <Link to={`/event/${selectedEventId}/activity/${selectedActivityId}/article/${createdArticleId}/tags`}>
                            Manage Tags for this Article
                        </Link>
                    </button>
                    <button type="button">
                        <Link to={`/event/${selectedEventId}/activity/${selectedActivityId}/article/${createdArticleId}/authors`}>
                            Manage Authors for this Article
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

                <label className="required">Event</label>
                <select
                    value={selectedEventId}
                    onChange={(e) => {
                        setSelectedEventId(e.target.value);
                        setSelectedActivityId("");
                    }}
                    required
                >
                    <option value="">Select an event...</option>
                    {events.map((ev) => (
                        <option key={ev.ID} value={ev.ID}>
                            {ev.Name}
                        </option>
                    ))}
                </select>

                <label className="required">Activity</label>
                <select
                    value={selectedActivityId}
                    onChange={(e) => setSelectedActivityId(e.target.value)}
                    required
                    disabled={!selectedEventId}
                >
                    <option value="">
                        {selectedEventId ? "Select an activity..." : "Select an event first"}
                    </option>
                    {activities.map((act) => (
                        <option key={act.ID} value={act.ID}>
                            {act.Name}
                        </option>
                    ))}
                </select>

                <label className="required">Title</label>
                <input
                    type="text"
                    placeholder="Article title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <label className="required">First Author</label>
                {firstAuthor ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <span style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px", flex: 1 }}>
                            <strong>{firstAuthor.firstName} {firstAuthor.lastName}</strong> ({firstAuthor.email})
                        </span>
                        <button type="button" onClick={() => setFirstAuthor(null)}>Change</button>
                    </div>
                ) : (
                    <UserSearchInput
                        onSelectUser={(user) => setFirstAuthor(user)}
                        buttonText="Set as First Author"
                        excludeUserIds={excludeIds}
                    />
                )}

                <label>Co-Authors</label>
                {coAuthors.length > 0 && (
                    <ul style={{ listStyle: "none", padding: 0, marginBottom: "10px" }}>
                        {coAuthors.map(author => (
                            <li key={author.id} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                marginBottom: "5px"
                            }}>
                                <span><strong>{author.firstName} {author.lastName}</strong> ({author.email})</span>
                                <button type="button" onClick={() => handleRemoveCoAuthor(author.id)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                )}
                <UserSearchInput
                    onSelectUser={(user) => setCoAuthors(prev => [...prev, user])}
                    buttonText="Add Co-Author"
                    excludeUserIds={excludeIds}
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
