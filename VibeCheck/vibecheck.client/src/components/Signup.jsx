import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/authServices";
import { Typography, Container, FormControlLabel, Checkbox } from "@mui/material";
import PasswordFieldWithRules, { passwordRules } from "../components/PasswordFieldWithRules";

import SignupButton from "../components/ui/SignupButton";

//emojiuri pt input
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LockIcon from "@mui/icons-material/Lock";
import Input from "../components/ui/Input";

function Signup() {
    const [formData, setFormData] = useState({
        email: "",
        Username: "",
        password: "",
        phoneNumber: "",
        twoFactorEnabled: true
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const isPasswordValid = passwordRules.every(rule => rule.test(formData.password));


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSignup = async (event) => {
        event.preventDefault();
        console.log("Signup button clicked!");
        setMessage("");


        const payload = {
            email: formData.email,
            Username: formData.Username,
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
            <Typography variant="h4" gutterBottom>Sign Up</Typography>
            <form onSubmit={handleSignup}>
                <Input
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    startIcon={<EmailIcon />}
                    margin="normal"
                    required
                />
                <Input
                    label="Username"
                    name="Username"
                    value={formData.Username}
                    onChange={handleChange}
                    startIcon={<PersonIcon />}
                    margin="normal"
                    required
                />
                <Input
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    startIcon={<PhoneAndroidIcon />}
                    margin="normal"
                    required
                />
                <PasswordFieldWithRules
                    password={formData.password}
                    setPassword={(val) => setFormData({ ...formData, password: val })}
                    startIcon={<LockIcon />}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.twoFactorEnabled}
                            onChange={handleChange}
                            name="twoFactorEnabled"
                        />
                    }
                    label="Enable Two-Factor Authentication"
                />
                <div style={{ margin: '20px auto 0', width: '30%' }}>
                    <SignupButton type="submit" style={{ width: '100%', display: 'block' }} />
                </div>


            </form>
            {message && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {message}
                </Typography>
            )}
        </Container>
    );

/*
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
                    type="username"
                    label="Username"
                    name="Username"
                    value={formData.Username}
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
                <SignupButton type="submit" />
            </form>
            {message && <Typography color="error" style={{ marginTop: "20px" }}>{message}</Typography>}
        </Container>
    );
    */
}

export default Signup;

