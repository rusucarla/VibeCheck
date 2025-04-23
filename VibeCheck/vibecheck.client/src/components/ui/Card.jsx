// src/components/ui/Card.jsx
/*import { Card as MuiCard, CardContent, Typography } from "@mui/material";

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
*/

import { Card as MuiCard, CardContent, Typography } from "@mui/material";

function Card({ title, children, sx = {} }) {
    return (
        <MuiCard
            sx={{
                margin: 2,
                borderRadius: "20px",
                padding: 2,
                backgroundColor: "#0f0f0f",
                color: "#fff",
                boxShadow: `
                    0 0 10px rgba(156, 39, 176, 0.6),
                    0 0 20px rgba(156, 39, 176, 0.4),
                    0 0 30px rgba(156, 39, 176, 0.2)
                `,
                transform: "translateY(0px)",
                transition: "all 0.4s ease-in-out",
                ":hover": {
                    transform: "translateY(-8px) scale(1.03)",
                    boxShadow: `
                        0 0 20px rgba(156, 39, 176, 0.8),
                        0 0 40px rgba(156, 39, 176, 0.6),
                        0 0 60px rgba(156, 39, 176, 0.4)
                    `
                },
                ...sx
            }}
        >
            <CardContent>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        fontWeight: "bold",
                        color: "#e040fb",
                        textShadow: "0 0 5px #e040fb, 0 0 10px #e040fb"
                    }}
                >
                    {title}
                </Typography>
                {children}
            </CardContent>
        </MuiCard>
    );
}

export default Card;



