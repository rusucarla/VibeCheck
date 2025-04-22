import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./App";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#dc004e",
        },
    },
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRoutes />
    </ThemeProvider>
);