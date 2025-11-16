// /frontend/src/pages/SuperAdminUsers.tsx

import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Chip,
  Snackbar,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  FaSearch,
  FaEdit,
  FaArchive,
  FaUserCheck,
} from 'react-icons/fa';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
} from '../services/superAdminService';
import { useAuth } from '../context/useAuth';
import { useDebounce } from '../hooks/useDebounce'; // We will create this hook

// --- Type Definitions ---
interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'teacher' | 'clientadmin' | 'superadmin';
  status: 'active' | 'archived' | 'pending_setup';
  created_at: string;
  organization_name: string;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}

interface FilterState {
  search: string;
  role: string;
}

// ========================
// MAIN COMPONENT
// ========================
const SuperAdminUsers: React.FC = () => {
  const { user: adminUser } = useAuth(); // Get the logged-in superadmin

  // --- State Definitions ---
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Filter & Pagination State
  const [filters, setFilters] = useState<FilterState>({ search: '', role: 'all' });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  });
  
  // Debounce the search term to avoid spamming the API
  const debouncedSearch = useDebounce(filters.search, 500);

  // Menu & Dialog states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<User['role']>('student');

  // ========================
  // DATA FETCHING
  // ========================
  const fetchUsers = useCallback(async (page: number, currentFilters: FilterState, search: string) => {
    setLoading(true);
    setError('');
    try {
      const apiFilters: any = {
        page,
        limit: pagination.limit,
      };
      if (search) apiFilters.search = search;
      if (currentFilters.role !== 'all') apiFilters.role = currentFilters.role;

      const data = await getAllUsers(apiFilters);
      
      setUsers(data.users || []);
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        totalUsers: data.pagination.totalUsers,
        limit: data.pagination.limit,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]); // Only depends on limit, page/filters are passed in

  // Effect to fetch data when page, filters, or debounced search changes
  useEffect(() => {
    fetchUsers(pagination.currentPage, filters, debouncedSearch);
  }, [pagination.currentPage, filters, debouncedSearch, fetchUsers]);

  // ========================
  // EVENT HANDLERS
  // ========================

  const handleFilterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage + 1 })); // MUI is 0-indexed
  };

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPagination((prev) => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      currentPage: 1, // Reset to page 1
    }));
  };

  // --- Menu Handlers ---
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
    setNewRole(user.role); // Pre-fill the role modal
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  // --- Modal Handlers ---
  const openRoleModal = () => {
    setRoleModalOpen(true);
    handleMenuClose();
  };

  const openStatusModal = () => {
    setStatusModalOpen(true);
    handleMenuClose();
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      await updateUserRole(selectedUser.id, newRole);
      setSnackbar({ open: true, message: 'User role updated successfully!' });
      setRoleModalOpen(false);
      // Refresh data
      fetchUsers(pagination.currentPage, filters, debouncedSearch);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === 'active' ? 'archived' : 'active';
    try {
      await updateUserStatus(selectedUser.id, newStatus);
      setSnackbar({ open: true, message: `User ${newStatus} successfully.` });
      setStatusModalOpen(false);
      // Refresh data
      fetchUsers(pagination.currentPage, filters, debouncedSearch);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // --- Render Status Chip ---
  const getStatusChip = (status: User['status']) => {
    if (status === 'active') {
      return <Chip label="Active" color="success" size="small" className="bg-green-100 text-green-800" />;
    }
    if (status === 'archived') {
      return <Chip label="Archived" color="default" size="small" className="bg-gray-100 text-gray-800" />;
    }
    return <Chip label="Pending" color="warning" size="small" className="bg-yellow-100 text-yellow-800" />;
  };

  return (
    <Box>
      {/* --- Page Header --- */}
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="font-bold text-gray-900">
          User Management
        </Typography>
      </Box>

      {/* --- Filter Bar --- */}
      <Paper className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100 flex items-center space-x-4">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name or email..."
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          className="flex-grow"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch className="text-gray-400" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl variant="outlined" size="small" className="min-w-[180px]">
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            label="Role"
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="superadmin">Super Admin</MenuItem>
            <MenuItem value="clientadmin">Client Admin</MenuItem>
            <MenuItem value="courseadmin">Teacher</MenuItem>
            <MenuItem value="student">Student</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* --- Main Content Table --- */}
      {loading && users.length === 0 ? (
        <Box className="flex justify-center items-center h-64">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" className="mb-2">{error}</Alert>
      ) : (
        <Paper className="bg-white rounded-xl shadow-lg border border-gray-100">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>{user.organization_name || 'N/A'}</TableCell>
                      <TableCell>{getStatusChip(user.status)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => handleMenuClick(e, user)}
                          disabled={user.id === adminUser?.id} // Disable actions on self
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No users found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* --- Pagination --- */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={pagination.totalUsers}
            rowsPerPage={pagination.limit}
            page={pagination.currentPage - 1} // MUI is 0-indexed
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Paper>
      )}

      {/* --- Modals & Menus --- */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={openRoleModal}>
          <FaEdit className="mr-3" /> Update Role
        </MenuItem>
        {selectedUser?.status === 'active' ? (
          <MenuItem onClick={openStatusModal}>
            <FaArchive className="mr-3" /> Archive User
          </MenuItem>
        ) : (
          <MenuItem onClick={openStatusModal}>
            <FaUserCheck className="mr-3" /> Activate User
          </MenuItem>
        )}
      </Menu>

      {/* Update Role Modal */}
      <Dialog open={roleModalOpen} onClose={() => setRoleModalOpen(false)}>
        <DialogTitle>Update Role for {selectedUser?.full_name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>New Role</InputLabel>
            <Select
              value={newRole}
              label="New Role"
              onChange={(e) => setNewRole(e.target.value as User['role'])}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="clientadmin">Client Admin</MenuItem>
              <MenuItem value="superadmin">Super Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleModalOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateRole} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Status Change Modal */}
      <Dialog open={statusModalOpen} onClose={() => setStatusModalOpen(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {selectedUser?.status === 'active' ? 'archive' : 'activate'} this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusModalOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained" color={selectedUser?.status === 'active' ? 'warning' : 'success'}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default SuperAdminUsers;