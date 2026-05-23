import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCookie } from "../../../shared/utils/getCookie";
import RegTypesList from "../regtypes/components/RegTypesList.tsx";
import { envHostBackend } from "@/shared/utils/env";
import { useUserID } from "@/shared/hooks/useUserID";
import ActivitiesList from "../activities/components/ActivitiesList.tsx";
import { mainDivStyle } from "@/shared/styles/formStyles.ts";
import TopBar from "@/shared/components/TopBar.tsx";
import BackButton from "@/shared/components/BackButton.tsx";

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
    Published: boolean;
};

export default function ViewEventPage() {
    const { id } = useParams();
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const userID = useUserID();
    
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
        <>
        <TopBar />
        <BackButton
            to="/home"
        />
        <div className={mainDivStyle + "m-auto max-w-[80%]! bg-white shadow-xl"}>
            <h1 className="text-4xl my-2">{event.Name}</h1>
            { !event.Published &&
                <span className="italic">(Unpublished)</span>
            }
            <p className="text-2xl"><strong>{event.Theme}</strong></p>
            <p>{event.Description}</p>
            <p>From <strong>{new Date(event.StartDate).toLocaleString()}</strong> until <strong>{new Date(event.EndDate).toLocaleString()}</strong></p>
            <p>Takes place in <strong>{event.Location}</strong></p>
            <p><i>Organized by {event.Organization}</i></p>

            <hr className="text-gray-400"/>
                <RegTypesList eventId={id!} organizer={userID == event.OrganizerID} published={event.Published}/>
            <hr className="text-gray-400"/>
                <ActivitiesList eventId={Number.parseInt(id!) || 0} />
            <hr className="text-gray-400"/>

            {/*TODO: Turn this into a style in order to remove repetition*/}
            <div className="flex">
            <Link className="mr-3 mt-5 w-10 text-center block items-center gap-2 rounded-md bg-gray-900 hover:bg-gray-700 transition-colors px-5 py-3 text-white" to="/events">Back</Link>
            {event.OrganizerID == userID &&
                <>
                <Link className={"mr-3 mt-5 w-20 border border-gray-300 shadow-sm text-center block items-center gap-2 rounded-md bg-white hover:bg-gray-50 transition-colors px-5 py-3 text-gray-700"} to={`/event/edit/${event.ID}`}>
                    Edit Event
                </Link>
                <Link className="mr-3 mt-5 w-35 border border-gray-300 shadow-sm text-center block items-center gap-2 rounded-md bg-white hover:bg-gray-50 transition-colors px-5 py-3 text-gray-700" to={`/event/${event.ID}/participants`}>
                    View Participants
                </Link>
                </>
            }
            <Link className="mr-3 mt-5 w-35 border border-gray-300 shadow-sm text-center block items-center gap-2 rounded-md bg-white hover:bg-gray-50 transition-colors px-5 py-3 text-gray-700" to={`/event/${event.ID}/benefits`}>
                View All Benefits
            </Link>
            </div>
        </div>
        </>
    );
}
