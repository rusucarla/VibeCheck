import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmEmail } from "../services/authServices";
import { Container, Typography, CircularProgress, Button } from "@mui/material";

function ConfirmEmail() {
    const [searchParams] = useSearchParams();
    console.log("🔍 URL Params:", Object.fromEntries(searchParams.entries()));
    const [message, setMessage] = useState("Verificare în curs...");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    console.log("Componenta ConfirmEmail a fost randată!");

    useEffect(() => {
        const userId = searchParams.get("userId");
        const token = searchParams.get("token");

        if (!userId || !token) {
            setMessage("Link invalid sau lipsă de parametri.");
            setLoading(false);
            return;
        }

        const encodedToken = encodeURIComponent(token); // Encodează corect token-ul

        confirmEmail(userId, encodedToken)
            .then(response => {
                setMessage("Email confirmat cu succes! Poti acum sa te loghezi.");
            })
            .catch(error => {
                setMessage("Eroare la confirmarea email-ului. Link-ul poate fi expirat sau invalid.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [searchParams]);

    return (
        <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "50px" }}>
            <Typography variant="h4">Confirmare Email</Typography>
            {loading ? <CircularProgress /> : <Typography style={{ marginTop: "20px" }}>{message}</Typography>}
            {!loading && (
                <Button variant="contained" color="primary" style={{ marginTop: "20px" }} onClick={() => navigate("/login")}>
                    Mergi la Login
                </Button>
            )}
        </Container>
    );
}

export default ConfirmEmail;