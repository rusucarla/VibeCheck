import { useEffect, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Chip,
    FormHelperText,
    Checkbox,
    ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createChannel } from "../../services/channelService";
import {fetchAllCategories} from "../../services/categoryService";

const MAX_CATEGORIES = 5;

function AddChannelPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchAllCategories();
                console.log("Loaded categories:", data);
                setAllCategories(data || []);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        loadCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedCategories.length < 1 || selectedCategories.length > MAX_CATEGORIES) {
            setError(`Please select between 1 and ${MAX_CATEGORIES} categories.`);
            return;
        }

        try {
            await createChannel({
                name,
                description,
                categoryIds: selectedCategories
            });
            navigate("/dashboard/channels");
        } catch (err) {
            console.error("Failed to create channel:", err);
            setError(err.message);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Creează un canal nou
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Nume canal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                    inputProps={{ maxLength: 20 }}
                />
                <TextField
                    label="Descriere"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                />

                <FormControl fullWidth margin="normal" error={!!error}>
                    <InputLabel id="categories-label">Categorii</InputLabel>
                    {/*<Select*/}
                    {/*    labelId="categories-label"*/}
                    {/*    multiple*/}
                    {/*    value={selectedCategories}*/}
                    {/*    onChange={(e) => setSelectedCategories(e.target.value)}*/}
                    {/*    input={<OutlinedInput label="Categorii" />}*/}
                    {/*    renderValue={(selected) => (*/}
                    {/*        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>*/}
                    {/*            {selected.map((id) => {*/}
                    {/*                const cat = allCategories.find((c) => c.id === id);*/}
                    {/*                return <Chip key={id} label={cat?.title || id} />;*/}
                    {/*            })}*/}
                    {/*        </Box>*/}
                    {/*    )}*/}
                    {/*>*/}
                    {/*    {allCategories.map((cat) => (*/}
                    {/*        <MenuItem key={cat.id} value={cat.id}>*/}
                    {/*            {cat.title}*/}
                    {/*        </MenuItem>*/}
                    {/*    ))}*/}
                    {/*</Select>*/}
                    <Select
                        labelId="categories-label"
                        multiple
                        value={selectedCategories}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= MAX_CATEGORIES) {
                                setSelectedCategories(value);
                                setError("");
                            } else {
                                setError(`You can select up to ${MAX_CATEGORIES} categories.`);
                            }
                        }}
                        input={<OutlinedInput label="Categorii" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {selected.map((id) => {
                                    const cat = allCategories.find((c) => c.id === id);
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
                        {allCategories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                                <Checkbox checked={selectedCategories.includes(cat.id)} />
                                <ListItemText primary={cat.title} />
                            </MenuItem>
                        ))}
                    </Select>
                    {error && <FormHelperText>{error}</FormHelperText>}
                </FormControl>

                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Creeaza canal
                </Button>
            </form>
        </Box>
    );
}

export default AddChannelPage;
