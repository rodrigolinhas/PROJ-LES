import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCookie } from "../../../shared/utils/getCookie";

/** Minimal event representation returned by the listing endpoints. */
type ShortEvent = {
    ID: number;
    Name: string;
    Theme: string;
    Location: string;
    StartDate: string;
    EndDate: string;
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
            <h2 className="text-center mt-0">{title}</h2>

            <form onSubmit={handleSearch} className="flex m-0! flex-row! w-full max-w-none!">
                <input
                    type="text"
                    placeholder="Filter by event name"
                    value={draftFilter}
                    onChange={(e) => setDraftFilter(e.target.value)}
                    className="flex-1 rounded-md border-black border-2 border-solid"
                />
                <button type="submit" className="flex-none w-20 bg-black text-white border-0 rounded-md">Search</button>
            </form>

            {loading && <p>Loading events...</p>}
            {!loading && error && <p className="error">{error}</p>}
            {!loading && !error && events.length === 0 && <p>{emptyMessage}</p>}

            {!loading && !error && events.length > 0 && (
                <div className="my-4">
                    {events.map((event) => (
                        <Link className="block mt-3 border p-2 rounded-lg w-fit no-underline text-black" to={`/event/${event.ID}`}>
                            <strong className="text-2xl">{event.Name}</strong> – {event.Theme}
                            <br />
                            <strong>Location:</strong> {event.Location}
                            <br />
                            <strong>Date/Time:</strong> {new Date(event.StartDate).toLocaleString()} — {new Date(event.EndDate).toLocaleString()}
                            {/* TODO: Add more info */}
                            {showEditButton && (
                                <>
                                    {" "}
                                    <Link to={`/event/edit/${event.ID}`}>Edit</Link>
                                </>
                            )}
                        </Link>
                    ))}
                </div>
            )}

            <div className="m-auto w-fit">
                <button className="border-2 rounded-full size-10"
                    type="button"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                    </svg> 
                </button>

                <span className="px-5">Page {page + 1}</span>

                <button className="border-2 rounded-full size-10"
                    type="button"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={events.length < PAGE_SIZE}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}
