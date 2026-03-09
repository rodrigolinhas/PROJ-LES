import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function AccountAuthForm() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("pass", pass);

            const response = await fetch("http://localhost:8080/user/login", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (response.status === 200) {
                setMessage("Succesfully logged in!");
                setIsError(false);
                localStorage.setItem("userEmail", email);
                navigate("/home");
            }
            else {
                const errorText = await response.text();
                setMessage(errorText);
                setIsError(true);
            }
        }
        catch (err) {
            setMessage("Server Error");
            setIsError(true);
        }


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
                value={pass}
                onChange={(e) => setPass(e.target.value)}
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
                <Link to={"/user/register"}>Create Account</Link>
            </p>

            <p className = {isError ? "error" : "success"}> {message} </p>
        </form>
    );
}
