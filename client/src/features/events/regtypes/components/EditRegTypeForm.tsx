import { useState } from "react";
import DeleteRegTypeButton from "./DeleteRegTypeButton";
import { Link } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie";
import { envHostBackend } from '@/shared/utils/env';

type RegType = {
    ID: number;
    Name: string;
    Description: string;
    Price: number;
    Benefits: string[];
};

async function loadRegTypeInfo(eventID: number, regTypeID: number): Promise<RegType> {
    const csrfToken = getCookie("csrf_token") || "";

    const res = await fetch(`http://`+ envHostBackend() + `/event/view/${eventID}/regtype/${regTypeID}`, {
            method: "GET",
            headers: {
                "X-CSRF-Token": csrfToken
            },
            credentials: "include"
    })

    let pro = new Promise<RegType>((resolve, reject) => {
        if(res.status === 200) {
            resolve(res.json())
        }
        else {
            reject()
        }
    })

    return pro
}

export default function EditRegTypeForm(props: any) {
    let eventID: number = props.eventID;
    let regTypeID: number = props.regTypeID;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [benefits, setBenefits] = useState<string[]>([]);

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [regTypeDeleted, setRegTypeDeleted] = useState(false);
    const [loaded, setLoaded] = useState(false);

    function loadRegTypeState(regType: RegType) {
        setName(regType.Name)
        setDescription(regType.Description)
        setPrice(regType.Price)
        setBenefits(regType.Benefits || [])
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();

        formData.append("eventID", eventID.toString());
        formData.append("regTypeID", regTypeID.toString());

        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price.toString());

        const cleanBenefits = benefits.map(b => b.trim()).filter(b => b !== "").join(", ");
        formData.append("benefits", cleanBenefits);

        try {
            const res = await fetch(`http://`+ envHostBackend() + `/event/regtype/edit`, {
                    method: "POST",
                    body: formData,
                    headers: {
                        "X-CSRF-Token": csrfToken
                    },
                    credentials: "include"
                }
            );

            if (res.status === 200) {
                setMessage("Registration Type updated successfully!");
                setIsError(false);
            } else if (res.status === 401) {
                setMessage("Your session has expired. Please log in again.");
                setIsError(true);
            } else if (res.status === 409) {
                setMessage("A registration type with this name already exists for this event. Please choose a different name.");
                setIsError(true);
            } else {
                setMessage(await res.text());
                setIsError(true);
            }
        }
        catch(error) {
            setMessage("Server error");
            setIsError(true);
        }
    }
    if (!loaded) {
        loadRegTypeInfo(eventID, regTypeID).then((value) => {loadRegTypeState(value); setLoaded(true)})
                                           .catch((err) => {console.log(err)})
        return(
            <h1>Loading Registration Type...</h1>
        )
    }
    if (regTypeDeleted) {
        return (
            <div>
                <h2>Registration Type deleted successfully!</h2>
                <Link to={`/event/edit/${eventID}`}>
                    Back to Edit Event
                </Link>
            </div>
        );
    }
    else{
        return (
            <form onSubmit={handleSubmit}>
                <h2>Edit Registration Type</h2>

                <label className="required">Name</label>
                <input
                    type="text"
                    placeholder="Registration Type Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <label className="required">Description</label>
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <label className="required">Price (€)</label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Price(€)"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0) }
                    required
                />

                <label className="required">Benefits (comma-separated)</label>
                <input
                    type="text"
                    placeholder="e.g. 'Lunch, Wi-Fi Access'"
                    value={benefits.join(",")}
                    onChange={(e) => setBenefits(e.target.value.split(","))}
                    required
                />

                <button type="submit">Edit Registration Type</button>

                <p className={isError ? "error" : "success"}>
                    {message}
                </p>

                <hr />

                <DeleteRegTypeButton
                    eventID={eventID}
                    regTypeID={regTypeID}
                    setRegTypeDeleted={setRegTypeDeleted}
                />
                <Link to={`/event/edit/${eventID}`}>Back to Edit Event</Link>
            </form>
        );
    }
}
