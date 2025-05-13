import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Pagination,
    Grid,
    Stack,
    TextField,
    Chip,
    Tooltip,
    Snackbar,
    Alert,
    useTheme
} from "@mui/material";
import { Add, Delete, Edit, PersonAdd, ExitToApp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card";
import {
    getAllChannels,
    deleteChannel,
    getUserChannels,
    requestToJoinChannel,
    getUserRole,
    checkChannelAdminAccess,
    leaveChannel
} from "../../services/channelService";

function ChannelsPage() {
    const [channels, setChannels] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [userChannels, setUserChannels] = useState([]);
    const [adminAccessMap, setAdminAccessMap] = useState({});
    const [userRoleRefresh, setUserRoleRefresh] = useState(0);
    const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info"
    });
    const pageSize = 9;
    const navigate = useNavigate();
    const theme = useTheme();

    const loadChannels = async (currentPage, searchTerm = "") => {
        const result = await getAllChannels(currentPage, pageSize, searchTerm);
        if (result) {
            setChannels(result.data || []);
            setTotalPages(result.totalPages || 1);
        }
    };

    const loadUserData = async () => {
        // Load user's subscribed channels
        const userChannelsResult = await getUserChannels();
        setUserChannels(userChannelsResult?.data || []);

        // Check if user is global admin
        const userRoleResult = await getUserRole();
        setIsGlobalAdmin(userRoleResult?.roles?.includes("Admin"));
    };

    useEffect(() => {
        loadChannels(page, search);
        loadUserData();
    }, [page]);
    
    // Add this useEffect to load admin access information
    useEffect(() => {
        const loadAdminAccess = async () => {
            const accessMap = {};
            for (const channel of channels) {
                try {
                    const hasAccess = await checkChannelAdminAccess(channel.id);
                    accessMap[channel.id] = hasAccess;
                } catch (error) {
                    accessMap[channel.id] = false;
                }
            }
            setAdminAccessMap(accessMap);
        };

        if (channels.length > 0) {
            loadAdminAccess();
        }
    }, [channels, userRoleRefresh]);

    // This function checks if a user has admin access to a specific channel
    const hasAdminAccess = (channelId) => {
        // Check if user is a channel admin
        const isChannelAdmin = userChannels.some(
            channel => channel.id === channelId && channel.userRole === "Admin"
        );
        // Or if they're a global admin
        return isChannelAdmin;
    };

    const getUserRoleInChannel = (channelId) => {
        const channel = userChannels.find(ch => ch.id === channelId);
        return channel ? channel.userRole : null;
    };

    const handleLeaveChannel = async (channelId, event) => {
        // Prevent card click propagation
        if (event) {
            event.stopPropagation();
        }
        
        try {
            // Call the leave channel API
            await leaveChannel(channelId);

            // Remove the channel from the userChannels state
            setUserChannels(prev => prev.filter(channel => channel.id !== channelId));

            // Update the membership tracking state
            setAdminAccessMap(prev => {
                const newMap = { ...prev };
                delete newMap[channelId];
                return newMap;
            });

            // Show success message
            setSnackbar({
                open: true,
                message: "Left channel successfully",
                severity: "success"
            });
        } catch (error) {
            console.error("Error leaving channel:", error);
            setSnackbar({
                open: true,
                message: error.message || "Failed to leave channel",
                severity: "error"
            });
        }
    };
    
    const handleDelete = async (id, event) => {
        // Prevent card click propagation
        if (event) {
            event.stopPropagation();
        }
        
        if (window.confirm("Are you sure you want to delete this channel?")) {
            try {
                await deleteChannel(id);
                loadChannels(page, search);
                setSnackbar({
                    open: true,
                    message: "Channel deleted successfully",
                    severity: "success"
                });
            } catch (error) {
                console.error("Delete error:", error.message);
                setSnackbar({
                    open: true,
                    message: "Failed to delete channel",
                    severity: "error"
                });
            }
        }
    };

    const handleJoinRequest = async (channelId, event) => {
        // Prevent card click propagation
        if (event) {
            event.stopPropagation();
        }
        
        try {
            await requestToJoinChannel(channelId);
            setSnackbar({
                open: true,
                message: "Join request sent successfully",
                severity: "success"
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || "Failed to send join request",
                severity: "error"
            });
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        loadChannels(1, search);
    };

    // Check if user is member of a channel
    const isUserMember = (channelId) => {
        return userChannels.some(channel => channel.id === channelId);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Canale disponibile
            </Typography>

            <Stack direction="row" spacing={2} mb={3} alignItems="center">
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => navigate("/dashboard/channels/new")}
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        }
                    }}
                >
                    Adaugă canal
                </Button>
                <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: '400px' }}>
                    <TextField
                        label="Caută canale"
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        fullWidth
                        InputProps={{
                            sx: { borderRadius: '8px' }
                        }}
                    />
                </form>
            </Stack>

            <Grid container spacing={3}>
                {channels.map((channel) => (
                    <Grid item xs={12} sm={6} md={4} key={channel.id}>
                        <Card
                            title={channel.name}
                            sx={{
                                height: '100%',
                                margin: 0,
                                position: 'relative',
                                backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
                                color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                                cursor: isUserMember(channel.id) ? "pointer" : "default",
                                opacity: isUserMember(channel.id) ? 1 : 0.8,
                                filter: isUserMember(channel.id) ? "none" : "grayscale(20%)",
                                transition: "all 0.3s ease-in-out",
                                '&:hover': {
                                    filter: "none",
                                    opacity: 1,
                                }
                            }}
                            onClick={() => {
                                if (isUserMember(channel.id)) {
                                    navigate(`/dashboard/channel/${channel.id}`);
                                } else {
                                    setSnackbar({
                                        open: true,
                                        message: "Trebuie să fii membru al acestui canal pentru a-l accesa.",
                                        severity: "info"
                                    });
                                }
                            }}
                        >
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                {channel.description}
                            </Typography>

                            <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" mb={1}>
                                {channel.categories?.map((cat) => (
                                    <Chip
                                        key={cat.id}
                                        label={cat.title}
                                        size="small"
                                        sx={{
                                            borderRadius: '12px',
                                            backgroundColor: theme.palette.mode === 'dark' ?
                                                'rgba(156, 39, 176, 0.15)' : 'rgba(156, 39, 176, 0.1)',
                                            color: theme.palette.primary.main,
                                            border: `1px solid ${theme.palette.primary.main}`,
                                            fontWeight: 500,
                                            fontSize: '0.7rem',
                                            height: '20px',
                                            margin: '2px'
                                        }}
                                    />
                                ))}
                            </Stack>

                            {/* Admin actions */}
                            {(hasAdminAccess(channel.id) || isGlobalAdmin) && (
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                    }}
                                >
                                    <IconButton
                                        onClick={(e) => navigate(`/dashboard/channels/edit/${channel.id}`)}
                                        size="small"
                                        sx={{
                                            color: theme.palette.warning.main,
                                            '&:hover': { color: theme.palette.warning.dark },
                                            padding: '4px'
                                        }}
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        onClick={(e) => handleDelete(channel.id, e)}
                                        size="small"
                                        sx={{
                                            color: theme.palette.error.main,
                                            '&:hover': { color: theme.palette.error.dark },
                                            padding: '4px'
                                        }}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Stack>
                            )}

                            {/* Join/Leave actions - spațiere redusă */}
                            <Box sx={{ mt: "auto", pt: 1 }}>
                                {!isUserMember(channel.id) ? (
                                    <Button
                                        variant="outlined"
                                        startIcon={<PersonAdd />}
                                        size="small"
                                        onClick={(e) => handleJoinRequest(channel.id, e)}
                                        sx={{
                                            borderRadius: '12px',
                                            borderColor: theme.palette.primary.main,
                                            color: theme.palette.primary.main,
                                            '&:hover': {
                                                borderColor: theme.palette.primary.dark,
                                                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                            },
                                            padding: '2px 10px',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        Solicită participare
                                    </Button>
                                ) : (
                                    <Stack spacing={1} alignItems="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            {hasAdminAccess(channel.id) ? (
                                                <Chip
                                                    label="Admin"
                                                    color="secondary"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: '12px',
                                                        height: '22px',
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                            ) : (
                                                <Chip
                                                    label="Membru"
                                                    color="primary"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: '12px',
                                                        height: '22px',
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                            )}

                                            <Tooltip title="Părăsire canal">
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        color: theme.palette.warning.main,
                                                        '&:hover': {
                                                            color: theme.palette.warning.dark,
                                                            backgroundColor: 'rgba(255, 152, 0, 0.1)'
                                                        },
                                                        padding: '2px'
                                                    }}
                                                    onClick={(e) => handleLeaveChannel(channel.id, e)}
                                                >
                                                    <ExitToApp fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>

                                        <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                borderRadius: '12px',
                                                borderColor: theme.palette.primary.main,
                                                color: theme.palette.primary.main,
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.dark,
                                                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                                },
                                                padding: '2px 10px',
                                                fontSize: '0.75rem',
                                                marginTop: '4px'
                                            }}
                                            onClick={() => navigate(`/dashboard/channel/${channel.id}`)}
                                        >
                                            Accesează canalul
                                        </Button>
                                    </Stack>
                                )}
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>


            <Stack spacing={2} alignItems="center" mt={4}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    sx={{
                        '& .MuiPaginationItem-root': {
                            borderRadius: '8px',
                        }
                    }}
                />
            </Stack>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ChannelsPage;


// import { useEffect, useState } from "react";
// import {
//     Box,
//     Typography,
//     Button,
//     IconButton,
//     Pagination,
//     Grid,
//     Stack,
//     TextField,
//     Chip
// } from "@mui/material";
// import { Add, Delete, Edit } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";
// import { getAllChannels, deleteChannel } from "../../services/channelService";
//
// function ChannelsPage() {
//     const [channels, setChannels] = useState([]);
//     const [page, setPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
//     const [search, setSearch] = useState("");
//     const pageSize = 9;
//     const navigate = useNavigate();
//
//     const loadChannels = async (currentPage, searchTerm = "") => {
//         const result = await getAllChannels(currentPage, pageSize, searchTerm);
//         if (result) {
//             setChannels(result.data || []);
//             setTotalPages(result.totalPages || 1);
//         }
//     };
//
//     useEffect(() => {
//         loadChannels(page, search);
//     }, [page]);
//
//     const handleDelete = async (id) => {
//         if (window.confirm("Are you sure you want to delete this channel?")) {
//             try {
//                 await deleteChannel(id);
//                 loadChannels(page, search);
//             } catch (error) {
//                 console.error("Delete error:", error.message);
//             }
//         }
//     };
//
//     const handleSearchSubmit = (e) => {
//         e.preventDefault();
//         setPage(1);
//         loadChannels(1, search);
//     };
//
//     return (
//         <Box>
//             <Typography variant="h4" gutterBottom>
//                 Canale disponibile
//             </Typography>
//
//             <Stack direction="row" spacing={2} mb={3} alignItems="center">
//                 <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/dashboard/channels/new")}>
//                     Add canal
//                 </Button>
//                 <form onSubmit={handleSearchSubmit}>
//                     <TextField
//                         label="Cauta canale"
//                         variant="outlined"
//                         size="small"
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                     />
//                 </form>
//             </Stack>
//
//             <Grid container spacing={2}>
//                 {channels.map((channel) => (
//                     <Grid item xs={12} sm={6} md={4} key={channel.id}>
//                         <Box
//                             sx={{
//                                 p: 2,
//                                 border: "1px solid",
//                                 borderRadius: "8px",
//                                 textAlign: "center",
//                                 backgroundColor: "background.paper",
//                                 position: "relative",
//                             }}
//                         >
//                             <Typography variant="h6">{channel.name}</Typography>
//                             <Typography variant="body2" gutterBottom>
//                                 {channel.description}
//                             </Typography>
//
//                             <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" mt={1}>
//                                 {channel.categories?.map((cat) => (
//                                     <Chip key={cat.id} label={cat.title} size="small" />
//                                 ))}
//                             </Stack>
//
//                             <Box
//                                 sx={{
//                                     position: "absolute",
//                                     top: 5,
//                                     right: 5,
//                                     display: "flex",
//                                     gap: 1,
//                                 }}
//                             >
//                                 <IconButton onClick={() => navigate(`/dashboard/channels/edit/${channel.id}`)} size="small">
//                                     <Edit fontSize="small" />
//                                 </IconButton>
//                                 <IconButton onClick={() => handleDelete(channel.id)} size="small">
//                                     <Delete fontSize="small" />
//                                 </IconButton>
//                             </Box>
//                         </Box>
//                     </Grid>
//                 ))}
//             </Grid>
//
//             <Stack spacing={2} alignItems="center" mt={4}>
//                 <Pagination
//                     count={totalPages}
//                     page={page}
//                     onChange={(_, newPage) => setPage(newPage)}
//                     color="primary"
//                     variant="outlined"
//                     shape="rounded"
//                 />
//             </Stack>
//         </Box>
//     );
// }
//
// export default ChannelsPage;
