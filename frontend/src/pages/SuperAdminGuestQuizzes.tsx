// /frontend/src/pages/SuperAdminGuestQuizzes.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility'; // "Manage Questions"
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { getAllGuestQuizzes, deleteGuestQuiz } from '../services/superAdminGuestQuizService';
import type { GuestQuiz } from '../services/superAdminGuestQuizService';

const SuperAdminGuestQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<GuestQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- NEW: State for Menus and Dialogs ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<GuestQuiz | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllGuestQuizzes();
      setQuizzes(data);
    } catch (err: unknown) {
      setError('Failed to fetch guest quizzes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // --- NEW: Handlers for Menu ---
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, quiz: GuestQuiz) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedQuiz(quiz);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Do NOT clear selectedQuiz here, as it is needed for the dialogs
  };

  const handleDialogClose = () => {
    setConfirmOpen(false);
    setSelectedQuiz(null); // Clear it when dialog closes
  };

  // --- Navigation Handlers ---
  const handleCreateQuiz = () => {
    navigate('/superadmin/guest-quizzes/new');
  };

  const handleEditQuiz = () => {
    if (selectedQuiz) {
      navigate(`/superadmin/guest-quizzes/${selectedQuiz.id}/edit`);
    }
    handleMenuClose();
  };

  const handleManageQuestions = () => {
    if (selectedQuiz) {
      navigate(`/superadmin/guest-quizzes/${selectedQuiz.id}/questions`);
    }
    handleMenuClose();
  };

  // --- NEW: Handlers for Delete Dialog ---
  const handleOpenDeleteConfirm = () => {
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleCloseDeleteConfirm = () => {
    handleDialogClose();
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;

    setDeleteLoading(true);
    try {
      await deleteGuestQuiz(selectedQuiz.id);
      setSnackbar({ open: true, message: 'Quiz deleted successfully.' });
      await fetchQuizzes(); // Refresh the list
    } catch (err: unknown) {
      setSnackbar({ open: true, message: 'Failed to delete quiz.' });
      console.error(err);
    } finally {
      setDeleteLoading(false);
      handleCloseDeleteConfirm();
    }
  };

  // --- NEW: Handle Publish/Unpublish ---
  const handleToggleStatus = async () => {
    if (!selectedQuiz) return;

    const newStatus = selectedQuiz.status === 'draft' ? 'published' : 'draft';
    try {
      // We need to pass title and category as well, so we use the existing values
      await import('../services/superAdminGuestQuizService').then(mod =>
        mod.updateGuestQuiz(selectedQuiz.id, {
          title: selectedQuiz.title,
          category: selectedQuiz.category,
          status: newStatus
        })
      );
      setSnackbar({ open: true, message: `Quiz ${newStatus === 'published' ? 'published' : 'unpublished'} successfully.` });
      await fetchQuizzes();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to update quiz status.' });
    } finally {
      handleMenuClose();
    }
  };

  // --- RENDER STATES ---
  if (loading && quizzes.length === 0) {
    return (
      <Box className="flex justify-center items-center h-[calc(100vh-200px)]">
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      {/* --- Page Header --- */}
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="font-bold text-gray-900">
          Guest Quizzes Management
        </Typography>
        {/* --- UI UPGRADE: Styled Button --- */}
        <Button
          color="inherit"
          onClick={handleCreateQuiz}
          className="flex items-center space-x-2 px-4 py-2 bg-[#1A1F91] hover:bg-[#1A1F91] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          startIcon={<AddIcon />}
          sx={{ border: 'none' }}
        >
          Create New Quiz
        </Button>
      </Box>

      {/* --- UI UPGRADE: Styled Paper Container --- */}
      <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Participants</TableCell>
                <TableCell align="right">Avg. Rating</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizzes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography className="text-gray-500 py-4">
                      No guest quizzes found. Start by creating a new one!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                quizzes.map((quiz) => (
                  <TableRow key={quiz.id} hover>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell className="capitalize">{quiz.category}</TableCell>
                    <TableCell>
                      {/* --- UI UPGRADE: Tailwind-styled Chips --- */}
                      <Chip
                        label={quiz.status}
                        size="small"
                        className={
                          quiz.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      />
                    </TableCell>
                    <TableCell align="right">{quiz.participant_count}</TableCell>
                    <TableCell align="right">
                      {quiz.average_rating !== null && quiz.average_rating !== undefined
                        ? Number(quiz.average_rating).toFixed(1)
                        : 'N/A'}
                    </TableCell>
                    {/* --- UI UPGRADE: "..." Menu for Actions --- */}
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuClick(e, quiz)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- NEW: "..." Menu --- */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditQuiz}>
          <EditIcon className="mr-3" fontSize="small" />
          Edit Details
        </MenuItem>
        <MenuItem onClick={handleManageQuestions}>
          <VisibilityIcon className="mr-3" fontSize="small" />
          Manage Questions
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {selectedQuiz?.status === 'draft' ? (
            <>
              <span className="mr-3 text-green-600 font-bold">↑</span> Publish Quiz
            </>
          ) : (
            <>
              <span className="mr-3 text-yellow-600 font-bold">↓</span> Unpublish Quiz
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleOpenDeleteConfirm} sx={{ color: 'error.main' }}>
          <DeleteIcon className="mr-3" fontSize="small" />
          Delete Quiz
        </MenuItem>
      </Menu>

      {/* --- NEW: Delete Confirmation Dialog --- */}
      <Dialog open={confirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Delete Guest Quiz?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete the quiz
            <strong> "{selectedQuiz?.title}"</strong>?
          </DialogContentText>
          <DialogContentText color="error" className="font-medium mt-2">
            This will also delete all of its questions and submission data. This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button
            onClick={handleDeleteQuiz}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- NEW: Feedback Snackbar --- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default SuperAdminGuestQuizzes;