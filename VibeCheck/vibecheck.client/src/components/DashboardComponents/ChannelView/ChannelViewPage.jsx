// src/components/DashboardComponents/ChannelView/ChannelViewPage.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Paper, CircularProgress, Container, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getChannelById, checkChannelAdminAccess } from '@/services/channelService.jsx';
import { getChannelRecommendations } from '@/services/recommendationService.jsx';
import ChannelMessagesTab from './ChannelMessagesTab';
import ChannelRecommendationsTab from './ChannelRecommendationsTab';
import ChannelUsersTab from './ChannelUsersTab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ChannelViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [channel, setChannel] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const loadChannel = async () => {
            try {
                setLoading(true);
                // Force fresh data by clearing any cache
                const channelData = await getChannelById(id);
                setChannel(channelData);

                // Check if current user is an admin of this channel
                const adminStatus = await checkChannelAdminAccess(id);
                setIsAdmin(adminStatus.isAdmin);
                console.log("Admin status check:", adminStatus);

                const recommendationsData = await getChannelRecommendations(id);
                setRecommendations(recommendationsData);
                setLoading(false);
            } catch (err) {
                console.error("Error loading channel:", err);
                setError(err.message || "Failed to load channel");
                setLoading(false);
            }
        };

        loadChannel();
    }, [id]);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleBack = () => {
        navigate('/dashboard/channels');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !channel) {
        return (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Typography variant="h6" color="error">
                    {error || "Channel not found"}
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} onClick={handleBack}>
                    Go Back to Channels
                </Button>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}
                        onClick={handleBack}
                    >
                        <ArrowBackIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">Back to Channels</Typography>
                    </Box>
                </Box>

                <Typography variant="h4" component="h1" gutterBottom>
                    {channel.name}
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph>
                    {channel.description}
                </Typography>

                {channel.categories && channel.categories.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {channel.categories.map(cat => (
                            <Paper key={cat.id} sx={{ px: 1.5, py: 0.5 }}>
                                <Typography variant="caption">{cat.title}</Typography>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                    <Tab label="Messages" id="channel-tab-0" />
                    <Tab label="Recommendations" id="channel-tab-1" />
                    {isAdmin && <Tab label="Users" id="channel-tab-2" />}
                </Tabs>
            </Box>

            <Box sx={{ mt: 2 }}>
                {currentTab === 0 && <ChannelMessagesTab channelId={id} channel={channel} />}
                {currentTab === 1 && <ChannelRecommendationsTab channelId={id} recommendations={recommendations} />}
                {currentTab === 2 && isAdmin && <ChannelUsersTab channelId={id} />}
            </Box>
        </Container>
    );
}

export default ChannelViewPage;