// src/components/DashboardComponents/SearchSpotifyTab.jsx
import { useState, useEffect } from "react";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import { Input, Button, List, Card, CardContent, CardActions, Box, Select, Option, Typography, CircularProgress } from "@mui/joy";
import { searchSpotifyTracks } from "../../services/spotifyService";
import { getUserChannels } from "../../services/channelService";
import { useThemeContext } from "../../context/ThemeContext";
import { useTheme as useMuiTheme } from "@mui/material";

function SearchSpotifyTab() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState("");
    const [userChannels, setUserChannels] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [positionForTop5, setPositionForTop5] = useState(1);
    // const { darkMode } = useThemeContext();
    const { darkMode, currentTheme } = useThemeContext();
    const muiTheme = useMuiTheme();

    // Create Joy UI theme that corresponds to the current theme
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
                const response = await getUserChannels(); // Use the new function
                if (response && response.data) {
                    setUserChannels(response.data);
                    console.log("Fetched user channels:", response.data);
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
            const data = await searchSpotifyTracks(query);
            setResults(data || []);
            setSelectedTrack(null);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTrackSelect = (track) => {
        setSelectedTrack(track.id === selectedTrack?.id ? null : track);
    };

    const handleAddToTop5 = async (track) => {
        try {
            const response = await fetch("https://localhost:7253/api/TopSongs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    spotifyTrackId: track.id,
                    position: positionForTop5
                })
            });

            if (response.ok) {
                alert(`Added "${track.name}" to position #${positionForTop5} in your Top 5!`);
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (err) {
            console.error("Failed to add to Top 5:", err);
            alert(`Failed to add track: ${err.message}`);
        }
    };

    const handleSendRecommendation = async (track) => {
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
                    externalId: track.id,
                    source: "Spotify"
                })
            });

            if (response.ok) {
                alert(`Recommendation for "${track.name}" sent to channel!`);
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
                    Search Spotify
                </Typography>

                {/*<Input*/}
                {/*    placeholder="Search for a track..."*/}
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
                    placeholder="Search for a track..."
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
                    {results.map((track) => (
                        <Card
                            key={track.id}
                            variant="outlined"
                            sx={{
                                cursor: 'pointer',
                                '&:hover': { borderColor: 'primary.500' },
                                borderColor: selectedTrack?.id === track.id ? 'primary.500' : undefined,
                                borderWidth: selectedTrack?.id === track.id ? 2 : 1
                            }}
                            onClick={() => handleTrackSelect(track)}
                        >
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: 'stretch'
                            }}>
                                {/* Left side - Track info */}
                                <CardContent sx={{
                                    flex: '1 1 50%',
                                    display: 'flex',
                                    gap: 2,
                                    borderRight: { xs: 'none', sm: selectedTrack?.id === track.id ? '1px solid' : 'none' },
                                    borderBottom: { xs: selectedTrack?.id === track.id ? '1px solid' : 'none', sm: 'none' },
                                    borderColor: 'divider'
                                }}>
                                    <img
                                        src={track.imageUrl}
                                        alt={track.name}
                                        width={64}
                                        height={64}
                                        style={{ borderRadius: '4px' }}
                                    />
                                    <Box>
                                        <Typography level="title-md">{track.name}</Typography>
                                        <Typography level="body-sm">{track.artist}</Typography>
                                    </Box>
                                </CardContent>

                                {/* Right side - Actions */}
                                {selectedTrack?.id === track.id && (
                                    <Box
                                        sx={{
                                            flex: '1 1 50%',
                                            p: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2
                                        }}
                                        onClick={(e) => e.stopPropagation()} // Stop click propagation here
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
                                                    handleAddToTop5(track);
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
                                                    handleSendRecommendation(track);
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

export default SearchSpotifyTab;

// // src/components/DashboardComponents/SearchSpotifyTab.jsx
// import { useState } from "react";
// // Import Joy UI theme provider
// import { CssVarsProvider } from "@mui/joy/styles";
// import { Input, Button, List, ListItem, Typography } from "@mui/joy";
// import { searchSpotifyTracks } from "../../services/spotifyService";
// import { useThemeContext } from "../../context/ThemeContext";
//
// function SearchSpotifyTab() {
//     const [query, setQuery] = useState("");
//     const [results, setResults] = useState([]);
//     const { darkMode } = useThemeContext();
//
//     const handleSearch = async () => {
//         if (!query.trim()) return;
//         try {
//             const data = await searchSpotifyTracks(query);
//             setResults(data || []);
//         } catch (err) {
//             console.error("Search failed:", err);
//         }
//     };
//
//     return (
//         // Wrap Joy UI components with CssVarsProvider
//         <CssVarsProvider defaultMode={darkMode ? "dark" : "light"}>
//             <div>
//                 <Typography level="h4" sx={{ mb: 2 }}>Search Spotify</Typography>
//                 <Input
//                     placeholder="Search for a track..."
//                     value={query}
//                     onChange={(e) => setQuery(e.target.value)}
//                     endDecorator={
//                         <Button onClick={handleSearch} variant="solid">Search</Button>
//                     }
//                     sx={{ mb: 3 }}
//                 />
//
//                 <List>
//                     {results.map((track) => (
//                         <ListItem key={track.id}>
//                             <img src={track.imageUrl} alt={track.name} width={48} height={48} style={{ marginRight: 10 }} />
//                             <div>
//                                 <Typography>{track.name}</Typography>
//                                 <Typography level="body2" color="neutral">{track.artist}</Typography>
//                             </div>
//                         </ListItem>
//                     ))}
//                 </List>
//             </div>
//         </CssVarsProvider>
//     );
// }
//
// export default SearchSpotifyTab;
