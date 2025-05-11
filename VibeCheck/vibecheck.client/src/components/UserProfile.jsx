import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Avatar,
    Box,
    Button,
    Stack,
    Divider,
    Grid,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import DeleteIcon from "@mui/icons-material/Delete";
import { getUserInfo } from "../services/authServices";
import { useThemeContext } from "../context/ThemeContext";
import { updateUserProfile } from "../services/authServices";
import { useNavigate } from "react-router-dom";
// import { ChangePasswordDialog } from '../DashboardComponents/ChangePasswordDialog';
import { changePassword } from '../services/authServices';
// import ChangePasswordDialog from './ChangePasswordDialog';
//
// export const changePassword = async (currentPassword, newPassword) => {
//     try {
//         const response = await fetch(`${API_URL_GENERAL}/User/change-password`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             credentials: 'include',
//             body: JSON.stringify({
//                 currentPassword,
//                 newPassword
//             })
//         });
//
//         const text = await response.text();
//         console.log('Change password response:', text);
//
//         if (!response.ok) {
//             throw new Error(`Failed to change password: ${response.status} - ${text}`);
//         }
//
//         return text ? JSON.parse(text) : { success: true };
//     } catch (error) {
//         console.error('Change password error:', error);
//         throw error;
//     }
// };

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { darkMode } = useThemeContext();
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        phoneNumber: "",
        avatar: null,
    });
    const [topSpotify, setTopSpotify] = useState([]);
    const [topTmdb, setTopTmdb] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userData = await getUserInfo();
                setUser(userData);
                setFormData({
                    userName: userData.userName || "",
                    email: userData.email || "",
                    phoneNumber: userData.phoneNumber || ""
                });
            } catch (error) {
                console.error("Failed to fetch user information:", error);
            }
        };

        const fetchTopLists = async () => {
            setIsLoading(true);
            try {
                // Fetch Top 5 Spotify tracks
                const spotifyResponse = await fetch("https://localhost:7253/api/TopSongs", {
                    method: "GET",
                    credentials: "include"
                });

                if (spotifyResponse.ok) {
                    const spotifyData = await spotifyResponse.json();
                    setTopSpotify(spotifyData || []);
                }

                // Fetch Top 5 TMDB media
                const tmdbResponse = await fetch("https://localhost:7253/api/TopTmdb", {
                    method: "GET",
                    credentials: "include"
                });

                if (tmdbResponse.ok) {
                    const tmdbData = await tmdbResponse.json();
                    setTopTmdb(tmdbData || []);
                }
            } catch (error) {
                console.error("Failed to fetch top lists:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserInfo();
        fetchTopLists();
    }, []);

    if (!user) {
        return (
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%"
            }}>
                <CircularProgress />
            </Box>
        );
    }
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    // Function to render each Spotify track item
    const renderSpotifyItem = (track) => (
        <Box
            key={track.position}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
                p: 1,
                borderRadius: 1,
                bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    minWidth: "30px",
                    fontWeight: "bold",
                    color: "primary.main"
                }}
            >
                #{track.position}
            </Typography>

            <img
                src={track.imageUrl}
                alt={track.name}
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: 4,
                    objectFit: "cover"
                }}
            />

            <Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {track.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {track.artist}
                </Typography>
            </Box>
        </Box>
    );

    // Function to render each TMDB item
    const renderTmdbItem = (media) => (
        <Box
            key={media.position}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
                p: 1,
                borderRadius: 1,
                bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    minWidth: "30px",
                    fontWeight: "bold",
                    color: "primary.main"
                }}
            >
                #{media.position}
            </Typography>

            <img
                src={media.posterUrl || 'https://via.placeholder.com/60x90?text=No+Image'}
                alt={media.title}
                style={{
                    width: 60,
                    height: 90,
                    borderRadius: 4,
                    objectFit: "cover"
                }}
            />

            <Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {media.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {media.mediaType?.toUpperCase()}
                </Typography>
            </Box>
        </Box>
    );

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, avatar: file }));
        }
    };

    const handleSave = async () => {
        try {
            const updatedUser = {
                userName: formData.userName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
            };

            const result = await updateUserProfile(updatedUser);
            setUser(result);
            setEditMode(false);
        } catch (error) {
            console.error("Failed to save profile:", error);
        }
    };

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        try {
            await changePassword(currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsPasswordDialogOpen(false);
            alert('Password changed successfully');
        } catch (error) {
            console.error('Failed to change password:', error);
            alert(error.message);
        }
    };


    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.email
    )}&background=1976d2&color=fff&size=128`;

    const backgroundColor = darkMode ? "#121212" : "#e3f2fd";
    const cardColor = darkMode ? "#1e1e1e" : "#fff";
    // const textColor = darkMode ? "#fff" : "#000";
    const secondaryText = darkMode ? "#b0b0b0" : "textSecondary";

    // return (
    //     <Box
    //         sx={{
    //             display: "flex",
    //             justifyContent: "center",
    //             alignItems: "center",
    //             //minHeight: "100vh",
    //             backgroundColor: backgroundColor,
    //             transition: "all 0.3s ease",
    //             padding: 2,
    //         }}
    //     >
    //         <Card
    //             sx={{
    //                 width: "100%",
    //                 maxWidth: 420,
    //                 padding: 4,
    //                 boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
    //                 borderRadius: "20px",
    //                 backgroundColor: cardColor,
    //                 transition: "all 0.3s ease",
    //             }}
    //         >
    //             <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    //                 {editMode ? (
    //                     <>
    //                         <label htmlFor="avatar-upload">
    //                             <input
    //                                 id="avatar-upload"
    //                                 type="file"
    //                                 accept="image/*"
    //                                 style={{ display: "none" }}
    //                                 onChange={handleAvatarChange}
    //                             />
    //                             <Avatar
    //                                 src={
    //                                     formData.avatar
    //                                         ? URL.createObjectURL(formData.avatar)
    //                                         : avatarUrl
    //                                 }
    //                                 alt="Profile Picture"
    //                                 sx={{ width: 100, height: 100, mb: 2, cursor: "pointer" }}
    //                             />
    //                         </label>
    //                         <TextField
    //                             fullWidth
    //                             label="userName"
    //                             name="userName"
    //                             value={formData.userName}
    //                             onChange={handleChange}
    //                             sx={{ mb: 2 }}
    //                         />
    //                         <TextField
    //                             fullWidth
    //                             label="email"
    //                             name="email"
    //                             value={formData.email}
    //                             onChange={handleChange}
    //                             sx={{ mb: 2 }}
    //                         />
    //                         <TextField
    //                             fullWidth
    //                             label="Phone Number"
    //                             name="phoneNumber"
    //                             value={formData.phoneNumber}
    //                             onChange={handleChange}
    //                         />
    //                     </>
    //                 ) : (
    //                     <>
    //                         <Avatar
    //                             src={user.avatarUrl || avatarUrl}
    //                             alt={user.name}
    //                             sx={{ width: 100, height: 100, marginBottom: 2 }}
    //                         />
    //                         <Typography variant="h5" sx={{ color: "#1976d2", fontWeight: 600 }}>
    //                             <strong>Name: </strong>{user.userName}
    //                         </Typography>
    //                         <Typography variant="body2" color={secondaryText} gutterBottom>
    //                             <strong>Email: </strong>{user.email}
    //                         </Typography>
    //                         <Typography variant="body2" color={secondaryText}>
    //                             <strong>Phone: </strong> {user.phoneNumber || "N/A"}
    //                         </Typography>
    //                     </>
    //                 )}
    //
    //             </Box>
    //
    //             <Divider sx={{ marginY: 3 }} />
    //
    //             <Stack spacing={1.5}>
    //                 {editMode ? (
    //                     <>
    //                         <Button variant="contained" onClick={handleSave} fullWidth>
    //                             Save Changes
    //                         </Button>
    //                         <Button
    //                             variant="outlined"
    //                             onClick={() => setEditMode(false)}
    //                             fullWidth
    //                         >
    //                             Cancel
    //                         </Button>
    //                     </>
    //                 ) : (
    //                     <>
    //                         <Button
    //                             variant="contained"
    //                             color="primary"
    //                             startIcon={<EditIcon />}
    //                             onClick={() => setEditMode(true)}
    //                             fullWidth
    //                         >
    //                             Edit Profile
    //                         </Button>
    //                         <Button
    //                             variant="outlined"
    //                             color="secondary"
    //                             startIcon={<LockResetIcon />}
    //                             onClick={() => alert("Change Password clicked")}
    //                             fullWidth
    //                         >
    //                             Change Password
    //                         </Button>
    //                         <Button
    //                             variant="text"
    //                             color="error"
    //                             startIcon={<DeleteIcon />}
    //                             onClick={() => alert("Delete Account clicked")}
    //                             fullWidth
    //                             sx={{
    //                                 "&:hover": {
    //                                     backgroundColor: darkMode ? "#2c2c2c" : "#ffebee",
    //                                 },
    //                             }}
    //                         >
    //                             Delete Account
    //                         </Button>
    //                     </>
    //                 )}
    //             </Stack>
    //
    //         </Card>
    //     </Box>
    // );
    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>My Profile</Typography>

            <Grid container spacing={4}>
                {/* Left column - User profile info */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Stack direction="column" spacing={3} alignItems="center">
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        bgcolor: darkMode ? "primary.dark" : "primary.main",
                                        fontSize: 48
                                    }}
                                >
                                    {user.userName?.charAt(0).toUpperCase()}
                                </Avatar>

                                {editMode ? (
                                    <Box component="form" sx={{ width: "100%" }}>
                                        <TextField
                                            margin="normal"
                                            fullWidth
                                            label="Username"
                                            name="userName"
                                            value={formData.userName}
                                            onChange={handleChange}
                                        />
                                        <TextField
                                            margin="normal"
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                        <TextField
                                            margin="normal"
                                            fullWidth
                                            label="Phone Number"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                        />
                                    </Box>
                                ) : (
                                    <Stack sx={{ width: "100%", gap: 1 }}>
                                        <Typography variant="h5" align="center">
                                            {user.userName}
                                        </Typography>
                                        <Typography color="text.secondary" align="center">
                                            {user.email}
                                        </Typography>
                                        <Typography color="text.secondary" align="center">
                                            {user.phoneNumber || "No phone number"}
                                        </Typography>
                                    </Stack>
                                )}

                                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                    {editMode ? (
                                        <>
                                            <Button
                                                variant="contained"
                                                onClick={async () => {
                                                    await updateUserProfile(formData);
                                                    setUser(prevUser => ({
                                                        ...prevUser,
                                                        userName: formData.userName,
                                                        email: formData.email,
                                                        phoneNumber: formData.phoneNumber
                                                    }));
                                                    setEditMode(false);
                                                }}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() => setEditMode(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            startIcon={<EditIcon />}
                                            onClick={() => {
                                                setFormData({
                                                    userName: user.userName || "",
                                                    email: user.email || "",
                                                    phoneNumber: user.phoneNumber || ""
                                                });
                                                setEditMode(true);
                                            }}
                                        >
                                            Edit Profile
                                        </Button>
                                    )}
                                </Stack>

                                <Divider sx={{ width: "100%" }} />

                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<LockResetIcon />}
                                        color="warning"
                                        onClick={() => setIsPasswordDialogOpen(true)}
                                    >
                                        Change Password
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<DeleteIcon />}
                                        color="error"
                                    >
                                        Delete Account
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right column - Top 5 lists */}
                <Grid item xs={12} md={7}>
                    {/* Top 5 Spotify Tracks */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h5" sx={{ mb: 2 }}>
                                My Top 5 Spotify Tracks
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {isLoading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : topSpotify.length > 0 ? (
                                topSpotify.map(track => renderSpotifyItem(track))
                            ) : (
                                <Box sx={{ py: 3, textAlign: "center" }}>
                                    <Typography color="text.secondary">
                                        You haven't added any tracks to your Top 5 yet.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        sx={{ mt: 2 }}
                                        onClick={() => navigate("/dashboard/search/spotify")}
                                    >
                                        Find Tracks
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top 5 TMDB Media */}
                    <Card>
                        <CardContent>
                            <Typography variant="h5" sx={{ mb: 2 }}>
                                My Top 5 Movies & TV Shows
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {isLoading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : topTmdb.length > 0 ? (
                                topTmdb.map(media => renderTmdbItem(media))
                            ) : (
                                <Box sx={{ py: 3, textAlign: "center" }}>
                                    <Typography color="text.secondary">
                                        You haven't added any movies or TV shows to your Top 5 yet.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        sx={{ mt: 2 }}
                                        onClick={() => navigate("/dashboard/search/tmdb")}
                                    >
                                        Find Movies & TV Shows
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Dialog open={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)}>
    <DialogTitle>Change Password</DialogTitle>
    <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
                type="password"
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
            />
            <TextField
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
            />
            <TextField
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
            />
        </Stack>
    </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handlePasswordChange}
                        variant="contained"
                        disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    >
                        Change Password
                    </Button>
                </DialogActions>
</Dialog>
        </Box>
    );
};

export default UserProfile;