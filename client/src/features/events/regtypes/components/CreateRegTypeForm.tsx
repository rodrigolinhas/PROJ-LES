import { useState } from "react";
import { Link } from "react-router-dom";
import { envHostBackend } from '@/shared/utils/env';
import { getCookie } from "@/shared/utils/getCookie";
import {
    buttonsDivStyle,
    descriptionStyle, errorMessageStyle,
    goHomeStyle, inputStyle, labelStyle,
    mainDivStyle, mandatoryLabelStyle, submitButtonStyle,
    successDivStyle,
    successMessageStyle,
    successOutDivStyle, titleStyle
} from "@/shared/styles/formStyles.ts";

export default function CreateRegTypeForm(props: any) {
    let eventID: string = props.eventID;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [benefits, setBenefits] = useState<string[]>([]);

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [created, setCreated] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();

        formData.append("eventID", eventID);
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price.toString());

        const cleanBenefits = benefits.map(b => b.trim()).filter(b => b !== "").join(", ");
        if (cleanBenefits) {
            formData.append("benefits", cleanBenefits);
        }

        try {
            const res = await fetch(`http://${envHostBackend()}/event/regtype/create`, {
                    method: "POST",
                    body: formData,
                    headers: {
                        "X-CSRF-Token": csrfToken
                    },
                    credentials: "include"
                }
            );

            if (res.status === 201 || res.status === 200) {
                setMessage("Registration Type created successfully!");
                setIsError(false);
                setCreated(true);
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

    if (created) {
        return (
            <div className={successOutDivStyle}>
                <div className={successDivStyle}>
                    <h2 className={successMessageStyle}>Registration Type created successfully!</h2>
                    <Link to ={`/event/edit/${eventID}`} className={goHomeStyle}>Back to Edit Event</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={mainDivStyle}>
            <div>
                <h2 className={titleStyle}>+ Create Registration Type</h2>
                <p className={descriptionStyle}>
                    Fill the fields bellow to create a new registration type for this event.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div>
                    <label className={mandatoryLabelStyle}>Name</label>
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
                    <label className={mandatoryLabelStyle}>Description</label>
                    <textarea
                        placeholder="Provide a brief overview of this registration type"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className={mandatoryLabelStyle}>Price (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 10€"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
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
                        Create Registration Type
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