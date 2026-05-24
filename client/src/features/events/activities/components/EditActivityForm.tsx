import { useEffect, useState } from "react";
import DeleteActivityButton from "./DeleteActivityButton";
import { Link } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie.ts"
import { envHostBackend } from "@/shared/utils/env";
import {
    buttonsDivStyle,
    descriptionStyle, errorMessageStyle,
    goHomeStyle, inputStyle, labelStyle,
    mainDivStyle, submitButtonStyle,
    successDivStyle,
    successMessageStyle,
    successOutDivStyle, titleStyle
} from "@/shared/styles/formStyles.ts";

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
    Place: string;
};

export default function EditActivityForm({ eventId, activityID }: Props) {
    const [activity, setActivity] = useState<Activity | null>(null);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [deleted, setDeleted] = useState(false);

    useEffect(() => {
        async function fetchActivity() {
            const csrfToken = getCookie("csrf_token") || "";

            try {
                const res = await fetch(
                    `http://${envHostBackend()}/event/${eventId}/activity/view/${activityID}`,
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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!activity) return;

        const csrfToken = getCookie("csrf_token") || "";

        const formData = new FormData();
        formData.append("name", activity.Name);
        formData.append("description", activity.Description);
        formData.append("startDate", new Date(activity.StartDate).toISOString());
        formData.append("endDate", new Date(activity.EndDate).toISOString());
        formData.append("place", activity.Place);

        try {
            const res = await fetch(
                `http://${envHostBackend()}/event/${eventId}/activity/edit/${activityID}`,
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
                setMessage("Activity updated successfully!");
                setIsError(false);
            } else if (res.status === 401) {
                setMessage("Your session has expired. Please log in again.");
                setIsError(true);
            } else {
                setMessage(await res.text());
                setIsError(true);
            }
        } catch {
            setMessage("Server error");
            setIsError(true);
        }
    }

    if (deleted) {
        return (
            <div className={successOutDivStyle}>
                <div className={successDivStyle}>
                    <h2 className={successMessageStyle}>Activity deleted successfully!</h2>
                    <Link to ={`/event/${eventId}`} className={goHomeStyle}>Back to Event</Link>
                </div>
            </div>
        );
    }

    if (!activity) return <p>Loading...</p>;

    return (
        <div className={mainDivStyle}>
            <div>
                <h2 className={titleStyle}>✎ Edit Activity</h2>
                <p className={descriptionStyle}>
                    Edit the activity fields you want to change.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div>
                    <label className={labelStyle}>Name</label>
                    <input
                        type="text"
                        placeholder="e.g., Presentation"
                        value={activity.Name}
                        onChange={(e) =>
                            setActivity({ ...activity, Name: e.target.value })
                        }
                        required
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelStyle}>Description</label>
                    <textarea
                        placeholder="Provide a brief overview of the activity"
                        value={activity.Description}
                        onChange={(e) =>
                            setActivity({ ...activity, Description: e.target.value })
                        }
                        required
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelStyle}>Location</label>
                    <input
                        type="text"
                        placeholder="e.g., Main Auditorium, Building C"
                        value={activity.Place}
                        onChange={(e) =>
                            setActivity({ ...activity, Place: e.target.value })
                        }
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelStyle}>Start Date</label>
                    <input
                        type="datetime-local"
                        value={activity.StartDate.slice(0, 16)}
                        onChange={(e) =>
                            setActivity({ ...activity, StartDate: e.target.value })
                        }
                        required
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelStyle}>End Date</label>
                    <input
                        type="datetime-local"
                        value={activity.EndDate.slice(0, 16)}
                        onChange={(e) =>
                            setActivity({ ...activity, EndDate: e.target.value })
                        }
                        required
                        className={inputStyle}
                    />
                </div>

                <div className={buttonsDivStyle}>
                    <button type = "submit" className={submitButtonStyle}>
                        Save Changes
                    </button>

                    <DeleteActivityButton
                        eventId={eventId}
                        activityID={activityID}
                        onDeleted={() => setDeleted(true)}
                    />
                </div>

                {message && isError && (
                    <p className={errorMessageStyle}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}
