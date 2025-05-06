import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container, IconButton } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Placeholder from "./components/Placeholder";
import ConfirmEmail from "./components/ConfirmEmail";
import TwoFactorAuth from "./components/TwoFactorAuth";
import DashboardLayout from "./components/DashboardLayout";
import AdminPanel from "./components/DashboardComponents/AdminPanel";
import CategoriesPage from "./components/DashboardComponents/CategoriesPage";
import AddCategoryPage from "./components/DashboardComponents/AddCategoryPage";
import EditCategoryPage from "./components/DashboardComponents/EditCategoryPage";
import ChannelsPage from "./components/DashboardComponents/ChannelsPage";
import UserProfile from "./components/UserProfile.jsx";
import { ThemeContextProvider, useThemeContext } from "./context/ThemeContext";

import TestUI from "./TestUI";
import TestUIButton from "./components/ui/TestUIButton";

function ThemeToggle() {
    const { darkMode, toggleTheme } = useThemeContext();

    return (
        <IconButton
            onClick={toggleTheme}
            sx={{
                position: "fixed",
                top: 15,
                right: 15,
                zIndex: 1000,
                color: "inherit",
            }}
        >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
    );
}


function AppRoutes() {
    return (
        <ThemeContextProvider>
            <Router>
                <ThemeToggle />
                <TestUIButton />
                <Container maxWidth="lg" sx={{ mt: 5 }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/confirm-email" element={<ConfirmEmail />} />
                        <Route path="/two-factor" element={<TwoFactorAuth />} />
                        <Route path="/placeholder" element={<Placeholder />} />
                        <Route path="/test-ui" element={<TestUI />} />
                        {/* Dashboard cu subpagini */}
                        <Route path="/dashboard" element={<DashboardLayout />}>
                            <Route path="admin" element={<AdminPanel />} />
                            <Route path="channels" element={<ChannelsPage />} />
                            <Route path="categories" element={<CategoriesPage />} />
                            <Route path="profile" element={<UserProfile />} />
                            <Route path="categories/new" element={<AddCategoryPage />} />
                            <Route path="categories/edit/:id" element={<EditCategoryPage />} />
                            {/*<Route path="channels" element={<Channels />} />*/}
                            {/*<Route path="inbox" element={<Inbox />} />*/}
                        </Route>
                        <Route path="*" element={<h1>404 - Page does not exist</h1>} />
                    </Routes>
                </Container>
            </Router>
        </ThemeContextProvider>
    );
}

export default AppRoutes;