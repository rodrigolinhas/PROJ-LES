import { BrowserRouter, Routes, Route } from 'react-router-dom'

import CreateAccountPage from "./features/account/CreateAccountPage";
import AccountAuthPage from "./features/account/AccountAuthPage";
import HomePage from "./features/home/HomePage";
import LandingPage from "./features/landing/LandingPage";

import ProtectedRoutes from "./utils/ProtectedRoutes";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<LandingPage />} />
                <Route path={"/user/login"} element={<AccountAuthPage />} />
                <Route path={"user/register"} element={<CreateAccountPage />} />

                <Route element={<ProtectedRoutes />}>
                    <Route path="/home" element={<HomePage />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
