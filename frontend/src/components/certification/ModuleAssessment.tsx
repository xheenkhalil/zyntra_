import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Radio, RadioGroup, FormControlLabel, FormControl, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

interface Question {
  id: string;
  question_text: string;
  options: { text: string }[];
}

interface ModuleAssessmentProps {
  certificationId: string;
  moduleId: string;
  onPass: () => void;
}

const ModuleAssessment: React.FC<ModuleAssessmentProps> = ({ certificationId, moduleId, onPass }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ passed: boolean, score: number, attempts: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [moduleId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/certifications/modules/${moduleId}/assessment`, { withCredentials: true });
      setQuestions(res.data);
      setResult(null);
      setAnswers({});
    } catch (err: any) {
      setError('Failed to load assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await axios.post(
        `/api/certifications/${certificationId}/modules/${moduleId}/assessment`, 
        { answers }, 
        { withCredentials: true }
      );
      setResult(res.data);
      if (res.data.passed) {
        onPass();
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to submit assessment.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (questions.length === 0) return <Alert severity="warning">No assessment questions available for this module.</Alert>;

  return (
    <Box maxWidth="800px" mx="auto">
      <Typography variant="h4" fontWeight="bold" mb={4} color="#111A50">Module Assessment</Typography>

      {result ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h5" fontWeight="bold" color={result.passed ? 'success.main' : 'error.main'} mb={2}>
            {result.passed ? 'Congratulations! You Passed!' : 'Assessment Failed'}
          </Typography>
          <Typography variant="h6" mb={2}>Score: {Math.round(result.score)}%</Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>Attempt {result.attempts} of 3</Typography>
          
          {!result.passed && result.attempts < 3 && (
            <Button variant="contained" color="primary" onClick={fetchQuestions}>
              Retake Assessment
            </Button>
          )}
        </Paper>
      ) : (
        <Paper sx={{ p: {xs: 3, md: 5}, borderRadius: 3, boxShadow: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
          
          {questions.map((q, idx) => (
            <Box key={q.id} mb={4}>
              <Typography variant="h6" mb={2}>{idx + 1}. {q.question_text}</Typography>
              <FormControl component="fieldset">
                <RadioGroup 
                  value={answers[q.id] || ''} 
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                >
                  {q.options.map((opt, oIdx) => (
                    <FormControlLabel 
                      key={oIdx} 
                      value={opt.text} 
                      control={<Radio />} 
                      label={opt.text} 
                      sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontSize: '1rem', color: '#374151' } }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          ))}

          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ModuleAssessment;
