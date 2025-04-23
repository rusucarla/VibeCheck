import Button from "./Button";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

function LoginButton({ onClick, sx = {} }) {
    return (
        <Button
            onClick={onClick}
            color="secondary"
            startIcon={<MusicNoteIcon />}
            sx={{
                backgroundColor: "#8e24aa",
                ":hover": {
                    backgroundColor: "#6a1b9a",
                    transform: "translateY(-2px)",
                },
                transition: "transform 0.2s ease, background-color 0.3s",
                borderRadius: "25px",
                fontWeight: "bold",
                px: 4,
                py: 1.5,
                ...sx,
            }}
        >
            Login
        </Button>

    );
}

export default LoginButton;
