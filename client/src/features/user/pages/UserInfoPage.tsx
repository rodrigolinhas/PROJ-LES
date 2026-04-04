import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCookie } from "../../../shared/utils/getCookie.ts";
import { envHostBackend } from "@/shared/utils/env.ts";

type UserDetails = {
    FirstName: string,
    LastName: string,
    Email: string,
    Role: string
};

export default function ViewUserPage() {
    const [user, setUser] = useState<UserDetails | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    async function fetchUser() {
        const csrfToken = getCookie("csrf_token");

        try {
            const response = await fetch(
                `http://${envHostBackend()}/user/me`,
                {
                    credentials: "include",
                    headers: {
                        "X-CSRF-Token": csrfToken,
                    },
                }
            );

            if (response.status === 200) {
                const data = await response.json();
                setUser(data);
            } else {
                setError("Unauthorized");
            }
        } catch {
            setError("Server error");
        } finally {
            setLoading(false);
        }

        return () => {}
    }

    useEffect(() => {fetchUser()}, [])

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!user) return null;

    if (user.Role == "EventOrganizer") { user.Role = "Event Organizer" }
    return (
        <div>
            <h1>User Information</h1>
            <p><strong>Name:</strong> {user.FirstName} {user.LastName}</p>
            <p><strong>E-mail:</strong> {user.Email}</p>
            <p><strong>Role:</strong> {user.Role}</p>

            <Link to="/home">Back</Link>
        </div>
    );
}
