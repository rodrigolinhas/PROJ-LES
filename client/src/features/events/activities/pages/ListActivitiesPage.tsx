import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCookie } from "../../../../shared/utils/getCookie";

type Activity = {
    ID: number;
    Name: string;
};

export default function ListActivityPage() {
    const { eventId } = useParams();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivities() {
            const csrfToken = getCookie("csrf_token");

            const response = await fetch(
                `http://localhost:8080/event/${eventId}/activity/list`,
                {
                    credentials: "include",
                    headers: { "X-CSRF-Token": csrfToken }
                }
            );

            if (response.status === 200) {
                const data = await response.json();
                setActivities(data);
            }

            setLoading(false);
        }

        fetchActivities();
    }, [eventId]);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Activities</h2>

            <ul>
                {activities.map(a => (
                    <li key={a.ID}>
                        <Link to={`/event/${eventId}/activity/view/${a.ID}`}>
                            {a.Name}
                        </Link>
                    </li>
                ))}
            </ul>

            <Link to={`/event/${eventId}`}>Back to Event</Link>
        </div>
    );
}