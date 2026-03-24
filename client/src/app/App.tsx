import { BrowserRouter, Routes, Route } from 'react-router-dom'

import CreateAccountPage from "../features/auth/pages/CreateAccountPage";
import AccountAuthPage from "../features/auth/pages/AccountAuthPage";
import HomePage from "../features/home/pages/HomePage";
import LandingPage from "../features/landing/pages/LandingPage";
import CreateEventPage from "../features/events/pages/CreateEventPage";
import AuthSuccessPage from "../features/auth/pages/AuthSuccessPage";
import EditEventPage from "../features/events/pages/EditEventPage";
import MyEventsPage from "../features/events/pages/MyEventsPage";

import ListActivitiesPage from "../features/events/activities/pages/ListActivitiesPage.tsx";
import ViewActivityPage from "../features/events/activities/pages/ViewActivityPage.tsx";
import EditActivityPage from "../features/events/activities/pages/EditActivityPage.tsx";
import CreateActivityPage from "../features/events/activities/pages/CreateActivityPage.tsx";

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

                    <Route path="/event/activity/list" element={<ListActivitiesPage />}/>
                    <Route path="/event/activity/view" element={<ViewActivityPage />}/>
                    <Route path="/event/activity/edit" element={<EditActivityPage />}/>
                    <Route path="/event/activity/create" element={<CreateActivityPage />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
