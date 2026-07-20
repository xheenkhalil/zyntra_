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
import axios from 'axios';
import { createGuestQuiz } from '../services/superAdminGuestQuizService';
// --- NEW: Added icons for buttons ---
import { FaArrowLeft, FaPlusCircle } from 'react-icons/fa';

const SuperAdminCreateGuestQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [autoGenerateAi, setAutoGenerateAi] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [error, setError] = useState('');
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
      const newQuiz = await createGuestQuiz(title, category, imageUrl);
      
      if (autoGenerateAi) {
        setSuccess(`Quiz "${newQuiz.title}" created! Generating AI questions...`);
        try {
          await axios.post('/api/superadmin/ai/guest-quiz-questions', {
            topic: `${category} - ${title}`,
            count: questionCount,
            quizId: newQuiz.id
          }, { withCredentials: true });
        } catch (aiErr) {
          console.error("AI Generation failed:", aiErr);
          alert("Quiz created, but AI generation failed.");
        }
      }

      setSuccess(`Quiz "${newQuiz.title}" ready! Redirecting...`);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/api/upload/image', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrl(res.data.url);
    } catch (error) {
      console.error('Upload failed', error);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
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
          <Box display="flex" gap={1} alignItems="center" mt={1}>
            <TextField
              label="Image URL (Optional)"
              fullWidth
              margin="normal"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={loading}
            />
            <Button variant="contained" component="label" disabled={uploadingImage || loading} sx={{ mt: 1, whiteSpace: 'nowrap' }}>
              {uploadingImage ? 'Uploading...' : 'Upload'}
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </Button>
          </Box>

          <Box mt={3} p={2} border={1} borderColor="grey.300" borderRadius={1} bgcolor="#f8f9fa">
            <FormControlLabel
              control={<Switch checked={autoGenerateAi} onChange={(e) => setAutoGenerateAi(e.target.checked)} disabled={loading} />}
              label="Auto-generate Questions via AI"
            />
            {autoGenerateAi && (
              <TextField
                label="Number of Questions"
                type="number"
                fullWidth
                margin="normal"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                disabled={loading}
              />
            )}
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
              className="flex items-center space-x-2 px-4 py-2 bg-[#111A50] hover:bg-[#080D2B] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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