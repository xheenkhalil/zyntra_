import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Button, Alert, CircularProgress, Paper,
    TextField, IconButton, List, ListItem, ListItemText, Radio, FormControlLabel,
    Tabs, Tab, Checkbox, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { 
    getExamById, addQuestionToExam, generateAiQuestions, generateFromDocument,
    updateQuestion, deleteQuestion, updateExamSettings
} from '../services/examService';

// Interfaces
interface Option { text: string; isCorrect: boolean; }
interface Question { id: string; question_text: string; options: Option[]; }
interface Exam { id: string; title: string; status: 'draft' | 'live' | 'completed'; questions: Question[]; grading_scale?: any; duration_minutes?: number; }

// --- Reusable Question Form (for Create & Edit) ---
const QuestionForm = ({ examId, onSave, initialQuestion = null, closeDialog }) => {
    const [questionText, setQuestionText] = useState(initialQuestion?.question_text || '');
    const [options, setOptions] = useState(initialQuestion?.options.map(o => ({text: o.text})) || [{ text: '' }, { text: '' }]);
    const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(() => {
        if (!initialQuestion) return null;
        const index = initialQuestion.options.findIndex(opt => opt.isCorrect);
        return index > -1 ? index : null;
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleAddOption = () => setOptions([...options, { text: '' }]);
    const handleRemoveOption = (index: number) => {
        if (correctOptionIndex === index) setCorrectOptionIndex(null);
        setOptions(options.filter((_, i) => i !== index));
    };
    const handleOptionTextChange = (index: number, text: string) => {
        const newOptions = [...options]; newOptions[index].text = text; setOptions(newOptions);
    };

    const handleSubmit = async () => {
        setError('');
        if (!questionText.trim() || correctOptionIndex === null || options.some(opt => !opt.text.trim())) {
            return setError('Please fill out the question, all options, and select a correct answer.');
        }
        setLoading(true);
        const formattedOptions = options.map((opt, index) => ({ text: opt.text, isCorrect: index === correctOptionIndex }));
        const questionData = { questionText, options: formattedOptions };
        try {
            if (initialQuestion) {
                await updateQuestion(initialQuestion.id, questionData);
            } else {
                await addQuestionToExam(examId, questionData);
            }
            onSave();
            closeDialog();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save question.');
        } finally { setLoading(false); }
    };

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField autoFocus label="Question Text" fullWidth multiline rows={3} defaultValue={questionText} onChange={e => setQuestionText(e.target.value)} sx={{ mb: 2 }} />
            <Typography variant="body1" gutterBottom>Options (select the correct answer):</Typography>
            {options.map((opt, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FormControlLabel value={index} control={<Radio checked={correctOptionIndex === index} onChange={() => setCorrectOptionIndex(index)} />} label="" />
                    <TextField size="small" fullWidth label={`Option ${index + 1}`} defaultValue={opt.text} onChange={e => handleOptionTextChange(index, e.target.value)} />
                    <IconButton onClick={() => handleRemoveOption(index)} disabled={options.length <= 2}><DeleteIcon /></IconButton>
                </Box>
            ))}
            <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddOption} sx={{ mt: 1 }}>Add Option</Button>
            <DialogActions>
                <Button onClick={closeDialog}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save Question'}</Button>
            </DialogActions>
        </Box>
    );
};

// --- Reusable sub-component for topic-based AI generation ---
const AiTopicGenerator = ({ examId, onQuestionsAdded }) => {
    const [aiForm, setAiForm] = useState({ topic: '', difficulty: 'Intermediate', numQuestions: 5 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

    const handleGenerate = async () => {
        setLoading(true); setError(''); setGeneratedQuestions([]); setSelectedQuestions([]);
        try {
            const questions = await generateAiQuestions({ ...aiForm, numOptions: 4 });
            setGeneratedQuestions(questions);
        } catch (err: any) { setError(err.message || 'Failed to generate questions.'); }
        finally { setLoading(false); }
    };

    const handleToggleSelect = (index: number) => { setSelectedQuestions(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]); };

    const handleAddSelected = async () => {
        setLoading(true); setError('');
        const questionsToAdd = generatedQuestions.filter((_, index) => selectedQuestions.includes(index));
        try {
            await Promise.all(questionsToAdd.map(q => addQuestionToExam(examId, { questionText: q.questionText, options: q.options })));
            onQuestionsAdded();
            setGeneratedQuestions([]);
            setSelectedQuestions([]);
        } catch (err: any) { setError(err.message || 'Failed to add selected questions.'); }
        finally { setLoading(false); }
    };

    return (
        <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>Generate Questions with AI by Topic</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField label="Topic" value={aiForm.topic} onChange={e => setAiForm({...aiForm, topic: e.target.value})} sx={{flexGrow: 1}} />
                <FormControl sx={{minWidth: 150}}><InputLabel>Difficulty</InputLabel><Select value={aiForm.difficulty} label="Difficulty" onChange={e => setAiForm({...aiForm, difficulty: e.target.value})}><MenuItem value="Easy">Easy</MenuItem><MenuItem value="Intermediate">Intermediate</MenuItem><MenuItem value="Hard">Hard</MenuItem></Select></FormControl>
                <TextField label="# Questions" type="number" value={aiForm.numQuestions} onChange={e => setAiForm({...aiForm, numQuestions: parseInt(e.target.value)})} sx={{width: 120}}/>
                <Button variant="contained" onClick={handleGenerate} disabled={loading || !aiForm.topic}>{loading && generatedQuestions.length === 0 ? <CircularProgress size={24} /> : 'Generate'}</Button>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            {generatedQuestions.length > 0 && ( <Box> <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Review & Select Questions</Typography> <List sx={{border: 1, borderColor: 'divider', borderRadius: 1}}> {generatedQuestions.map((q, index) => ( <ListItem key={index} divider> <Checkbox checked={selectedQuestions.includes(index)} onChange={() => handleToggleSelect(index)} /> <ListItemText primary={q.questionText} secondary={q.options.map(opt => (opt.isCorrect ? `✓ ${opt.text}` : opt.text)).join(' | ')} /> </ListItem> ))} </List> <Box sx={{ mt: 2, textAlign: 'right' }}> <Button variant="contained" onClick={handleAddSelected} disabled={loading || selectedQuestions.length === 0}> {loading ? 'Adding...' : `Add ${selectedQuestions.length} Selected to Exam`} </Button> </Box> </Box> )}
        </Paper>
    );
};

// --- Reusable sub-component for document-based AI generation ---
const AiDocumentGenerator = ({ examId, onQuestionsAdded }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { if (event.target.files && event.target.files[0]) setSelectedFile(event.target.files[0]); };
    const handleGenerate = async () => {
        if (!selectedFile) return setError('Please select a file to upload.');
        setLoading(true); setError(''); setGeneratedQuestions([]); setSelectedQuestions([]);
        try {
            const questions = await generateFromDocument(selectedFile);
            setGeneratedQuestions(questions);
        } catch (err: any) { setError(err.response?.data?.message || 'Failed to generate questions from document.'); }
        finally { setLoading(false); }
    };
    const handleToggleSelect = (index: number) => { setSelectedQuestions(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]); };
    const handleAddSelected = async () => {
        setLoading(true); setError('');
        const questionsToAdd = generatedQuestions.filter((_, index) => selectedQuestions.includes(index));
        try {
            await Promise.all(questionsToAdd.map(q => addQuestionToExam(examId, { questionText: q.questionText, options: q.options })));
            onQuestionsAdded();
            setGeneratedQuestions([]); setSelectedQuestions([]); setSelectedFile(null);
        } catch (err: any) { setError(err.message || 'Failed to add selected questions.'); }
        finally { setLoading(false); }
    };

    return (
        <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>Generate Questions from a Document</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}> Upload PDF or DOCX <input type="file" hidden accept=".pdf,.docx,.txt" onChange={handleFileChange} /> </Button>
                {selectedFile && <Typography variant="body2" sx={{color: 'text.secondary'}}>{selectedFile.name}</Typography>}
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" onClick={handleGenerate} disabled={loading || !selectedFile}>{loading && generatedQuestions.length === 0 ? <CircularProgress size={24} /> : 'Generate Questions'}</Button>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            {generatedQuestions.length > 0 && ( <Box> <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Review & Select Questions</Typography> <List sx={{border: 1, borderColor: 'divider', borderRadius: 1}}> {generatedQuestions.map((q, index) => ( <ListItem key={index} divider> <Checkbox checked={selectedQuestions.includes(index)} onChange={() => handleToggleSelect(index)} /> <ListItemText primary={q.questionText} secondary={q.options.map(opt => (opt.isCorrect ? `✓ ${opt.text}` : opt.text)).join(' | ')} /> </ListItem> ))} </List> <Box sx={{ mt: 2, textAlign: 'right' }}> <Button variant="contained" onClick={handleAddSelected} disabled={loading || selectedQuestions.length === 0}> {loading ? 'Adding...' : `Add ${selectedQuestions.length} Selected to Exam`} </Button> </Box> </Box> )}
        </Paper>
    );
};

// --- Main Component ---
const ExamBuilderPage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [creationMode, setCreationMode] = useState('');
    const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
    
    // Updated State for settings
    const [gradingScale, setGradingScale] = useState({ A: '90', B: '80', C: '70', D: '60', E: '50', F: '40' });
    const [duration, setDuration] = useState('30');

    const fetchExam = async () => {
        if (!examId) return;
        try {
            if (!exam) setLoading(true);
            const data = await getExamById(examId);
            setExam(data);
            if (data.grading_scale) {
                const stringScale = Object.fromEntries(Object.entries(data.grading_scale).map(([grade, value]) => [grade, String(value)]));
                setGradingScale(prev => ({...prev, ...stringScale}));
            }
            if (data.duration_minutes) {
                setDuration(String(data.duration_minutes));
            }
        } catch (err: any) { setError(err.response?.data?.message || 'Failed to load exam details.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchExam(); }, [examId]);

    const handleDelete = async () => {
        if (!questionToDelete) return;
        try {
            await deleteQuestion(questionToDelete.id);
            setQuestionToDelete(null);
            fetchExam();
        } catch (err) { console.error("Failed to delete", err); setQuestionToDelete(null); }
    };

    const handlePublish = async () => {
        if (!exam) return;
        try {
            const numericGradingScale = Object.fromEntries(
                Object.entries(gradingScale).map(([grade, value]) => [grade, Number(value)])
            );
            await updateExamSettings(exam.id, {
                status: 'live',
                grading_scale: numericGradingScale,
                duration_minutes: Number(duration)
            });
            fetchExam();
        } catch (err) { console.error("Failed to publish", err); }
    };
    
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!exam) return <Alert severity="warning">Exam not found.</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" gutterBottom>Exam Builder: {exam.title}</Typography>
                <Chip label={exam.status} color={exam.status === 'live' ? 'success' : (exam.status === 'completed' ? 'info' : 'default')} />
            </Box>

            {exam.status === 'draft' && (
                <Paper sx={{ p: 3, mb: 4, border: 1, borderColor: 'primary.main' }}>
                    <Typography variant="h6" gutterBottom>Settings & Publish</Typography>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Exam Duration (minutes)"
                            type="number"
                            size="small"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                            sx={{ mb: 3, width: 250 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="body1" sx={{fontWeight: 600, mr: 1}}>Grading Scale (%):</Typography>
                            <TextField label="A >=" size="small" value={gradingScale.A} onChange={e => setGradingScale({...gradingScale, A: e.target.value})} sx={{width: 90}} />
                            <TextField label="B >=" size="small" value={gradingScale.B} onChange={e => setGradingScale({...gradingScale, B: e.target.value})} sx={{width: 90}} />
                            <TextField label="C >=" size="small" value={gradingScale.C} onChange={e => setGradingScale({...gradingScale, C: e.target.value})} sx={{width: 90}} />
                            <TextField label="D >=" size="small" value={gradingScale.D} onChange={e => setGradingScale({...gradingScale, D: e.target.value})} sx={{width: 90}} />
                            <TextField label="E >=" size="small" value={gradingScale.E} onChange={e => setGradingScale({...gradingScale, E: e.target.value})} sx={{width: 90}} />
                            <TextField label="F <"  size="small" value={gradingScale.F} onChange={e => setGradingScale({...gradingScale, F: e.target.value})} sx={{width: 90}} />
                            <Box flexGrow={1} />
                            <Button variant="contained" color="success" onClick={handlePublish} disabled={exam.questions.length === 0}>Save Settings & Publish</Button>
                        </Box>
                    </Box>
                </Paper>
            )}

            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6">Existing Questions ({exam.questions.length})</Typography>
                <List>
                    {exam.questions.map((q, index) => (
                        <ListItem key={q.id} divider
                            secondaryAction={ exam.status !== 'completed' ?
                                <><IconButton edge="end" aria-label="edit" onClick={() => setQuestionToEdit(q)}><EditIcon /></IconButton><IconButton edge="end" aria-label="delete" onClick={() => setQuestionToDelete(q)}><DeleteIcon /></IconButton></> : null
                            }
                        >
                            <ListItemText primary={`${index + 1}. ${q.question_text}`} />
                        </ListItem>
                    ))}
                    {exam.questions.length === 0 && <Typography sx={{mt: 2, color: 'text.secondary'}}>No questions added yet.</Typography>}
                </List>
            </Paper>
            
            {exam.status !== 'completed' && (
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={creationMode} onChange={(e, newValue) => setCreationMode(newValue)}>
                      <Tab label="Add Manually" value="manual" />
                      <Tab label="AI Generate (Topic)" value="ai_topic" />
                      <Tab label="AI Generate (Document)" value="ai_doc" />
                  </Tabs>
              </Box>
            )}

            {creationMode === 'ai_topic' && <AiTopicGenerator examId={exam.id} onQuestionsAdded={fetchExam} />}
            {creationMode === 'ai_doc' && <AiDocumentGenerator examId={exam.id} onQuestionsAdded={fetchExam} />}
            
            <Dialog open={creationMode === 'manual'} onClose={() => setCreationMode('')} fullWidth maxWidth="md">
                <DialogTitle>Add New Question Manually</DialogTitle>
                <DialogContent><QuestionForm examId={exam.id} onSave={fetchExam} closeDialog={() => setCreationMode('')} /></DialogContent>
            </Dialog>

            <Dialog open={!!questionToEdit} onClose={() => setQuestionToEdit(null)} fullWidth maxWidth="md">
                <DialogTitle>Edit Question</DialogTitle>
                <DialogContent>{questionToEdit && <QuestionForm examId={exam.id} onSave={fetchExam} initialQuestion={questionToEdit} closeDialog={() => setQuestionToEdit(null)} />}</DialogContent>
            </Dialog>

            <Dialog open={!!questionToDelete} onClose={() => setQuestionToDelete(null)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent><Typography>Are you sure you want to delete this question: "{questionToDelete?.question_text}"?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setQuestionToDelete(null)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExamBuilderPage;