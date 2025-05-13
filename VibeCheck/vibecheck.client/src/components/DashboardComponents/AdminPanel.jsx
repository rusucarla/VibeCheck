import { useState, useEffect } from "react";
import { getAllUsers, promoteUser, demoteUser, getUserInfo } from "../../services/authServices";
import {
    Container, Typography, Grid, Card, CardContent,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, Alert
} from "@mui/material";

function AdminPanel() {
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [users, setUsers] = useState([]);
    const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        getUserInfo()
            .then(data => setCurrentUserId(data.id))
            .catch(err => console.error("Error fetching current user:", err));
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const statsResponse = await fetch("https://localhost:7253/api/admin/overview", {
                credentials: 'include'
            });
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }

            const recentResponse = await fetch("https://localhost:7253/api/admin/recent-users", {
                credentials: 'include'
            });
            if (recentResponse.ok) {
                const recentData = await recentResponse.json();
                setRecentUsers(recentData);
            }

            const regResponse = await fetch("https://localhost:7253/api/admin/registrations-last-7-days", {
                credentials: 'include'
            });
            if (regResponse.ok) {
                const regData = await regResponse.json();
                setRegistrations(regData);
            }

            const usersData = await getAllUsers();
            setUsers(usersData);
        } catch (error) {
            console.error("Error loading data:", error);
            setStatusMessage({
                message: "A apărut o eroare la încărcarea datelor",
                type: 'error'
            });
        }
    };

    const handlePromote = async (userId) => {
        if (userId === currentUserId) {
            setStatusMessage({
                message: 'Nu îți poți modifica propriul rol de administrator',
                type: 'error'
            });
            return;
        }
        try {
            const result = await promoteUser(userId);
            setStatusMessage({ message: result.message, type: 'success' });
            const updatedUsers = await getAllUsers();
            setUsers(updatedUsers);
        } catch (error) {
            setStatusMessage({ 
                message: error.message || 'A apărut o eroare la promovarea utilizatorului', 
                type: 'error' 
            });
        }
    };

    const handleDemote = async (userId) => {
        if (userId === currentUserId) {
            setStatusMessage({
                message: 'Nu îți poți modifica propriul rol de administrator',
                type: 'error'
            });
            return;
        }
        try {
            const result = await demoteUser(userId);
            setStatusMessage({ message: result.message, type: 'success' });
            const updatedUsers = await getAllUsers();
            setUsers(updatedUsers);
        } catch (error) {
            setStatusMessage({ 
                message: error.message || 'A apărut o eroare la retrogradarea utilizatorului', 
                type: 'error' 
            });
        }
    };

    const cardData = [
        { label: "Utilizatori înregistrați", value: stats?.totalUsers ?? "-" },
        { label: "Canale create", value: stats?.totalChannels ?? "-" },
        { label: "Recomandări trimise", value: stats?.totalRecommendations ?? "-" }
    ];

    const buttonBaseStyles = {
        width: 200,
        height: 40,
        textTransform: 'none',
        borderRadius: 2,
        fontSize: '0.875rem',
        fontWeight: 500,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
    };

    const promoteButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: '#4caf50',
        color: 'white',
        '&:hover': {
            backgroundColor: '#45a049',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }
    };

    const demoteButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: '#f44336',
        color: 'white',
        '&:hover': {
            backgroundColor: '#e53935',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }
    };

    const disabledButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: '#f5f5f5',
        color: 'rgba(0, 0, 0, 0.38)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: 'none',
        '&.Mui-disabled': {
            backgroundColor: '#f5f5f5',
            color: 'rgba(0, 0, 0, 0.38)'
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard Administrator
            </Typography>
            <Typography variant="body1" gutterBottom>
                Bine ai venit! Aici poți vedea statistici și gestiona platforma.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 3 }}>
                {cardData.map((stat, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                        <Card sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            py: 4,
                            minHeight: 160,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)'
                            }
                        }}>
                            <CardContent>
                                <Typography variant="h6" align="center">{stat.label}</Typography>
                                <Typography variant="h4" color="primary" align="center">
                                    {stat.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
                Utilizatori recenți
            </Typography>

            <TableContainer component={Paper} sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Creat la</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {recentUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.userName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
                Gestionare Roluri Utilizatori
            </Typography>

            {statusMessage.message && (
                <Alert 
                    severity={statusMessage.type} 
                    sx={{ mb: 2 }}
                    onClose={() => setStatusMessage({ message: '', type: '' })}
                >
                    {statusMessage.message}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Acțiuni</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.userName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    {user.id === currentUserId ? (
                                        <Button
                                            disabled
                                            variant="outlined"
                                            sx={disabledButtonStyles}
                                        >
                                            Nu îți poți modifica rolul
                                        </Button>
                                    ) : user.role === 'Admin' ? (
                                        <Button
                                            variant="contained"
                                            onClick={() => handleDemote(user.id)}
                                            sx={demoteButtonStyles}
                                        >
                                            Retrogradează
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            onClick={() => handlePromote(user.id)}
                                            sx={promoteButtonStyles}
                                        >
                                            Promovează
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}

export default AdminPanel;