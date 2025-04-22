//import { Container, Typography, Box } from "@mui/material";

//function App() {
//    return (
//        <Box
//            sx={{
//                height: '100vh',
//                width: '100vw',
//                display: 'flex',
//                justifyContent: 'center',
//                alignItems: 'center',
//                bgcolor: 'background.default',
//                color: 'text.primary',
//                textAlign: 'center',
//                p: 2
//            }}
//        >
//            <Container maxWidth="md">
//                <Typography variant="h2" gutterBottom>
//                    Bine ai venit la VibeCheck!
//                </Typography>
//                <Typography variant="h6">
//                    Abia asteptam sa ne impartasesti pasiunile tale!
//                </Typography>
//            </Container>
//        </Box>
//    );
//}

//export default App;

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
import { ThemeContextProvider, useThemeContext } from "./context/ThemeContext";

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
                <Container maxWidth="md" sx={{ mt: 5 }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/dashboard" element={<Placeholder />} />
                        <Route path="/confirm-email" element={<ConfirmEmail />} />
                        <Route path="/two-factor" element={<TwoFactorAuth />} />
                        <Route path="*" element={<h1>404 - Page does not exist</h1>} />
                    </Routes>
                </Container>
            </Router>
        </ThemeContextProvider>
    );
}

export default AppRoutes;