import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/authServices";
import { TextField, Button, Typography, Container, FormControlLabel, Checkbox } from "@mui/material";

function Signup() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        phoneNumber: "",
        twoFactorEnabled: true
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSignup = async (event) => {
        event.preventDefault();
        console.log("Signup button clicked!");

        const payload = {
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            twoFactorEnabled: formData.twoFactorEnabled
        };

        console.log("Payload being sent to signup function:", payload);

        try {
            const result = await signup(payload);
            console.log("Signup result:", result);
            setMessage("Signup successful! Please check your email to confirm your account.");
        } catch (error) {
            console.error("Signup failed:", error);
            setMessage(error.message || "Signup failed");
        }
    };

    return (
        <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "50px" }}>
            <Typography variant="h4">Sign Up</Typography>
            <form onSubmit={handleSignup}>
                <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <FormControlLabel
                    control={<Checkbox checked={formData.twoFactorEnabled} onChange={handleChange} name="twoFactorEnabled" />}
                    label="Enable Two-Factor Authentication"
                />
                <Button type="submit" variant="contained" color="primary" style={{ marginTop: "20px" }}>Sign Up</Button>
            </form>
            {message && <Typography color="error" style={{ marginTop: "20px" }}>{message}</Typography>}
        </Container>
    );
}

export default Signup;