import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Pagination,
    Grid,
    Stack,
    TextField,
    Chip
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAllChannels, deleteChannel } from "../../services/channelService";

function ChannelsPage() {
    const [channels, setChannels] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const pageSize = 9;
    const navigate = useNavigate();

    const loadChannels = async (currentPage, searchTerm = "") => {
        const result = await getAllChannels(currentPage, pageSize, searchTerm);
        if (result) {
            setChannels(result.data || []);
            setTotalPages(result.totalPages || 1);
        }
    };

    useEffect(() => {
        loadChannels(page, search);
    }, [page]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this channel?")) {
            try {
                await deleteChannel(id);
                loadChannels(page, search);
            } catch (error) {
                console.error("Delete error:", error.message);
            }
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        loadChannels(1, search);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Canale disponibile
            </Typography>

            <Stack direction="row" spacing={2} mb={3} alignItems="center">
                <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/dashboard/channels/new")}>
                    Add canal
                </Button>
                <form onSubmit={handleSearchSubmit}>
                    <TextField
                        label="Cauta canale"
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
            </Stack>

            <Grid container spacing={2}>
                {channels.map((channel) => (
                    <Grid item xs={12} sm={6} md={4} key={channel.id}>
                        <Box
                            sx={{
                                p: 2,
                                border: "1px solid",
                                borderRadius: "8px",
                                textAlign: "center",
                                backgroundColor: "background.paper",
                                position: "relative",
                            }}
                        >
                            <Typography variant="h6">{channel.name}</Typography>
                            <Typography variant="body2" gutterBottom>
                                {channel.description}
                            </Typography>

                            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" mt={1}>
                                {channel.categories?.map((cat) => (
                                    <Chip key={cat.id} label={cat.title} size="small" />
                                ))}
                            </Stack>

                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 5,
                                    right: 5,
                                    display: "flex",
                                    gap: 1,
                                }}
                            >
                                <IconButton onClick={() => navigate(`/dashboard/channels/edit/${channel.id}`)} size="small">
                                    <Edit fontSize="small" />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(channel.id)} size="small">
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <Stack spacing={2} alignItems="center" mt={4}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                />
            </Stack>
        </Box>
    );
}

export default ChannelsPage;
