import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCookie } from "../../../shared/utils/getCookie";
import RegTypesList from "../regtypes/components/RegTypesList.tsx";

type EventDetails = {
    ID: number;
    Name: string;
    Theme: string;
    Description: string;
    Organization: string;
    Location: string;
    StartDate: string;
    EndDate: string;
};

export default function ViewEventPage() {
    const { id } = useParams();
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvent() {
            const csrfToken = getCookie("csrf_token");

            try {
                const response = await fetch(
                    `http://localhost:8080/event/view/${id}`,
                    {
                        credentials: "include",
                        headers: {
                            "X-CSRF-Token": csrfToken,
                        },
                    }
                );

                if (response.status === 200) {
                    const data = await response.json();
                    setEvent(data);
                } else {
                    setError("Event not found");
                }
            } catch {
                setError("Server error");
            } finally {
                setLoading(false);
            }
        }

        fetchEvent();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!event) return null;

    return (
        <div>
            <h1>{event.Name}</h1>
            <p><strong>Theme:</strong> {event.Theme}</p>
            <p><strong>Description:</strong> {event.Description}</p>
            <p><strong>Organization:</strong> {event.Organization}</p>
            <p><strong>Location:</strong> {event.Location}</p>
            <p><strong>Start:</strong> {new Date(event.StartDate).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(event.EndDate).toLocaleString()}</p>

            <hr />
                <RegTypesList eventId={id!} />
            <hr />

            <Link to={`/event/${event.ID}/activity/list`}>
                View Activities
            </Link>

            <Link to="/events">Back</Link>
        </div>
    );
}