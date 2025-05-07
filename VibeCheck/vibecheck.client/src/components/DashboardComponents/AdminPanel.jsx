import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Container, Button, Typography } from "@mui/material";

function AdminPanel() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h4">Dashboard</Typography>
            <Typography variant="body1">Bine ai venit! Ai acces la toate functionalitatile.</Typography>
        </Container>
    );
}

export default AdminPanel;