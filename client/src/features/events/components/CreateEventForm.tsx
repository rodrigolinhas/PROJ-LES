import { envHostBackend } from '@/shared/utils/env';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCookie } from "@/shared/utils/getCookie.ts";

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

    const inputStyle = "w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none font-sans";
    const labelStyle = "font-medium text-sm text-gray-700 after:content-['*'] after:ml-1 after:text-red-500";

    if (eventCreated) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center p-6 border rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-green-600 mb-4">Event created with success!</h2>
                <Link to ="/home" className="text-blue-600 hover:underline">Go back to Home</Link>
            </div>
        );
    }
    else {
        return (
            <div className="max-w-lg mx-auto mt-10 px-10 pt-10 pb-8 bg-gray-50 rounded-lg shadow-2xl">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Create Event</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Fill the fields bellow to create a new scientific event.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className={labelStyle}>Name</label>
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
                        <label className={labelStyle}>Theme</label>
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
                        <label className={labelStyle}>Description</label>
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
                        <label className={labelStyle}>Organization</label>
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
                        <label className={labelStyle}>Location</label>
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
                        <label className={labelStyle}>Start Date</label>
                        <input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>End Date</label>
                        <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div className="flex justify-center">
                        <button type="submit" className="mt-4 min-w-[250px] px-10 py-3 bg-gray-900 text-white rounded border-none hover:bg-gray-800 transition-colors">
                            Create Event
                        </button>
                    </div>

                    {message && (
                        <p className={`mt-2 text-center text-sm font-medium ${isError ? "text-red-600" : "text-green-600"}`}>
                            {message}
                        </p>
                    )}
                </form>
            </div>
        );
    }
}
