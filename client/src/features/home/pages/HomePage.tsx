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
            </button> <br/>
            {role === "EventOrganizer" && <span><Link to="/event/create">Create Event</Link><br/></span>} 
            <Link to="/events">View Events</Link> <br/>
            <Link to="/user/me">User Information</Link> <br/>
        </div>
    );
}

