import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verify2FA } from "../services/authServices";
import { Container, TextField, Button, Typography, Box } from "@mui/material";

function TwoFactorAuth() {
    const [token, setToken] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const handleVerify = async () => {
        try {
            await verify2FA(email, token);
            navigate("/dashboard");
        } catch (error) {
            console.error("2FA Verification failed:", error);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h4" gutterBottom>Two-Factor Authentication</Typography>
            <Typography>Check your email for the 2FA code.</Typography>
            <Box display="flex" flexDirection="column" gap={2} mt={3}>
                <TextField label="Enter 2FA Code" fullWidth value={token} onChange={(e) => setToken(e.target.value)} />
                <Button variant="contained" color="primary" onClick={handleVerify}>Verify</Button>
            </Box>
        </Container>
    );
}

export default TwoFactorAuth;
