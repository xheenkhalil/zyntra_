// frontend/src/pages/CentralAdminCourseAdmins.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Container
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EmailIcon from "@mui/icons-material/Email";
import SearchIcon from "@mui/icons-material/Search";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import BulkTeacherUploadDialog from "../components/BulkTeacherUploadDialog";
import {
  getCourseAdmins,
  createCourseAdmin,
  updateCourseAdmin,
  archiveCourseAdmin,
  unarchiveCourseAdmin,
  deleteCourseAdmin,
  sendInviteEmail,
} from "../services/centralAdminService";
import type { CourseAdmin, CourseAdminData } from "../services/centralAdminService";

interface SnackbarState {
  open: boolean;
  message: string;
}

const CentralAdminCourseAdmins: React.FC = () => {


  const [courseAdmins, setCourseAdmins] = useState<CourseAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: "" });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<CourseAdmin | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<"archive" | "unarchive" | "delete" | null>(
    null
  );
  const [dialogError, setDialogError] = useState("");

  const [createForm, setCreateForm] = useState<CourseAdminData>({
    fullName: "",
    email: "",
    username: "",
  });
  const [editForm, setEditForm] = useState<Partial<CourseAdminData>>({});
  const [setupLink, setSetupLink] = useState("");
  const [newlyCreatedAdminId, setNewlyCreatedAdminId] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "archived" | "pending_setup"
  >("all");

  const fetchCourseAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const admins = await getCourseAdmins();
      setCourseAdmins(admins || []);
    } catch (error: unknown) {
      if (error instanceof Error) setError(error.message);
      else setError("Failed to fetch course admins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAdmins();
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, admin: CourseAdmin) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(admin);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleAction = (action: "edit" | "archive" | "unarchive" | "delete") => {
    if (!selectedUser) return;
    handleMenuClose();
    setDialogError("");
    if (action === "edit") {
      setEditForm({
        fullName: selectedUser.full_name,
        username: selectedUser.username,
      });
      setEditOpen(true);
    } else {
      setActionToConfirm(action);
      setConfirmOpen(true);
    }
  };

  const handleOpenCreate = () => {
    setCreateForm({ fullName: "", email: "", username: "" });
    setSetupLink("");
    setDialogError("");
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    setSetupLink("");
    setDialogError("");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(setupLink);
    setSnackbar({ open: true, message: "Invite link copied to clipboard!" });
  };

  const handleCreate = async () => {
    setDialogError("");
    if (
      !createForm.fullName.trim() ||
      !createForm.email.trim() ||
      !createForm.username.trim()
    ) {
      setDialogError("Full Name, Email, and Username are required.");
      return;
    }
    try {
      const data = await createCourseAdmin(createForm);
      if (!data?.setupLink || !data?.user?.id) throw new Error("Invalid server response.");
      setSetupLink(data.setupLink);
      setNewlyCreatedAdminId(data.user.id);
      await fetchCourseAdmins();
    } catch (error: unknown) {
      if (error instanceof Error) setDialogError(error.message);
      else setDialogError("Failed to create admin.");
    }
  };

  const handleSendEmail = async () => {
    if (!newlyCreatedAdminId) return;
    setIsSendingEmail(true);
    try {
      const data = await sendInviteEmail(newlyCreatedAdminId);
      setSnackbar({ open: true, message: data.message || "Email sent successfully!" });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to send email.";
      setSnackbar({ open: true, message: msg });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    setDialogError("");
    try {
      await updateCourseAdmin(selectedUser.id, editForm);
      setEditOpen(false);
      setSnackbar({ open: true, message: "Course Admin updated successfully!" });
      await fetchCourseAdmins();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update admin.";
      setDialogError(msg);
    }
  };

  const handleConfirm = async () => {
    if (!selectedUser || !actionToConfirm) return;
    setDialogError("");
    try {
      let message = "";
      if (actionToConfirm === "archive") {
        const res = await archiveCourseAdmin(selectedUser.id);
        message = res?.message || "User archived.";
      } else if (actionToConfirm === "unarchive") {
        const res = await unarchiveCourseAdmin(selectedUser.id);
        message = res?.message || "User restored.";
      } else if (actionToConfirm === "delete") {
        const res = await deleteCourseAdmin(selectedUser.id);
        message = res?.message || "User deleted.";
      }
      setSnackbar({ open: true, message });
      setConfirmOpen(false);
      await fetchCourseAdmins();
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : `Failed to ${actionToConfirm} user.`;
      setDialogError(msg);
    }
  };

  const filteredAdmins = courseAdmins.filter((admin) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      admin.full_name.toLowerCase().includes(query) ||
      admin.username.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "all" || admin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchCourseAdmins}>
          Retry
        </Button>
      </Container>
    );

  return (
    <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Manage Course Admins
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create and manage teachers/admins for your organization.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<GroupAddIcon />} onClick={() => setBulkUploadOpen(true)}>
            Bulk Add Teachers
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Invite Course Admin
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search by name, email, or username..."
          size="small"
          sx={{ width: 300, flexGrow: 1 }}
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
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            label="Status Filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending_setup">Pending Setup</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date Created</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
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
                      label={admin.status.replace("_", " ")}
                      color={
                        admin.status === "active"
                          ? "success"
                          : admin.status === "pending_setup"
                            ? "warning"
                            : "default"
                      }
                      size="small"
                      variant="outlined"
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
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">No course admins found matching your criteria.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ... Menus and Dialogs remain mostly the same ... */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleAction("edit")}>Edit Details</MenuItem>
        {selectedUser?.status === "archived" ? (
          <MenuItem onClick={() => handleAction("unarchive")}>Restore Access</MenuItem>
        ) : (
          <MenuItem onClick={() => handleAction("archive")}>Archive User</MenuItem>
        )}
        <MenuItem onClick={() => handleAction("delete")} sx={{ color: "error.main" }}>
          Delete Permanently
        </MenuItem>
      </Menu>

      <Dialog open={createOpen} onClose={handleCloseCreate} fullWidth maxWidth="sm">
        <DialogTitle>{setupLink ? "Success! Share or Send Invite" : "Invite New Course Admin"}</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          {setupLink ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Send this secure link to the new Course Admin. It expires in 24 hours.
              </Typography>
              <TextField fullWidth variant="outlined" value={setupLink} InputProps={{ readOnly: true }} />
            </Box>
          ) : (
            <>
              <TextField margin="dense" label="Full Name" fullWidth variant="outlined" value={createForm.fullName}
                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} sx={{ mb: 2, mt: 1 }} />
              <TextField margin="dense" label="Email Address" type="email" fullWidth variant="outlined" value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} sx={{ mb: 2 }} />
              <TextField margin="dense" label="Username" fullWidth variant="outlined" value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCreate}>{setupLink ? "Done" : "Cancel"}</Button>
          {!setupLink && <Button onClick={handleCreate} variant="contained">Generate Invite Link</Button>}
          {setupLink && (
            <>
              <Button onClick={handleCopyLink} variant="outlined" startIcon={<ContentCopyIcon />}>Copy Link</Button>
              <Button onClick={handleSendEmail} variant="outlined"
                startIcon={isSendingEmail ? <CircularProgress size={20} /> : <EmailIcon />}
                disabled={isSendingEmail}>{isSendingEmail ? "Sending..." : "Send as Email"}</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Course Admin</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <TextField margin="dense" label="Full Name" fullWidth variant="standard" value={editForm.fullName || ""}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
          <TextField margin="dense" label="Username" fullWidth variant="standard" value={editForm.username || ""}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <Typography>Are you sure you want to {actionToConfirm} user "{selectedUser?.full_name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} color={actionToConfirm === "delete" ? "error" : "primary"} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ open: false, message: "" })} message={snackbar.message} />

      <BulkTeacherUploadDialog 
          open={bulkUploadOpen} 
          onClose={() => setBulkUploadOpen(false)} 
          onSuccess={() => {
              setBulkUploadOpen(false);
              fetchCourseAdmins();
          }}
      />
    </Container>
  );
};

export default CentralAdminCourseAdmins;
