import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCookie } from "@/shared/utils/getCookie.ts"
import {
    mainDivStyle,
    titleStyle,
    descriptionStyle,
    successOutDivStyle,
    successDivStyle,
    successMessageStyle,
    goHomeStyle,
    mandatoryLabelStyle,
    inputStyle,
    submitButtonStyle,
    errorMessageStyle,
    buttonsDivStyle
} from '@/shared/styles/formStyles';


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
                setMessage("Activity Created Successfully!");
                setIsError(false);
                setActivityCreated(true);
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
            <div className={successOutDivStyle}>
                <div className={successDivStyle}>
                    <h2 className={successMessageStyle}>Activity created with success!</h2>
                    <Link to = {`/event/${eventId}/activity/list`} className={goHomeStyle}>Go back to this event's activities list</Link>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className={mainDivStyle}>
                <div>
                    <h2 className={titleStyle}>+ Create Activity</h2>
                    <p className={descriptionStyle}>
                        Fill the fields bellow to create a new activity.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label className={mandatoryLabelStyle}>Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Presentation"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={mandatoryLabelStyle}>Description</label>
                        <textarea
                            placeholder="Provide a brief overview of the activity"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={mandatoryLabelStyle}>Location</label>
                        <input
                            type="text"
                            placeholder="e.g., Main Auditorium, Building C"
                            value={place}
                            onChange={(e) => setPlace(e.target.value)}
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

                    <div className={buttonsDivStyle}>
                        <button type = "submit" className={submitButtonStyle}>
                            Create Activity
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
