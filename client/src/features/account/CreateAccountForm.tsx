import { useState } from "react";
import {Link} from "react-router-dom";

export default function CreateAccountForm() {
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");

    const [role, setRole] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (password !== passwordConfirm) {
            setMessage("Passwords do not match");
            setIsError(true);
            return;
        }

        setMessage("Account created!");
        setIsError(false);
    }

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
                <option value = "Student">Participant</option>
                <option value = "Professor">Author</option>
                <option value = "Author">Program Chair</option>
                <option value = "Organizator">Organization Member</option>
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <label className="required">Confirm Password</label>
            <input
                type="password"
                placeholder="Confirm Password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
            />

            <button type="submit">Create Account</button>

            <p>
                Already have an account?{" "}
                <Link to={"/"}>Login to your account</Link>
            </p>

            <p className = {isError ? "error" : "success"}> {message} </p>
        </form>
    );
}
