import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Snackbar, IconButton, Menu, MenuItem, Chip, Select, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailIcon from '@mui/icons-material/Email';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import {
  getCourseAdmins,
  createCourseAdmin,
  updateCourseAdmin,
  archiveCourseAdmin,
  unarchiveCourseAdmin,
  deleteCourseAdmin,
  sendInviteEmail
} from '../services/centralAdminService';
import type { CourseAdminData } from '../services/centralAdminService';
import { useAuth } from '../context/AuthContext';

interface CourseAdmin {
  id: string;
  full_name: string;
  email: string;
  username: string;
  status: 'active' | 'archived' | 'pending_setup';
  created_at: string;
}

const CentralAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  // === State Definitions ===
  const [courseAdmins, setCourseAdmins] = useState<CourseAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Menu and Dialogs
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<CourseAdmin | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<'archive' | 'unarchive' | 'delete' | null>(null);
  const [dialogError, setDialogError] = useState('');

  // Forms and Email Sending
  const [createForm, setCreateForm] = useState<CourseAdminData>({ fullName: '', email: '', username: '' });
  const [editForm, setEditForm] = useState<Partial<CourseAdminData>>({});
  const [setupLink, setSetupLink] = useState('');
  const [newlyCreatedAdminId, setNewlyCreatedAdminId] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived' | 'pending_setup'>('all');

  // === Fetch Course Admins ===
  const fetchCourseAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const admins = await getCourseAdmins();
      setCourseAdmins(admins || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch course admins.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAdmins();
  }, []);

  // === Menu Logic ===
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, admin: CourseAdmin) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(admin);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleAction = (action: 'edit' | 'archive' | 'unarchive' | 'delete') => {
    if (!selectedUser) return;
    handleMenuClose();
    setDialogError('');
    if (action === 'edit') {
      setEditForm({ fullName: selectedUser.full_name, username: selectedUser.username });
      setEditOpen(true);
    } else {
      setActionToConfirm(action);
      setConfirmOpen(true);
    }
  };

  // === Create Admin Logic ===
  const handleOpenCreate = () => {
    setCreateForm({ fullName: '', email: '', username: '' });
    setSetupLink('');
    setDialogError('');
    setCreateOpen(true);
  };
  const handleCloseCreate = () => {
    setCreateOpen(false);
    setSetupLink('');
    setDialogError('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(setupLink);
    setSnackbar({ open: true, message: 'Invite link copied to clipboard!' });
  };

  const handleCreate = async () => {
    setDialogError('');
    if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.username.trim()) {
      return setDialogError('Full Name, Email, and Username are required.');
    }
    try {
      const data = await createCourseAdmin(createForm);
      if (!data?.setupLink || !data?.user?.id) {
        throw new Error('Invalid server response. Setup link missing.');
      }
      setSetupLink(data.setupLink);
      setNewlyCreatedAdminId(data.user.id);
      await fetchCourseAdmins();
    } catch (err: any) {
      console.error('Error creating admin:', err);
      setDialogError(err.response?.data?.message || err.message || 'Failed to create admin.');
    }
  };

  const handleSendEmail = async () => {
    if (!newlyCreatedAdminId) return;
    setIsSendingEmail(true);
    try {
      const data = await sendInviteEmail(newlyCreatedAdminId);
      setSnackbar({ open: true, message: data.message || 'Email sent successfully!' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to send email.' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // === Update Admin ===
  const handleUpdate = async () => {
    if (!selectedUser) return;
    setDialogError('');
    try {
      await updateCourseAdmin(selectedUser.id, editForm);
      setEditOpen(false);
      setSnackbar({ open: true, message: 'Course Admin updated successfully!' });
      await fetchCourseAdmins();
    } catch (err: any) {
      setDialogError(err.response?.data?.message || 'Failed to update admin.');
    }
  };

  // === Confirm Actions ===
  const handleConfirm = async () => {
    if (!selectedUser || !actionToConfirm) return;
    setDialogError('');
    try {
      let res;
      if (actionToConfirm === 'archive') res = await archiveCourseAdmin(selectedUser.id);
      else if (actionToConfirm === 'unarchive') res = await unarchiveCourseAdmin(selectedUser.id);
      else if (actionToConfirm === 'delete') res = await deleteCourseAdmin(selectedUser.id);
      setSnackbar({ open: true, message: res?.message || 'Action completed successfully!' });
      setConfirmOpen(false);
      await fetchCourseAdmins();
    } catch (err: any) {
      setDialogError(err.response?.data?.message || `Failed to ${actionToConfirm} user.`);
    }
  };

  // === Filtering Logic ===
  const filteredAdmins = courseAdmins.filter(admin => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      admin.full_name.toLowerCase().includes(query) ||
      admin.username.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // === Render States ===
  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={fetchCourseAdmins}>Retry</Button>
      </Container>
    );

  // === Main Render ===
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Central Admin Dashboard</Typography>
          <Typography>Welcome, {user?.fullName || 'Central Admin'}!</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Invite Course Admin
          </Button>
          <Button variant="outlined" startIcon={<LogoutIcon />} onClick={logout}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* 🔍 Sticky Search + Filter Controls */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          backgroundColor: '#fff',
          py: 1.5,
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search Course Admins..."
          size="small"
          sx={{ width: 300 }}
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
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            label="Status Filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending_setup">Pending Setup</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Typography variant="h6" gutterBottom>Managed Course Admins</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id} hover>
                  <TableCell>{admin.full_name}</TableCell>
                  <TableCell>{admin.username}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={admin.status.replace('_', ' ')}
                      color={
                        admin.status === 'active'
                          ? 'success'
                          : admin.status === 'pending_setup'
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuClick(e, admin)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No course admins found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleAction('edit')}>Edit</MenuItem>
        {selectedUser?.status === 'archived' ? (
          <MenuItem onClick={() => handleAction('unarchive')}>Restore</MenuItem>
        ) : (
          <MenuItem onClick={() => handleAction('archive')}>Archive</MenuItem>
        )}
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={handleCloseCreate} fullWidth maxWidth="sm">
        <DialogTitle>
          {setupLink ? 'Success! Share or Send Invite' : 'Invite New Course Admin'}
        </DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          {setupLink ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Send this secure link to the new Course Admin. It expires in 24 hours.
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={setupLink}
                InputProps={{ readOnly: true }}
                onFocus={(e) => e.target.select()}
              />
            </Box>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Full Name"
                fullWidth
                variant="standard"
                value={createForm.fullName}
                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Email Address"
                type="email"
                fullWidth
                variant="standard"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Username"
                type="text"
                fullWidth
                variant="standard"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCreate}>{setupLink ? 'Done' : 'Cancel'}</Button>
          {!setupLink && (
            <Button onClick={handleCreate} variant="contained">
              Generate Invite Link
            </Button>
          )}
          {setupLink && (
            <>
              <Button onClick={handleCopyLink} variant="outlined" startIcon={<ContentCopyIcon />}>
                Copy Link
              </Button>
              <Button
                onClick={handleSendEmail}
                variant="outlined"
                startIcon={isSendingEmail ? <CircularProgress size={20} /> : <EmailIcon />}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? 'Sending...' : 'Send as Email'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Course Admin</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            fullWidth
            variant="standard"
            value={editForm.fullName || ''}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Username"
            fullWidth
            variant="standard"
            value={editForm.username || ''}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <Typography>
            Are you sure you want to {actionToConfirm} user "{selectedUser?.full_name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            color={actionToConfirm === 'delete' ? 'error' : 'primary'}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default CentralAdminDashboard;
