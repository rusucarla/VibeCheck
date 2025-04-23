// src/components/ui/Input.jsx
import { TextField } from "@mui/material";

function Input({ label, value, onChange, type = "text", ...rest }) {
    return (
        <TextField
            label={label}
            value={value}
            onChange={onChange}
            type={type}
            fullWidth
            variant="outlined"
            {...rest}
        />
    );
}

export default Input;
