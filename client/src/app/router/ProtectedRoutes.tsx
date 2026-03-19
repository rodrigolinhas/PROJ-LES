import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoutes = () => {
    const user = localStorage.getItem("userEmail");

    if (!user || user === "null" || user === "undefined" || user === "") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoutes;
