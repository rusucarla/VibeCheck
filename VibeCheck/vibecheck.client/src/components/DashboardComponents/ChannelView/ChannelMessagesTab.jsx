// În ChannelMessagesTab.jsx
import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, Stack, Avatar, CircularProgress } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { getChannelMessages, sendMessage } from '../../../services/channelService';
import { getUserById, getCurrentUserInfo } from '../../../services/userService';

function ChannelMessagesTab({ channelId, channel }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [userCache, setUserCache] = useState({}); // Cache pentru informațiile utilizatorilor
    const messagesEndRef = useRef(null);

    // Funcție pentru a face scroll în jos când apar mesaje noi
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Obține informațiile despre un utilizator
    const fetchUserInfo = async (userId) => {
        // Verifică dacă informațiile sunt deja în cache
        if (userCache[userId]) {
            return userCache[userId];
        }
        
        try {
            const userInfo = await getUserById(userId);
            if (userInfo) {
                // Actualizează cache-ul
                setUserCache(prev => ({
                    ...prev,
                    [userId]: userInfo
                }));
                return userInfo;
            }
        } catch (error) {
            console.error(`Error fetching user info for userId ${userId}:`, error);
        }
        return null;
    };

    useEffect(() => {
        // Obține informații despre utilizatorul curent
        const getUserInfo = async () => {
            try {
                const userInfo = await getCurrentUserInfo();
                if (userInfo) {
                    setUserId(userInfo.id);
                    // Adaugă utilizatorul curent în cache
                    setUserCache(prev => ({
                        ...prev,
                        [userInfo.id]: userInfo
                    }));
                }
            } catch (error) {
                console.error('Error getting current user info:', error);
            }
        };

        // Preia mesajele din canal
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const data = await getChannelMessages(channelId);
                console.log("Date primite de la server:", data);
                setMessages(data);

                // Preîncarcă informațiile despre utilizatori
                const uniqueUserIds = [...new Set(data.map(msg => msg.userId))];
                for (const uid of uniqueUserIds) {
                    if (!userCache[uid]) {
                        await fetchUserInfo(uid);
                    }
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        getUserInfo();
        fetchMessages();
    }, [channelId]);

    // Scroll la mesaje noi
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (message.trim()) {
            try {
                const messageData = {
                    content: message
                };

                const response = await sendMessage(channelId, messageData);
                setMessages(prev => [...prev, response]);
                setMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    // Obține numele de afișare pentru un utilizator
    const getDisplayName = (userId, isCurrentUser) => {
        if (isCurrentUser) return "Tu";

        const userInfo = userCache[userId];
        if (userInfo) {
            return userInfo.displayName || userInfo.userName || `Utilizator ${userId.substring(0, 5)}`;
        }

        // Dacă nu avem informații în cache, începe să le obțină
        fetchUserInfo(userId);
        return `Utilizator ${userId.substring(0, 5)}`;
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
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Încărcare mesaje...</Typography>
                    </Box>
                ) : messages.length === 0 ? (
                    <Typography align="center" sx={{ p: 2 }}>Nu există mesaje în acest canal încă.</Typography>
                ) : (
                    <Stack spacing={2}>
                        {messages.map(msg => {
                            // Verifică dacă mesajul e de la utilizatorul curent
                            const isCurrentUser = msg.userId === userId;

                            // Obține numele de afișat din cache sau din răspunsul API-ului
                            const displayName = getDisplayName(msg.userId, isCurrentUser);

                            // Obține prima literă pentru avatar
                            const avatarLetter = isCurrentUser ? "T" :
                                (displayName?.charAt(0)?.toUpperCase() || "?");

                            return (
                                <Box
                                    key={msg.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                                        mb: 1
                                    }}
                                >
                                    {!isCurrentUser && (
                                        /*<Avatar
                                            sx={{ mr: 1, width: 32, height: 32, bgcolor: 'primary.main' }}
                                        >
                                            {avatarLetter}
                                        </Avatar>*/
                                        /*<Avatar
                                            src={msg.profilePictureUrl ? `https://localhost:7253${msg.profilePictureUrl}` : undefined}
                                            sx={{ mr: 1, width: 32, height: 32, bgcolor: 'primary.main' }}
                                        >
                                            {!msg.profilePictureUrl && avatarLetter}
                                        </Avatar>
                                        */
                                        <Avatar
                                            sx={{ mr: 1, width: 32, height: 32 }}
                                            src={`https://localhost:7253/api/user/${msg.userId}/profile-picture`}
                                        >
                                            {avatarLetter}
                                        </Avatar>

                                    )}
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            maxWidth: '70%',
                                            bgcolor: isCurrentUser ? 'primary.light' : 'background.paper',
                                            color: isCurrentUser ? 'primary.contrastText' : 'text.primary'
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{
                                            fontWeight: 'bold',
                                            color: isCurrentUser ? 'primary.contrastText' : 'inherit'
                                        }}>
                                            {displayName}
                                        </Typography>
                                        <Typography variant="body1">
                                            {msg.content}
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                                            {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </Paper>
                                    {isCurrentUser && (
                                       /* <Avatar
                                            sx={{ ml: 1, width: 32, height: 32, bgcolor: 'primary.dark' }}
                                        >
                                            {avatarLetter}
                                        </Avatar>*/
                                       /* <Avatar
                                            src={msg.profilePictureUrl ? `https://localhost:7253${msg.profilePictureUrl}` : undefined}
                                            sx={{ ml: 1, width: 32, height: 32, bgcolor: 'primary.dark' }}
                                        >
                                            {!msg.profilePictureUrl && avatarLetter}
                                        </Avatar>*/
                                        <Avatar
                                            sx={{ ml: 1, width: 32, height: 32 }}
                                            src={`https://localhost:7253/api/user/${msg.userId}/profile-picture`}
                                        >
                                            {avatarLetter}
                                        </Avatar>


                                    )}
                                </Box>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </Stack>
                )}
            </Box>

            {/* Message input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Scrie un mesaj..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    multiline
                    maxRows={3}
                />
                <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!message.trim() || loading}
                >
                    Trimite
                </Button>
            </Box>
        </Box>
    );
}

export default ChannelMessagesTab;
