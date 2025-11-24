import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Container,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  getExams,
  createExam,
  archiveExam,
  deleteExam,
  restoreExam,
} from '../services/examService';
import ExamCard from '../components/ExamCard';

interface Exam {
  id: string;
  title: string;
  status: 'draft' | 'live' | 'completed' | 'archived';
  created_at: string;
  total_questions?: number;
  question_types?: string[];
  time_limit?: number;
  stats?: {
    registered?: number;
    completed?: number;
    pending?: number;
    auto_submitted?: number;
    proctoring_defaulters?: number;
  };
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

  // Delete confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  const fetchExams = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getExams();
      setExams(data || []);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        setError((err as { response: { data: { message: string } } }).response.data.message);
      } else {
        setError('Failed to load exams.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // --- Action Handlers ---
  const handleEdit = (examId: string) => {
    navigate(`/courseadmin/exams/${examId}`);
  };

  const handleDelete = (examId: string) => {
    setExamToDelete(examId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!examToDelete) return;

    try {
      const res = await deleteExam(examToDelete);
      setSnackbar({
        open: true,
        message: res?.message || 'Exam deleted successfully!',
      });
      await fetchExams();
    } catch (err: unknown) {
      let message = 'Failed to delete exam.';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
      ) {
        message = (err as { response: { data: { message: string } } }).response.data.message;
      }
      setSnackbar({
        open: true,
        message,
      });
    } finally {
      setConfirmOpen(false);
      setExamToDelete(null);
    }
  };

  const handleArchive = async (examId: string) => {
    try {
      const res = await archiveExam(examId);
      setSnackbar({
        open: true,
        message: res?.message || 'Exam archived successfully!',
      });
      await fetchExams();
    } catch (err: unknown) {
      let message = 'Failed to archive exam.';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
      ) {
        message = (err as { response: { data: { message: string } } }).response.data.message;
      }
      setSnackbar({ open: true, message });
    }
  };

  const handleRestore = async (examId: string) => {
    try {
      const res = await restoreExam(examId);
      setSnackbar({
        open: true,
        message: res?.message || 'Exam restored successfully!',
      });
      await fetchExams();
    } catch (err: unknown) {
      let message = 'Failed to restore exam.';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
      ) {
        message = (err as { response: { data: { message: string } } }).response.data.message;
      }
      setSnackbar({ open: true, message });
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
    } catch (err: unknown) {
      let message = 'Failed to create exam.';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
      ) {
        message = (err as { response: { data: { message: string } } }).response.data.message;
      }
      setDialogError(message);
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
        <Button variant="contained" onClick={fetchExams} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Container>
    );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f9fafb',
        padding: '40px 20px',
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: '#1e293b',
            }}
          >
            Exam Bank
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              background: '#1e3a8a',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
              '&:hover': {
                background: '#1e40af',
                boxShadow: '0 6px 16px rgba(30, 58, 138, 0.4)',
              },
            }}
          >
            Create New Exam
          </Button>
        </Box>

        {/* Exam Cards Grid */}
        {exams.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: 3,
            }}
          >
            {exams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onRestore={handleRestore}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h6" sx={{ color: '#64748b', mb: 2 }}>
              No exams created yet.
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
              Click "Create New Exam" to get started!
            </Typography>
          </Box>
        )}
      </Container>

      {/* Create Exam Dialog */}
      <Dialog
        open={openCreate}
        onClose={handleCloseCreate}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '8px',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
          Create a New Exam
        </DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Exam Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newExamTitle}
            onChange={(e) => setNewExamTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={handleCloseCreate} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            sx={{
              background: '#1e3a8a',
              fontWeight: 600,
              '&:hover': {
                background: '#1e40af',
              },
            }}
          >
            Create & Build
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to permanently delete this exam? All associated data will be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{
              fontWeight: 600,
            }}
          >
            Delete Permanently
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
