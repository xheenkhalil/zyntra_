import React, { useState, useEffect } from "react";
import {
  Container,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getStudents, createStudent } from "../services/courseAdminService";
import { useAuth } from "../context/useAuth"; // ✅ Updated import for new auth hook

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

const CourseAdminDashboard: React.FC = () => {
  const { user } = useAuth(); // ✅ Uses updated context hook
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({ fullName: "", email: "" });
  const [formError, setFormError] = useState("");
  const [newStudentId, setNewStudentId] = useState<string | null>(null);

  // === Fetch Students ===
  const fetchStudents = async (): Promise<void> => {
    try {
      setLoading(true);
      const studentData = await getStudents();
      setStudents(studentData);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch students.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStudents();
  }, []);

  // === Dialog Handlers ===
  const handleOpen = (): void => setOpen(true);
  const handleClose = (): void => {
    setOpen(false);
    setFormError("");
    setNewStudentId(null);
    setFormState({ fullName: "", email: "" });
  };

  // === Form Handlers ===
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  // === Create Student ===
  const handleCreate = async (): Promise<void> => {
    setFormError("");
    try {
      const data = await createStudent(formState);
      if (!data?.user?.student_id) throw new Error("Invalid server response.");
      setNewStudentId(data.user.student_id);
      await fetchStudents();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create student.";
      setFormError(message);
    }
  };

  // === Render Loading ===
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Course Admin Dashboard
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Add Student
        </Button>
      </Box>

      {/* Welcome */}
      <Typography>Welcome, {user?.fullName || "Course Admin"}!</Typography>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {/* Students Table */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Manage Students
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student ID</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Date Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>{student.full_name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Student Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {newStudentId ? "Student Created Successfully!" : "Add a New Student"}
        </DialogTitle>

        <DialogContent>
          {newStudentId ? (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Please securely share the following Student ID with the new student. They will use
                this to log in.
              </Typography>
              <TextField
                label="Student ID"
                fullWidth
                variant="outlined"
                margin="normal"
                value={newStudentId}
                InputProps={{ readOnly: true }}
                onFocus={(e) => e.target.select()}
              />
            </Box>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                name="fullName"
                label="Full Name"
                type="text"
                fullWidth
                variant="standard"
                value={formState.fullName}
                onChange={handleFormChange}
              />
              <TextField
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="standard"
                value={formState.email}
                onChange={handleFormChange}
              />
              {formError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {formError}
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>{newStudentId ? "Done" : "Cancel"}</Button>
          {!newStudentId && (
            <Button onClick={handleCreate} variant="contained">
              Create Student
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseAdminDashboard;
