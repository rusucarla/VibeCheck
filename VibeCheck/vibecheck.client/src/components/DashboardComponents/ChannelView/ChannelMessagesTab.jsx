// src/components/DashboardComponents/ChannelView/ChannelMessagesTab.jsx
import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Avatar, Stack } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

function ChannelMessagesTab({ channelId, channel }) {
    const [message, setMessage] = useState('');

    // This is just a placeholder - for a real chat implementation you would
    // connect to websockets or use polling
    const dummyMessages = [
        {
            id: 1,
            sender: 'John Doe',
            text: 'Welcome to the channel!',
            timestamp: '10:30 AM'
        },
        {
            id: 2,
            sender: 'Jane Smith',
            text: 'Thanks! Excited to be here.',
            timestamp: '10:32 AM'
        },
        {
            id: 3,
            sender: 'Current User',
            text: 'Let me know what you think about the latest recommendations.',
            timestamp: '10:35 AM',
            isCurrentUser: true
        }
    ];

    const handleSendMessage = () => {
        if (message.trim()) {
            // Here we would normally send the message to the backend
            console.log(`Sending message to channel ${channelId}: ${message}`);
            setMessage('');
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
            {/* Messages area */}
            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                p: 2,
                bgcolor: theme => theme.palette.mode === 'dark' ? 'background.paper' : '#f5f5f5',
                borderRadius: 1,
                mb: 2
            }}>
                <Stack spacing={2}>
                    {dummyMessages.map(msg => (
                        <Box
                            key={msg.id}
                            sx={{
                                display: 'flex',
                                justifyContent: msg.isCurrentUser ? 'flex-end' : 'flex-start',
                                mb: 1
                            }}
                        >
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 2,
                                    maxWidth: '70%',
                                    bgcolor: msg.isCurrentUser ? 'primary.light' : 'background.paper',
                                    color: msg.isCurrentUser ? 'primary.contrastText' : 'text.primary'
                                }}
                            >
                                {!msg.isCurrentUser && (
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        {msg.sender}
                                    </Typography>
                                )}
                                <Typography variant="body1">
                                    {msg.text}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                                    {msg.timestamp}
                                </Typography>
                            </Paper>
                        </Box>
                    ))}
                </Stack>
            </Box>

            {/* Message input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                >
                    Send
                </Button>
            </Box>
        </Box>
    );
}

export default ChannelMessagesTab;