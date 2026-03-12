import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublishEventButton from "../components/PublishEventButton.tsx";

function getCookie(name: string) {
    const value = "; " + document.cookie;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
}

async function loadEventInfo(id: number): Promise<LongEvent> {
    const email = localStorage.getItem("userEmail") || "";
    const csrfToken = getCookie("csrf_token") || "";
    const formData = new FormData();

    formData.append("email", email);

    const res = await fetch(`http://localhost:8080/event/view/${id}`, {
        method: "POST", //TODO: HTTP GET Requests can't have a body, so the backend needs to be refactored
        body: formData,
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
    const [eventEdited, setEventEdited] = useState(false);
    const [eventLoaded, setEventLoaded] = useState(false);

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

        const email = localStorage.getItem("userEmail") || "";
        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();

        formData.append("email", email);
        formData.append("eventID", eventID.toString());
        formData.append("name", name);
        formData.append("theme", theme);
        formData.append("description", description);
        formData.append("organization", organization);
        formData.append("location", location);
        formData.append("startDate", new Date(startDate).toISOString());
        formData.append("endDate", new Date(endDate).toISOString());

        try {
            const response = await fetch("http://localhost:8080/event/edit", {
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
                setEventEdited(true);
            }
            else {
                const errorText = await response.text();
                setMessage(errorText);
                setIsError(true);
                setEventEdited(false);
            }
        }
        catch(error) {
            setMessage("Server error");
            setIsError(true);
            setEventEdited(false);
        }
    }

    if (!eventLoaded) {
        loadEventInfo(eventID).then((value) => {loadEventState(value); setEventLoaded(true)})
                              .catch((err) => {console.log(err)})
        return (
            <h1>Loading Event...</h1>
        )
    }

    if (eventEdited) {
        return (
            <div style={{ textAlign: "center", margin: "100px" }}>
                <h2 style={{ color: "green" }}>Event edited successfully!</h2>
                <Link to ="/home">Go back to Home</Link>
            </div>
        );
    }
    else {
        return (
            <form onSubmit={handleSubmit}>
                <h2>Edit Event</h2>
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
                    value={(new Date(startDate)).toISOString().slice(0, -1)} //TODO: do this in a clean way
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />
                <label className="required">End Date</label>
                <input
                    type="datetime-local"
                    value={(new Date(endDate)).toISOString().slice(0, -1)}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                />
                <button type = "submit">Edit Event</button>
                <p className={isError ? "error" : "success"}>
                    {message}
                </p>
                <hr/>
                <PublishEventButton eventID={eventID} published={published}/>
            </form>
        );
    }
}
