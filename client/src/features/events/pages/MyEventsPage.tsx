import {Link} from "react-router-dom";
import EventList from "../components/EventList";
import {useUserRole} from "../../../shared/hooks/useUserRole";
import { useState } from "react";

enum Tabs {
    Published,
    My
}

/**
 * Page that displays published events and, for organizers (role 3),
 * their own events with edit capabilities.
 */
export default function MyEventsPage() {
    const role = useUserRole();
    const [tab, setTab] = useState(Tabs.Published);

    return (
        // TODO: Add header
        <div>
            <h1 className="font-sans text-center text-4xl">Events</h1>
            <p className="font-sans text-center">Here you can filter published events and also see your own events.</p>

            {role === "EventOrganizer" && (
                <div className="flex items-center content-center mx-auto my-5 w-fit [&_button]:w-45 ">
                    <button className={"rounded-l-full border-solid border-black " + (tab === Tabs.Published ? "bg-black text-white" : "bg-white text-black")} onClick={() => setTab(Tabs.Published)}>
                        Published Events
                    </button>
                    <button className={"rounded-r-full border-solid border-black " + (tab === Tabs.My ? "bg-black text-white" : "bg-white text-black")} onClick={() => setTab(Tabs.My)}>
                        My Events
                    </button>
                </div>
            )}

            <div className="max-w-[80%] m-auto rounded-xl p-5 border-3">
                {tab === Tabs.Published && (
                    <EventList
                        title="Published Events"
                        endpoint="http://localhost:8080/event/list"
                        emptyMessage="No published events found."
                    />
                )}

                {tab === Tabs.My && (
                    <EventList
                        title="My Events"
                        endpoint="http://localhost:8080/event/my"
                        emptyMessage="You have no events yet."
                        showEditButton    //TODO: Edit button should be displayed in event details
                    />
                )}
            </div>

            {role === "EventOrganizer" && (
                <Link className="mt-5 mx-auto w-35 text-center font-sans block items-center gap-2 rounded-md bg-black px-5 py-3 text-white no-underline" to="/event/create">Create Event</Link>
            )}

            {/* TODO: The user should return to the home page through the header instead */}
            <button>
                <Link to="/home">Back Home</Link>             
            </button>

        </div>
    );
}
