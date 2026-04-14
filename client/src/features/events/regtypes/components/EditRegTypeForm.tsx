import { useEffect, useState } from "react";
import DeleteRegTypeButton from "./DeleteRegTypeButton";
import { Link } from "react-router-dom";
import { getCookie } from "@/shared/utils/getCookie";

type Props = {
    eventId: number;
    regTypeId: number;
};

type RegType = {
    ID: number;
    Name: string;
    Description: string;
    Price: number;
    Benefits: string[];
};

export default function EditRegTypeForm({ eventId, regTypeId }: Props) {
    const [regType, setRegType] = useState<RegType | null>(null);

    const [benefitsStr, setBenefitsStr] = useState("");

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [deleted, setDeleted] = useState(false);

    useEffect(() => {
        async function fetchRegType() {
            const csrfToken = getCookie("csrf_token") || "";

            try {
                const res = await fetch(
                    "http://"+ envHostBackend() + "/event/view/${eventId}/regtype/${regTypeId}",
                    {
                        credentials: "include",
                        headers: {
                            "X-CSRF-Token": csrfToken
                        }
                    }
                );

                if (res.status === 200) {
                    const data = await res.json();
                    setRegType(data);
                    setBenefitsStr(data.Benefits ? data.Benefits.join(", ") : "");
                } else {
                    setIsError(true);
                    setMessage("Failed to load registration type");
                }
            } catch {
                setIsError(true);
                setMessage("Server error");
            }
        }

        fetchRegType();
    }, [eventId, regTypeId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!regType) return;

        const csrfToken = getCookie("csrf_token") || "";

        const formData = new FormData();
        formData.append("eventID", eventId.toString());
        formData.append("regTypeID", regTypeId.toString());
        formData.append("name", regType.Name);
        formData.append("description", regType.Description);
        formData.append("price", regType.Price.toString());
        formData.append("benefits", benefitsStr);

        try {
            const res = await fetch(
                "http://"+ envHostBackend() + "/event/regtype/edit",
                {
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
        } catch {
            setMessage("Server error");
            setIsError(true);
        }
    }
    if (deleted) {
        return (
            <div>
                <h2>Registration Type deleted successfully!</h2>
                <Link to={`/event/view/${eventId}`}>
                    Back to Event
                </Link>
            </div>
        );
    }

    if (!regType) return <p>Loading...</p>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>Edit Registration Type</h2>

            <label>Name</label>
            <input
                type="text"
                value={regType.Name}
                onChange={(e) =>
                    setRegType({ ...regType, Name: e.target.value })
                }
                required
            />

            <label>Description</label>
            <textarea
                value={regType.Description}
                onChange={(e) =>
                    setRegType({ ...regType, Description: e.target.value })
                }
                required
            />

            <label>Price (€)</label>
            <input
                type="number"
                step="0.01"
                min="0"
                value={regType.Price}
                onChange={(e) =>
                    setRegType({ ...regType, Price: parseFloat(e.target.value) })
                }
                required
            />

            <label>Benefits (comma-separated)</label>
            <input
                type="text"
                placeholder="e.g. Lunch, T-Shirt, VIP Pass"
                value={benefitsStr}
                onChange={(e) => setBenefitsStr(e.target.value)}
            />

            <button type="submit">Save</button>

            <p style={{ color: isError ? "red" : "green" }}>
                {message}
            </p>

            <hr />

            <DeleteRegTypeButton
                eventId={eventId}
                regTypeId={regTypeId}
                onDeleted={() => setDeleted(true)}
            />
            <Link to={`/event/view/${eventId}`} style={{ marginLeft: "10px" }}>Back to Event</Link>
        </form>
    );
}
