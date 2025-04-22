mport { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Placeholder from "./components/Placeholder";
import ConfirmEmail from "./components/ConfirmEmail";
import TwoFactorAuth from "./components/TwoFactorAuth";

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/two-factor" element={<TwoFactorAuth />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Placeholder />} />
                <Route path="/confirm-email" element={<ConfirmEmail />} />
                <Route path="*" element={<h1> 404 - Page does not exist</h1>} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;