import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserRole } from "@/shared/hooks/useUserRole";

/**
 * Main home page displayed after authentication.
 *
 * Shows navigation links and, for organizers (role 3),
 * a shortcut to create new events.
 */
export default function HomePage() {
    const navigate = useNavigate();
    const role = useUserRole();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <div>
            <h1>Home Page</h1>
            <button
                type="button"
                className="margin-button"
                onClick={() => {
                    localStorage.removeItem("userEmail");
                    navigate("/");
                }}
            >
                Log Out
            </button>

            {role === "EventOrganizer" && (
                <div className="dropdown-container">
                    <button onClick={() => setIsCreateOpen(!isCreateOpen)}>
                        Create {isCreateOpen ? "▲" : "▼"}
                    </button>
                    {isCreateOpen && (
                        <div className="dropdown-menu">
                            <Link to="/event/create" className="dropdown-item">Event</Link>
                            <Link to="/article/create" className="dropdown-item">Article</Link>
                        </div>
                    )}
                </div>
            )}

            <button className="margin-button">
                <Link to="/events">View Events</Link>
            </button>

            <div className="dropdown-container">
                <button onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    Profile {isProfileOpen ? "▲" : "▼"}
                </button>
                {isProfileOpen && (
                    <div className="dropdown-menu">
                        <Link to="/user/me" className="dropdown-item">User Information</Link>
                        <Link to="/settings" className="dropdown-item">Settings</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
