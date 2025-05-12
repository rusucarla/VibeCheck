// src/components/DashboardComponents/ChannelView/ChannelRecommendationsTab.jsx
import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Button,
    Stack,
    Link
} from '@mui/material';
import { Launch as LaunchIcon } from '@mui/icons-material';
import { useThemeContext } from '../../../context/ThemeContext';

function ChannelRecommendationsTab({ channelId, recommendations }) {
    const [sourceFilter, setSourceFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const { darkMode } = useThemeContext();

    // Get unique media types for filter options
    const mediaTypes = [...new Set(recommendations
        .filter(rec => rec.subtitle)
        .map(rec => rec.subtitle.toUpperCase()))];

    // Get unique sources for filter options
    const sources = [...new Set(recommendations.map(rec => rec.source))];

    // Filter recommendations based on selected filters
    const filteredRecommendations = recommendations.filter(rec => {
        const matchesSource = sourceFilter === 'all' || rec.source === sourceFilter;
        const matchesType = typeFilter === 'all' ||
            (rec.subtitle && rec.subtitle.toUpperCase() === typeFilter);
        return matchesSource && matchesType;
    });

    return (
        <Box>
            {/* Filters */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="source-filter-label">Source</InputLabel>
                    <Select
                        labelId="source-filter-label"
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        label="Source"
                    >
                        <MenuItem value="all">All Sources</MenuItem>
                        {sources.map(source => (
                            <MenuItem key={source} value={source}>
                                {source}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="type-filter-label">Type</InputLabel>
                    <Select
                        labelId="type-filter-label"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        label="Type"
                    >
                        <MenuItem value="all">All Types</MenuItem>
                        {mediaTypes.map(type => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            {/* Results count */}
            <Typography variant="body2" sx={{ mb: 2 }}>
                Showing {filteredRecommendations.length} of {recommendations.length} recommendations
            </Typography>

            {/* Recommendations grid */}
            <Grid container spacing={3}>
                {filteredRecommendations.length > 0 ? (
                    filteredRecommendations.map(rec => (
                        <Grid item xs={12} sm={6} md={4} key={rec.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={rec.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image'}
                                    alt={rec.title}
                                    sx={{ objectFit: 'cover' }}
                                />

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" component="h3" gutterBottom noWrap>
                                        {rec.title}
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {rec.subtitle}
                                        </Typography>

                                        <Chip
                                            label={rec.source}
                                            size="small"
                                            color={rec.source === 'Spotify' ? 'success' : 'primary'}
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        Added: {new Date(rec.createdAt).toLocaleDateString()}
                                    </Typography>
                                </CardContent>

                                <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                                    <Button
                                        size="small"
                                        endIcon={<LaunchIcon />}
                                        component={Link}
                                        href={rec.externalUrl}
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        Open {rec.source === 'Spotify' ? 'in Spotify' : 'on TMDb'}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <Typography variant="h6">
                                No recommendations match your filters
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Try adjusting your filter settings or add recommendations from the search pages.
                            </Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}

export default ChannelRecommendationsTab;