import { BrowserRouter, Routes, Route } from 'react-router-dom'

import CreateAccountPage from "./features/pages/CreateAccountPage";
import AccountAuthPage from "./features/pages/AccountAuthPage";
import HomePage from "./features/pages/HomePage.tsx";
import LandingPage from "./features/pages/LandingPage.tsx";
import CreateEventPage from "./features/pages/CreateEventPage";
import AuthSuccessPage from "./features/pages/AuthSuccessPage.tsx";


import ProtectedRoutes from "./utils/ProtectedRoutes";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<LandingPage />} />
                <Route path={"/user/login"} element={<AccountAuthPage />} />
                <Route path={"/user/register"} element={<CreateAccountPage />} />
                <Route path={"/auth/success"} element={<AuthSuccessPage />} />

                <Route element={<ProtectedRoutes />}>
                    <Route path="/home" element={<HomePage />}/>
                    <Route path="/event/create" element={<CreateEventPage />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
