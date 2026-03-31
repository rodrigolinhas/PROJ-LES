import { BrowserRouter, Routes, Route } from 'react-router-dom'

import CreateAccountPage from "../features/auth/pages/CreateAccountPage";
import AccountAuthPage from "../features/auth/pages/AccountAuthPage";
import HomePage from "../features/home/pages/HomePage";
import LandingPage from "../features/landing/pages/LandingPage";
import CreateEventPage from "../features/events/pages/CreateEventPage";
import AuthSuccessPage from "../features/auth/pages/AuthSuccessPage";
import EditEventPage from "../features/events/pages/EditEventPage";
import MyEventsPage from "../features/events/pages/MyEventsPage";
import ViewEventPage from "@/features/events/components/ViewEventPage.tsx";

import ProtectedRoutes from "./router/ProtectedRoutes";

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
                    <Route path="/events" element={<MyEventsPage />}/>
                    <Route path="/event/create" element={<CreateEventPage />}/>
                    <Route path="/event/edit/:id" element={<EditEventPage />}/>
                    <Route path="/event/:id" element={<ViewEventPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
