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

} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import DeleteIcon from "@mui/icons-material/Delete";
import { getUserInfo } from "../services/authServices";
import { useThemeContext } from "../context/ThemeContext";
import TextField from "@mui/material/TextField";

import { updateUserProfile } from "../services/authServices";






const UserProfile = () => {
    const [user, setUser] = useState(null);
    const { darkMode } = useThemeContext();

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        phoneNumber: "",
        avatar: null,
    });
    //const muiTheme = useTheme();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfo = await getUserInfo();
                setUser(userInfo);
                setFormData({
                    userName: userInfo.userName || "",
                    email: userInfo.email || "",
                    phoneNumber: userInfo.phoneNumber || "",
                    avatar: null,
                });
            } catch (error) {
                console.error("Failed to fetch user info:", error);
            }
        };

        fetchUserInfo();
    }, []);

    if (!user)
        return <Typography variant="h6" align="center">Loading profile...</Typography>;



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, avatar: file }));
        }
    };

    //const handleSave = async () => {
    //    try {
    //        const updatedUser = {
    //            ...user,
    //            name: formData.name,
    //            email: formData.email,
    //            phoneNumber: formData.phoneNumber,
    //        };

    //        if (formData.avatar) {
    //            const reader = new FileReader();
    //            reader.onloadend = () => {
    //                updatedUser.avatarUrl = reader.result;
    //                setUser(updatedUser);
    //                setEditMode(false);
    //            };
    //            reader.readAsDataURL(formData.avatar);
    //        } else {
    //            setUser(updatedUser);
    //            setEditMode(false);
    //        }

    //    } catch (err) {
    //        console.error("Update failed", err);
    //    }
    //};

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


    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.email
    )}&background=1976d2&color=fff&size=128`;

    const backgroundColor = darkMode ? "#121212" : "#e3f2fd";
    const cardColor = darkMode ? "#1e1e1e" : "#fff";
    // const textColor = darkMode ? "#fff" : "#000";
    const secondaryText = darkMode ? "#b0b0b0" : "textSecondary";

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                //minHeight: "100vh",
                backgroundColor: backgroundColor,
                transition: "all 0.3s ease",
                padding: 2,
            }}
        >
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    padding: 4,
                    boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                    borderRadius: "20px",
                    backgroundColor: cardColor,
                    transition: "all 0.3s ease",
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {editMode ? (
                        <>
                            <label htmlFor="avatar-upload">
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleAvatarChange}
                                />
                                <Avatar
                                    src={
                                        formData.avatar
                                            ? URL.createObjectURL(formData.avatar)
                                            : avatarUrl
                                    }
                                    alt="Profile Picture"
                                    sx={{ width: 100, height: 100, mb: 2, cursor: "pointer" }}
                                />
                            </label>
                            <TextField
                                fullWidth
                                label="userName"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </>
                    ) : (
                        <>
                            <Avatar
                                src={user.avatarUrl || avatarUrl}
                                alt={user.name}
                                sx={{ width: 100, height: 100, marginBottom: 2 }}
                            />
                            <Typography variant="h5" sx={{ color: "#1976d2", fontWeight: 600 }}>
                                <strong>Name: </strong>{user.userName}
                            </Typography>
                            <Typography variant="body2" color={secondaryText} gutterBottom>
                                <strong>Email: </strong>{user.email}
                            </Typography>
                            <Typography variant="body2" color={secondaryText}>
                                <strong>Phone: </strong> {user.phoneNumber || "N/A"}
                            </Typography>
                        </>
                    )}

                </Box>

                <Divider sx={{ marginY: 3 }} />

                <Stack spacing={1.5}>
                    {editMode ? (
                        <>
                            <Button variant="contained" onClick={handleSave} fullWidth>
                                Save Changes
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setEditMode(false)}
                                fullWidth
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<EditIcon />}
                                onClick={() => setEditMode(true)}
                                fullWidth
                            >
                                Edit Profile
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<LockResetIcon />}
                                onClick={() => alert("Change Password clicked")}
                                fullWidth
                            >
                                Change Password
                            </Button>
                            <Button
                                variant="text"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => alert("Delete Account clicked")}
                                fullWidth
                                sx={{
                                    "&:hover": {
                                        backgroundColor: darkMode ? "#2c2c2c" : "#ffebee",
                                    },
                                }}
                            >
                                Delete Account
                            </Button>
                        </>
                    )}
                </Stack>

            </Card>
        </Box>
    );
};

export default UserProfile;
