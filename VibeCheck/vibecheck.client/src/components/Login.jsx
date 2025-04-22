import { useState } from "react";
import { login } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box } from "@mui/material";

function Login() {
    const [loginInput, setLoginInput] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await login(loginInput, password);
            if (response.requiresTwoFactor) {
                navigate("/two-factor", { state: { login: loginInput } });
            } else {
                navigate("/placeholder");
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h4" gutterBottom>Login</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
                <TextField label="Email or Username" fullWidth value={loginInput} onChange={(e) => setLoginInput(e.target.value)} />
                <TextField label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button variant="contained" color="primary" onClick={handleLogin}>Login</Button>
            </Box>
        </Container>
    );
}

export default Login;