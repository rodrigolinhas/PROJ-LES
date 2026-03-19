import { Link } from "react-router-dom"

export default function LandingPage() {
    return (
        <div>
            <h1>Welcome to Scientific Event Management!</h1>
            <button>
                <Link to="user/login">Login</Link>
            </button>
            <button>
                <Link to="user/register">Create Account</Link>
            </button>
        </div>
    );
}
