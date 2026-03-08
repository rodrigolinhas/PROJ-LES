import { useState } from "react";
import {Link} from "react-router-dom";

export default function CreateAccountForm() {
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");

    const [role, setRole] = useState("");

    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [passConfirm, setPassConfirm] = useState("");

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const [accountCreated, setAccountCreated] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (pass !== passConfirm) {
            setMessage("Passwords do not match");
            setIsError(true);
            setAccountCreated(false);
            return;
        }
        else if (pass.length < 8) {
            setMessage("Password must have at least 8 characters");
            setIsError(true);
            setAccountCreated(false);
            return;
        }

        const formData = new FormData();
        formData.append("firstName", name);
        formData.append("lastName", lastName);
        formData.append("role", role);
        formData.append("email", email);
        formData.append("pass", pass);

        try {
            const response = await fetch("http://localhost:8080/user/register", {
                method: "POST",
                body: formData,
            });

            if (response.status === 201) {
                setMessage("Account created!");
                setIsError(false);
                setAccountCreated(true);
            }
            else {
                const errorText = await response.text();
                setMessage(errorText);
                setIsError(true);
                setAccountCreated(false);
            }
        }
        catch(error) {
            setMessage("Server Error")
            setIsError(true);
            setAccountCreated(false);
        }
    }

    if (accountCreated) {
        return (
            <div style={{ textAlign: "center", marginTop: "100px" }}>
                <h2 style={{ color: "green" }}>
                    Account created successfully!
                </h2>
                <Link to={"/user/login"}>
                    Go to login page
                </Link>
            </div>
        );
    }
    else {
        return (
            <form onSubmit={handleSubmit}>
                <h2>Create Account</h2>
                <label className="required">First Name</label>
                <input
                    type="text"
                    placeholder="First Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <label className="required">Last Name</label>
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />

                <label className="required">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} required>
                    <option value = "" disabled>Select Role</option>
                    <option value = "Student">Student</option>
                    <option value = "Professor">Professor</option>
                    <option value = "EventOrganizer">Event Organizer</option>
                </select>

                <label className="required">Email</label>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label className="required">Password</label>
                <input
                    type="password"
                    placeholder="Password (must be at least 8 characters)"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    required
                />

                <label className="required">Confirm Password</label>
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={passConfirm}
                    onChange={(e) => setPassConfirm(e.target.value)}
                    required
                />

                <button type="submit">Create Account</button>

                <p>
                    Already have an account?{" "}
                    <Link to={"/user/login"}>Login to your account</Link>
                </p>

                <p className = {isError ? "error" : "success"}> {message} </p>
            </form>
        );
    }
}
