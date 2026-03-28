import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Intermediate page reached after a successful Google OAuth callback.
 *
 * The backend redirects here with the user's email as a query parameter
 * (e.g. /auth/success?email=user@example.com). This component reads the
 * email, persists it in localStorage (used by ProtectedRoutes), and
 * navigates to the home page.
 *
 * No authenticated API call is needed here — the session cookies have
 * already been set by the backend's OAuth callback response.
 */
export default function AuthSuccessPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const email = params.get("email");

        if (email) {
            localStorage.setItem("userEmail", email);
            navigate("/home");
        } else {
            console.error("AuthSuccessPage: no email parameter in URL");
            navigate("/user/login");
        }
    }, [navigate]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <h2>Logging you in...</h2>
        </div>
    );
}
