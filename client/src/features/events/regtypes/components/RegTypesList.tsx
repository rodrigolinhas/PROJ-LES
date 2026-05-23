import { useEffect, useState } from "react";
import { getCookie } from "../../../../shared/utils/getCookie.ts";
import { envHostBackend } from '@/shared/utils/env';
import { Link, useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();
    const [enrollingId, setEnrollingId] = useState<number | null>(null);
    const [enrollError, setEnrollError] = useState("");
    const [enrollSuccess, setEnrollSuccess] = useState("");

    async function handleEnroll(regTypeId: number) {
        setEnrollingId(regTypeId);
        setEnrollError("");
        setEnrollSuccess("");

        const csrfToken = getCookie("csrf_token") || "";
        const formData = new FormData();
        formData.append("eventID", eventId);
        formData.append("regTypeID", regTypeId.toString());

        try {
            const res = await fetch(`http://${envHostBackend()}/event/register`, {
                method: "POST",
                body: formData,
                headers: { "X-CSRF-Token": csrfToken },
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                if (data.payToken && data.payToken !== "") {
                    navigate(`/event/${eventId}/pay`, { state: { payToken: data.payToken, eventId } });
                } else {
                    setEnrollSuccess("Successfully enrolled! Your registration is confirmed.");
                }
            } else {
                const text = await res.text();
                setEnrollError(text || "Failed to enroll");
            }
        } catch {
            setEnrollError("Server error during enrollment");
        } finally {
            setEnrollingId(null);
        }
    }

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
                {(!regTypes || regTypes.length == 0) ? (
                    <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl w-full">
                        {/*<CalendarDays size={28} className="text-gray-300 mx-auto mb-2" />*/}
                        <p className="text-sm text-gray-400">This event does not have registration types yet.</p>
                    </div>
                ) :
                <>{regTypes.map((rt) => (
                    <div key={rt.ID} className="flex flex-col border border-gray-200 bg-gray-50 shadow-sm m-3 px-5 py-1 w-60 min-h-90 rounded-xl">
                        <div className="grow min-w-full">
                            <h2 className="text-2xl my-4">{rt.Name}</h2>
                            <h3 className="text-1xl my-0"><strong>{rt.Price}€</strong></h3>
                            <p>{rt.Description}</p>
                            <hr className="text-[#ddd]"/>
                            <ul className="pl-6 list-disc mt-4">
                                {(rt.Benefits || []).map((b: any, i) => (
                                    <li className="my-2" key={i}>{typeof b === "string" ? b : b.Name}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-none my-2">
                            { (organizer && !published) &&
                                <Link className={"align-bottom m-auto w-10 border border-gray-300 text-center block items-center gap-2 rounded-md bg-white hover:bg-gray-50 px-5 py-3 text-gray-700 shadow-sm transition-colors"} to={`/event/${eventId}/regtype/edit/${rt.ID}`}>
                                    Edit
                                </Link>
                            }
                            { (!organizer && published) &&
                                <button
                                    onClick={() => handleEnroll(rt.ID)}
                                    disabled={enrollingId === rt.ID}
                                    className="w-full mt-2 px-4 py-2.5 rounded-md bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {enrollingId === rt.ID ? "Enrolling..." : "Enroll"}
                                </button>
                            }
                        </div>
                    </div>
                ))}</>}
            </div>
            {enrollError && <p className="text-sm text-red-600 mt-2">{enrollError}</p>}
            {enrollSuccess && <p className="text-sm text-emerald-600 mt-2">{enrollSuccess}</p>}
        </div>
    );
}
