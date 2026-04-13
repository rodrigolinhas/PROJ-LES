import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCookie } from "../../../../shared/utils/getCookie";

type Activity = {
    ID: number;
    Name: string;
    Description: string;
    Place: string;
    StartDate: string;
    EndDate: string;
};

export default function ViewActivityPage() {
    const {id} = useParams();
    const {eventId} = useParams();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivity() {
            const csrfToken = getCookie("csrf_token");

            try {
                const response = await fetch(
                    `http://localhost:8080/event/${eventId}/activity/view/${id}`,
                    {
                        credentials: "include",
                        headers: { "X-CSRF-Token": csrfToken }
                    }
                );

                if (response.status === 200) {
                    const data = await response.json();
                    setActivity(data);
                } else {
                    const text = await response.text();
                    setError(text || "Activity not found");
                }
            } catch {
                setError("Server error");
            } finally {
                setLoading(false);
            }
        }

        fetchActivity();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!activity) return null;

    return (
        <div>
            <h1>{activity.Name}</h1>
            <p>{activity.Description}</p>
            <p><strong>Start:</strong> {new Date(activity.StartDate).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(activity.EndDate).toLocaleString()}</p>
            {activity.Place && <p><strong>Location:</strong> {activity.Place}</p>}

            <Link to={`/event/${eventId}/activity/edit/${id}`}>Edit</Link>

            <br />
            <Link to={`/event/${eventId}/activity/list`}>Back to list</Link>


        </div>
    );
}
