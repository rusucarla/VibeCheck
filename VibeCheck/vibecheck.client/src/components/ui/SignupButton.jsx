import Button from "./Button";
import TheatersIcon from "@mui/icons-material/Theaters"; // cinema

function SignupButton({ onClick, sx = {}, ...rest }) {
    return (
        <Button
            onClick={onClick}
            color="error"
            startIcon={<TheatersIcon />}
            sx={{
                backgroundColor: "#c62828",
                color: "#fff",
                boxShadow: "0 0 10px rgba(255, 82, 82, 0.7)",
                ":hover": {
                    backgroundColor: "#b71c1c",  //rosu inchis
                    boxShadow: "0 0 20px rgba(255, 82, 82, 1)"
                },
                ...sx
            }}
            {...rest} //AICI trebuie sa fie inclus `type="submit"` din form
        >
            Sign Up
        </Button>
    );
}


export default SignupButton;
