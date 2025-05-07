import { useEffect, useState } from "react";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline, Toolbar, AppBar, Typography, IconButton, Divider, Tooltip } from "@mui/material";
import { Dashboard, Group, ExitToApp, Menu, AdminPanelSettings } from "@mui/icons-material";
import { Outlet, useNavigate } from "react-router-dom";
import { getUserRole, logout } from "../services/authServices";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useThemeContext } from "../context/ThemeContext";
import CategoryIcon from "@mui/icons-material/Category";

const drawerWidth = 240;

function ThemeToggle() {
    const { darkMode, toggleTheme } = useThemeContext();

    return (
        <IconButton
            onClick={toggleTheme}
            sx={{
                position: "absolute", // important pentru layout
                top: 15,
                right: 15,
                zIndex: 1000,
                color: "inherit"
            }}
        >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
    );
}

export default function DashboardLayout() {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            const roles = await getUserRole();
            if (roles.includes("Admin")) {
                setIsAdmin(true);
            }
        };
        fetchRole();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const toggleDrawer = () => setOpen(!open);

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: 1201 }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={toggleDrawer}
                            sx={{ mr: 2 }}
                        >
                            <Menu />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            VibeCheck Dashboard
                        </Typography>
                    </Box>
                    <ThemeToggle />
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    width: open ? drawerWidth : 60,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: open ? drawerWidth : 60,
                        overflowX: "hidden",
                        transition: "width 0.3s",
                        whiteSpace: "nowrap"
                    }
                }}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                <Toolbar />
                <Divider />
                <List>
                    <Tooltip title="Canale" placement="right" disableHoverListener={open}>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate("/dashboard/channels")}>
                                <ListItemIcon><Dashboard /></ListItemIcon>
                                {open && <ListItemText primary="Canale" />}
                            </ListItemButton>
                        </ListItem>
                    </Tooltip>
                    <Tooltip title="Profil" placement="right" disableHoverListener={open}>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate("/dashboard/profile")}>
                                <ListItemIcon><Group /></ListItemIcon>
                                {open && <ListItemText primary="Profil" />}
                            </ListItemButton>
                        </ListItem>
                    </Tooltip>

                    {isAdmin && (
                        <Tooltip title="Admin Panel" placement="right" disableHoverListener={open}>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate("/dashboard/admin")}>
                                    <ListItemIcon><AdminPanelSettings /></ListItemIcon>
                                    {open && <ListItemText primary="Admin Panel" />}
                                </ListItemButton>
                            </ListItem>
                        </Tooltip>
                    )}

                    {isAdmin && (
                        <Tooltip title="Categorii" placement="right" disableHoverListener={open}>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate("/dashboard/categories")}>
                                    <ListItemIcon><CategoryIcon /></ListItemIcon>
                                    {open && <ListItemText primary="Categorii" />}
                                </ListItemButton>
                            </ListItem>
                        </Tooltip>
                    )}

                    <Tooltip title="Logout" placement="right" disableHoverListener={open}>
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemIcon><ExitToApp /></ListItemIcon>
                                {open && <ListItemText primary="Logout" />}
                            </ListItemButton>
                        </ListItem>
                    </Tooltip>
                </List>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}