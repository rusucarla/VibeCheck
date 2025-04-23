import { Typography, Box, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import Input from "./ui/Input"; 

export const passwordRules = [
    { test: (p) => p.length >= 8, label: "Minim 8 caractere" },
    { test: (p) => p.length <= 20, label: "Maxim 20 caractere" },
    { test: (p) => /[A-Z]/.test(p), label: "Cel putin o litera mare (A-Z)" },
    { test: (p) => /[a-z]/.test(p), label: "Cel putin o litera mica (a-z)" },
    { test: (p) => /\d/.test(p), label: "Cel putin o cifra (0-9)" },
    { test: (p) => /[^a-zA-Z0-9]/.test(p), label: "Cel putin un caracter special (!, @, # etc.)" },
];

export default function PasswordFieldWithRules({ password, setPassword, startIcon }) {
    return (
        <Box sx={{ mb: 2 }}>
            <Input
                label="Password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startIcon={startIcon}
                required
                margin="normal"
            />
            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 1, textAlign: 'left' }}>
            </Typography>
            <List dense>
                {passwordRules.map(({ test, label }, idx) => {
                    const passed = test(password);
                    return (
                        <ListItem key={idx}>
                            <ListItemIcon>
                                {passed ? <CheckIcon color="success" /> : <ClearIcon color="error" />}
                            </ListItemIcon>
                            <ListItemText primary={label} />
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
}
