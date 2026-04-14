import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCookie } from "../../../shared/utils/getCookie";
import RegTypesList from "../regtypes/components/RegTypesList.tsx";
import { envHostBackend } from "@/shared/utils/env";
import { useUserID } from "@/shared/hooks/useUserID";

type EventDetails = {
    ID: number;
    Name: string;
    Theme: string;
    Description: string;
    Organization: string;
    Location: string;
    StartDate: string;
    EndDate: string;
    OrganizerID: number;
};

type Beneficiary = {
    ID: number
    FirstName: string
    LastName: string
    Email: string
}

export default function ViewEventPage() {
    const { id } = useParams();
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [benefitID, setBenefitID] = useState("");
    const userID = useUserID();
    
    async function handleBeneficiariesCSV() {
        const csrfToken = getCookie("csrf_token")

        let data: Beneficiary[] | null = null;

        const response = await fetch(
            `http://${envHostBackend()}/event/view/${id}/benefit_participants/${benefitID}`,
            {
                credentials: "include",
                headers: {
                    "X-CSRF-Token": csrfToken,
                },
            }
        )

        if (response.status === 200) {
            data = await response.json();
        } else {
            console.log(await response.text())
        }

        if (data === null || data == undefined) { return }

        const csvRows = ["ID,FirstName,LastName,Email"]
        data.forEach(elem => {
            const row = [
                elem.ID,
                `"${(elem.FirstName || "")}"`,
                `"${(elem.LastName || "")}"`,
                `"${(elem.Email || "")}"`
            ]
            csvRows.push(row.join(","))
        })

        const csvStr = csvRows.join("\n")
        const blob = new Blob([csvStr], {type: "text/csv; charset=utf-8;"})
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `beneficiaries_${id}_${benefitID}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    useEffect(() => {
        async function fetchEvent() {
            const csrfToken = getCookie("csrf_token");

            try {
                const response = await fetch(
                    `http://${envHostBackend()}/event/view/${id}`,
                    {
                        credentials: "include",
                        headers: {
                            "X-CSRF-Token": csrfToken,
                        },
                    }
                );

                if (response.status === 200) {
                    const data = await response.json();
                    setEvent(data);
                } else {
                    setError("Event not found");
                }
            } catch {
                setError("Server error");
            } finally {
                setLoading(false);
            }
        }

        fetchEvent();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!event) return null;

    return (
        <div>
            <h1>{event.Name}</h1>
            <p><strong>Theme:</strong> {event.Theme}</p>
            <p><strong>Description:</strong> {event.Description}</p>
            <p><strong>Organization:</strong> {event.Organization}</p>
            <p><strong>Location:</strong> {event.Location}</p>
            <p><strong>Start:</strong> {new Date(event.StartDate).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(event.EndDate).toLocaleString()}</p>

            <hr />
                <RegTypesList eventId={id!} />
            <hr />
            <Link to={`/event/${event.ID}/participants`}>
                View Participants
            </Link>

            <br />

            <Link to={`/event/${event.ID}/activity/list`}>
                View Activities
            </Link>

            <Link to="/events">Back</Link>

            {userID == event.OrganizerID && (<>
            <h2>Beneficiaries</h2>
            <input
                type="text"
                placeholder="Benefit ID"
                value={benefitID}
                onChange={(e) => setBenefitID(e.target.value)}
                required
            />
            <button onClick={handleBeneficiariesCSV}>
                Export Beneficiaries CSV
            </button>
            </>)}
        </div>
    );
}
