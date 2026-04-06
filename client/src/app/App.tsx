import { BrowserRouter, Routes, Route } from 'react-router-dom'

import CreateAccountPage from "../features/auth/pages/CreateAccountPage";
import AccountAuthPage from "../features/auth/pages/AccountAuthPage";
import HomePage from "../features/home/pages/HomePage";
import LandingPage from "../features/landing/pages/LandingPage";
import CreateEventPage from "../features/events/pages/CreateEventPage";
import AuthSuccessPage from "../features/auth/pages/AuthSuccessPage";
import EditEventPage from "../features/events/pages/EditEventPage";
import MyEventsPage from "../features/events/pages/MyEventsPage";
import ViewEventPage from "../features/events/pages/ViewEventPage";
import SettingsPage from "../features/settings/pages/SettingsPage";
import EditActivityPage from "../features/events/activities/pages/EditActivityPage.tsx";
import CreateActivityPage from "../features/events/activities/pages/CreateActivityPage.tsx";
import ViewActivityPage from "@/features/events/activities/pages/ViewActivityPage.tsx";
import ListActivityPage from "@/features/events/activities/pages/ListActivitiesPage.tsx";

import ProtectedRoutes from "./router/ProtectedRoutes";
import ViewUserPage from '@/features/user/pages/UserInfoPage';

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
                    <Route path="/user/me" element={<ViewUserPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/events" element={<MyEventsPage />}/>
                    <Route path="/event/create" element={<CreateEventPage />}/>
                    <Route path="/event/edit/:id" element={<EditEventPage />}/>
                    <Route path="/event/:id" element={<ViewEventPage />} />


                    <Route path="/event/:eventId/activity/edit/:id" element={<EditActivityPage />}/>
                    <Route path="/event/:eventId/activity/create" element={<CreateActivityPage />}/>
                    <Route path="/event/:eventId/activity/view/:id" element={<ViewActivityPage />} />
                    <Route path="/event/:eventId/activity/list" element={<ListActivityPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
