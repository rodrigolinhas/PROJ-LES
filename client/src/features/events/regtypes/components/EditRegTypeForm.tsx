import { useState } from "react";
import DeleteRegTypeButton from "./DeleteRegTypeButton";
import { Link } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie";
import { envHostBackend } from '@/shared/utils/env';
import {
    backDivStyle, backLinkStyle,
    buttonsDivStyle,
    descriptionStyle, errorMessageStyle,
    goHomeStyle, inputStyle, labelStyle,
    mainDivStyle, submitButtonStyle,
    successDivStyle,
    successMessageStyle,
    successOutDivStyle, titleStyle
} from "@/shared/styles/formStyles.ts";

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
            <div className={successOutDivStyle}>
                <div className={successDivStyle}>
                    <h2 className={successMessageStyle}>Registration Type deleted successfully!</h2>
                    <Link to ={`/event/edit/${eventID}`} className={goHomeStyle}>Back to Edit Event</Link>
                </div>
            </div>
        );
    }
    else{
        return (
            <div className={mainDivStyle}>
                <div>
                    <h2 className={titleStyle}>✎ Edit Registration Type</h2>
                    <p className={descriptionStyle}>
                        Edit the registration type fields you want to change.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label className={labelStyle}>Name</label>
                        <input
                            type="text"
                            placeholder="e.g. VIP Pass"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Description</label>
                        <textarea
                            placeholder="Provide a brief overview of this registration type"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Price (€)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g., 10€"
                            value={price}
                            onChange={(e) => setPrice(parseFloat(e.target.value) || 0) }
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Benefits (comma-separated)</label>
                        <input
                            type="text"
                            placeholder="e.g. 'Lunch, Wi-Fi Access'"
                            value={benefits.join(",")}
                            onChange={(e) => setBenefits(e.target.value.split(","))}
                            className={inputStyle}
                        />
                    </div>

                    <div className={buttonsDivStyle}>
                        <button type="submit" className={submitButtonStyle}>
                            Save Changes
                        </button>

                        <DeleteRegTypeButton
                            eventID={eventID}
                            regTypeID={regTypeID}
                            setRegTypeDeleted={setRegTypeDeleted}
                        />
                    </div>

                    {message && isError && (
                        <p className={errorMessageStyle}>
                            {message}
                        </p>
                    )}

                    <div className={backDivStyle}>
                        <Link to={`/event/edit/${eventID}`} className={backLinkStyle}>
                            ↶ Back to Edit Event
                        </Link>
                    </div>
                </form>
            </div>
        );
    }
}
