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
    TextField,
    useTheme
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card";

function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const pageSize = 9;
    const navigate = useNavigate();
    const theme = useTheme();

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
        if (window.confirm("E?ti sigur c? vrei s? ?tergi aceast? categorie?")) {
            try {
                await deleteCategory(id);
                loadCategories(page, search);
            } catch (error) {
                console.error("Eroare la stergere:", error.message);
            }
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1); // reseteaz? pagina când se face un nou search
        loadCategories(1, search);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Categorii disponibile
            </Typography>

            {/* Rând cu Add ?i Search */}
            <Stack direction="row" spacing={2} mb={3} alignItems="center">
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => navigate(`/dashboard/categories/new/`)}
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        }
                    }}
                >
                    Adauga categorie
                </Button>
                <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: '400px' }}>
                    <TextField
                        label="Cauta categorii"
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        fullWidth
                        InputProps={{
                            sx: { borderRadius: '8px' }
                        }}
                    />
                </form>
            </Stack>

            {/* Carduri pentru categorii */}
            <Grid container spacing={3}>
                {categories.map((cat) => (
                    <Grid item xs={12} sm={6} md={4} key={cat.id}>
                        <Card 
                            title={cat.title}
                            sx={{ 
                                height: '100%',
                                margin: 0,
                                position: 'relative',
                                backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
                                color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                }}
                            >
                                <IconButton 
                                    onClick={() => navigate(`/dashboard/categories/edit/${cat.id}`)} 
                                    size="small"
                                    sx={{ 
                                        color: theme.palette.warning.main,
                                        '&:hover': { color: theme.palette.warning.dark }
                                    }}
                                >
                                    <Edit fontSize="small" />
                                </IconButton>
                                <IconButton 
                                    onClick={() => handleDelete(cat.id)} 
                                    size="small"
                                    sx={{ 
                                        color: theme.palette.error.main,
                                        '&:hover': { color: theme.palette.error.dark }
                                    }}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Stack>
                            
                            {/*<Typography variant="body1" sx={{ mt: 2 }}>*/}
                            {/*    ID: {cat.id}*/}
                            {/*</Typography>*/}
                            
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ 
                                    mt: 2,
                                    borderRadius: '12px',
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                        borderColor: theme.palette.primary.dark,
                                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                    }
                                }}
                                onClick={() => navigate(`/dashboard/categories/edit/${cat.id}`)}
                            >
                                Vezi detalii
                            </Button>
                        </Card>
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
                    sx={{
                        '& .MuiPaginationItem-root': {
                            borderRadius: '8px',
                        }
                    }}
                />
            </Stack>
        </Box>
    );
}

export default CategoriesPage;
