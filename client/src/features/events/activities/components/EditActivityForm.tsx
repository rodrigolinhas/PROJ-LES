import { useState } from 'react';
import DeleteActivityButton from '../components/DeleteActivityButton.tsx';
import { Link } from 'react-router-dom';

function getCookie(name: string) {
    const value = "; " + document.cookie;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
}

async function loadActivityInfo(id: number): Promise<Activity> {
    const csrfToken = getCookie("csrf_token") || "";

    const res = await fetch(`http://localhost:8080/event/activity/view/${id}`, {
        method: "GET",
        headers: {
            "X-CSRF-Token": csrfToken
        },
        credentials: "include"
    })

    let pro = new Promise<Activity>((resolve, reject) => {
        if(res.status === 200) {
            resolve(res.json())
        }
        else {
            reject()
        }
    })

    return pro
}

type Activity = {
    ID: number;
    Name: string;
    Description: string;
    StartDate: string;
    EndDate: string;
    Published: boolean;
}

export default function EditActivityForm(props: any) {

    let activityID: number = props.activityID

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [activityLoaded, setActivityLoaded] = useState(false);
    const [activityDeleted, setActivityDeleted] = useState(false);

    function loadActivityState(activity: Activity) {
        let start = new Date(activity.StartDate)
        setName(activity.Name)
        setDescription(activity.Description)
        setStartDate(start.toString())
        setEndDate(activity.EndDate)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();

        formData.append("activity", activityID.toString());
        formData.append("name", name);
        formData.append("description", description);
        formData.append("startDate", new Date(startDate).toISOString());
        formData.append("endDate", new Date(endDate).toISOString());

        try {
            const response = await fetch("http://localhost:8080/event/activity/edit", {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include"
            });

            if(response.status === 200) {
                setMessage("Activity Edited Successfully!");
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

    if (!activityLoaded) {
        loadActivityInfo(activityID).then((value) => {loadActivityState(value); setActivityLoaded(true)})
            .catch((err) => {console.log(err)})
        return (
            <h1>Loading Activity...</h1>
        )
    }

    if(activityDeleted) {
        return (
            <div style={{ textAlign: "center", margin: "100px" }}>
                <h2 style={{ color: "green" }}>Activity deleted successfully!</h2>
                <Link to ="/event/activity/list">Go back to Event's Activity List</Link>
            </div>
        );
    }
    else
    {
        return (
            <form onSubmit={handleSubmit}>
                <h2>Edit Activity</h2>
                <label className="required">Name</label>
                <input
                    type="text"
                    placeholder="Event name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <label className="required">Description</label>
                <textarea
                    placeholder="Event description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                    value={(new Date(endDate)).toISOString().slice(0, -1)} //TODO: do this in a clean way
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                />
                <button type = "submit">Edit Activity</button>
                <p className={isError ? "error" : "success"}>
                    {message}
                </p>
                <hr/>
                <DeleteActivityButton eventID={activityID} setEventDeleted={setActivityDeleted}/>
            </form>
        );
    }
}
