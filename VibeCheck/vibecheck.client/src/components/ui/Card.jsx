// src/components/ui/Card.jsx
import { Card as MuiCard, CardContent, Typography } from "@mui/material";

function Card({ title, children }) {
    return (
        <MuiCard sx={{ margin: 2 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>{title}</Typography>
                {children}
            </CardContent>
        </MuiCard>
    );
}

export default Card;
