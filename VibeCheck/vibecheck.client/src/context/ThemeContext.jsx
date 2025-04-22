import { createContext, useState, useMemo, useContext } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useMediaQuery } from "@mui/material";

const ThemeContext = createContext();

export function ThemeContextProvider({ children }) {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const [darkMode, setDarkMode] = useState(prefersDarkMode);

    const toggleTheme = () => setDarkMode((prev) => !prev);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? "dark" : "light",
                    primary: { main: darkMode ? "#90caf9" : "#1976d2" },
                    secondary: { main: darkMode ? "#f48fb1" : "#d32f2f" },
                },
                typography: {
                    fontFamily: "Montserrat, Roboto, sans-serif",
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: "8px",
                                textTransform: "none",
                            },
                        },
                    },
                },
            }),
        [darkMode]
    );

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    return useContext(ThemeContext);
}