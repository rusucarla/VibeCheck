import { Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";


import LoginButton from "../components/ui/LoginButton";
import SignupButton from "../components/ui/SignupButton";
import "./Home.css";

const emojis = ["💬", "❤️", "🔥", "✨", "😎", "👋", "🎉", "📢", "📱"];
const bubbles = Array.from({ length: 20 }).map(() => ({
    left: `${Math.floor(Math.random() * 100)}%`,
    size: `${16 + Math.floor(Math.random() * 24)}px`,
    delay: `${Math.random() * 10}s`,
    duration: `${10 + Math.random() * 10}s`,
    emoji: emojis[Math.floor(Math.random() * emojis.length)]
}));
;


function Home() {
    const navigate = useNavigate();

    return (

        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Poppins', sans-serif",
                textAlign: "center",
                px: 2,
                overflow: "hidden",
                position: "relative",
            }}
        >

            <Box
                sx={(theme) => ({
                    zIndex: 1,
                    backgroundColor: theme.palette.mode === "dark"
                        ? "rgba(18, 18, 18, 0.9)"
                        : "rgba(255, 255, 255, 0.9)",
                    borderRadius: "16px",
                    padding: 4,
                    backdropFilter: "blur(8px)",
                    boxShadow: 6,
                    maxWidth: "800px",
                    mx: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    animation: "lightPulse 3s ease-in-out infinite",
                })}
            >

                <Typography className="fade-slide-in" variant="h3" fontWeight={600} gutterBottom>
                    Bine ai venit la <span className="vibe-gradient">VibeCheck</span>! 💬
                </Typography>



                <Typography
                    className="fade-slide-in"
                    style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 4, maxWidth: 600 }}
                >
                    Un spațiu prietenos pentru a-ți împărtăși pasiunile cu oameni din toată lumea.
                </Typography>

                <Box className="fade-slide-in" style={{ animationDelay: "0.4s" }}>
                    <LoginButton onClick={() => navigate("/login")} sx={{ mx: 2 }} />
                    <SignupButton onClick={() => navigate("/signup")} sx={{ mx: 2 }} />
                </Box>

                <img
                    src="/chat2.webp"
                    alt="Ilustrație chat"
                    style={{
                        maxWidth: "600px",
                        height: "auto",
                        opacity: 0.9
                    }}
                />
            </Box>

            <Box
                sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: 0,
                    pointerEvents: "none",
                    overflow: "hidden",
                }}
            >
                {bubbles.map((bubble, i) => (
                    <span
                        key={i}
                        className="chat-bubble"
                        style={{
                            left: bubble.left,
                            fontSize: bubble.size,
                            animationDelay: bubble.delay,
                            animationDuration: bubble.duration,
                        }}
                    >
                        {bubble.emoji}
                    </span>
                ))}
            </Box>

        </Box>
    );
}

export default Home;
