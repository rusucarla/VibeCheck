import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createCategory } from "../../services/categoryService";

function AddCategoryPage() {
    const [title, setTitle] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCategory({ title });
            navigate("/dashboard/categories");
        } catch (error) {
            console.error("Error creating category:", error);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>Adauga Categorie</Typography>
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
                    Creeaza
                </Button>
            </form>
        </Box>
    );
}

export default AddCategoryPage;
