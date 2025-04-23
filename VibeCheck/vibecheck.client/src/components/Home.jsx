import { Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

import LoginButton from "../components/ui/LoginButton";
import SignupButton from "../components/ui/SignupButton";

function Home() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Poppins', sans-serif",
                textAlign: "center",
                px: 2,
                overflow: "hidden",
            }}
        >
            <Typography variant="h3" fontWeight={600} gutterBottom>
                Bine ai venit la VibeCheck! 💬
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
                Un spațiu prietenos pentru a-ți împărtăși pasiunile cu oameni din toată lumea.
            </Typography>
            <Box>
                <LoginButton onClick={() => navigate("/login")} sx={{ mx: 2 }} />
                <SignupButton onClick={() => navigate("/signup")} sx={{ mx: 2 }} />
            </Box>
        </Box>
    );
}

export default Home;
