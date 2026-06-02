// frontend/src/pages/CourseAdminStudents.tsx

import React, { useState, useEffect, useRef } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileUploadIcon from "@mui/icons-material/FileUpload";

// --- Import the new bulk upload function ---
import { getStudents, createStudent, bulkUploadStudents } from "../services/courseAdminService";

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
    // --- State Definitions ---
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [open, setOpen] = useState(false);
    const [formState, setFormState] = useState<FormState>({ fullName: "", email: "" });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [newStudentId, setNewStudentId] = useState<string | null>(null);

    // --- New State for Bulk Upload ---
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

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

    // === Create Student (Individual) ===
    const handleCreate = async (): Promise<void> => {
        setFormError("");
        setFormLoading(true);
        try {
            const data = await createStudent(formState);
            if (!data?.user?.student_id) throw new Error("Invalid server response.");
            setNewStudentId(data.user.student_id);
            setFormLoading(false);
            await fetchStudents();
            setSnackbar({ open: true, message: "Student registered successfully!", severity: "success" });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to create student.";
            setFormError(message);
            setFormLoading(false);
        }
    };

    // === Bulk Upload Handlers (NEW) ===
    const handleBulkClick = () => {
        // Trigger the hidden file input
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset input so same file can be selected again if needed
        event.target.value = "";

        if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
            setSnackbar({ open: true, message: "Please upload a valid CSV file.", severity: "error" });
            return;
        }

        setUploading(true);
        try {
            const result = await bulkUploadStudents(file);
            await fetchStudents(); // Refresh list

            const msg = `Success! Registered: ${result.registeredCount}, Skipped (Duplicates): ${result.skippedCount}`;
            setSnackbar({ open: true, message: msg, severity: "success" });

        } catch (err: any) {
            const message = err.response?.data?.message || "Failed to upload students.";
            setSnackbar({ open: true, message: message, severity: "error" });
        } finally {
            setUploading(false);
        }
    };

    const handleCopyId = (): void => {
        if (newStudentId) {
            void navigator.clipboard.writeText(newStudentId);
            setSnackbar({ open: true, message: "Student ID copied!", severity: "success" });
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

    return (
        <Box>
            {/* --- Page Header --- */}
            <Box className="flex justify-between items-center mb-6">
                <Typography variant="h5" className="font-bold text-gray-900">
                    Student Management
                </Typography>
                <Box className="flex space-x-3">

                    {/* --- Bulk Upload Input (Hidden) --- */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept=".csv"
                        onChange={handleFileChange}
                    />

                    {/* --- Bulk Upload Button --- */}
                    <Button
                        variant="outlined"
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
                        onClick={handleBulkClick}
                        disabled={uploading}
                    >
                        {uploading ? "Uploading..." : "Bulk Upload CSV"}
                    </Button>

                    {/* --- Add Student Button --- */}
                    <Button
                        color="inherit"
                        startIcon={<AddIcon />}
                        onClick={handleOpen}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#3C4DCE] hover:bg-[#2C31B9] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        sx={{ border: 'none' }}
                        disabled={uploading}
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
            <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <Typography variant="h6" className="font-semibold text-gray-900 mb-4">
                    Enrolled Students ({students.length})
                </Typography>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell className="font-bold text-gray-700">Full Name</TableCell>
                                <TableCell className="font-bold text-gray-700">Student ID</TableCell>
                                <TableCell className="font-bold text-gray-700">Email</TableCell>
                                <TableCell className="font-bold text-gray-700">Date Joined</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" className="text-gray-500">
                                        No students have been added to your organization yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student) => (
                                    <TableRow key={student.id} hover className="hover:bg-gray-50">
                                        <TableCell className="font-medium text-gray-900">{student.full_name}</TableCell>
                                        <TableCell>{student.student_id}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* --- Add Student Dialog --- */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle className="font-bold text-gray-900">
                    {newStudentId ? "Student Created Successfully!" : "Add a New Student"}
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
                        <Box component="form" onSubmit={(e) => { e.preventDefault(); void handleCreate(); }}>
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
                            onClick={handleCreate}
                            variant="contained"
                            disabled={formLoading}
                            startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                        >
                            {formLoading ? "Creating..." : "Create Student"}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CourseAdminStudents;