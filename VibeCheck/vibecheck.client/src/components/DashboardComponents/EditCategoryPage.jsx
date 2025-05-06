import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { updateCategory, getCategoryById } from "../../services/categoryService";

function EditCategoryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");

    useEffect(() => {
        const fetchCategory = async () => {
            const category = await getCategoryById(id);
            setTitle(category?.title || "");
        };
        fetchCategory();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateCategory(id, { title });
            navigate("/dashboard/categories");
        } catch (error) {
            console.error("Error updating category:", error);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>Editeaza Categorie</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Titlu categorie"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                />
                <Button type="submit" variant="contained" color="primary">
                    Salveaza
                </Button>
            </form>
        </Box>
    );
}

export default EditCategoryPage;
