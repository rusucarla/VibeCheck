// src/components/DashboardComponents/ChannelView/ChannelUsersTab.jsx
import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    PersonAdd,
    ArrowUpward,
    ArrowDownward,
    Delete
} from '@mui/icons-material';
import { getChannelUsers, promoteChannelUser, demoteChannelUser, removeChannelUser } from '@/services/channelService';

function ChannelUsersTab({ channelId }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openPromoteDialog, setOpenPromoteDialog] = useState(false);
    const [openDemoteDialog, setOpenDemoteDialog] = useState(false);
    const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });

    useEffect(() => {
        fetchChannelUsers();
    }, [channelId]);

    const fetchChannelUsers = async () => {
        try {
            setLoading(true);
            const data = await getChannelUsers(channelId);
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching channel users:", error);
            setError("Failed to load channel users");
            setLoading(false);
        }
    };

    const handlePromote = (user) => {
        setSelectedUser(user);
        setOpenPromoteDialog(true);
    };

    const handleDemote = (user) => {
        setSelectedUser(user);
        setOpenDemoteDialog(true);
    };

    const handleRemove = (user) => {
        setSelectedUser(user);
        setOpenRemoveDialog(true);
    };

    const confirmPromote = async () => {
        try {
            await promoteChannelUser(channelId, selectedUser.id);
            setStatusMessage({ message: 'User promoted successfully', type: 'success' });
            fetchChannelUsers(); // Refresh the user list
            setOpenPromoteDialog(false);
        } catch (error) {
            setStatusMessage({ message: `Failed to promote user: ${error.message}`, type: 'error' });
        }
    };

    const confirmDemote = async () => {
        try {
            await demoteChannelUser(channelId, selectedUser.id);
            setStatusMessage({ message: 'User demoted successfully', type: 'success' });
            fetchChannelUsers(); // Refresh the user list
            setOpenDemoteDialog(false);
        } catch (error) {
            setStatusMessage({ message: `Failed to demote user: ${error.message}`, type: 'error' });
        }
    };

    const confirmRemove = async () => {
        try {
            await removeChannelUser(channelId, selectedUser.id);
            setStatusMessage({ message: 'User removed from channel successfully', type: 'success' });
            fetchChannelUsers(); // Refresh the user list
            setOpenRemoveDialog(false);
        } catch (error) {
            setStatusMessage({ message: `Failed to remove user: ${error.message}`, type: 'error' });
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Channel Members
            </Typography>

            {statusMessage.message && (
                <Alert severity={statusMessage.type} sx={{ mb: 2 }}>
                    {statusMessage.message}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.userName}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell align="right">
                                    {user.role === 'Member' && (
                                        <Tooltip title="Promote to Admin">
                                            <IconButton color="primary" onClick={() => handlePromote(user)}>
                                                <ArrowUpward />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {user.role === 'Admin' && (
                                        <Tooltip title="Demote to Member">
                                            <IconButton color="warning" onClick={() => handleDemote(user)}>
                                                <ArrowDownward />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Remove from channel">
                                        <IconButton color="error" onClick={() => handleRemove(user)}>
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Promote Dialog */}
            <Dialog open={openPromoteDialog} onClose={() => setOpenPromoteDialog(false)}>
                <DialogTitle>Promote User</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to promote {selectedUser?.userName} to Admin?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This will give them full administrative rights to this channel.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPromoteDialog(false)}>Cancel</Button>
                    <Button onClick={confirmPromote} color="primary" variant="contained">
                        Promote
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Demote Dialog */}
            <Dialog open={openDemoteDialog} onClose={() => setOpenDemoteDialog(false)}>
                <DialogTitle>Demote User</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to demote {selectedUser?.userName} to Member?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        They will lose administrative rights to this channel.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDemoteDialog(false)}>Cancel</Button>
                    <Button onClick={confirmDemote} color="warning" variant="contained">
                        Demote
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Remove Dialog */}
            <Dialog open={openRemoveDialog} onClose={() => setOpenRemoveDialog(false)}>
                <DialogTitle>Remove User</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to remove {selectedUser?.userName} from this channel?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRemoveDialog(false)}>Cancel</Button>
                    <Button onClick={confirmRemove} color="error" variant="contained">
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ChannelUsersTab;