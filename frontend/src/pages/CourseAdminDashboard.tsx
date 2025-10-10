// /frontend/src/pages/CourseAdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, Button, Alert, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Dialog, DialogActions, DialogContent, DialogTitle, TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getStudents, createStudent } from '../services/courseAdminService';
import { useAuth } from '../context/AuthContext';

interface Student {
    id: string;
    full_name: string;
    email: string;
    student_id: string;
    created_at: string;
}

const CourseAdminDashboard = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [open, setOpen] = useState(false);
    const [formState, setFormState] = useState({ fullName: '', email: '' });
    const [formError, setFormError] = useState('');
    
    // CORRECTED: State now only holds the student_id
    const [newStudentId, setNewStudentId] = useState<string | null>(null);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const studentData = await getStudents();
            setStudents(studentData);
        } catch (err) {
            setError('Failed to fetch students.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormError('');
        setNewStudentId(null);
        setFormState({ fullName: '', email: '' });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleCreate = async () => {
        setFormError('');
        try {
            const data = await createStudent(formState);
            // CORRECTED: Only set the student_id
            setNewStudentId(data.user.student_id);
            fetchStudents(); // Refresh the list
        } catch (err: any) {
            setFormError(err.message || 'Failed to create student.');
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" gutterBottom>Course Admin Dashboard</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>Add Student</Button>
            </Box>
            <Typography>Welcome, {user?.fullName}!</Typography>
            
            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Manage Students</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead><TableRow><TableCell>Student ID</TableCell><TableCell>Full Name</TableCell><TableCell>Email</TableCell><TableCell>Date Joined</TableCell></TableRow></TableHead>
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
                <DialogTitle>{newStudentId ? 'Student Created Successfully!' : 'Add a New Student'}</DialogTitle>
                <DialogContent>
                    {newStudentId ? (
                        // CORRECTED: Updated success message
                        <Box>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Please securely share the following Student ID with the new student. They will use this to log in.
                            </Typography>
                            <TextField label="Student ID" fullWidth variant="outlined" margin="normal" value={newStudentId} InputProps={{ readOnly: true }} onFocus={(e) => e.target.select()} />
                        </Box>
                    ) : (
                        <>
                            <TextField autoFocus margin="dense" name="fullName" label="Full Name" type="text" fullWidth variant="standard" onChange={handleFormChange} />
                            <TextField margin="dense" name="email" label="Email Address" type="email" fullWidth variant="standard" onChange={handleFormChange} />
                            {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        {newStudentId ? 'Done' : 'Cancel'}
                    </Button>
                    {!newStudentId && <Button onClick={handleCreate}>Create Student</Button>}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CourseAdminDashboard;