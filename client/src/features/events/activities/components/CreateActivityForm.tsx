import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCookie } from "@/shared/utils/getCookie.ts"

export default function CreateActivityForm() {
    const {eventId} = useParams();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [place, setPlace] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [activityCreated, setActivityCreated] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();

        formData.append("name", name);
        formData.append("description", description);
        formData.append("startDate", new Date(startDate).toISOString()); // convreter p rfc3339
        formData.append("endDate", new Date(endDate).toISOString());
        formData.append("place", place);

        try {
            const response = await fetch(`http://localhost:8080/event/${eventId}/activity/create`, {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include"
            });

            if(response.status === 201) {
                setMessage("Activity created successfully!");
                setIsError(false);
                setActivityCreated(true);
            }
            else if (response.status === 401) {
                setMessage("Your session has expired. Please log in again.");
                setIsError(true);
                setActivityCreated(false);
            }
            else {
                const errorText = await response.text();
                setMessage(errorText);
                setIsError(true);
                setActivityCreated(false);
            }
        }
        catch(error) {
            setMessage("Server error");
            setIsError(true);
            setActivityCreated(false);
        }
    }

    if (activityCreated) {
        return (
            <div style={{ textAlign: "center", margin: "100px" }}>
                <h2 style={{ color: "green" }}>Activity created successfully!</h2>
                <Link to = {`/event/${eventId}`}>Go back to the event page</Link>
            </div>
        );
    }
    else {
        return (
            <form onSubmit={handleSubmit}>
                <h2>Create Activity</h2>
                <label className="required">Name</label>
                <input
                    type="text"
                    placeholder="Activity name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <label className="required">Description</label>
                <textarea
                    placeholder="Activity description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <label className="required">Start Date</label>
                <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />
                <label className="required">End Date</label>
                <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                />
                <label>Location</label>
                <input
                    placeholder="Activity Location"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                />
                <button type = "submit">Create Activity</button>
                <p className={isError ? "error" : "success"}>
                    {message}
                </p>
            </form>
        );
    }
}
