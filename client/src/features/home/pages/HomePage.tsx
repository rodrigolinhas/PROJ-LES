import {Link, useNavigate} from "react-router-dom";
import {useUserRole} from "../../../shared/hooks/useUserRole";

/**
 * Main home page displayed after authentication.
 *
 * Shows navigation links and, for organizers (role 3),
 * a shortcut to create new events.
 */
export default function HomePage() {
    const navigate = useNavigate();
    const role = useUserRole();

    return (
        <div>
            <h1>Home Page</h1>
            <button
                type="button"
                onClick={() => {
                    localStorage.removeItem("userEmail");
                    navigate("/");
                }}
            >
                Log Out
            </button>
            {role === 3 && <Link to="/event/create">Create Event</Link>}
            <Link to="/events">View Events</Link>
        </div>
    );
}
