// În ChannelMessagesTab.jsx
import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, Stack, Avatar, CircularProgress, IconButton } from '@mui/material';
import { Send as SendIcon, Reply as ReplyIcon, Close as CloseIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import { getChannelMessages, sendMessage } from '../../../services/channelService';
import { getUserById, getCurrentUserInfo } from '../../../services/userService';

function ChannelMessagesTab({ channelId, channel }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [userCache, setUserCache] = useState({}); // Cache pentru info utilizatorilor
    const messagesEndRef = useRef(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [fileUploadError, setFileUploadError] = useState(null);
    const fileInputRef = useRef(null);
    

    // Functie pentru a face scroll în jos cand apar mesaje noi
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Obține informațiile despre un utilizator
    const fetchUserInfo = async (userId) => {
        // Verifica daca info sunt deja în cache
        if (userCache[userId]) {
            return userCache[userId];
        }
        
        try {
            const userInfo = await getUserById(userId);
            if (userInfo) {
                // update cache-ul
                setUserCache(prev => ({
                    ...prev,
                    [userId]: {
                        ...userInfo,
                        avatarUpdatedAt: Date.now()  // <<< AICI ADAUG
                    }
                }));
                return userInfo;
            }
        } catch (error) {
            console.error(`Error fetching user info for userId ${userId}:`, error);
        }
        return null;
    };

    useEffect(() => {
        // Obtin info despre utilizatorul curent
        const getUserInfo = async () => {
            try {
                const userInfo = await getCurrentUserInfo();
                if (userInfo) {
                    setUserId(userInfo.id);
                    // Ad utilizatorul curent in cache
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

                // Preload info despre utilizatori
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

    const handleReply = (message) => {
        setReplyingTo(message);
        // Focus on the text field
        document.getElementById('message-input').focus();
    };

    const previewFile = (file) => {
        if (!file) return;

        setSelectedFile(file);
        setFileUploadError(null);

        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new window.Image();
                img.onload = () => {
                    const width = img.width * 0.25;
                    const height = img.height * 0.25;
                    setFilePreview({ src: reader.result, width, height });
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };


    // Add this function to handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            setFileUploadError("Fișierul depășește limita de 10MB");
            return;
        }
        previewFile(file);
    };

    // Add function to clear file selection
    const clearFileSelection = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setFileUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    

    // Update handleSendMessage to include file upload
    const handleSendMessage = async () => {
        // Don't send if there's nothing to send or if there's an error
        if ((!message.trim() && !selectedFile) || fileUploadError) {
            return;
        }

        setLoading(true);
        try {
            // Process reply content if replying to a message
            const actualContent = message.trim();
            let messageContent = actualContent;

            if (replyingTo) {
                const replyUserName = getDisplayName(replyingTo.userId, replyingTo.userId === userId);
                messageContent = `[↪️ ${replyUserName}: ${replyingTo.content.substring(0, 50)}${replyingTo.content.length > 50 ? '...' : ''}] ${actualContent}`;
            }

            let response;

            // If we have a file, use the FormData API and the with-file endpoint
            if (selectedFile) {
                const formData = new FormData();
                formData.append('content', messageContent || ' '); // Use a space if content is empty
                formData.append('file', selectedFile);

                response = await fetch(`https://localhost:7253/api/channels/${channelId}/messages/with-file`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });
            } else {
                // Regular message without file
                response = await fetch(`https://localhost:7253/api/channels/${channelId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        content: messageContent
                    })
                });
            }

            if (!response.ok) {
                throw new Error(`Failed to send message: ${response.status}`);
            }

            const sentMessage = await response.json();

            // Add the new message to the list
            setMessages(prev => [...prev, sentMessage]);

            // Reset form
            setMessage('');
            setReplyingTo(null);
            clearFileSelection();

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Eroare la trimiterea mesajului: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Add this function to render file preview
    const renderFilePreview = () => {
        if (!selectedFile) return null;

        return (
            <Box sx={{
                mt: 1,
                p: 1,
                border: '1px solid #ddd',
                borderRadius: 1,
                position: 'relative',
                maxWidth: '100%'
            }}>
                <IconButton
                    size="small"
                    onClick={clearFileSelection}
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                {filePreview ? (
                    <Box
                        component="img"
                        src={filePreview}
                        alt="Preview"
                        sx={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            display: 'block',
                            m: 'auto'
                        }}
                    />
                ) : (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </Typography>
                )}

                {fileUploadError && (
                    <Typography variant="caption" color="error">
                        {fileUploadError}
                    </Typography>
                )}
            </Box>
        );
    };

    // get display name pentru un utilizator
    const getDisplayName = (userId, isCurrentUser) => {
        if (isCurrentUser) return "Tu";

        const userInfo = userCache[userId];
        if (userInfo) {
            return userInfo.displayName || userInfo.userName || `Utilizator ${userId.substring(0, 5)}`;
        }

        // get info din cache daca nu le am deja
        fetchUserInfo(userId);
        return `Utilizator ${userId.substring(0, 5)}`;
    };


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)' }}>
            {/* Messages area - update to include reply buttons */}
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
                            const isCurrentUser = msg.userId === userId;
                            const displayName = getDisplayName(msg.userId, isCurrentUser);
                            const avatarLetter = isCurrentUser ? "T" : (displayName?.charAt(0)?.toUpperCase() || "?");

                            // Check if message content has a reply indicator
                            const hasReply = msg.content.startsWith('[↪️');
                            let replyPreview = null;
                            let actualContent = msg.content;

                            if (hasReply) {
                                const replyEndIndex = msg.content.indexOf(']\n');
                                if (replyEndIndex !== -1) {
                                    replyPreview = msg.content.substring(0, replyEndIndex + 1);
                                    actualContent = msg.content.substring(replyEndIndex + 2);

                                    // Format the reply preview to be more readable
                                    replyPreview = replyPreview.replace('[↪️ ', '').replace(']', '');
                                }
                            }

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
                                        <Avatar
                                            sx={{ mr: 1, width: 32, height: 32 }}
                                            src={`https://localhost:7253/api/user/${msg.userId}/profile-picture?ts=${userCache[msg.userId]?.avatarUpdatedAt || 0}`}
                                        >
                                            {avatarLetter}
                                        </Avatar>
                                    )}
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            maxWidth: { xs: '95%', sm: '85%', md: '75%' },
                                            bgcolor: isCurrentUser ? 'primary.light' : 'background.paper',
                                            color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
                                            position: 'relative'
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{
                                            fontWeight: 'bold',
                                            color: isCurrentUser ? 'primary.contrastText' : 'inherit'
                                        }}>
                                            {displayName}
                                        </Typography>

                                        {/* Show reply preview if exists */}
                                        {replyPreview && (
                                            <Box sx={{
                                                bgcolor: 'rgba(0,0,0,0.1)',
                                                p: 1,
                                                borderRadius: 1,
                                                fontSize: '0.85em',
                                                mb: 1,
                                                color: isCurrentUser ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                                borderLeft: '3px solid',
                                                borderColor: isCurrentUser ? 'primary.contrastText' : 'primary.main'
                                            }}>
                                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                                    {replyPreview.split(':')[0]}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {replyPreview.split(':').slice(1).join(':')}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Typography variant="body1">
                                            {actualContent}
                                            {msg.filePath && msg.fileType?.startsWith("image/") && (
                                                <Box
                                                    component="img"
                                                    src={`https://localhost:7253${msg.filePath}`}
                                                    alt="upload"
                                                    // sx={{ maxWidth: '100%', mt: 1, borderRadius: 1 }}
                                                    sx={{
                                                        width: '100%',
                                                        maxWidth: 300,
                                                        maxHeight: 200,
                                                        objectFit: 'cover',
                                                        mt: 1,
                                                        borderRadius: 1,
                                                        display: 'block'
                                                    }}
                                                />
                                            )}

                                            {msg.filePath && msg.fileType?.startsWith("audio/") && (
                                                <audio controls style={{ width: "100%", marginTop: "0.5rem" }}>
                                                    <source src={`https://localhost:7253${msg.filePath}`} type={msg.fileType} />
                                                </audio>
                                            )}
                                            
                                            {msg.filePath && msg.fileType?.startsWith("video/") && (
                                                <video
                                                    controls
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '300px',
                                                        maxHeight: '200px',
                                                        objectFit: 'cover',
                                                        marginTop: '0.5rem',
                                                        borderRadius: '6px',
                                                        display: 'block'
                                                    }}
                                                >
                                                    <source src={`https://localhost:7253${msg.filePath}`} type={msg.fileType} />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}


                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                                            {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>

                                        {/* Reply button */}
                                        <Button
                                            size="small"
                                            onClick={() => handleReply(msg)}
                                            sx={{
                                                minWidth: 'auto',
                                                position: 'absolute',
                                                top: '5px',
                                                right: '5px',
                                                opacity: 0,
                                                transition: 'opacity 0.2s',
                                                color: isCurrentUser ? 'primary.contrastText' : 'primary.main',
                                                p: 0.5,
                                                '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                                            }}
                                            className="reply-button"
                                        >
                                            <ReplyIcon fontSize="small" />
                                        </Button>
                                    </Paper>
                                    {isCurrentUser && (
                                        <Avatar
                                            sx={{ ml: 1, width: 32, height: 32 }}
                                            src={`https://localhost:7253/api/user/${userId}/profile-picture?ts=${userCache[userId]?.avatarUpdatedAt || 0}`}
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

            {/* Reply indicator */}
            {replyingTo && (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    mb: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ReplyIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="caption" color="primary">
                                Răspuns pentru {getDisplayName(replyingTo.userId, replyingTo.userId === userId)}
                            </Typography>
                            <Typography variant="body2" noWrap sx={{ maxWidth: { xs: '200px', sm: '300px', md: '450px' } }}>
                                {replyingTo.content}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={() => setReplyingTo(null)}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}
            
            <Box
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (!file) return;

                    if (file.size > 10 * 1024 * 1024) {
                        setFileUploadError("Fișierul e prea mare");
                        return;
                    }

                    previewFile(file);
                }}
                sx={{
                    border: '2px dashed',
                    borderColor: selectedFile ? 'success.main' : 'divider',
                    borderRadius: 2,
                    p: 1,
                    mb: 1,
                    backgroundColor: 'background.default',
                    transition: '0.2s all',
                    '&:hover': { backgroundColor: 'action.hover' }
                }}
            >
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        id="message-input"
                        fullWidth
                        variant="outlined"
                        placeholder={replyingTo ? "Scrie un răspuns..." : "Scrie un mesaj..."}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        multiline
                        maxRows={3}
                    />
                    <IconButton component="label">
                        <AttachFileIcon />
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*,audio/*,video/*"
                        />
                    </IconButton>
                    <Button
                        variant="contained"
                        color="primary"
                        endIcon={<SendIcon />}
                        onClick={handleSendMessage}
                        disabled={(message.trim() === '' && !selectedFile) || loading}
                    >
                        Trimite
                    </Button>
                </Box>

                {/* Aici vine preview-ul */}
                {selectedFile && (
                    <Box
                        sx={{
                            position: 'relative',
                            display: 'inline-block',
                            mt: 2,
                            '&:hover .remove-button': {
                                opacity: 1
                            }
                        }}
                    >
                        {/* IMAGINE */}
                        {filePreview?.src ? (
                            <img
                                src={filePreview.src}
                                alt="Preview"
                                width={filePreview.width}
                                height={filePreview.height}
                                style={{ borderRadius: 4, display: 'block' }}
                            />
                        ) : (
                            // NON-IMAGINE (audio/video/text/etc)
                            <Box
                                sx={{
                                    p: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    backgroundColor: 'background.paper',
                                    minWidth: '200px',
                                }}
                            >
                                <Typography variant="body2">
                                    Fișier: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                </Typography>
                            </Box>
                        )}

                        {/* BUTON X pe hover */}
                        <IconButton
                            onClick={clearFileSelection}
                            className="remove-button"
                            size="small"
                            sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                zIndex: 2
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}


            </Box>


        </Box>
    );
}

// Add this CSS to make the reply buttons visible on hover
const style = document.createElement('style');
style.innerHTML = `
    .MuiPaper-root:hover .reply-button {
        opacity: 1;
    }
`;
document.head.appendChild(style);

export default ChannelMessagesTab;
