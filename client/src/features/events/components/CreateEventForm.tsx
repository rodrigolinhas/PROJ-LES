import { envHostBackend } from '@/shared/utils/env';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCookie } from "@/shared/utils/getCookie.ts";
import { mainDivStyle, titleStyle, descriptionStyle, successOutDivStyle, successDivStyle, successMessageStyle, goHomeStyle, mandatoryLabelStyle, inputStyle, submitButtonStyle, errorMessageStyle } from '@/shared/styles/formStyles';

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
            <div className={successOutDivStyle}>
                <div className={successDivStyle}>
                    <h2 className={successMessageStyle}>Event created with success!</h2>
                    <Link to ="/home" className={goHomeStyle}>Go back to Home</Link>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className={mainDivStyle}>
                <div>
                    <h2 className={titleStyle}>+ Create Event</h2>
                    <p className={descriptionStyle}>
                        Fill the fields bellow to create a new scientific event.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label className={mandatoryLabelStyle}>Name</label>
                        <input
                            type="text"
                            placeholder="e.g., International Summit on Artificial Intelligence"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={mandatoryLabelStyle}>Theme</label>
                        <input
                            type="text"
                            placeholder="e.g., Machine Learning"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={mandatoryLabelStyle}>Description</label>
                        <textarea
                            placeholder="Provide a brief overview of the event, main topics, and target audience"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={3}
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={mandatoryLabelStyle}>Organization</label>
                        <input
                            type="text"
                            placeholder="e.g., University of Algarve"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={mandatoryLabelStyle}>Location</label>
                        <input
                            type="text"
                            placeholder="e.g., Main Auditorium, Building C"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={mandatoryLabelStyle}>Start Date</label>
                        <input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={mandatoryLabelStyle}>End Date</label>
                        <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div className="flex justify-center">
                        <button type="submit" className={submitButtonStyle}>
                            Create Event
                        </button>
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
}
