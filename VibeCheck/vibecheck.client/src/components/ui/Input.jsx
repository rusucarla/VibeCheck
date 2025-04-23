// src/components/ui/Input.jsx

import { TextField, InputAdornment } from "@mui/material";

function Input({ label, value, onChange, type = "text", startIcon = null, ...rest }) {
    return (
        <TextField
            label={label}
            value={value}
            onChange={onChange}
            type={type}
            fullWidth
            variant="outlined"
            InputProps={{
                startAdornment: startIcon ? (
                    <InputAdornment position="start">{startIcon}</InputAdornment>
                ) : null,
            }}
            sx={{
                "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": {
                        borderColor: "#8e24aa",
                    },
                    "&:hover fieldset": {
                        borderColor: "#ab47bc",
                    },
                    "&.Mui-focused fieldset": {
                        borderColor: "#d500f9",
                        boxShadow: "0 0 6px 2px rgba(213, 0, 249, 0.4)",
                    },
                },
                "& .MuiInputLabel-root": {
                    color: "#6a1b9a",
                    fontWeight: "bold",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                    color: "#d500f9",
                },
            }}
            {...rest}
        />
    );
}

export default Input;

//import { TextField } from "@mui/material";

//function Input({ label, value, onChange, type = "text", ...rest }) {
//    return (
//        <TextField
//            label={label}
//            value={value}
//            onChange={onChange}
//            type={type}
//            fullWidth
//            variant="outlined"
//            {...rest}
//        />
//    );
//}

//export default Input;
