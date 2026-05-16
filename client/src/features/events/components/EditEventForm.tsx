import { useState, useEffect } from 'react';
import PublishEventButton from "../components/PublishEventButton.tsx";
import DeleteEventButton from '../components/DeleteEventButton.tsx';
import { Link } from 'react-router-dom';
import { envHostBackend } from '@/shared/utils/env.ts';
import { getCookie } from "@/shared/utils/getCookie.ts";
import {
    mainDivStyle, titleStyle, descriptionStyle, labelStyle, inputStyle, submitButtonStyle, errorMessageStyle,
    otherButtonsDivStyle, backLinkStyle, buttonsDivStyle, backDivStyle, smallLinksStyle, successOutDivStyle,
    successDivStyle, successMessageStyle, goHomeStyle
} from '@/shared/styles/formStyles';

type RegType = {
    ID: number;
    Name: string;
    Description: string;
    Price: number;
    Benefits: string[];
};

async function loadEventInfo(id: number): Promise<LongEvent> {
    const csrfToken = getCookie("csrf_token") || "";

    const res = await fetch(`http://${envHostBackend()}/event/view/${id}`, {
        method: "GET",
        headers: {
            "X-CSRF-Token": csrfToken
        },
        credentials: "include"
    })

    let pro = new Promise<LongEvent>((resolve, reject) => {
        if(res.status === 200) {
            resolve(res.json())
        }
        else {
            reject()
        }
    })

    return pro
}

async function loadRegTypes(id: number): Promise<RegType[]> {
    const csrfToken = getCookie("csrf_token") || "";
    const res = await fetch(`http://${envHostBackend()}/event/view/${id}/regtypes`, {
        method: "GET",
        headers: {
            "X-CSRF-Token": csrfToken
        },
        credentials: "include"
    })

    let pro = new Promise<RegType[]>((resolve, reject) => {
        if(res.status === 200) {
            resolve(res.json())
        }
        else if(res.status === 404) {
            resolve([]);
        }
        else {
            reject()
        }
    })

    return pro
}

type LongEvent = {
    Closed: boolean;
    Description: string;
    EndDate: string;
    ID: number;
    Location: string;
    Name: string;
    Organization: string;
    OrganizerID: number;
    Published: boolean;
    StartDate: string;
    Theme: string;
}

export default function EditEventForm(props: any) {

    let eventID: number = props.eventID

    const [name, setName] = useState("");
    const [theme, setTheme] = useState("");
    const [description, setDescription] = useState("");
    const [organization, setOrganization] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [published, setPublished] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [eventLoaded, setEventLoaded] = useState(false);
    const [eventDeleted, setEventDeleted] = useState(false);

    function loadEventState(event: LongEvent) {
        let start = new Date(event.StartDate)
        setName(event.Name)
        setTheme(event.Theme)
        setDescription(event.Description)
        setOrganization(event.Organization)
        setLocation(event.Location)
        setStartDate(start.toString())
        setEndDate(event.EndDate)
        setPublished(event.Published)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();

        formData.append("eventID", eventID.toString());
        formData.append("name", name);
        formData.append("theme", theme);
        formData.append("description", description);
        formData.append("organization", organization);
        formData.append("location", location);
        formData.append("startDate", new Date(startDate).toISOString());
        formData.append("endDate", new Date(endDate).toISOString());

        try {
            const response = await fetch("http://" + envHostBackend() + "/event/edit", {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include"
            });

            if(response.status === 200) {
                setMessage("Event Edited Successfully!");
                setIsError(false);
            }
            else {
                const errorText = await response.text();
                setMessage(errorText);
                setIsError(true);
            }
        }
        catch(error) {
            setMessage("Server error");
            setIsError(true);
        }
    }

    useEffect(() => {
        Promise.all([loadEventInfo(eventID), loadRegTypes(eventID)])
            .then(([event]) => {
                loadEventState(event);
                setEventLoaded(true);
            })
            .catch((err) => console.log(err));
    }, [eventID]);

    if (!eventLoaded) {
        return (
            <h1>Loading Event...</h1>
        )
    }

    if(eventDeleted) {
        return (
            <div className={successOutDivStyle}>
                <div className={successDivStyle}>
                    <h2 className={successMessageStyle}>Event deleted successfully!</h2>
                    <Link to ="/home" className={goHomeStyle}>Go back to Home</Link>
                </div>
            </div>
        );
    }
    else
    {
        return (
            <div className={mainDivStyle}>
                <div>
                    <h2 className={titleStyle}>✎ Edit Event</h2>
                    <p className={descriptionStyle}>
                        Edit the event fields you want to change.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
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
                            value={(new Date(startDate)).toISOString().slice(0, -1)} //TODO: do this in a clean way
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>End Date</label>
                        <input
                            type="datetime-local"
                            value={(new Date(endDate)).toISOString().slice(0, -1)} //TODO: do this in a clean way
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div className={buttonsDivStyle}>
                        <button type = "submit" className={submitButtonStyle}>
                            Save Changes
                        </button>

                        <PublishEventButton eventID={eventID} published={published}/>

                        <DeleteEventButton eventID={eventID} setEventDeleted={setEventDeleted}/>

                    </div>

                    {message && isError && (
                        <p className={errorMessageStyle}>
                            {message}
                        </p>
                    )}

                    <div className={otherButtonsDivStyle}>
                        <div className="flex flex-col gap-4 items-center w-full">

                            <div className="flex gap-4 items-center">
                                <Link
                                    to={`/event/${eventID}/activity/list`}
                                    className={smallLinksStyle}
                                >
                                    View Activities
                                </Link>
                                <span className="text-gray-300">|</span>
                                <Link
                                    to={`/event/${eventID}/activity/create`}
                                    className={smallLinksStyle}
                                >
                                    Add Activity
                                </Link>
                            </div>

                            <div className="flex gap-4 items-center">
                                <Link
                                    to={`/event/${eventID}/regtype/list`}
                                    className={smallLinksStyle}
                                >
                                    View Registration Types
                                </Link>
                                <span className="text-gray-300">|</span>
                                <Link
                                    to={`/event/${eventID}/regtype/create`}
                                    className={smallLinksStyle}
                                >
                                    Add Registration Type
                                </Link>
                            </div>

                        </div>
                    </div>

                    <div className={backDivStyle}>
                        <Link to={`/events`} className={backLinkStyle}>
                            ↶ Back to Events
                        </Link>
                    </div>
                </form>
            </div>
        );
    }
}
