import { BrowserRouter, Routes, Route } from 'react-router-dom'

import CreateAccountPage from "./features/pages/CreateAccountPage";
import AccountAuthPage from "./features/pages/AccountAuthPage";
import HomePage from "./features/pages/HomePage.tsx";
import LandingPage from "./features/pages/LandingPage.tsx";
import CreateEventPage from "./features/pages/CreateEventPage";
import EditEventPage from "./features/pages/EditEventPage";

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
                    <Route path="/event/create" element={<CreateEventPage />}/>
                    <Route path="/event/edit/:id" element={<EditEventPage />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
