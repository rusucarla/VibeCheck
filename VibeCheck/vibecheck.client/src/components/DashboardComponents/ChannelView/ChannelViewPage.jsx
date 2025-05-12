// src/components/DashboardComponents/ChannelView/ChannelViewPage.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Paper, CircularProgress, Container, Divider } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getChannelById } from '../../../services/channelService';
import { getChannelRecommendations } from '../../../services/recommendationService';
import ChannelMessagesTab from './ChannelMessagesTab';
import ChannelRecommendationsTab from './ChannelRecommendationsTab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ChannelViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [channel, setChannel] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);

    useEffect(() => {
        const loadChannel = async () => {
            try {
                setLoading(true);
                const channelData = await getChannelById(id);
                setChannel(channelData);

                // Also load recommendations
                const recData = await getChannelRecommendations(id);
                setRecommendations(recData || []);
                setLoading(false);
            } catch (err) {
                console.error("Error loading channel data:", err);
                setError("Failed to load channel data.");
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
                </Tabs>
            </Box>

            <Box sx={{ mt: 2 }}>
                {currentTab === 0 && <ChannelMessagesTab channelId={id} channel={channel} />}
                {currentTab === 1 && <ChannelRecommendationsTab channelId={id} recommendations={recommendations} />}
            </Box>
        </Container>
    );
}

export default ChannelViewPage;