import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCategoryById, updateCategory } from "../../services/categoryService";
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Stack
} from "@mui/material";

function EditCategoryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState({
        title: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const data = await getCategoryById(id);
                if (data) {
                    setCategory({ title: data.title });
                }
            } catch (err) {
                setError("Failed to load category");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [id]);

    const handleChange = (e) => {
        setCategory({ ...category, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateCategory(id, category);
            navigate("/dashboard/categories");
        } catch (err) {
            setError("Failed to update category");
            console.error(err);
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Edit Category</Typography>
            <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            label="Title"
                            name="title"
                            value={category.title}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button
                                variant="outlined"
                                onClick={() => navigate("/dashboard/categories")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                            >
                                Update
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}

export default EditCategoryPage;