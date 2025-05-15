// src/context/ThemeContext.jsx
import { CssVarsProvider } from '@mui/joy/styles';
import { extendTheme as extendJoyTheme } from '@mui/joy/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { createContext, useState, useContext, useMemo, useEffect } from 'react';

// Define theme constants
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    PURPLE: 'purple',
    PINK: 'pink',
    GREEN: 'green'
};

// Theme order for cycling
const THEME_CYCLE = [THEMES.LIGHT, THEMES.DARK, THEMES.PURPLE, THEMES.PINK, THEMES.GREEN];

const ThemeContext = createContext();

export function ThemeContextProvider({ children }) {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [currentTheme, setCurrentTheme] = useState(prefersDarkMode ? THEMES.DARK : THEMES.LIGHT);

    // Load saved theme preference from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme-preference');
        if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
            setCurrentTheme(savedTheme);
        }
    }, []);

    const cycleTheme = () => {
        const currentIndex = THEME_CYCLE.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
        const nextTheme = THEME_CYCLE[nextIndex];

        setCurrentTheme(nextTheme);
        localStorage.setItem('theme-preference', nextTheme);
    };

    // For backward compatibility
    const darkMode = currentTheme === THEMES.DARK;

    // Material UI theme definitions
    const muiTheme = useMemo(() => {
        // Define base colors for each theme
        const themeColors = {
            [THEMES.LIGHT]: {
                primary: { main: '#1976d2', dark: '#115293', light: '#4791db' },
                secondary: { main: '#d32f2f', dark: '#9a0007', light: '#e57373' },
                background: { default: '#fafafa', paper: '#ffffff' },
                text: { primary: '#333333', secondary: '#666666' }
            },
            [THEMES.DARK]: {
                primary: { main: '#90caf9', dark: '#648dae', light: '#bbdefb' },
                secondary: { main: '#f48fb1', dark: '#ab647a', light: '#f6a5c0' },
                background: { default: '#121212', paper: '#1e1e1e' },
                text: { primary: '#ffffff', secondary: '#b3b3b3' }
            },
            [THEMES.PURPLE]: {
                primary: { main: '#9c27b0', dark: '#6a1b9a', light: '#ce93d8' },
                secondary: { main: '#3f51b5', dark: '#303f9f', light: '#7986cb' },
                background: { default: '#f3e5f5', paper: '#ffffff' },
                text: { primary: '#4a148c', secondary: '#7b1fa2' }
            },
            [THEMES.PINK]: {
                primary: { main: '#e91e63', dark: '#c2185b', light: '#f48fb1' },
                secondary: { main: '#ff4081', dark: '#f50057', light: '#ff80ab' },
                background: { default: '#fce4ec', paper: '#ffffff' },
                text: { primary: '#880e4f', secondary: '#ad1457' }
            },
            [THEMES.GREEN]: {
                primary: { main: '#4caf50', dark: '#388e3c', light: '#81c784' },
                secondary: { main: '#009688', dark: '#00796b', light: '#4db6ac' },
                background: { default: '#e8f5e9', paper: '#ffffff' },
                text: { primary: '#1b5e20', secondary: '#2e7d32' }
            }
        };

        const isColoredTheme = ![THEMES.LIGHT, THEMES.DARK].includes(currentTheme);
        const mode = currentTheme === THEMES.DARK ? 'dark' : 'light';
        const colors = themeColors[currentTheme];

        return createTheme({
            palette: {
                mode,
                ...colors,
                // Ensure contrast for content
                contrastThreshold: isColoredTheme ? 4.5 : 3,
                tonalOffset: isColoredTheme ? 0.3 : 0.2
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
                MuiPaper: {
                    styleOverrides: {
                        root: {
                            // Improve readability in light mode
                            ...(currentTheme === THEMES.LIGHT && {
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            })
                        }
                    }
                },
                MuiCard: {
                    styleOverrides: {
                        root: {
                            // Improve contrast in light mode
                            ...(currentTheme === THEMES.LIGHT && {
                                boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                            })
                        }
                    }
                }
            },
        });
    }, [currentTheme]);

    // Joy UI theme
    const joyTheme = useMemo(() => {
        // Map theme colors to Joy UI format
        const joyColors = {
            [THEMES.LIGHT]: {
                primary: '#1976d2',
                neutral: '#8796A5'
            },
            [THEMES.DARK]: {
                primary: '#90caf9',
                neutral: '#A0AEC0'
            },
            [THEMES.PURPLE]: {
                primary: '#9c27b0',
                neutral: '#9E86B0'
            },
            [THEMES.PINK]: {
                primary: '#e91e63',
                neutral: '#D178A1'
            },
            [THEMES.GREEN]: {
                primary: '#4caf50',
                neutral: '#7BB07E'
            }
        };

        return extendJoyTheme({
            cssVarPrefix: 'joy',
            colorSchemes: {
                light: {
                    palette: {
                        primary: { main: joyColors[currentTheme].primary },
                        neutral: { main: joyColors[currentTheme].neutral }
                    },
                },
                dark: {
                    palette: {
                        primary: { main: joyColors[currentTheme === THEMES.DARK ? THEMES.DARK : currentTheme].primary },
                        neutral: { main: joyColors[currentTheme === THEMES.DARK ? THEMES.DARK : currentTheme].neutral }
                    },
                },
            },
            fontFamily: {
                body: 'Montserrat, Roboto, sans-serif',
            },
        });
    }, [currentTheme]);

    return (
        <ThemeContext.Provider value={{
            darkMode, // For backward compatibility
            toggleTheme: cycleTheme, // Old name, new function
            currentTheme,
            cycleTheme,
            themes: THEMES
        }}>
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

// import { CssVarsProvider } from '@mui/joy/styles';
// import { extendTheme as extendJoyTheme } from '@mui/joy/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
// import { useMediaQuery } from '@mui/material';
// import { createContext, useState, useContext, useMemo } from 'react';
//
// const ThemeContext = createContext();
//
// export function ThemeContextProvider({ children }) {
//     const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
//     const [darkMode, setDarkMode] = useState(prefersDarkMode);
//
//     const toggleTheme = () => setDarkMode((prev) => !prev);
//
//     // Material UI theme
//     const muiTheme = useMemo(
//         () =>
//             createTheme({
//                 palette: {
//                     mode: darkMode ? 'dark' : 'light',
//                     primary: { main: darkMode ? "#90caf9" : "#1976d2" },
//                     secondary: { main: darkMode ? "#f48fb1" : "#d32f2f" },
//                 },
//                 typography: {
//                     fontFamily: 'Montserrat, Roboto, sans-serif',
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
//     // Joy UI theme
//     const joyTheme = useMemo(
//         () =>
//             extendJoyTheme({
//                 cssVarPrefix: 'joy',
//                 colorSchemes: {
//                     light: {
//                         palette: {
//                             primary: {
//                                 main: '#1976d2',
//                             },
//                         },
//                     },
//                     dark: {
//                         palette: {
//                             primary: {
//                                 main: '#90caf9',
//                             },
//                         },
//                     },
//                 },
//                 fontFamily: {
//                     body: 'Montserrat, Roboto, sans-serif',
//                 },
//             }),
//         []
//     );
//
//     return (
//         <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
//             {/* Material UI components should use MUI ThemeProvider only */}
//             <MuiThemeProvider theme={muiTheme}>
//                 <CssBaseline />
//                 {children}
//             </MuiThemeProvider>
//         </ThemeContext.Provider>
//     );
// }
//
// export function useThemeContext() {
//     return useContext(ThemeContext);
// }

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