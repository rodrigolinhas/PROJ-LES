import { envHostBackend } from "@/shared/utils/env";
import { getCookie } from "@/shared/utils/getCookie";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Form component for editing authenticated user's account information.
 *
 * Fetches current user data on mount and pre-fills the form fields.
 * Sends only changed fields to `POST /user/account/edit`.
 */
export default function SettingsForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [originalData, setOriginalData] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const csrfToken = getCookie("csrf_token");
            try {
                const res = await fetch(
                    "http://" + envHostBackend() + "/user/me",
                    {
                        credentials: "include",
                        headers: {
                            "X-CSRF-Token": csrfToken,
                        },
                    }
                );
                if (res.ok) {
                    const data = await res.json();
                    setFirstName(data.FirstName);
                    setLastName(data.LastName);
                    setEmail(data.Email);
                    setOriginalData({
                        firstName: data.FirstName,
                        lastName: data.LastName,
                        email: data.Email,
                    });
                } else {
                    setMessage("Failed to load user data");
                    setIsError(true);
                }
            } catch {
                setMessage("Server Error");
                setIsError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (password !== "" && password !== passwordConfirm) {
            setMessage("Passwords do not match");
            setIsError(true);
            return;
        }

        if (password !== "" && password.length < 8) {
            setMessage("Password must have at least 8 characters");
            setIsError(true);
            return;
        }

        const formData = new FormData();

        // Only send changed fields
        if (firstName !== originalData.firstName) {
            formData.append("firstName", firstName);
        }
        if (lastName !== originalData.lastName) {
            formData.append("lastName", lastName);
        }
        if (email !== originalData.email) {
            formData.append("email", email);
        }
        if (password !== "") {
            formData.append("password", password);
        }

        const csrfToken = getCookie("csrf_token");

        try {
            const response = await fetch(
                "http://" + envHostBackend() + "/user/account/edit",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "X-CSRF-Token": csrfToken,
                    },
                    body: formData,
                }
            );

            if (response.ok) {
                setMessage("Settings updated successfully!");
                setIsError(false);
                setPassword("");
                setPasswordConfirm("");
                // Update original data to reflect saved state
                setOriginalData({
                    firstName,
                    lastName,
                    email,
                });
            } else if (response.status === 400) {
                const errorText = await response.text();
                setMessage(errorText || "Invalid input. Please check your data.");
                setIsError(true);
            } else if (response.status === 401) {
                setMessage("Your session has expired. Please log in again.");
                setIsError(true);
            } else {
                const errorText = await response.text();
                setMessage(errorText || "Failed to update settings");
                setIsError(true);
            }
        } catch {
            setMessage("Server Error");
            setIsError(true);
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Account Settings</h2>

            <label>First Name</label>
            <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />

            <label>Last Name</label>
            <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />

            <label>Email</label>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <label>New Password</label>
            <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {password !== "" && (
                <>
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                </>
            )}

            <button type="submit">Save Changes</button>

            <button>
                <Link to="/home">Back Home</Link>
            </button>

            <p className={isError ? "error" : "success"}> {message} </p>
        </form>
    );
}
