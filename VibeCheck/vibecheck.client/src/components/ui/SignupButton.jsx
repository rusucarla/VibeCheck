import Button from "./Button";
import TheatersIcon from "@mui/icons-material/Theaters"; // cinema

function SignupButton({ onClick }) {
    return (
        <Button
            onClick={onClick}
            color="error"
            startIcon={<TheatersIcon />}
            sx={{
                backgroundColor: "#c62828", // rosu inchis
                color: "#fff",
                ":hover": {
                    backgroundColor: "#b71c1c"
                }
            }}
        >
            Sign Up
        </Button>
    );
}

export default SignupButton;
