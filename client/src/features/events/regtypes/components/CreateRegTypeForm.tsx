import { useState } from "react";
import { Link } from "react-router-dom";
import { envHostBackend } from '@/shared/utils/env';
import { getCookie } from "@/shared/utils/getCookie";

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
            <div style={{ textAlign: "center", margin: "100px" }}>
                <h2 style={{ color: "green" }}>Registration Type created successfully!</h2>
                <Link to={`/event/edit/${eventID}`}>Back to Edit Event</Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Registration Type</h2>

            <label className="required">Name</label>
            <input
                type="text"
                placeholder="e.g. VIP Pass"
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
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
            />

            <label>Benefits (comma-separated)</label>
            <input
                type="text"
                placeholder="e.g. 'Lunch, Wi-Fi Access'"
                value={benefits.join(",")}
                onChange={(e) => setBenefits(e.target.value.split(","))}
            />

            <button type="submit">Create Registration Type</button>

            <p className={isError ? "error" : "success"}>
                {message}
            </p>

            <hr />
            <Link to={`/event/edit/${eventID}`}>Back to Edit Event</Link>
        </form>
    );
}