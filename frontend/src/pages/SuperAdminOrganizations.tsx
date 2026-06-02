// frontend/src/pages/SuperAdminOrganizations.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  Snackbar,
  Container,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailIcon from '@mui/icons-material/Email';

import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  archiveOrganization,
  unarchiveOrganization,
  deleteOrganization,
  createCentralAdmin,
  sendInviteEmail,
} from '../services/superAdminService';

// ========================
// INTERFACES
// ========================
interface Organization {
  id: string;
  name: string;
  tier: string;
  status?: 'active' | 'archived';
  created_at: string;
}

// ========================
// COMPONENT
// ========================
const SuperAdminOrganizations: React.FC = () => {
  // === State Definitions ===
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Menu & Dialog states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<
    'archive' | 'unarchive' | 'delete' | null
  >(null);
  const [dialogError, setDialogError] = useState('');
  const [editedName, setEditedName] = useState('');

  // Create Organization flow
  const [createOpen, setCreateOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [newlyCreatedOrg, setNewlyCreatedOrg] = useState<Organization | null>(
    null
  );
  const [newOrgName, setNewOrgName] = useState('');
  const [centralAdminForm, setCentralAdminForm] = useState({
    fullName: '',
    email: '',
    username: '',
  });
  const [setupLink, setSetupLink] = useState('');

  // for email sending
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false); // Added loading state
  const [newlyCreatedAdminId, setNewlyCreatedAdminId] = useState<string | null>(
    null
  );

  // ========================
  // FETCH ORGANIZATIONS
  // ========================
  const fetchOrgs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrganizations();
      setOrganizations(data || []);
    } catch (err: unknown) {
      interface AxiosError {
        response?: { data?: { message?: string } };
        message?: string;
      }
      let msg = 'Failed to load organizations.';
      if (typeof err === 'object' && err !== null) {
        const errorObj = err as AxiosError;
        if (typeof errorObj.response?.data?.message === 'string') {
          msg = errorObj.response.data.message;
        } else if (typeof errorObj.message === 'string') {
          msg = errorObj.message;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  // ========================
  // MENU & ACTION HANDLERS
  // ========================
  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    org: Organization
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedOrg(org);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleAction = (
    action: 'edit' | 'archive' | 'unarchive' | 'delete'
  ) => {
    if (!selectedOrg) return;
    handleMenuClose();
    setDialogError('');
    if (action === 'edit') {
      setEditedName(selectedOrg.name);
      setEditOpen(true);
    } else {
      setActionToConfirm(action);
      setConfirmOpen(true);
    }
  };

  // ========================
  // CREATE FLOW HANDLERS
  // ========================
  const handleOpenCreateModal = () => {
    setModalStep(1);
    setNewlyCreatedOrg(null);
    setNewOrgName('');
    setCentralAdminForm({ fullName: '', email: '', username: '' });
    setSetupLink('');
    setDialogError('');
    setCreateOpen(true);
  };

  const handleCloseCreateModal = () => setCreateOpen(false);

  const handleCreateOrg = async () => {
    setDialogError('');
    if (!newOrgName.trim())
      return setDialogError('Organization name is required.');
    try {
      const data = await createOrganization(newOrgName.trim());
      // FIX: Backend returns the org object directly, not wrapped in 'organization'
      setNewlyCreatedOrg(data);
      setModalStep(2);
    } catch (err: unknown) {
      interface AxiosError {
        response?: { data?: { message?: string } };
      }
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as AxiosError).response?.data?.message === 'string'
      ) {
        setDialogError((err as AxiosError).response!.data!.message!);
      } else {
        setDialogError('Failed to create organization.');
      }
    }
  };

  const handleCreateCentralAdmin = async () => {
    setDialogError('');
    if (!newlyCreatedOrg) return;
    if (
      !centralAdminForm.fullName.trim() ||
      !centralAdminForm.email.trim() ||
      !centralAdminForm.username.trim()
    ) {
      return setDialogError('All admin fields are required.');
    }
    const adminData = {
      ...centralAdminForm,
      organizationId: newlyCreatedOrg.id,
    };
    setIsCreatingAdmin(true); // Start loading
    try {
      const data = await createCentralAdmin(adminData);
      setSetupLink(data.setupLink);
      setNewlyCreatedAdminId(data.user.id);
      setModalStep(3);
      await fetchOrgs();
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === 'string'
      ) {
        setDialogError(
          (err as { response: { data: { message: string } } }).response.data
            .message
        );
      } else {
        setDialogError('Failed to create central admin.');
      }
    } finally {
      setIsCreatingAdmin(false); // Stop loading
    }
  };

  const handleSendEmail = async () => {
    if (!newlyCreatedAdminId) return;
    setIsSendingEmail(true);
    try {
      const data = await sendInviteEmail(newlyCreatedAdminId);
      setSnackbar({ open: true, message: data.message });
    } catch (err: unknown) {
      let message = 'Failed to send email.';
      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
      ) {
        message = (err as { message: string }).message;
      }
      setSnackbar({ open: true, message });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(setupLink);
    setSnackbar({ open: true, message: 'Invite link copied to clipboard!' });
  };

  // ========================
  // UPDATE / ARCHIVE / DELETE
  // ========================
  const handleUpdate = async () => {
    if (!selectedOrg || !editedName.trim()) return;
    setDialogError('');
    try {
      await updateOrganization(selectedOrg.id, editedName.trim());
      setEditOpen(false);
      setSnackbar({ open: true, message: 'Organization updated successfully!' });
      await fetchOrgs();
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === 'string'
      ) {
        setDialogError(
          (err as { response: { data: { message: string } } }).response.data
            .message
        );
      } else {
        setDialogError('Failed to update organization.');
      }
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedOrg || !actionToConfirm) return;
    setDialogError('');
    try {
      let res;
      if (actionToConfirm === 'archive') {
        res = await archiveOrganization(selectedOrg.id);
      } else if (actionToConfirm === 'unarchive') {
        res = await unarchiveOrganization(selectedOrg.id);
      } else if (actionToConfirm === 'delete') {
        res = await deleteOrganization(selectedOrg.id);
      }
      setSnackbar({
        open: true,
        message: res?.message || 'Action successful!',
      });
      setConfirmOpen(false);
      await fetchOrgs();
    } catch (err: unknown) {
      let message = `Failed to ${actionToConfirm} organization.`;
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === 'string'
      ) {
        message = (err as { response: { data: { message: string } } }).response
          .data.message;
      }
      setDialogError(message);
    }
  };

  // ========================
  // RENDER STATES
  // ========================
  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchOrgs}>
          Retry
        </Button>
      </Container>
    );

  // ========================
  // MAIN RENDER
  // ========================
  return (
    <Box>
      {/* --- Page Header --- */}
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="font-bold text-gray-900">
          Organization Management
        </Typography>
        <Button
          color="inherit"
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-2 px-4 py-2 bg-[#3C4DCE] hover:bg-[#2C31B9] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          startIcon={<AddIcon />}
          sx={{ border: 'none' }}
        >
          Create Organization
        </Button>
      </Box>

      {/* --- Table --- */}
      <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Subscription Tier</TableCell>
                <TableCell>Date Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <TableRow key={org.id} hover>
                    <TableCell>{org.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={org.status || 'active'}
                        color={
                          org.status === 'active' || !org.status
                            ? 'success'
                            : 'default'
                        }
                        size="small"
                        className={
                          org.status === 'active' || !org.status
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      />
                    </TableCell>
                    <TableCell className="capitalize">
                      {org.tier || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(org.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuClick(e, org)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No organizations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- DIALOGS AND MENUS --- */}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('edit')}>Edit</MenuItem>
        {selectedOrg?.status === 'archived' ? (
          <MenuItem onClick={() => handleAction('unarchive')}>Restore</MenuItem>
        ) : (
          <MenuItem onClick={() => handleAction('archive')}>Archive</MenuItem>
        )}
        <MenuItem
          onClick={() => handleAction('delete')}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Organization</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            type="text"
            fullWidth
            variant="standard"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <Box>
            Are you sure you want to {actionToConfirm} the organization
            <strong> "{selectedOrg?.name}"</strong>?
            {actionToConfirm === 'delete' && (
              <Typography color="error" sx={{ fontWeight: 'bold', mt: 1 }}>
                This action is irreversible.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            color={actionToConfirm === 'delete' ? 'error' : 'primary'}
            variant="contained"
          >
            Confirm {actionToConfirm}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Two-Step Create Dialog */}
      <Dialog
        open={createOpen}
        onClose={handleCloseCreateModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {modalStep === 1 && 'Step 1: Create New Organization'}
          {modalStep === 2 &&
            `Step 2: Create Central Admin for "${newlyCreatedOrg?.name}"`}
          {modalStep === 3 && 'Success! Share or Send Invite'}
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}

          {modalStep === 1 && (
            <TextField
              autoFocus
              margin="dense"
              label="Organization Name"
              type="text"
              fullWidth
              variant="standard"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
            />
          )}
          {modalStep === 2 && (
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Enter the primary admin's details:
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Admin's Full Name"
                type="text"
                fullWidth
                variant="standard"
                value={centralAdminForm.fullName}
                onChange={(e) =>
                  setCentralAdminForm({
                    ...centralAdminForm,
                    fullName: e.target.value,
                  })
                }
              />
              <TextField
                margin="dense"
                label="Admin's Email"
                type="email"
                fullWidth
                variant="standard"
                value={centralAdminForm.email}
                onChange={(e) =>
                  setCentralAdminForm({
                    ...centralAdminForm,
                    email: e.target.value,
                  })
                }
              />
              <TextField
                margin="dense"
                label="Admin's Username"
                type="text"
                fullWidth
                variant="standard"
                value={centralAdminForm.username}
                onChange={(e) =>
                  setCentralAdminForm({
                    ...centralAdminForm,
                    username: e.target.value,
                  })
                }
              />
            </>
          )}
          {modalStep === 3 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Send this secure link to the new Central Admin. It expires in 24
                hours.
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={setupLink}
                onFocus={(e) => e.target.select()}
                InputProps={{ readOnly: true }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {modalStep < 3 && (
            <Button onClick={handleCloseCreateModal}>Cancel</Button>
          )}
          {modalStep === 1 && (
            <Button onClick={handleCreateOrg} variant="contained">
              Next
            </Button>
          )}
          {modalStep === 2 && (
            <Button
              onClick={handleCreateCentralAdmin}
              variant="contained"
              disabled={isCreatingAdmin}
              startIcon={isCreatingAdmin ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isCreatingAdmin ? 'Creating...' : 'Create Admin & Generate Link'}
            </Button>
          )}
          {modalStep === 3 && (
            <>
              <Button
                onClick={handleCopyLink}
                variant="outlined"
                startIcon={<ContentCopyIcon />}
              >
                Copy Link
              </Button>
              <Button
                onClick={handleSendEmail}
                variant="outlined"
                startIcon={
                  isSendingEmail ? (
                    <CircularProgress size={20} />
                  ) : (
                    <EmailIcon />
                  )
                }
                disabled={isSendingEmail}
              >
                {isSendingEmail ? 'Sending...' : 'Send as Email'}
              </Button>
              <Button onClick={handleCloseCreateModal} variant="contained">
                Done
              </Button>
            </>
          )}
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

export default SuperAdminOrganizations;