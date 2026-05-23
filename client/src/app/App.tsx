import { BrowserRouter, Routes, Route } from 'react-router-dom'

import CreateAccountPage from "../features/auth/pages/CreateAccountPage";
import AccountAuthPage from "../features/auth/pages/AccountAuthPage";
import HomePage from "../features/home/pages/HomePage";
import LandingPage from "../features/landing/pages/LandingPage";
import CreateEventPage from "../features/events/pages/CreateEventPage";
import AuthSuccessPage from "../features/auth/pages/AuthSuccessPage";
import EditEventPage from "../features/events/pages/EditEventPage";
import MyEventsPage from "../features/events/pages/MyEventsPage";
import CreateArticlePage from "../features/articles/pages/CreateArticlePage";
import ManageArticleTagsPage from "../features/articles/pages/ManageArticleTagsPage";
import ManageArticleAuthorsPage from "../features/articles/pages/ManageArticleAuthorsPage";
import ViewEventPage from "../features/events/pages/ViewEventPage";
import SettingsPage from "../features/settings/pages/SettingsPage";
import EditActivityPage from "../features/events/activities/pages/EditActivityPage.tsx";
import CreateActivityPage from "../features/events/activities/pages/CreateActivityPage.tsx";
import ViewActivityPage from "../features/events/activities/pages/ViewActivityPage.tsx";
import EditRegTypePage from "../features/events/regtypes/pages/EditRegTypePage";
import CreateRegTypePage from "@/features/events/regtypes/pages/CreateRegTypePage.tsx";
import ListBenefitsPage from "@/features/events/benefits/pages/ListBenefitsPage.tsx";

import ProtectedRoutes from "./router/ProtectedRoutes";
import ViewUserPage from '@/features/user/pages/UserInfoPage';
import ListArticlesPage from "@/features/articles/pages/ListArticlesPage.tsx";
import ViewArticlePage from "@/features/articles/pages/ViewArticlePage.tsx";
import EditArticlePage from "@/features/articles/pages/EditArticlePage.tsx";
import ListEventParticipantsPage from "@/features/events/pages/ListEventParticipantsPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<LandingPage />} />
                <Route path={"/user/login"} element={<AccountAuthPage />} />
                <Route path={"/user/register"} element={<CreateAccountPage />} />
                <Route path={"/auth/success"} element={<AuthSuccessPage />} />

                <Route element={<ProtectedRoutes />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/user/me" element={<ViewUserPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/events" element={<MyEventsPage />} />
                    <Route path="/event/create" element={<CreateEventPage />} />
                    <Route path="/event/edit/:id" element={<EditEventPage />} />
                    <Route path="/event/:id" element={<ViewEventPage />} />
                    <Route path="/event/:id/participants" element={<ListEventParticipantsPage />} />
                    <Route path="/event/:id/pay" element={<EventPaymentPage />} />
                    <Route path="/event/:id/benefits" element={<ListBenefitsPage />} />
                    <Route path="/article/create" element={<CreateArticlePage />} />


                    <Route path="/event/:eventId/activity/edit/:id" element={<EditActivityPage />} />
                    <Route path="/event/:eventId/activity/create" element={<CreateActivityPage />} />
                    <Route path="/event/:eventId/activity/view/:id" element={<ViewActivityPage />} />

                    <Route path="/event/:eventId/regtype/edit/:regTypeId" element={<EditRegTypePage />}/>
                    <Route path="/event/:eventId/regtype/create" element={<CreateRegTypePage />}/>

                    <Route path="/event/:eventId/activity/:activityId/article/list" element={<ListArticlesPage />} />
                    <Route path="/event/:eventId/activity/:activityId/article/view/:articleId" element={<ViewArticlePage />} />
                    <Route path="/event/:eventId/activity/:activityId/article/edit/:articleId" element={<EditArticlePage />} />
                    <Route path="/event/:eventId/activity/:activityId/article/:articleId/tags" element={<ManageArticleTagsPage />} />
                    <Route path="/event/:eventId/activity/:activityId/article/:articleId/authors" element={<ManageArticleAuthorsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
