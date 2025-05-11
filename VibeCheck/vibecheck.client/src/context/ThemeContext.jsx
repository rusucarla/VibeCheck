import { CssVarsProvider } from '@mui/joy/styles';
import { extendTheme as extendJoyTheme } from '@mui/joy/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { createContext, useState, useContext, useMemo } from 'react';

const ThemeContext = createContext();

export function ThemeContextProvider({ children }) {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useState(prefersDarkMode);

    const toggleTheme = () => setDarkMode((prev) => !prev);

    // Material UI theme
    const muiTheme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    primary: { main: darkMode ? "#90caf9" : "#1976d2" },
                    secondary: { main: darkMode ? "#f48fb1" : "#d32f2f" },
                },
                typography: {
                    fontFamily: 'Montserrat, Roboto, sans-serif',
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

    // Joy UI theme
    const joyTheme = useMemo(
        () =>
            extendJoyTheme({
                cssVarPrefix: 'joy',
                colorSchemes: {
                    light: {
                        palette: {
                            primary: {
                                main: '#1976d2',
                            },
                        },
                    },
                    dark: {
                        palette: {
                            primary: {
                                main: '#90caf9',
                            },
                        },
                    },
                },
                fontFamily: {
                    body: 'Montserrat, Roboto, sans-serif',
                },
            }),
        []
    );

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {/* Material UI components should use MUI ThemeProvider only */}
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    return useContext(ThemeContext);
}

// import { createContext, useState, useMemo, useContext } from "react";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";
// import { useMediaQuery } from "@mui/material";
// import { CssVarsProvider } from '@mui/joy/styles';
// const ThemeContext = createContext();
//
// export function ThemeContextProvider({ children }) {
//     const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
//     const [darkMode, setDarkMode] = useState(prefersDarkMode);
//
//     const toggleTheme = () => setDarkMode((prev) => !prev);
//
//     const theme = useMemo(
//         () =>
//             createTheme({
//                 palette: {
//                     mode: darkMode ? "dark" : "light",
//                     primary: { main: darkMode ? "#90caf9" : "#1976d2" },
//                     secondary: { main: darkMode ? "#f48fb1" : "#d32f2f" },
//                 },
//                 typography: {
//                     fontFamily: "Montserrat, Roboto, sans-serif",
//                 },
//                 components: {
//                     MuiButton: {
//                         styleOverrides: {
//                             root: {
//                                 borderRadius: "8px",
//                                 textTransform: "none",
//                             },
//                         },
//                     },
//                 },
//             }),
//         [darkMode]
//     );
//
//     return (
//         <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
//             <CssVarsProvider defaultMode={darkMode ? "dark" : "light"}>
//                 <ThemeProvider theme={theme}>
//                     <CssBaseline />
//                     {children}
//                 </ThemeProvider>
//             </CssVarsProvider>
//         </ThemeContext.Provider>
//     );
// }
//
// export function useThemeContext() {
//     return useContext(ThemeContext);
// }