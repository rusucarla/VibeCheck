import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Button,
    Divider,
    Stack,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { getPendingRequests, approveJoinRequest, rejectJoinRequest } from '../../services/channelService';

function RequestsInboxPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const result = await getPendingRequests();
            setRequests(result.data || []);
            setLoading(false);
        } catch (err) {
            setError("Failed to load join requests");
            setLoading(false);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (requestId) => {
        try {
            await approveJoinRequest(requestId);
            setSuccess("Request approved successfully");
            // Refresh the list
            fetchRequests();
        } catch (err) {
            setError("Failed to approve request");
            console.error(err);
        }
    };

    const handleReject = async (requestId) => {
        try {
            await rejectJoinRequest(requestId);
            setSuccess("Request rejected successfully");
            // Refresh the list
            fetchRequests();
        } catch (err) {
            setError("Failed to reject request");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
            <Typography variant="h4" gutterBottom>
                Join Requests Inbox
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {requests.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                        No pending join requests
                    </Typography>
                </Paper>
            ) : (
                <Paper>
                    <List>
                        {requests.map((request, index) => (
                            <React.Fragment key={request.requestId}>
                                {index > 0 && <Divider />}
                                <ListItem
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        py: 2
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1">
                                                {request.userName} wants to join {request.channelName}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="textSecondary">
                                                Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                                            </Typography>
                                        }
                                        sx={{ flex: 1 }}
                                    />
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ mt: { xs: 2, sm: 0 } }}
                                    >
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            startIcon={<Check />}
                                            onClick={() => handleApprove(request.requestId)}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<Close />}
                                            onClick={() => handleReject(request.requestId)}
                                        >
                                            Reject
                                        </Button>
                                    </Stack>
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
}

export default RequestsInboxPage;