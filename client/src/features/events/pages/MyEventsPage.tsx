import {Link} from "react-router-dom";
import EventList from "../components/EventList";
import {useUserRole} from "../../../shared/hooks/useUserRole";

/**
 * Page that displays published events and, for organizers (role 3),
 * their own events with edit capabilities.
 */
export default function MyEventsPage() {
    const role = useUserRole();

    return (
        <div>
            <h1>Events</h1>
            <p>Here you can filter published events and also see your own events.</p>

            <Link to="/home">Back Home</Link>

            {role === 3 && <Link to="/event/create">Create Event</Link>}

            <EventList
                title="Published Events"
                endpoint="http://localhost:8080/event/list"
                emptyMessage="No published events found."
            />

            {role === 3 && (
                <EventList
                    title="My Events"
                    endpoint="http://localhost:8080/event/my"
                    emptyMessage="You have no events yet."
                    showEditButton
                />
            )}
        </div>
    );
}