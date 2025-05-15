import { useState, useEffect } from "react";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import { Input, Button, List, Card, CardContent, CardActions, Box, Select, Option, Typography, CircularProgress } from "@mui/joy";
import { useThemeContext } from "../../context/ThemeContext";
import { getUserChannels } from "../../services/channelService";
import { useTheme as useMuiTheme } from "@mui/material";

function SearchTmdbTab() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState("");
    const [userChannels, setUserChannels] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [positionForTop5, setPositionForTop5] = useState(1);
    // const { darkMode } = useThemeContext();
    const { darkMode, currentTheme } = useThemeContext();
    const muiTheme = useMuiTheme();

    // Create Joy UI theme
    const joyTheme = extendTheme({
        cssVarPrefix: 'joy',
        colorSchemes: {
            light: {
                palette: {
                    primary: {
                        main: muiTheme.palette.primary.main
                    },
                },
            },
            dark: {
                palette: {
                    primary: {
                        main: muiTheme.palette.primary.main
                    },
                },
            },
        },
    });

    useEffect(() => {
        const fetchUserChannels = async () => {
            try {
                const response = await getUserChannels();
                if (response && response.data) {
                    setUserChannels(response.data);
                } else {
                    console.error("No user channels data in response:", response);
                }
            } catch (err) {
                console.error("Failed to fetch user channels:", err);
            }
        };

        fetchUserChannels();
    }, []);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`https://localhost:7253/api/Tmdb/search?query=${encodeURIComponent(query)}`, {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setResults(data || []);
            setSelectedMedia(null);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMediaSelect = (media) => {
        setSelectedMedia(media.id === selectedMedia?.id ? null : media);
    };

    const handleAddToTop5 = async (media) => {
        try {
            const response = await fetch("https://localhost:7253/api/TopTmdb", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    tmdbId: media.id,
                    position: positionForTop5
                })
            });

            if (response.ok) {
                alert(`Added "${media.title}" to position #${positionForTop5} in your Top 5!`);
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (err) {
            console.error("Failed to add to Top 5:", err);
            alert(`Failed to add to Top 5: ${err.message}`);
        }
    };

    const handleSendRecommendation = async (media) => {
        if (!selectedChannel) {
            alert("Please select a channel first");
            return;
        }

        try {
            const response = await fetch("https://localhost:7253/api/Recommendations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    channelId: selectedChannel,
                    externalId: media.id.toString(),
                    source: "TMDb"
                })
            });

            if (response.ok) {
                alert(`Recommendation for "${media.title}" sent to channel!`);
                setSelectedChannel("");
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (err) {
            console.error("Failed to send recommendation:", err);
            alert(`Failed to send recommendation: ${err.message}`);
        }
    };

    return (
        <CssVarsProvider theme={joyTheme} defaultMode={darkMode ? "dark" : "light"}>
        <Box sx={{ maxWidth: 800, margin: "0 auto" }}>
                <Typography
                    level="h4"
                    sx={{
                        mb: 2,
                        color: muiTheme.palette.text.primary,
                        fontWeight: 600
                    }}
                >
                    Search Movies or TV Shows
                </Typography>

                {/*<Input*/}
                {/*    placeholder="Search for movies or TV shows..."*/}
                {/*    value={query}*/}
                {/*    onChange={(e) => setQuery(e.target.value)}*/}
                {/*    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}*/}
                {/*    endDecorator={*/}
                {/*        <Button*/}
                {/*            onClick={handleSearch}*/}
                {/*            variant="solid"*/}
                {/*            disabled={isLoading || !query.trim()}*/}
                {/*        >*/}
                {/*            {isLoading ? <CircularProgress size="sm" /> : "Search"}*/}
                {/*        </Button>*/}
                {/*    }*/}
                {/*    sx={{ mb: 3, width: '100%' }}*/}
                {/*/>*/}
                <Input
                    placeholder="Search for movies or TV shows..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    endDecorator={
                        <Button
                            onClick={handleSearch}
                            variant="outlined"
                            disabled={isLoading || !query.trim()}
                        >
                            {isLoading ? <CircularProgress size="sm" /> : "Search"}
                        </Button>
                    }
                    sx={{
                        mb: 3,
                        width: '100%',
                        backgroundColor: 'transparent',
                        border: '1px solid',
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                        borderRadius: '8px',
                        '& input': {
                            color: darkMode ? '#ffffff' : '#333333',
                        },
                        '&:hover': {
                            borderColor: muiTheme.palette.primary.main,
                        },
                        '&:focus-within': {
                            borderColor: muiTheme.palette.primary.main,
                            boxShadow: `0 0 0 2px ${muiTheme.palette.primary.main}25`,
                        }
                    }}
                />

                <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
                    {results.map((media) => (
                        <Card
                            key={media.id}
                            variant="outlined"
                            sx={{
                                cursor: 'pointer',
                                '&:hover': { borderColor: 'primary.500' },
                                borderColor: selectedMedia?.id === media.id ? 'primary.500' : undefined,
                                borderWidth: selectedMedia?.id === media.id ? 2 : 1
                            }}
                            onClick={() => handleMediaSelect(media)}
                        >
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: 'stretch'
                            }}>
                                {/* Left side - Media info */}
                                <CardContent sx={{
                                    flex: '1 1 50%',
                                    display: 'flex',
                                    gap: 2,
                                    borderRight: { xs: 'none', sm: selectedMedia?.id === media.id ? '1px solid' : 'none' },
                                    borderBottom: { xs: selectedMedia?.id === media.id ? '1px solid' : 'none', sm: 'none' },
                                    borderColor: 'divider'
                                }}>
                                    <img
                                        src={media.posterUrl || 'https://via.placeholder.com/92x138?text=No+Image'}
                                        alt={media.title}
                                        width={64}
                                        height={92}
                                        style={{ borderRadius: '4px', objectFit: 'cover' }}
                                    />
                                    <Box>
                                        <Typography level="title-md">{media.title}</Typography>
                                        <Typography level="body-sm">{media.mediaType?.toUpperCase()}</Typography>
                                    </Box>
                                </CardContent>

                                {/* Right side - Actions */}
                                {selectedMedia?.id === media.id && (
                                    <Box
                                        sx={{
                                            flex: '1 1 50%',
                                            p: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Typography level="body-sm">Position:</Typography>
                                            <Select
                                                value={positionForTop5}
                                                onChange={(_, newValue) => {
                                                    if (newValue !== null) {
                                                        setPositionForTop5(newValue);
                                                    }
                                                }}
                                                sx={{ width: 80 }}
                                            >
                                                {[1, 2, 3, 4, 5].map(pos => (
                                                    <Option key={pos} value={pos}>#{pos}</Option>
                                                ))}
                                            </Select>
                                            <Button
                                                variant="solid"
                                                color="success"
                                                onClick={(e) => {
                                                    handleAddToTop5(media);
                                                }}
                                            >
                                                Add to Top 5
                                            </Button>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Typography level="body-sm">Channel:</Typography>
                                            <Select
                                                placeholder="Select channel"
                                                value={selectedChannel}
                                                onChange={(_, value) => setSelectedChannel(value)}
                                                sx={{ flexGrow: 1 }}
                                            >
                                                {userChannels.map((channel) => (
                                                    <Option key={channel.id} value={channel.id}>
                                                        {channel.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                            <Button
                                                variant="solid"
                                                color="primary"
                                                disabled={!selectedChannel}
                                                onClick={(e) => {
                                                    handleSendRecommendation(media);
                                                }}
                                            >
                                                Send
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Card>
                    ))}
                    {results.length === 0 && query && !isLoading && (
                        <Typography level="body-lg" sx={{ textAlign: 'center', my: 4 }}>
                            No results found
                        </Typography>
                    )}
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </List>
            </Box>
        </CssVarsProvider>
    );
}

export default SearchTmdbTab;