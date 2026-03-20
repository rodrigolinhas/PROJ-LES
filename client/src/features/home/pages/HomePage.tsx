import {Link, useNavigate} from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("userEmail");
        navigate("/");
    };

    return (
        <div>
            <h1>Home Page</h1>

            <button onClick={handleLogout}>Logout</button>
            <button>
                <Link to="/event/create">Create Event</Link>
            </button>
        </div>
    );
}
