import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCookie } from "../../../shared/utils/getCookie";

/** Minimal event representation returned by the listing endpoints. */
type ShortEvent = {
    ID: number;
    Name: string;
    Theme: string;
};

/** Props accepted by the {@link EventList} component. */
type EventListProps = {
    /** Section heading displayed above the list. */
    title: string;
    /** Backend endpoint URL for fetching events. */
    endpoint: string;
    /** Message shown when the list is empty. */
    emptyMessage: string;
    /** Whether to display an "Edit" link for each event. */
    showEditButton?: boolean;
};

/** Number of events fetched per page. */
const PAGE_SIZE = 10;

/**
 * Reusable paginated event list with search filtering.
 *
 * Fetches events from the given `endpoint`, supports name-based filtering
 * and offset pagination. Optionally renders an edit link per event.
 */
export default function EventList({
                                      title,
                                      endpoint,
                                      emptyMessage,
                                      showEditButton = false,
                                  }: EventListProps) {
    const [events, setEvents] = useState<ShortEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [draftFilter, setDraftFilter] = useState("");
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(0);

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            setError("");

            const csrfToken = getCookie("csrf_token");

            try {
                const response = await fetch(
                    `${endpoint}?filter=${encodeURIComponent(filter)}&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "X-CSRF-Token": csrfToken,
                        },
                    }
                );

                if (response.status === 200) {
                    const data = await response.json();
                    setEvents(data);
                } else if (response.status === 404) {
                    setEvents([]);
                } else {
                    const errorText = await response.text();
                    setError(errorText || "Failed to load events.");
                    setEvents([]);
                }
            } catch {
                setError("Server error while loading events.");
                setEvents([]);
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, [endpoint, filter, page]);

    /** Applies the draft filter value and resets pagination to the first page. */
    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPage(0);
        setFilter(draftFilter.trim());
    }

    return (
        <div>
            <h2>{title}</h2>

            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Filter by event name"
                    value={draftFilter}
                    onChange={(e) => setDraftFilter(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            {loading && <p>Loading events...</p>}
            {!loading && error && <p className="error">{error}</p>}
            {!loading && !error && events.length === 0 && <p>{emptyMessage}</p>}

            {!loading && !error && events.length > 0 && (
                <ul>
                    {events.map((event) => (
                        <li key={event.ID}>
                            <strong>{event.Name}</strong> – {event.Theme}
                            {showEditButton && (
                                <>
                                    {" "}
                                    <Link to={`/event/edit/${event.ID}`}>Edit</Link>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <div>
                <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                >
                    Previous
                </button>

                <span>Page {page + 1}</span>

                <button
                    type="button"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={events.length < PAGE_SIZE}
                >
                    Next
                </button>
            </div>
        </div>
    );
}