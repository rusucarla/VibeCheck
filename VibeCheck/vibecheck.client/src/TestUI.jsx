import { useState } from "react";
import { Box, TextField, Button, Card, CardContent, Typography } from "@mui/material";

function TestUI() {
    const [text, setText] = useState("");

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                gap: 2,
                bgcolor: "background.default",
                color: "text.primary"
            }}
        >
            <TextField
                label="Introdu ceva"
                variant="outlined"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <Button
                variant="contained"
                onClick={() => alert(`Ai introdus: ${text}`)}
            >
                Trimite
            </Button>

            <Card sx={{ maxWidth: 400, mt: 4 }}>
                <CardContent>
                    <Typography variant="h5">Previzualizare text:</Typography>
                    <Typography variant="body1">{text || "Nimic introdus inca."}</Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default TestUI;
