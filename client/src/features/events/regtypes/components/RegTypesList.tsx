import { useEffect, useState } from "react";
import { getCookie } from "../../../../shared/utils/getCookie.ts";
import { envHostBackend } from '@/shared/utils/env';

type RegType = {
    ID: number;
    Name: string;
    Description: string;
    Price: number;
    Benefits: string[];
};

export async function getEventRegTypes(eventId: string) {
    const csrfToken = getCookie("csrf_token") || "";

    const res = await fetch(`http://` + envHostBackend() + `/event/view/${eventId}/regtypes`, {
        method: "GET",
        credentials: "include",
        headers: {
            "X-CSRF-Token": csrfToken,
        },
    });

    const text = await res.text();

    if (res.status === 404) {
        return [];
    }

    if (!res.ok) {
        throw new Error(text);
    }

    try {
        return JSON.parse(text);
    } catch {
        throw new Error("Invalid JSON response");
    }
}

export default function RegTypesList({ eventId }: { eventId: string }) {
    const [regTypes, setRegTypes] = useState<RegType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getEventRegTypes(eventId)
            .then(setRegTypes)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [eventId]);

    if (loading) return <p>Loading registration types...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h3>Registration Types</h3>

            {regTypes.map((rt) => (
                <div key={rt.ID} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
                    <h4>{rt.Name}</h4>
                    <p>{rt.Description}</p>
                    <p><strong>Price:</strong> {rt.Price}€</p>

                    <p><strong>Benefits:</strong></p>
                    <ul>
                        {rt.Benefits.map((b, i) => (
                            <li key={i}>{b}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
