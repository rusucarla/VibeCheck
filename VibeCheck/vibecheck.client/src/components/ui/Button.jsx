//import { Button as MuiButton } from "@mui/material";

//function Button({ children, onClick, ...rest }) {
//    return (
//        <MuiButton variant="contained" onClick={onClick} {...rest}>
//            {children}
//        </MuiButton>
//    );
//}

//export default Button;

//ok hai mai fancy

// components/ui/Button.jsx

import { Button as MuiButton } from "@mui/material";

function Button({ children, onClick, variant = "contained", color = "primary", sx = {}, ...rest }) {
    return (
        <MuiButton
            variant={variant}
            color={color}
            onClick={onClick}
            sx={{
                borderRadius: "25px",
                textTransform: "uppercase",
                fontWeight: "bold",
                letterSpacing: "1px",
                px: 4,
                py: 1.5,
                boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
                ":hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0px 6px 20px rgba(0,0,0,0.3)",
                },
                ...sx
            }}
            {...rest}
        >
            {children}
        </MuiButton>
    );
}

export default Button;
