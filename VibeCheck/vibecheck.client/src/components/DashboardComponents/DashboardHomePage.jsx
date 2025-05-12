// src/components/DashboardComponents/DashboardHomePage.jsx
import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Grid,
    Typography,
    Button,
    CircularProgress,
    Divider,
    Paper,
    Stack
} from '@mui/material';
import {
    TrendingUp,
    People,
    MusicNote,
    MovieCreation,
    Notifications,
    AssignmentTurnedIn,
    Dashboard as DashboardIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getUserChannels } from '../../services/channelService';
import { getUserRole } from '../../services/authServices';
import { useThemeContext } from '../../context/ThemeContext';

function DashboardHomePage() {
    const [loading, setLoading] = useState(true);
    const [userChannels, setUserChannels] = useState([]);
    const [userRoles, setUserRoles] = useState([]);
    const navigate = useNavigate();
    const { darkMode } = useThemeContext();

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Load user channels
                const channelsResponse = await getUserChannels();
                setUserChannels(channelsResponse?.data || []);

                // Get user role
                const roles = await getUserRole();
                setUserRoles(roles?.roles || []);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const isAdmin = userRoles.includes('Admin');

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 2 }}>
            <Paper
                elevation={0}
                sx={{
                    mb: 4,
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 2,
                    bgcolor: darkMode ? '#1E1E2F' : '#f9f9f9',
                    backgroundImage: `linear-gradient(${darkMode ? 'rgba(25,25,40,0.97)' : 'rgba(255,255,255,0.9)'}, ${darkMode ? 'rgba(25,25,40,0.97)' : 'rgba(255,255,255,0.9)'}), url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1920')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(0,0,0,0.1)'
                }}
            >
                <Typography variant="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    Bun venit la VibeCheck!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    Platforma ta pentru a descoperi și discuta despre conținut media
                </Typography>
                <Divider sx={{ mb: 4 }} />
            </Paper>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card raised sx={{
                        height: '100%',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <CardContent sx={{ p: 3, flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <MusicNote sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
                                <Typography variant="h5">Descoperă Muzică</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                Caută melodii noi și împărtășește-le cu prietenii în canalele tale preferate.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate('/dashboard/search/spotify')}
                            >
                                Explorează Spotify
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card raised sx={{
                        height: '100%',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <CardContent sx={{ p: 3, flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <MovieCreation sx={{ fontSize: 32, mr: 1, color: 'secondary.main' }} />
                                <Typography variant="h5">Filme și Seriale</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                Descoperă filme și seriale noi și discută despre ele cu comunitatea.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => navigate('/dashboard/search/tmdb')}
                            >
                                Explorează TMDB
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card raised sx={{
                        height: '100%',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <CardContent sx={{ p: 3, flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TrendingUp sx={{ fontSize: 32, mr: 1, color: 'info.main' }} />
                                <Typography variant="h5">Canalele Tale</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                Gestionează canalele tale și vezi recomandările primite de la prieteni.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                color="info"
                                onClick={() => navigate('/dashboard/channels')}
                            >
                                Vezi Canalele
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
            }}>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    Acțiuni rapide
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/dashboard/channels/new')}
                >
                    Canal nou
                </Button>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} lg={3}>
                    <Card
                        sx={{
                            cursor: 'pointer',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            borderRadius: 2,
                            bgcolor: darkMode ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.04)'
                        }}
                        onClick={() => navigate('/dashboard/channels')}
                    >
                        <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                            <DashboardIcon color="primary" sx={{ mr: 1.5 }} />
                            <Typography variant="subtitle1">Canalele mele</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <Card
                        sx={{
                            cursor: 'pointer',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            borderRadius: 2,
                            bgcolor: darkMode ? 'rgba(156, 39, 176, 0.08)' : 'rgba(156, 39, 176, 0.04)'
                        }}
                        onClick={() => navigate('/dashboard/requests/inbox')}
                    >
                        <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                            <Notifications color="secondary" sx={{ mr: 1.5 }} />
                            <Typography variant="subtitle1">Cereri de înscriere</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <Card
                        sx={{
                            cursor: 'pointer',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            borderRadius: 2,
                            bgcolor: darkMode ? 'rgba(2, 136, 209, 0.08)' : 'rgba(2, 136, 209, 0.04)'
                        }}
                        onClick={() => navigate('/dashboard/profile')}
                    >
                        <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                            <People color="info" sx={{ mr: 1.5 }} />
                            <Typography variant="subtitle1">Editează profilul</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {isAdmin && (
                    <Grid item xs={12} sm={6} lg={3}>
                        <Card
                            sx={{
                                cursor: 'pointer',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                borderRadius: 2,
                                bgcolor: darkMode ? 'rgba(245, 124, 0, 0.08)' : 'rgba(245, 124, 0, 0.04)'
                            }}
                            onClick={() => navigate('/dashboard/admin')}
                        >
                            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                                <AssignmentTurnedIn color="warning" sx={{ mr: 1.5 }} />
                                <Typography variant="subtitle1">Panou Admin</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {userChannels.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                        Canalele tale recente
                    </Typography>
                    <Stack spacing={1}>
                        {userChannels.slice(0, 3).map(channel => (
                            <Paper
                                key={channel.id}
                                sx={{
                                    p: 2,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                                    }
                                }}
                                onClick={() => navigate(`/dashboard/channel/${channel.id}`)}
                            >
                                <Typography variant="subtitle1">{channel.name}</Typography>
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            )}
        </Box>
    );
}

export default DashboardHomePage;