import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Tooltip,
  IconButton,
  Checkbox,
  TablePagination,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkDeleteStudents,
  exportStudents
} from "../services/courseAdminService";
import BulkUploadDialog from "../components/BulkUploadDialog";

// --- Type Interfaces ---
interface Student {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  created_at: string;
}

interface FormState {
  fullName: string;
  email: string;
}

// =====================================================
// COMPONENT: Student Management (CourseAdminStudents)
// =====================================================
const CourseAdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination State
  const [page, setPage] = useState(0); // MUI TablePagination uses 0-indexed pages
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Selection State
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Dialog States
  const [open, setOpen] = useState(false); // Create/Edit Dialog
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuStudent, setMenuStudent] = useState<Student | null>(null);

  // Form/Action States
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>({ fullName: "", email: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [newStudentId, setNewStudentId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // === Fetch Students with Pagination ===
  const fetchStudents = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getStudents(page + 1, rowsPerPage); // Backend uses 1-indexed pages
      setStudents(data.students || []);
      setTotal(data.pagination?.total || 0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch students.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelected(new Set()); // Clear selection when page changes
    void fetchStudents();
  }, [page, rowsPerPage]);

  // === Pagination Handlers ===
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // === Selection Handlers ===
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Set(students.map(s => s.id));
      setSelected(newSelected);
    } else {
      setSelected(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.has(id);

  // === Dialog Handlers ===
  const handleOpenCreate = (): void => {
    setIsEditing(false);
    setFormState({ fullName: "", email: "" });
    setNewStudentId(null);
    setFormError("");
    setOpen(true);
  };

  const handleOpenEdit = (student: Student): void => {
    setIsEditing(true);
    setCurrentStudentId(student.id);
    setFormState({ fullName: student.full_name, email: student.email });
    setFormError("");
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
    setFormError("");
    setNewStudentId(null);
    setFormState({ fullName: "", email: "" });
    setIsEditing(false);
    setCurrentStudentId(null);
  };

  const handleOpenDelete = (student: Student): void => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleCloseDelete = (): void => {
    setStudentToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleOpenBulkDelete = (): void => {
    setBulkDeleteDialogOpen(true);
  };

  const handleCloseBulkDelete = (): void => {
    setBulkDeleteDialogOpen(false);
  };

  // === Menu Handlers ===
  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, student: Student) => {
    setAnchorEl(event.currentTarget);
    setMenuStudent(student);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuStudent(null);
  };

  const handleMenuAction = (action: 'edit' | 'delete') => {
    if (menuStudent) {
      if (action === 'edit') handleOpenEdit(menuStudent);
      if (action === 'delete') handleOpenDelete(menuStudent);
    }
    handleCloseMenu();
  };

  // === Form Handlers ===
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  // === Create / Update Student ===
  const handleSubmit = async (): Promise<void> => {
    setFormError("");
    setFormLoading(true);
    try {
      if (isEditing && currentStudentId) {
        // Update
        await updateStudent(currentStudentId, {
          full_name: formState.fullName,
          email: formState.email
        });
        setSnackbar({ open: true, message: "Student updated successfully!" });
        handleClose();
      } else {
        // Create
        const data = await createStudent(formState);
        if (!data?.user?.student_id) throw new Error("Invalid server response.");
        setNewStudentId(data.user.student_id);
        setSnackbar({ open: true, message: "Student registered successfully!" });
      }
      await fetchStudents();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save student.";
      setFormError(message);
    } finally {
      setFormLoading(false);
    }
  };

  // === Delete Student ===
  const handleDelete = async (): Promise<void> => {
    if (!studentToDelete) return;
    try {
      await deleteStudent(studentToDelete.id);
      setSnackbar({ open: true, message: "Student deleted successfully!" });
      await fetchStudents();
      handleCloseDelete();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete student.";
      setSnackbar({ open: true, message });
    }
  };

  // === Bulk Delete Students ===
  const handleBulkDelete = async (): Promise<void> => {
    try {
      const studentIds = Array.from(selected);
      const result = await bulkDeleteStudents(studentIds);
      setSnackbar({ open: true, message: result.message || "Students deleted successfully!" });
      setSelected(new Set());
      await fetchStudents();
      handleCloseBulkDelete();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete students.";
      setSnackbar({ open: true, message });
    }
  };

  // === Export Students ===
  const handleExport = async (): Promise<void> => {
    try {
      const blob = await exportStudents();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setSnackbar({ open: true, message: "Export started!" });
    } catch (error: unknown) {
      console.error("Export failed:", error);
      setSnackbar({ open: true, message: "Failed to export students." });
    }
  };

  const handleCopyId = (): void => {
    if (newStudentId) {
      void navigator.clipboard.writeText(newStudentId);
      setSnackbar({ open: true, message: "Student ID copied!" });
    }
  };

  // === Render Loading ===
  if (loading && students.length === 0) {
    return (
      <Box className="flex justify-center items-center h-[calc(100vh-200px)]">
        <CircularProgress />
      </Box>
    );
  }

  const numSelected = selected.size;
  const rowCount = students.length;

  return (
    <Box>
      {/* --- Page Header --- */}
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="font-bold text-gray-900">
          Student Management
        </Typography>
        <Box className="flex space-x-3">
          {numSelected > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleOpenBulkDelete}
            >
              Delete Selected ({numSelected})
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={students.length === 0}
          >
            Export CSV
          </Button>

          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={() => setBulkUploadOpen(true)}
          >
            Bulk Upload
          </Button>

          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-[#1A1F91] hover:bg-[#1A1F91] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            sx={{ border: 'none' }}
          >
            Add Student
          </Button>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" className="my-3">
          {error}
        </Alert>
      )}

      {/* Students Table */}
      <Paper className="bg-white rounded-xl shadow-lg border border-gray-100">
        <Box className="p-6 pb-0">
          <Typography variant="h6" className="font-semibold text-gray-900 mb-4">
            Enrolled Students ({total})
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell className="font-bold text-gray-700">Full Name</TableCell>
                <TableCell className="font-bold text-gray-700">Student ID</TableCell>
                <TableCell className="font-bold text-gray-700">Email</TableCell>
                <TableCell className="font-bold text-gray-700">Date Joined</TableCell>
                <TableCell className="font-bold text-gray-700" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="text-gray-500">
                    No students have been added to your organization yet.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => {
                  const isItemSelected = isSelected(student.id);
                  return (
                    <TableRow
                      key={student.id}
                      hover
                      className="hover:bg-gray-50"
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={() => handleSelectOne(student.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">{student.full_name}</TableCell>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleOpenMenu(e, student)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* --- Action Menu --- */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleMenuAction('edit')}>
          Edit Student
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
          Delete Student
        </MenuItem>
      </Menu>

      {/* --- Create/Edit Student Dialog --- */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle className="font-bold text-gray-900">
          {newStudentId
            ? "Student Created Successfully!"
            : isEditing
              ? "Edit Student"
              : "Add a New Student"}
        </DialogTitle>

        <DialogContent>
          {newStudentId ? (
            <Box>
              <Alert severity="success" className="mb-4">
                Student successfully registered!
              </Alert>
              <Typography variant="body1" className="text-gray-700 mb-2">
                The **unique access code** (Student ID) below is required for the student to log in. Please share it securely.
              </Typography>
              <TextField
                label="Student Access Code"
                fullWidth
                variant="outlined"
                margin="normal"
                value={newStudentId}
                InputProps={{
                  readOnly: true, endAdornment: (
                    <Tooltip title="Copy to clipboard">
                      <IconButton onClick={handleCopyId} edge="end">
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }}
                onFocus={(e) => e.target.select()}
              />
            </Box>
          ) : (
            <Box component="form" onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}>
              <TextField
                autoFocus
                margin="dense"
                name="fullName"
                label="Full Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formState.fullName}
                onChange={handleFormChange}
                required
              />
              <TextField
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={formState.email}
                onChange={handleFormChange}
                required
              />
              {formError && (
                <Alert severity="error" className="mt-2">
                  {formError}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions className="p-4">
          <Button onClick={handleClose} disabled={formLoading}>
            {newStudentId ? "Done" : "Cancel"}
          </Button>
          {!newStudentId && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={formLoading}
              startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : (isEditing ? <EditIcon /> : <AddIcon />)}
            >
              {formLoading ? "Saving..." : (isEditing ? "Update Student" : "Create Student")}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* --- Delete Confirmation Dialog --- */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{studentToDelete?.full_name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Bulk Delete Confirmation Dialog --- */}
      <Dialog open={bulkDeleteDialogOpen} onClose={handleCloseBulkDelete}>
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{numSelected} student(s)</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDelete}>Cancel</Button>
          <Button onClick={handleBulkDelete} color="error" variant="contained">
            Delete {numSelected} Student(s)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />

      {/* --- Bulk Upload Dialog --- */}
      <BulkUploadDialog
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onSuccess={() => {
          void fetchStudents();
          setSnackbar({ open: true, message: "Bulk upload successful!" });
        }}
      />
    </Box>
  );
};

export default CourseAdminStudents;