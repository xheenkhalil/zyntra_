// /frontend/src/pages/SuperAdminCreateGuestQuiz.tsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createGuestQuiz } from '../services/superAdminGuestQuizService';
// --- NEW: Added icons for buttons ---
import { FaArrowLeft, FaPlusCircle } from 'react-icons/fa';

const SuperAdminCreateGuestQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // The success state is fine, but we navigate away so fast it's barely seen.
  // This is okay, as the navigation is the real success indicator.
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !category.trim()) {
      setError('Quiz title and category cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const newQuiz = await createGuestQuiz(title, category);
      setSuccess(
        `Quiz "${newQuiz.title}" created successfully! Redirecting...`
      );
      
      // Navigate to the question manager for the new quiz, as per your logic
      navigate(`/superadmin/guest-quizzes/${newQuiz.id}/questions`);

    } catch (err: unknown) {
      // (Your existing error handling is good)
      interface ErrorWithResponse {
        response?: { data?: { message?: string; }; };
      }
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as ErrorWithResponse).response?.data?.message
      ) {
        setError((err as ErrorWithResponse).response!.data!.message!);
      } else {
        setError('Failed to create guest quiz.');
      }
      console.error('Error creating guest quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* --- UI UPGRADE: Page Header --- */}
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography variant="h5" className="font-bold text-gray-900">
            Create New Guest Quiz
          </Typography>
          <Typography className="text-gray-600">
            Step 1: Define the details.
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
          className="max-w-xl mx-auto" // Constrain width for better readability
        >
          <Typography
            variant="h6"
            className="font-semibold text-gray-900 mb-2"
          >
            Quiz Details
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-6">
            Start by giving your quiz a title and a category. You'll add
            questions in the next step after creation.
          </Typography>

          <TextField
            label="Quiz Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
          <TextField
            label="Category"
            fullWidth
            margin="normal"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={loading}
            helperText="e.g., 'Mathematics', 'Data Science', 'History'"
          />

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
              variant="text" // Use text for a simpler "Cancel"
              onClick={() => navigate('/superadmin/guest-quizzes')}
              className="mr-2 text-gray-600"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="inherit" // Let Tailwind control the color
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-[#1A1F91] hover:bg-[#1A1F91] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              sx={{ border: 'none' }}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <FaPlusCircle />
                )
              }
            >
              {loading ? 'Creating...' : 'Create & Add Questions'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SuperAdminCreateGuestQuiz;