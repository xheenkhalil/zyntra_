import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Container,
    Chip,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getOrganizationUsers } from "../services/centralAdminService";

interface User {
    id: string;
    full_name: string;
    email: string;
    username: string;
    role: string;
    status: string;
    created_at: string;
}

const CentralAdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedRole, setSelectedRole] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const data = await getOrganizationUsers(selectedRole);
                setUsers(data || []);
            } catch (err) {
                setError("Failed to fetch users.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [selectedRole]);

    const filteredUsers = users.filter((user) =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>;
    if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Organization Users
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    View all users (Course Admins and Students) within your organization.
                </Typography>
            </Box>

            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search users..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="role-filter-label">Filter by Role</InputLabel>
                    <Select
                        labelId="role-filter-label"
                        value={selectedRole}
                        label="Filter by Role"
                        onChange={(e) => setSelectedRole(e.target.value)}
                    >
                        <MenuItem value="">All Roles</MenuItem>
                        <MenuItem value="courseadmin">Teachers (Course Admins)</MenuItem>
                        <MenuItem value="student">Students</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Joined Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{user.full_name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role === 'centraladmin' ? 'Org Admin' : user.role === 'courseadmin' ? 'Teacher' : 'Student'}
                                            color={user.role === 'centraladmin' ? 'warning' : user.role === 'courseadmin' ? 'primary' : 'secondary'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.status}
                                            color={user.status === 'active' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="textSecondary">No users found.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default CentralAdminUsers;
