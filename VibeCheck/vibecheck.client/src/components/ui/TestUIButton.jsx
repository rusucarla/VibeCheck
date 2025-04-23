// src/components/ui/TestUIButton.jsx
import { useNavigate } from "react-router-dom";
import Button from "./Button";

function TestUIButton() {
    const navigate = useNavigate();

    return (
        <Button
            onClick={() => navigate("/test-ui")}
            sx={{
                position: "fixed",
                top: 70,
                right: 15,
                zIndex: 1000,
            }}
        >
            Test UI
        </Button>
    );
}

export default TestUIButton;
