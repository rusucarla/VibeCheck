import { Container, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function ChannelsPage() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                Canale disponibile
            </Typography>
            <Typography variant="body1" gutterBottom>
                Aici po?i vedea toate canalele ?i po?i crea unul nou.
            </Typography>
            <Box mt={4}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/channels/create")}
                >
                    Creeazã un canal nou
                </Button>
            </Box>
        </Container>
    );
}

export default ChannelsPage;