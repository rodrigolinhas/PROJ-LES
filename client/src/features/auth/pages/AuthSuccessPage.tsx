import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthSuccessPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("http://localhost:8080/user/me", {
                    method: "GET",
                    credentials: "include",
                });

                if (response.status === 200) {
                    const data = await response.json();
                    localStorage.setItem("userEmail", data.email);
                    navigate("/home");
                } else {
                    navigate("/user/login");
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
                navigate("/user/login");
            }
        };

        fetchUser();
    }, [navigate]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <h2>Logging you in...</h2>
        </div>
    );
}
