import { useEffect, useState } from "react";
import DeleteActivityButton from "./DeleteActivityButton";
import { Link } from "react-router-dom";

function getCookie(name: string) {
    const value = "; " + document.cookie;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
}

type Props = {
    eventId: number;
    activityID: number;
};

type Activity = {
    ID: number;
    Name: string;
    Description: string;
    StartDate: string;
    EndDate: string;
};

export default function EditActivityForm({ eventId, activityID }: Props) {
    const [activity, setActivity] = useState<Activity | null>(null);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [deleted, setDeleted] = useState(false);

    // 🔹 LOAD ACTIVITY
    useEffect(() => {
        async function fetchActivity() {
            const csrfToken = getCookie("csrf_token") || "";

            try {
                const res = await fetch(
                    `http://localhost:8080/event/${eventId}/activity/view/${activityID}`,
                    {
                        credentials: "include",
                        headers: {
                            "X-CSRF-Token": csrfToken
                        }
                    }
                );

                if (res.status === 200) {
                    const data = await res.json();
                    setActivity(data);
                } else {
                    setIsError(true);
                    setMessage("Failed to load activity");
                }
            } catch {
                setIsError(true);
                setMessage("Server error");
            }
        }

        fetchActivity();
    }, [eventId, activityID]);

    // 🔹 EDIT ACTIVITY
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!activity) return;

        const csrfToken = getCookie("csrf_token") || "";

        const formData = new FormData();
        formData.append("name", activity.Name);
        formData.append("description", activity.Description);
        formData.append("startDate", new Date(activity.StartDate).toISOString());
        formData.append("endDate", new Date(activity.EndDate).toISOString());

        try {
            const res = await fetch(
                `http://localhost:8080/event/${eventId}/activity/edit/${activityID}`,
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        "X-CSRF-Token": csrfToken
                    },
                    credentials: "include"
                }
            );

            if (res.status === 200) {
                setMessage("Activity updated!");
                setIsError(false);
            } else {
                setMessage(await res.text());
                setIsError(true);
            }
        } catch {
            setMessage("Server error");
            setIsError(true);
        }
    }

    // 🔹 AFTER DELETE
    if (deleted) {
        return (
            <div>
                <h2>Activity deleted successfully!</h2>
                <Link to={`/event/${eventId}/activity/list`}>
                    Back to Activities
                </Link>
            </div>
        );
    }

    if (!activity) return <p>Loading...</p>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>Edit Activity</h2>

            <label>Name</label>
            <input
                value={activity.Name}
                onChange={(e) =>
                    setActivity({ ...activity, Name: e.target.value })
                }
                required
            />

            <label>Description</label>
            <textarea
                value={activity.Description}
                onChange={(e) =>
                    setActivity({ ...activity, Description: e.target.value })
                }
                required
            />

            <label>Start Date</label>
            <input
                type="datetime-local"
                value={activity.StartDate.slice(0, 16)}
                onChange={(e) =>
                    setActivity({ ...activity, StartDate: e.target.value })
                }
                required
            />

            <label>End Date</label>
            <input
                type="datetime-local"
                value={activity.EndDate.slice(0, 16)}
                onChange={(e) =>
                    setActivity({ ...activity, EndDate: e.target.value })
                }
                required
            />

            <button type="submit">Save</button>

            <p className={isError ? "error" : "success"}>
                {message}
            </p>

            <hr />

            <DeleteActivityButton
                eventId={eventId}
                activityID={activityID}
                onDeleted={() => setDeleted(true)}
            />
            <Link to={`/event/${eventId}/activity/view/${activityID}`}>Back</Link>
        </form>
    );
}