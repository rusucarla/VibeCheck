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
    Alert
} from "@mui/material";
import { Add, Delete, Edit, PersonAdd, ExitToApp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
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
        console.log("User roles:", userRoleResult);
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
                    console.error(`Error checking admin access for channel ${channel.id}:`, error);
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
        console.log("User channels:", userChannels);
        // Or if they're a global admin
        return isChannelAdmin;
    };

    const getUserRoleInChannel = (channelId) => {
        const channel = userChannels.find(ch => ch.id === channelId);
        return channel ? channel.userRole : null;
    };

    const handleLeaveChannel = async (channelId) => {
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
    const handleDelete = async (id) => {
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

    const handleJoinRequest = async (channelId) => {
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
                >
                    Add canal
                </Button>
                <form onSubmit={handleSearchSubmit}>
                    <TextField
                        label="Cauta canale"
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
            </Stack>

            <Grid container spacing={2}>
                {channels.map((channel) => (
                    <Grid item xs={12} sm={6} md={4} key={channel.id}>
                        <Box
                            sx={{
                                p: 2,
                                border: "1px solid",
                                borderRadius: "8px",
                                textAlign: "center",
                                backgroundColor: "background.paper",
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                                // Only show pointer cursor if user is a member
                                cursor: isUserMember(channel.id) ? "pointer" : "default",
                                // Dim appearance for non-members
                                opacity: isUserMember(channel.id) ? 1 : 0.7,
                            }}
                            onClick={(e) => {
                                // Prevent navigation if user clicks on the admin buttons area
                                if (e.target.closest('.admin-actions')) {
                                    e.stopPropagation();
                                    return;
                                }
                                // Only navigate if user is a member
                                if (isUserMember(channel.id)) {
                                    navigate(`/dashboard/channel/${channel.id}`);
                                } else {
                                    // Show a message that they need to join first
                                    setSnackbar({
                                        open: true,
                                        message: "Trebuie să fii membru al acestui canal pentru a-l accesa.",
                                        severity: "info"
                                    });
                                }
                            }}
                        >
                            <Typography variant="h6">{channel.name}</Typography>
                            <Typography variant="body2" gutterBottom>
                                {channel.description}
                            </Typography>

                            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" mt={1}>
                                {channel.categories?.map((cat) => (
                                    <Chip key={cat.id} label={cat.title} size="small" />
                                ))}
                            </Stack>

                            {/* Admin actions */}
                            {(hasAdminAccess(channel.id) || isGlobalAdmin) && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 5,
                                        right: 5,
                                        display: "flex",
                                        gap: 1,
                                    }}
                                >
                                    <IconButton
                                        onClick={() => navigate(`/dashboard/channels/edit/${channel.id}`)}
                                        size="small"
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDelete(channel.id)}
                                        size="small"
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}

                            {/* Join button for non-members */}
                            <Box sx={{ mt: "auto", pt: 2 }}>
                                {!isUserMember(channel.id) && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<PersonAdd />}
                                        size="small"
                                        onClick={() => handleJoinRequest(channel.id)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Request to Join
                                    </Button>
                                )}
                                {isUserMember(channel.id) && (
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                        {hasAdminAccess(channel.id) && (
                                            <Chip
                                                label="Channel Admin"
                                                color="secondary"
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                        {isGlobalAdmin && (
                                            <Chip
                                                label="Global Admin"
                                                color="error"
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                        {!hasAdminAccess(channel.id) && (
                                            <Chip
                                                label="Member"
                                                color="primary"
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                )}
                                {isUserMember(channel.id) && (
                                    <Tooltip title="Leave Channel">
                                        <IconButton
                                            size="small"
                                            color="warning"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLeaveChannel(channel.id);
                                            }}
                                        >
                                            <ExitToApp />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
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
