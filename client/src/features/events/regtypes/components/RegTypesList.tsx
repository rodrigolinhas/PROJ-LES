import { useEffect, useState } from "react";
import { getCookie } from "../../../../shared/utils/getCookie.ts";
import { envHostBackend } from '@/shared/utils/env';
import { Link } from "react-router-dom";

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

export default function RegTypesList({ eventId, organizer, published }: { eventId: string, organizer: boolean, published: boolean }) {
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
            <h2>Registration Types</h2>

            <div className="flex">
                {(!regTypes || regTypes.length == 0) && (
                    <p>This event does not have registration types</p>
                )}
                {regTypes.map((rt) => (
                    <div key={rt.ID} className="flex flex-col border border-[#181818] m-3 px-5 py-1 w-60 min-h-90 rounded-xl">
                        <div className="grow min-w-full">
                            <h2 className="text-2xl my-4">{rt.Name}</h2>
                            <h3 className="text-1xl my-0"><strong>{rt.Price}€</strong></h3>
                            <p>{rt.Description}</p>
                            <hr className="text-[#ddd]"/>
                            <ul className="pl-6 list-disc mt-4">
                                {rt.Benefits.map((b, i) => (
                                    <li className="my-2" key={i}>{b}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-none my-2">
                            { (organizer && !published) &&
                                <Link className="align-bottom m-auto w-10 border-2 text-center block items-center gap-2 rounded-md bg-white px-5 py-3 text-black" to={`/event/${eventId}/regtype/edit/${rt.ID}`}>
                                    Edit
                                </Link>
                            }
                            {/*TODO: Add enroll button*/}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
