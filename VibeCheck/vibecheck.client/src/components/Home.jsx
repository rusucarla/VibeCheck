import { Link } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

import LoginButton from "../components/ui/LoginButton";
import SignupButton from "../components/ui/SignupButton";

function Home() {
    const navigate = useNavigate();
    //<Button variant="contained" color="primary" onClick={() => navigate("/login")} sx={{ mx: 2 }}>Login</Button>
   // <Button variant="outlined" color="secondary" onClick={() => navigate("/signup")} sx={{ mx: 2 }}>Sign Up</Button>
    return (
        <Container maxWidth="md" sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h3" gutterBottom>Bine ai venit!</Typography>
            <Typography variant="h5">VibeCheck este un messanger pentru oameni care vor sa isi impartaseasca pasiunile cu cei de pe mapamond!</Typography>
            <Box mt={4}>
                <LoginButton onClick={() => navigate("/login")} sx={{ mx: 2 }} />
                <SignupButton onClick={() => navigate("/signup")} sx={{ mx: 2 }} /> 
            </Box>
        </Container>
    );
}

export default Home;

