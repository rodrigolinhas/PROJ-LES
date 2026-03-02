import { useState } from "react";
import { Link } from "react-router-dom";

export default function AccountAuthForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setMessage("Succesfully logged in!");
        setIsError(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login to your account</h2>
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
            <button type="submit">Login</button>

            <h3>Other login options:</h3>
            <button type={"button"} onClick={() => {
                setMessage("Logged in with Gmail");
                setIsError(false);
            }}>
                Login with Gmail
            </button>


            <p>
                Don't have an account?{" "}
                <Link to={"/register"}>Create Account</Link>
            </p>

            <p className = {isError ? "error" : "success"}> {message} </p>
        </form>
    );
}
