import { Link } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h3" gutterBottom>Bine ai venit!</Typography>
            <Typography variant="h5">VibeCheck este un messanger pentru oameni care vor sa isi impartaseasca pasiunile cu cei de pe mapamond!</Typography>
            <Box mt={4}>
                <Button variant="contained" color="primary" onClick={() => navigate("/login")} sx={{ mx: 2 }}>Login</Button>
                <Button variant="outlined" color="secondary" onClick={() => navigate("/signup")} sx={{ mx: 2 }}>Sign Up</Button>
            </Box>
        </Container>
    );
}

export default Home;

