import {Link} from "react-router-dom";
import EventList from "../components/EventList";
import {useUserRole} from "../../../shared/hooks/useUserRole";
import { useState } from "react";
import TopBar from "@/shared/components/TopBar";
import { mainDivStyle, submitButtonStyle } from "@/shared/styles/formStyles";

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
        <>
        <TopBar />
        <div>
            <h1 className="text-center text-4xl">Events</h1>
            <p className="text-center">Here you can filter published events and also see your own events.</p>

            {role === "EventOrganizer" && (
                <div className="flex items-center content-center mx-auto my-5 w-fit [&_button]:w-45 ">
                    <button className={"rounded-l-full border-solid border-gray-900 " + (tab === Tabs.Published ? "bg-gray-900 text-white hover:bg-gray-700 transition-colors" : "bg-white text-gray-900 hover:bg-gray-50 transition-colors")} onClick={() => setTab(Tabs.Published)}>
                        Published Events
                    </button>
                    <button className={"rounded-r-full border-solid border-gray-900 " + (tab === Tabs.My ? "bg-gray-900 text-white hover:bg-gray-700 transition-colors" : "bg-white text-gray-900 hover:bg-gray-50 transition-colors")} onClick={() => setTab(Tabs.My)}>
                        My Events
                    </button>
                </div>
            )}

            <div className={mainDivStyle + " max-w-[80%]! p-5 bg-white"}>
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
                    />
                )}
            </div>

            {role === "EventOrganizer" && (
                <Link className={submitButtonStyle + "mt-5 mx-auto w-35 text-center block min-w-0!"} to="/event/create">Create Event</Link>
            )}

        </div>
        </>
    );
}
