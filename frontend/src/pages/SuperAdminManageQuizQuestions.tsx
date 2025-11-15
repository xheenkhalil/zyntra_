// /frontend/src/pages/SuperAdminManageQuizQuestions.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Radio,
  FormControlLabel,
  RadioGroup,
  // Grid, // <-- No longer needed
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
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getGuestQuizById,
  addGuestQuizQuestion,
  updateGuestQuizQuestion,
  deleteGuestQuizQuestion,
} from '../services/superAdminGuestQuizService';

// --- Type Interfaces ---
interface GuestQuiz {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'published';
  questions: GuestQuestion[];
}

interface Option {
  text: string;
  isCorrect: boolean;
}

interface GuestQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: Option[];
}

const SuperAdminManageQuizQuestions: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<GuestQuiz | null>(null);
  const [questions, setQuestions] = useState<GuestQuestion[]>([]);
  
  // --- Form State ---
  const [formTitle, setFormTitle] = useState('Add New Question');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState<Option[]>([
    { text: '', isCorrect: true }, // Start with one correct option
    { text: '', isCorrect: false },
  ]);
  const [editingQuestion, setEditingQuestion] = useState<GuestQuestion | null>(null);

  // --- System State ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<GuestQuestion | null>(null);

  // --- Fetch Quiz & Questions ---
  const fetchQuizAndQuestions = useCallback(async () => {
    if (!quizId) {
      setError('Quiz ID is missing.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await getGuestQuizById(quizId);
      setQuiz(data);
      setQuestions(data.questions || []);
    } catch (err: unknown) {
      setError('Failed to fetch quiz and questions.');
      console.error('Error fetching quiz and questions:', err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuizAndQuestions();
  }, [fetchQuizAndQuestions]);

  // --- Form Reset Utility ---
  const resetForm = () => {
    setEditingQuestion(null);
    setFormTitle('Add New Question');
    setNewQuestionText('');
    setNewOptions([
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
    ]);
    setError('');
    setSuccess('');
  };

  // --- Option Handlers for the Form ---
  const handleAddOption = () => {
    if (newOptions.length < 6) { // Limit options
      setNewOptions([...newOptions, { text: '', isCorrect: false }]);
    }
  };

  const handleOptionTextChange = (index: number, value: string) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index].text = value;
    setNewOptions(updatedOptions);
  };
  
  const handleCorrectOptionChange = (index: number) => {
    const updatedOptions = newOptions.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setNewOptions(updatedOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (newOptions.length > 2) {
      const updatedOptions = newOptions.filter((_, i) => i !== index);
      if (!updatedOptions.some(opt => opt.isCorrect)) {
        updatedOptions[0].isCorrect = true;
      }
      setNewOptions(updatedOptions);
    }
  };

  // --- Add or Update Question ---
  const handleAddUpdateQuestion = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!quizId) return setError('Quiz ID is missing.');
    if (!newQuestionText.trim()) return setError('Question text cannot be empty.');
    
    const validOptions = newOptions.filter(opt => opt.text.trim());
    if (validOptions.length < 2) return setError('Please provide at least two non-empty options.');
    if (!validOptions.some(opt => opt.isCorrect)) return setError('At least one option must be marked as correct.');

    setSaving(true);
    
    try {
      const payload = {
        question_text: newQuestionText,
        options: validOptions,
      };

      if (editingQuestion) {
        // --- Update existing question ---
        const updatedQuestion = await updateGuestQuizQuestion(editingQuestion.id, payload as any); // Cast as any to avoid type conflicts on payload
        setQuestions(questions.map(q =>
            q.id === updatedQuestion.id ? { ...q, ...updatedQuestion } : q
        ));
        setSnackbar({ open: true, message: 'Question updated successfully!' });
      } else {
        // --- Add new question ---
        const addedQuestion = await addGuestQuizQuestion(quizId, payload);
        setQuestions([...questions, addedQuestion]);
        setSuccess('Question added successfully!');
      }
      resetForm(); // Reset form on success
    } catch (err: unknown) {
      console.error('Error saving question:', err);
      setError('Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  // --- Edit/Delete Handlers ---
  const handleEditClick = (question: GuestQuestion) => {
    setEditingQuestion(question);
    setFormTitle('Edit Question');
    setNewQuestionText(question.question_text);
    setNewOptions(question.options);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteConfirm = (question: GuestQuestion) => {
    setQuestionToDelete(question);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    
    setSaving(true);
    try {
      await deleteGuestQuizQuestion(questionToDelete.id);
      setQuestions(questions.filter(q => q.id !== questionToDelete.id));
      setSnackbar({ open: true, message: 'Question deleted successfully!' });
      if(editingQuestion?.id === questionToDelete.id) {
        resetForm();
      }
    } catch (err: unknown) {
      setSnackbar({ open: true, message: 'Failed to delete question.' });
      console.error('Error deleting question:', err);
    } finally {
      setSaving(false);
      setDeleteConfirmOpen(false);
      setQuestionToDelete(null);
    }
  };

  // --- UI ---
  if (loading) {
    return (
      <Box className="flex justify-center items-center h-[calc(100vh-200px)]">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !quiz) return <Alert severity="error">{error}</Alert>;
  if (!quiz) return <Alert severity="info">Quiz not found or not loaded.</Alert>;

  return (
    <Box>
      {/* --- Page Header --- */}
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography variant="h5" className="font-bold text-gray-900">
            Manage Questions
          </Typography>
          <Typography className="text-gray-600">
            For Quiz: <span className="font-semibold">{quiz.title}</span>
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

      {/* --- FIX: Replaced <Grid container> with <Box> and Tailwind grid classes --- */}
      <Box className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- Column 1: Add/Edit Form --- */}
        {/* --- FIX: Replaced <Grid item> with <Box> and Tailwind col-span classes --- */}
        <Box className="lg:col-span-5">
          <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-24">
            <Typography variant="h6" className="font-semibold text-gray-900 mb-6">
              {formTitle}
            </Typography>

            <Box component="form" onSubmit={handleAddUpdateQuestion}>
              <TextField
                label="Question Text"
                fullWidth
                multiline
                rows={3}
                margin="normal"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                required
                disabled={saving}
              />

              <Box className="mt-4 mb-2">
                <Typography variant="subtitle1" className="font-semibold text-gray-800 mb-2">
                  Options
                </Typography>
                
                <RadioGroup
                  value={newOptions.findIndex(opt => opt.isCorrect)}
                  onChange={(e) => handleCorrectOptionChange(Number(e.target.value))}
                >
                  {newOptions.map((option, index) => (
                    <Box key={index} className="flex items-center mb-2">
                      <FormControlLabel 
                        value={index} 
                        control={<Radio size="small" />} 
                        label=""
                        className="mr-1"
                        disabled={saving}
                      />
                      <TextField
                        label={`Option ${index + 1}`}
                        fullWidth
                        size="small"
                        value={option.text}
                        onChange={(e) => handleOptionTextChange(index, e.target.value)}
                        required
                        disabled={saving}
                      />
                      {newOptions.length > 2 && (
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveOption(index)} 
                          disabled={saving}
                          className="ml-1"
                        >
                          <FaTimes size={16} />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </RadioGroup>
                
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddOption}
                  variant="outlined"
                  size="small"
                  className="mt-1"
                  disabled={saving || newOptions.length >= 6}
                >
                  Add Option
                </Button>
              </Box>

              {error && <Alert severity="error" className="mt-4">{error}</Alert>}
              {success && <Alert severity="success" className="mt-4">{success}</Alert>}

              <Box className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                {editingQuestion && (
                  <Button
                    variant="text"
                    onClick={resetForm}
                    className="text-gray-600"
                    disabled={saving}
                  >
                    Cancel Edit
                  </Button>
                )}
                <Button
                  type="submit"
                  color="inherit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  sx={{ border: 'none', ml: 'auto' }}
                  startIcon={
                    saving ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <FaSave />
                    )
                  }
                >
                  {saving ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* --- Column 2: Existing Questions List --- */}
        {/* --- FIX: Replaced <Grid item> with <Box> and Tailwind col-span classes --- */}
        <Box className="lg:col-span-7">
          <Typography variant="h6" className="font-semibold text-gray-900 mb-6">
            Existing Questions ({questions.length})
          </Typography>
          {questions.length === 0 ? (
            <Alert severity="info">No questions added to this quiz yet.</Alert>
          ) : (
            <Box className="space-y-4">
              {questions.map((question, qIndex) => (
                <Paper key={question.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <Box className="flex justify-between items-start">
                    <Typography className="font-semibold text-gray-900 mb-2 pr-4">
                      {qIndex + 1}. {question.question_text}
                    </Typography>
                    <Box className="flex-shrink-0">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditClick(question)} 
                        disabled={saving}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => openDeleteConfirm(question)} 
                        disabled={saving}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box className="pl-4">
                    {question.options.map((option, idx) => (
                      <Typography
                        key={idx}
                        variant="body2"
                        className={`pl-2 ${
                          option.isCorrect ? 'text-green-600 font-bold' : 'text-gray-600'
                        }`}
                      >
                        {option.isCorrect ? '✅ ' : '- '} {option.text}
                      </Typography>
                    ))}
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Box>
      
      {/* --- Delete Confirmation Dialog --- */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Question?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this question?
          </DialogContentText>
          <Paper variant="outlined" className="p-3 mt-2 bg-gray-50">
            <Typography variant="body2" className="text-gray-800">
              {questionToDelete?.question_text}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteQuestion}
            color="error"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* --- Feedback Snackbar --- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default SuperAdminManageQuizQuestions;