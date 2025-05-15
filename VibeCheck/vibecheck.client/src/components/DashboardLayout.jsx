// import { useEffect, useState } from "react";
// import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline, Toolbar, AppBar, Typography, IconButton, Divider, Tooltip } from "@mui/material";
// import { Dashboard, Group, ExitToApp, Menu, AdminPanelSettings } from "@mui/icons-material";
// import { Outlet, useNavigate } from "react-router-dom";
// import { getUserRole, logout } from "../services/authServices";
// import DarkModeIcon from "@mui/icons-material/DarkMode";
// import LightModeIcon from "@mui/icons-material/LightMode";
// import { useThemeContext } from "../context/ThemeContext";
// import CategoryIcon from "@mui/icons-material/Category";
//
// const drawerWidth = 240;
//
// function ThemeToggle() {
//     const { darkMode, toggleTheme } = useThemeContext();
//
//     return (
//         <IconButton
//             onClick={toggleTheme}
//             sx={{
//                 position: "absolute", // important pentru layout
//                 top: 15,
//                 right: 15,
//                 zIndex: 1000,
//                 color: "inherit"
//             }}
//         >
//             {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
//         </IconButton>
//     );
// }
//
// export default function DashboardLayout() {
//     const navigate = useNavigate();
//     const [isAdmin, setIsAdmin] = useState(false);
//     const [open, setOpen] = useState(true);
//
//     useEffect(() => {
//         const fetchRole = async () => {
//             const roles = await getUserRole();
//             if (roles.includes("Admin")) {
//                 setIsAdmin(true);
//             }
//         };
//         fetchRole();
//     }, []);
//
//     const handleLogout = async () => {
//         await logout();
//         navigate("/");
//     };
//
//     const toggleDrawer = () => setOpen(!open);
//
//     return (
//         <Box sx={{ display: "flex" }}>
//             <CssBaseline />
//             <AppBar position="fixed" sx={{ zIndex: 1201 }}>
//                 <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
//                     <Box sx={{ display: "flex", alignItems: "center" }}>
//                         <IconButton
//                             color="inherit"
//                             edge="start"
//                             onClick={toggleDrawer}
//                             sx={{ mr: 2 }}
//                         >
//                             <Menu />
//                         </IconButton>
//                         <Typography variant="h6" noWrap component="div">
//                             VibeCheck Dashboard
//                         </Typography>
//                     </Box>
//                     <ThemeToggle />
//                 </Toolbar>
//             </AppBar>
//
//             <Drawer
//                 variant="permanent"
//                 open={open}
//                 sx={{
//                     width: open ? drawerWidth : 60,
//                     flexShrink: 0,
//                     "& .MuiDrawer-paper": {
//                         width: open ? drawerWidth : 60,
//                         overflowX: "hidden",
//                         transition: "width 0.3s",
//                         whiteSpace: "nowrap"
//                     }
//                 }}
//                 onMouseEnter={() => setOpen(true)}
//                 onMouseLeave={() => setOpen(false)}
//             >
//                 <Toolbar />
//                 <Divider />
//                 <List>
//                     <Tooltip title="Canale" placement="right" disableHoverListener={open}>
//                         <ListItem disablePadding>
//                             <ListItemButton onClick={() => navigate("/dashboard/channels")}>
//                                 <ListItemIcon><Dashboard /></ListItemIcon>
//                                 {open && <ListItemText primary="Canale" />}
//                             </ListItemButton>
//                         </ListItem>
//                     </Tooltip>
//
//                     <Tooltip title="Spotify" placement="right" disableHoverListener={open}>
//                         <ListItem disablePadding>
//                             <ListItemButton onClick={() => navigate("search/spotify")}>
//                                 <ListItemIcon><Dashboard /></ListItemIcon>
//                                 {open && <ListItemText primary="Spotify" />}
//                             </ListItemButton>
//                         </ListItem>
//                     </Tooltip>
//                    
//                     <Tooltip title="Profil" placement="right" disableHoverListener={open}>
//                         <ListItem disablePadding>
//                             <ListItemButton onClick={() => navigate("/dashboard/profile")}>
//                                 <ListItemIcon><Group /></ListItemIcon>
//                                 {open && <ListItemText primary="Profil" />}
//                             </ListItemButton>
//                         </ListItem>
//                     </Tooltip>
//
//                     {isAdmin && (
//                         <Tooltip title="Admin Panel" placement="right" disableHoverListener={open}>
//                             <ListItem disablePadding>
//                                 <ListItemButton onClick={() => navigate("/dashboard/admin")}>
//                                     <ListItemIcon><AdminPanelSettings /></ListItemIcon>
//                                     {open && <ListItemText primary="Admin Panel" />}
//                                 </ListItemButton>
//                             </ListItem>
//                         </Tooltip>
//                     )}
//
//                     {isAdmin && (
//                         <Tooltip title="Categorii" placement="right" disableHoverListener={open}>
//                             <ListItem disablePadding>
//                                 <ListItemButton onClick={() => navigate("/dashboard/categories")}>
//                                     <ListItemIcon><CategoryIcon /></ListItemIcon>
//                                     {open && <ListItemText primary="Categorii" />}
//                                 </ListItemButton>
//                             </ListItem>
//                         </Tooltip>
//                     )}
//
//                     <Tooltip title="Logout" placement="right" disableHoverListener={open}>
//                         <ListItem disablePadding>
//                             <ListItemButton onClick={handleLogout}>
//                                 <ListItemIcon><ExitToApp /></ListItemIcon>
//                                 {open && <ListItemText primary="Logout" />}
//                             </ListItemButton>
//                         </ListItem>
//                     </Tooltip>
//                 </List>
//             </Drawer>
//
//             <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
//                 <Toolbar />
//                 <Outlet />
//             </Box>
//         </Box>
//     );
// }

// src/components/DashboardLayout.jsx

// var mai draguta 
import { useEffect, useState } from "react";
import {
    Box,
    CssBaseline,
    Divider,
    Typography,
    useTheme
} from "@mui/material";
import {
    Menu as MenuIcon,
    Dashboard,
    Group,
    ExitToApp,
    Category as CategoryIcon,
    AdminPanelSettings,
    ChevronLeft,
    ChevronRight,
    MusicNote,
    Movie as MovieIcon,
    Brightness4,
    Brightness7,
    Palette,
    ColorLens,
    Inbox
} from "@mui/icons-material";
import { Outlet, useNavigate } from "react-router-dom";
import { getUserRole, logout } from "../services/authServices";
import { useThemeContext } from "../context/ThemeContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const drawerWidth = 240;

function DashboardLayout() {
    const [open, setOpen] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const { darkMode, currentTheme, cycleTheme } = useThemeContext();
    const getThemeIcon = (theme) => {
        switch(theme) {
            case 'light': return <Brightness7 />;
            case 'dark': return <Brightness4 />;
            case 'purple': return <Palette sx={{ color: '#9c27b0' }} />;
            case 'pink': return <Palette sx={{ color: '#e91e63' }} />;
            case 'green': return <Palette sx={{ color: '#4caf50' }} />;
            default: return <ColorLens />;
        }
    };

    useEffect(() => {
        const checkRole = async () => {
            const roles = await getUserRole();
            if (roles && roles.includes("Admin")) {
                setIsAdmin(true);
            }
        };
        checkRole();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <CssBaseline />

            {/* App Bar */}
            <Box
                component="header"
                sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 64,
                    zIndex: 1200,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: darkMode ? "#1e1e1e" : "#f5f5f5",
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                }}
            >
                <Box
                    onClick={() => setOpen(!open)}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        cursor: "pointer",
                        "&:hover": {
                            bgcolor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                        }
                    }}
                >
                    <MenuIcon sx={{ color: theme.palette.primary.main }} />
                </Box>

                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 600
                    }}
                >
                    VibeCheck Dashboard
                </Typography>

                {/*<Box*/}
                {/*    onClick={toggleTheme}*/}
                {/*    sx={{*/}
                {/*        display: "flex",*/}
                {/*        alignItems: "center",*/}
                {/*        justifyContent: "center",*/}
                {/*        width: 40,*/}
                {/*        height: 40,*/}
                {/*        borderRadius: "50%",*/}
                {/*        cursor: "pointer",*/}
                {/*        bgcolor: theme.palette.primary.main,*/}
                {/*        color: theme.palette.primary.contrastText,*/}
                {/*        "&:hover": {*/}
                {/*            opacity: 0.9*/}
                {/*        }*/}
                {/*    }}*/}
                {/*>*/}
                {/*    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}*/}
                {/*</Box>*/}
                <Box
                    onClick={cycleTheme}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        cursor: "pointer",
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        "&:hover": {
                            opacity: 0.9
                        },
                        transition: "background-color 0.3s"
                    }}
                    title={`Current theme: ${currentTheme} (click to change)`}
                >
                    {getThemeIcon(currentTheme)}
                </Box>
            </Box>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{
                    position: "fixed",
                    top: 64,
                    left: 0,
                    bottom: 0,
                    width: open ? drawerWidth : 72,
                    overflow: "hidden",
                    transition: "width 0.3s ease",
                    borderRight: "1px solid",
                    borderColor: "divider",
                    zIndex: 1100,
                    display: "flex",
                    flexDirection: "column",
                    // bgcolor: darkMode ? "#121212" : "#fff",
                    bgcolor: theme.palette.background.paper,
                }}
            >
                <Box sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    p: 1,
                }}>
                    <Box
                        onClick={() => setOpen(!open)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            cursor: "pointer",
                            "&:hover": {
                                bgcolor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                            }
                        }}
                    >
                        {open ? <ChevronLeft sx={{ color: 'text.secondary' }} /> : <ChevronRight sx={{ color: 'text.secondary' }} />}
                    </Box>
                </Box>

                <Divider />

                <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                    {/* Navigation items */}
                    <Box
                        component="div"
                        onClick={() => navigate("/dashboard/channels")}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            py: 1.5,
                            cursor: "pointer",
                            "&:hover": {
                                bgcolor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
                            }
                        }}
                    >
                        <Dashboard sx={{ mr: 2, color: theme.palette.primary.main }} />
                        <Box sx={{
                            opacity: open ? 1 : 0,
                            transition: "opacity 0.2s",
                            whiteSpace: "nowrap"
                        }}>
                            Canale
                        </Box>
                    </Box>

                    <Box
                        component="div"
                        onClick={() => navigate("/dashboard/requests/inbox")}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            py: 1.5,
                            cursor: "pointer",
                            "&:hover": {
                                bgcolor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
                            }
                        }}
                    >
                        <Inbox sx={{ mr: 2, color: theme.palette.primary.main }} />
                        <Box sx={{
                            opacity: open ? 1 : 0,
                            transition: "opacity 0.2s",
                            whiteSpace: "nowrap"
                        }}>
                            Inbox
                        </Box>
                    </Box>

                    <Box
                        component="div"
                        onClick={() => navigate("search/spotify")}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            py: 1.5,
                            cursor: "pointer",
                            "&:hover": {
                                bgcolor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
                            }
                        }}
                    >
                        <MusicNote sx={{ mr: 2, color: theme.palette.primary.main }} />
                        <Box sx={{
                            opacity: open ? 1 : 0,
                            transition: "opacity 0.2s",
                            whiteSpace: "nowrap"
                        }}>
                            Spotify
                        </Box>
                    </Box>
                    
                    <Box
                        component="div"
                        onClick={() => navigate("search/tmdb")}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            py: 1.5,
                            cursor: "pointer",
                            "&:hover": {
                                bgcolor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
                            }
                        }}
                    >
                        <MovieIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                        <Box sx={{
                            opacity: open ? 1 : 0,
                            transition: "opacity 0.2s",
                            whiteSpace: "nowrap"
                        }}>
                            Movies & TV
                        </Box>
                    </Box>
                    
                    <Box
                        component="div"
                        onClick={() => navigate("/dashboard/profile")}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            py: 1.5,
                            cursor: "pointer",
                            "&:hover": {
                                bgcolor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
                            }
                        }}
                    >
                        <Group sx={{ mr: 2, color: theme.palette.primary.main }} />
                        <Box sx={{
                            opacity: open ? 1 : 0,
                            transition: "opacity 0.2s",
                            whiteSpace: "nowrap"
                        }}>
                            Profil
                        </Box>
                    </Box>

                    {isAdmin && (
                        <>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{
                                px: 2,
                                py: 0.5,
                                opacity: open ? 1 : 0,
                                transition: "opacity 0.2s"
                            }}>
                                <Typography
                                    variant="caption"
                                    color="textSecondary"
                                >
                                    Admin Tools
                                </Typography>
                            </Box>

                            <Box
                                component="div"
                                onClick={() => navigate("/dashboard/admin")}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    px: 2,
                                    py: 1.5,
                                    cursor: "pointer",
                                    "&:hover": {
                                        bgcolor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
                                    }
                                }}
                            >
                                <AdminPanelSettings sx={{ mr: 2, color: theme.palette.primary.main }} />
                                <Box sx={{
                                    opacity: open ? 1 : 0,
                                    transition: "opacity 0.2s",
                                    whiteSpace: "nowrap"
                                }}>
                                    Admin Panel
                                </Box>
                            </Box>

                            <Box
                                component="div"
                                onClick={() => navigate("/dashboard/categories")}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    px: 2,
                                    py: 1.5,
                                    cursor: "pointer",
                                    "&:hover": {
                                        bgcolor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
                                    }
                                }}
                            >
                                <CategoryIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                                <Box sx={{
                                    opacity: open ? 1 : 0,
                                    transition: "opacity 0.2s",
                                    whiteSpace: "nowrap"
                                }}>
                                    Categorii
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>

                <Divider />
                <Box
                    component="div"
                    onClick={handleLogout}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 2,
                        py: 1.5,
                        cursor: "pointer",
                        color: "#f44336",
                        "&:hover": {
                            bgcolor: darkMode ? "rgba(244,67,54,0.15)" : "rgba(244,67,54,0.08)"
                        }
                    }}
                >
                    <ExitToApp sx={{ mr: 2 }} />
                    <Box sx={{
                        opacity: open ? 1 : 0,
                        transition: "opacity 0.2s",
                        whiteSpace: "nowrap"
                    }}>
                        Logout
                    </Box>
                </Box>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { xs: '100%', sm: `calc(100% - ${open ? drawerWidth : 72}px)` },
                    ml: { xs: 0, sm: `${open ? drawerWidth : 72}px` },
                    mt: "64px",
                    transition: "margin-left 0.3s ease, width 0.3s ease",
                    // bgcolor: darkMode ? "#1a1a1a" : "#fafafa",
                    bgcolor: theme.palette.background.default,
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}

export default DashboardLayout;
