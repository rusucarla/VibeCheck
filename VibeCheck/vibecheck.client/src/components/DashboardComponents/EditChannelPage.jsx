import { useEffect, useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Box,
    MenuItem,
    FormHelperText,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Checkbox,
    ListItemText,
    Chip,
    CircularProgress,
    Alert
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { getChannelById, updateChannel, checkChannelAdminAccess } from "../../services/channelService";
import { fetchAllCategories } from "../../services/categoryService";

function EditChannelPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        categoryIds: []
    });

    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Check if user has admin access to this channel
                const adminAccess = await checkChannelAdminAccess(Number(id));
                setHasAccess(adminAccess);

                if (!adminAccess) {
                    setError("You don't have permission to edit this channel");
                    setIsLoading(false);
                    return;
                }

                const channel = await getChannelById(id);
                const cats = await fetchAllCategories();

                setFormData({
                    name: channel.name,
                    description: channel.description,
                    categoryIds: channel.categories.map((c) => c.id)
                });

                setCategories(cats || []);
            } catch (err) {
                setError("Failed to load channel data");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value.map((v) => Number(v));
        if (value.length <= 5) {
            setFormData((prev) => ({ ...prev, categoryIds: value }));
            setError("");
        } else {
            setError("You can select up to 5 categories.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.categoryIds.length < 1) {
            setError("Select at least one category.");
            return;
        }
        try {
            await updateChannel(id, formData);
            navigate("/dashboard/channels");
        } catch (err) {
            setError("Failed to update channel");
            console.error("Failed to update channel", err);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!hasAccess) {
        return (
            <Box sx={{ maxWidth: 500, mx: "auto", my: 4 }}>
                <Alert severity="error">
                    You don't have permission to edit this channel. Only channel administrators can edit channel details.
                </Alert>
                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate("/dashboard/channels")}
                >
                    Back to Channels
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 500, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>Edit Channel</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Channel Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal" error={!!error}>
                    <InputLabel>Select Categories</InputLabel>
                    <Select
                        multiple
                        name="categoryIds"
                        value={formData.categoryIds}
                        onChange={handleCategoryChange}
                        input={<OutlinedInput label="Select Categories" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {selected.map((id) => {
                                    const cat = categories.find((c) => c.id === id);
                                    return <Chip key={id} label={cat?.title || id} />;
                                })}
                            </Box>
                        )}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                    overflowY: "auto"
                                }
                            }
                        }}
                    >
                        {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                                <Checkbox checked={formData.categoryIds.includes(cat.id)} />
                                <ListItemText primary={cat.title} />
                            </MenuItem>
                        ))}
                    </Select>
                    {error && <FormHelperText>{error}</FormHelperText>}
                </FormControl>
                <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 2 }}
                >
                    Save Changes
                </Button>
                <Button
                    variant="outlined"
                    sx={{ mt: 2, ml: 2 }}
                    onClick={() => navigate("/dashboard/channels")}
                >
                    Cancel
                </Button>
            </form>
        </Box>
    );
}

export default EditChannelPage;

// import { useEffect, useState } from "react";
// import {
//     TextField,
//     Button,
//     Typography,
//     Box,
//     MenuItem,
//     FormHelperText,
//     FormControl,
//     InputLabel,
//     Select,
//     OutlinedInput,
//     Checkbox,
//     ListItemText,
//     Chip,
// } from "@mui/material";
// import { useNavigate, useParams } from "react-router-dom";
// import { getChannelById, updateChannel } from "../../services/channelService";
// import { fetchAllCategories } from "../../services/categoryService";
//
// function EditChannelPage() {
//     const { id } = useParams();
//     const navigate = useNavigate();
//
//     const [formData, setFormData] = useState({
//         name: "",
//         description: "",
//         categoryIds: []
//     });
//
//     const [categories, setCategories] = useState([]);
//     const [error, setError] = useState("");
//
//     useEffect(() => {
//         const loadData = async () => {
//             const channel = await getChannelById(id);
//             const cats = await fetchAllCategories();
//             console.log("Loaded categories:", cats);
//             setFormData({
//                 name: channel.name,
//                 description: channel.description,
//                 categoryIds: channel.categories.map((c) => c.id)
//             });
//
//             setCategories(cats || []);
//         };
//
//         loadData();
//     }, [id]);
//
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };
//
//     const handleCategoryChange = (e) => {
//         // const value = e.target.value;
//         const value = e.target.value.map((v) => Number(v));
//         if (value.length <= 5) {
//             setFormData((prev) => ({ ...prev, categoryIds: value }));
//             setError("");
//         } else {
//             setError("You can select up to 5 categories.");
//         }
//     };
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (formData.categoryIds.length < 1) {
//             setError("Select at least one category.");
//             return;
//         }
//         try {
//             await updateChannel(id, formData);
//             navigate("/dashboard/channels");
//         } catch (err) {
//             console.error("Failed to update channel", err);
//         }
//     };
//
//     return (
//         <Box sx={{ maxWidth: 500, mx: "auto" }}>
//             <Typography variant="h4" gutterBottom>Edit Channel</Typography>
//             <form onSubmit={handleSubmit}>
//                 <TextField
//                     label="Channel Name"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     fullWidth
//                     margin="normal"
//                     required
//                 />
//                 <TextField
//                     label="Description"
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     fullWidth
//                     margin="normal"
//                     required
//                 />
//                 <FormControl fullWidth margin="normal" error={!!error}>
//                     <InputLabel>Select Categories</InputLabel>
//                     {/*<Select*/}
//                     {/*    multiple*/}
//                     {/*    name="categoryIds"*/}
//                     {/*    value={formData.categoryIds}*/}
//                     {/*    onChange={handleCategoryChange}*/}
//                     {/*    input={<OutlinedInput label="Select Categories" />}*/}
//                     {/*    renderValue={(selected) =>*/}
//                     {/*        categories*/}
//                     {/*            .filter((c) => selected.includes(c.id))*/}
//                     {/*            .map((c) => c.title)*/}
//                     {/*            .join(", ")*/}
//                     {/*    }*/}
//                     {/*>*/}
//                     {/*    {categories.map((cat) => (*/}
//                     {/*        <MenuItem key={cat.id} value={cat.id}>*/}
//                     {/*            <Checkbox checked={formData.categoryIds.includes(cat.id)} />*/}
//                     {/*            <ListItemText primary={cat.title} />*/}
//                     {/*        </MenuItem>*/}
//                     {/*    ))}*/}
//                     {/*</Select>*/}
//                     <Select
//                         multiple
//                         name="categoryIds"
//                         value={formData.categoryIds}
//                         onChange={handleCategoryChange}
//                         input={<OutlinedInput label="Select Categories" />}
//                         renderValue={(selected) => (
//                             <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                                 {selected.map((id) => {
//                                     const cat = categories.find((c) => c.id === id);
//                                     return <Chip key={id} label={cat?.title || id} />;
//                                 })}
//                             </Box>
//                         )}
//                         MenuProps={{
//                             PaperProps: {
//                                 style: {
//                                     maxHeight: 300,
//                                     overflowY: "auto"
//                                 }
//                             }
//                         }}
//                     >
//                         {categories.map((cat) => (
//                             <MenuItem key={cat.id} value={cat.id}>
//                                 <Checkbox checked={formData.categoryIds.includes(cat.id)} />
//                                 <ListItemText primary={cat.title} />
//                             </MenuItem>
//                         ))}
//                     </Select>
//                     {error && <FormHelperText>{error}</FormHelperText>}
//                 </FormControl>
//                 <Button type="submit" variant="contained">Save Changes</Button>
//             </form>
//         </Box>
//     );
// }
//
// export default EditChannelPage;
