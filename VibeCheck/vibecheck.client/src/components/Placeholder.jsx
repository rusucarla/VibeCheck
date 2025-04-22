import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authServices";
import { Container, Button, Typography } from "@mui/material";

function Placeholder() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h4">Dashboard</Typography>
            <Typography variant="body1">Bine ai venit! Ai acces la toate functionalitatile.</Typography>
            <Button variant="contained" color="secondary" sx={{ mt: 3 }} onClick={handleLogout}>
                Logout
            </Button>
        </Container>
    );
}

export default Placeholder;
