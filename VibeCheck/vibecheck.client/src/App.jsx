import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container, IconButton } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Placeholder from "./components/Placeholder";
import ConfirmEmail from "./components/ConfirmEmail";
import TwoFactorAuth from "./components/TwoFactorAuth";
import { ThemeContextProvider, useThemeContext } from "./context/ThemeContext";

import TestUI from "./TestUI";
import TestUIButton from "./components/ui/TestUIButton";

function ThemeToggle() {
    const { darkMode, toggleTheme } = useThemeContext();

    return (
        <IconButton
            onClick={toggleTheme}
            sx={{
                position: "fixed",
                top: 15,
                right: 15,
                zIndex: 1000,
                color: "inherit",
            }}
        >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
    );
}


function AppRoutes() {
    return (
        <ThemeContextProvider>
            <Router>
                <ThemeToggle />
                <TestUIButton />
                <Container maxWidth="lg" sx={{ mt: 5 }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/confirm-email" element={<ConfirmEmail />} />
                        <Route path="/two-factor" element={<TwoFactorAuth />} />
                        <Route path="/placeholder" element={<Placeholder />} />
                        <Route path="/test-ui" element={<TestUI />} />
                        <Route path="*" element={<h1>404 - Page does not exist</h1>} />
                    </Routes>
                </Container>
            </Router>
        </ThemeContextProvider>
    );
}

export default AppRoutes;
//de adaugat test ui later + dashboard


//import { useEffect, useState } from 'react';
//import './App.css';

//function App() {
//    const [forecasts, setForecasts] = useState();

//    useEffect(() => {
//        populateWeatherData();
//    }, []);

//    const contents = forecasts === undefined
//        ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
//        : <table className="table table-striped" aria-labelledby="tableLabel">
//            <thead>
//                <tr>
//                    <th>Date</th>
//                    <th>Temp. (C)</th>
//                    <th>Temp. (F)</th>
//                    <th>Summary</th>
//                </tr>
//            </thead>
//            <tbody>
//                {forecasts.map(forecast =>
//                    <tr key={forecast.date}>
//                        <td>{forecast.date}</td>
//                        <td>{forecast.temperatureC}</td>
//                        <td>{forecast.temperatureF}</td>
//                        <td>{forecast.summary}</td>
//                    </tr>
//                )}
//            </tbody>
//        </table>;

//    return (
//        <div>
//            <h1 id="tableLabel">Weather forecast</h1>
//            <p>This component demonstrates fetching data from the server.</p>
//            {contents}
//        </div>
//    );

//    async function populateWeatherData() {
//        const response = await fetch('weatherforecast');
//        if (response.ok) {
//            const data = await response.json();
//            setForecasts(data);
//        }
//    }
//}

//export default App;
