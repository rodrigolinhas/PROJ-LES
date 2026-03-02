import { BrowserRouter, Routes, Route } from 'react-router-dom'

import CreateAccountPage from "./features/account/CreateAccountPage";
import AccountAuthPage from "./features/account/AccountAuthPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<AccountAuthPage />} />
                <Route path={"user/register"} element={<CreateAccountPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
