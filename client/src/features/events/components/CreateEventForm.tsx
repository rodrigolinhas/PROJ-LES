import { envHostBackend } from '@/shared/utils/env';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function getCookie(name: string) {
    const value = "; " + document.cookie;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export default function CreateEventForm() {
    const [name, setName] = useState("");
    const [theme, setTheme] = useState("");
    const [description, setDescription] = useState("");
    const [organization, setOrganization] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [eventCreated, setEventCreated] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();

        formData.append("name", name);
        formData.append("theme", theme);
        formData.append("description", description);
        formData.append("organization", organization);
        formData.append("location", location);
        formData.append("startDate", new Date(startDate).toISOString()); // convreter p rfc3339
        formData.append("endDate", new Date(endDate).toISOString());

        try {
            const response = await fetch("http://" + envHostBackend() + "/event/create", {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include"
            });

            if(response.status === 201) {
                setMessage("Event Created Successfully!");
                setIsError(false);
                setEventCreated(true);
            }
            else {
                const errorText = await response.text();
                setMessage(errorText);
                setIsError(true);
                setEventCreated(false);
            }
        }
        catch(error) {
            setMessage("Server error");
            setIsError(true);
            setEventCreated(false);
        }
    }

    if (eventCreated) {
        return (
            <div style={{ textAlign: "center", margin: "100px" }}>
                <h2 style={{ color: "green" }}>Event created with success!</h2>
                <Link to ="/home">Go back to Home</Link>
            </div>
        );
    }
    else {
        return (
            <form onSubmit={handleSubmit}>
                <h2>Create Event</h2>
                <label className="required">Name</label>
                <input
                    type="text"
                    placeholder="Event name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <label className="required">Theme</label>
                <input
                    type="text"
                    placeholder="Event theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    required
                />
                <label className="required">Description</label>
                <textarea
                    placeholder="Event description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <label className="required">Organization</label>
                <input
                    type="text"
                    placeholder="Organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                />
                <label className="required">Location</label>
                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
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
                <button type = "submit">Create Event</button>
                <p className={isError ? "error" : "success"}>
                    {message}
                </p>
            </form>
        );
    }
}
