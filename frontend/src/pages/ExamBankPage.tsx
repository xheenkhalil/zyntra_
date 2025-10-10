import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Snackbar,
  Container,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  getExams,
  createExam,
  archiveExam,
  deleteExam,
  restoreExam, // Assuming restoreExam exists in your examService
} from '../services/examService';

interface Exam {
  id: string;
  title: string;
  status: 'draft' | 'live' | 'completed' | 'archived';
  created_at: string;
}

const ExamBankPage: React.FC = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Create Exam dialog state
  const [openCreate, setOpenCreate] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [dialogError, setDialogError] = useState('');

  // Action menu and confirmation dialog
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<'archive' | 'delete' | 'restore' | null>(null);

  const fetchExams = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getExams();
      setExams(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // --- Action Handlers ---
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, exam: Exam) => {
    setAnchorEl(event.currentTarget);
    setSelectedExam(exam);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleAction = (action: 'archive' | 'delete' | 'restore') => {
    handleMenuClose();
    setActionToConfirm(action);
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedExam || !actionToConfirm) return;

    try {
      let res;

      if (actionToConfirm === 'archive') {
        res = await archiveExam(selectedExam.id);
      } else if (actionToConfirm === 'delete') {
        res = await deleteExam(selectedExam.id);
      } else if (actionToConfirm === 'restore') {
        res = await restoreExam(selectedExam.id);
      }

      setSnackbar({
        open: true,
        message: res?.message || 'Action completed successfully!',
      });

      await fetchExams();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Action failed.',
      });
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleOpenCreate = () => setOpenCreate(true);

  const handleCloseCreate = () => {
    setOpenCreate(false);
    setDialogError('');
    setNewExamTitle('');
  };

  const handleCreate = async () => {
    setDialogError('');
    if (!newExamTitle.trim()) return setDialogError('Exam title is required.');

    try {
      const newExam = await createExam(newExamTitle.trim());
      handleCloseCreate();
      navigate(`/courseadmin/exams/${newExam.id}`);
    } catch (err: any) {
      setDialogError(err.response?.data?.message || 'Failed to create exam.');
    }
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={fetchExams}>
          Retry
        </Button>
      </Container>
    );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Exam Bank
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Create New Exam
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.length > 0 ? (
              exams.map((exam) => (
                <TableRow key={exam.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{exam.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={exam.status}
                      size="small"
                      color={
                        exam.status === 'live'
                          ? 'success'
                          : exam.status === 'draft'
                          ? 'warning'
                          : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>{new Date(exam.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => navigate(`/courseadmin/exams/${exam.id}`)}
                      title="Edit / View"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={(e) => handleMenuClick(e, exam)}
                      title="More Actions"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No exams created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedExam?.status === 'archived' ? (
          <MenuItem onClick={() => handleAction('restore')}>Restore to Draft</MenuItem>
        ) : (
          <MenuItem onClick={() => handleAction('archive')}>Archive</MenuItem>
        )}
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      {/* Create Exam Dialog */}
      <Dialog open={openCreate} onClose={handleCloseCreate}>
        <DialogTitle>Create a New Exam</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Exam Title"
            type="text"
            fullWidth
            variant="standard"
            value={newExamTitle}
            onChange={(e) => setNewExamTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>Cancel</Button>
          <Button onClick={handleCreate}>Create & Build</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionToConfirm} the exam "{selectedExam?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            color={actionToConfirm === 'delete' ? 'error' : 'primary'}
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
    </Box>
  );
};

export default ExamBankPage;
