import { useEffect, useState } from "react";
import {
    getAllCategories,
    deleteCategory
} from "../../services/categoryService";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Pagination,
    Grid,
    Stack,
    TextField
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const pageSize = 9;
    const navigate = useNavigate();

    const loadCategories = async (currentPage, searchTerm = "") => {
        const result = await getAllCategories(currentPage, pageSize, searchTerm);
        if (result) {
            setCategories(result.data || []);
            setTotalPages(result.totalPages || 1);
        }
    };

    useEffect(() => {
        loadCategories(page, search);
    }, [page]);

    const handlePageChange = (_, newPage) => {
        setPage(newPage);
    };

    const handleDelete = async (id) => {
        if (window.confirm("You sure you want to delete this category?")) {
            try {
                await deleteCategory(id);
                loadCategories(page, search);
            } catch (error) {
                console.error("Error when trying to delete:", error.message);
            }
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1); // reset pagina cand se face un nou search
        loadCategories(1, search);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Categorii disponibile
            </Typography>

            {/* Rand cu Add si Search */}
            <Stack direction="row" spacing={2} mb={3} alignItems="center">
                <Button variant="contained" startIcon={<Add />} onClick={() => navigate(`/dashboard/categories/new/`)}>
                    Add categorie
                </Button>
                <form onSubmit={handleSearchSubmit}>
                    <TextField
                        label="Cauta categorii"
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
            </Stack>

            {/* Carduri pentru categorii */}
            <Grid container spacing={2}>
                {categories.map((cat) => (
                    <Grid item xs={12} sm={6} md={4} key={cat.id}>
                        <Box
                            sx={{
                                p: 2,
                                border: "1px solid",
                                borderRadius: "8px",
                                textAlign: "center",
                                backgroundColor: "background.paper",
                                position: "relative"
                            }}
                        >
                            <Typography variant="h6">{cat.title}</Typography>

                            {/* Butoane Edit / Delete */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 5,
                                    right: 5,
                                    display: "flex",
                                    gap: 1
                                }}
                            >
                                <IconButton onClick={() => navigate(`/dashboard/categories/edit/${cat.id}`)} size="small">
                                    <Edit fontSize="small" />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(cat.id)} size="small">
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {/* Paginare */}
            <Stack spacing={2} alignItems="center" mt={4}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                />
            </Stack>
        </Box>
    );
}

export default CategoriesPage;
