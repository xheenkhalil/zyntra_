// /frontend/src/pages/SuperAdminEditGuestQuiz.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getGuestQuizById, updateGuestQuiz } from '../services/superAdminGuestQuizService';
// --- NEW: Added icons ---
import { FaArrowLeft, FaSave, FaEdit } from 'react-icons/fa';

interface GuestQuizDetails {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'published';
  average_rating: number | null;
  participant_count?: number; // Added this from your other file
}

const SuperAdminEditGuestQuiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<GuestQuizDetails | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchQuizDetails = async () => {
      if (!quizId) {
        setError('Quiz ID is missing.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const data = await getGuestQuizById(quizId); // This needs to fetch all quiz data
        setQuiz(data);
        setTitle(data.title);
        setCategory(data.category);
        setStatus(data.status);
      } catch (err: unknown) {
        // (Your existing error handling is good)
        setError('Failed to fetch quiz details.');
        console.error('Error fetching quiz details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!quizId) {
      setError('Quiz ID is missing for update.');
      return;
    }
    if (!title.trim() || !category.trim()) {
      setError('Quiz title and category cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const updatedQuiz = await updateGuestQuiz(quizId, {
        title,
        category,
        status,
      });
      setSuccess(`Quiz "${updatedQuiz.title}" updated successfully!`);
      setQuiz(updatedQuiz); // Update local state with fresh data
    } catch (err: unknown) {
      // (Your existing error handling is good)
      setError('Failed to update guest quiz.');
      console.error('Error updating guest quiz:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box className="flex justify-center items-center h-[calc(100vh-200px)]">
        <CircularProgress />
      </Box>
    );

  if (error && !quiz) return <Alert severity="error">{error}</Alert>;
  if (!quiz) return <Alert severity="info">Quiz not found or not loaded.</Alert>;

  return (
    <Box>
      {/* --- UI UPGRADE: Page Header --- */}
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography variant="h5" className="font-bold text-gray-900">
            Edit Guest Quiz
          </Typography>
          <Typography className="text-gray-600">
            Update details for "{quiz.title}"
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FaArrowLeft />}
          onClick={() => navigate('/superadmin/guest-quizzes')}
        >
          Back to List
        </Button>
      </Box>

      {/* --- UI UPGRADE: Styled Paper Container --- */}
      <Paper className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
        <Box
          component="form"
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto" // Constrain width
        >
          <Typography
            variant="h6"
            className="font-semibold text-gray-900 mb-6"
          >
            Quiz Details
          </Typography>

          <TextField
            label="Quiz Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={saving}
          />
          <TextField
            label="Category"
            fullWidth
            margin="normal"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={saving}
          />
          <TextField
            select
            label="Status"
            fullWidth
            margin="normal"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as 'draft' | 'published')
            }
            disabled={saving}
          >
            <MenuItem value="draft">Draft (Hidden from public)</MenuItem>
            <MenuItem value="published">Published (Visible to public)</MenuItem>
          </TextField>

          {/* --- UI UPGRADE: "Manage Questions" Button --- */}
          <Box className="my-4 pt-4 border-t border-gray-200">
            <Typography variant="body2" className="text-gray-600 mb-2">
              You can add, edit, or remove questions for this quiz separately.
            </Typography>
            <Button
              variant="outlined"
              color="secondary" // Use MUI secondary color
              className="w-full"
              startIcon={<FaEdit />}
              onClick={() =>
                navigate(`/superadmin/guest-quizzes/${quiz.id}/questions`)
              }
            >
              Manage Questions
            </Button>
          </Box>

          {error && (
            <Alert severity="error" className="mt-4">
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" className="mt-4">
              {success}
            </Alert>
          )}

          {/* --- UI UPGRADE: Styled Buttons --- */}
          <Box className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="text"
              onClick={() => navigate('/superadmin/guest-quizzes')}
              className="mr-2 text-gray-600"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="inherit" // Let Tailwind control
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-[#3C4DCE] hover:bg-[#2C31B9] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              sx={{ border: 'none' }}
              startIcon={
                saving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <FaSave />
                )
              }
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SuperAdminEditGuestQuiz;