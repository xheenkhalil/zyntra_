// /frontend/src/pages/ExamBuilderPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Paper,
    TextField,
    IconButton,
    List,
    ListItem,
    Radio,
    FormControlLabel,
    Checkbox,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Divider,
    Switch,
    Tooltip,
    InputAdornment,
} from '@mui/material';
import {
    AddCircleOutline as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ArrowBack as ArrowBackIcon,
    Settings as SettingsIcon,
    Save as SaveIcon,
    Timer as TimerIcon,
    Security as SecurityIcon,
    Close as CloseIcon,
    Description as DescriptionIcon,
    AutoAwesome as AutoAwesomeIcon,
    Functions as FunctionsIcon,
} from '@mui/icons-material';

// Import Services
import {
    getExamById,
    addQuestionToExam,
    updateQuestionInExam,
    deleteQuestion,
    updateExamSettings,
} from '../services/courseAdminService';
import { generateAiQuestions } from '../services/examService';
import MathInput from '../components/MathInput';
import LatexRenderer from '../components/LatexRenderer';

// --- Types ---
type QuestionType = 'MCQ' | 'MSQ' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY';

interface Option {
    text: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    question_text: string;
    question_type: QuestionType;
    question_instructions?: string;
    options?: Option[];
    correct_answer?: string;
}

interface Exam {
    id: string;
    title: string;
    status: 'draft' | 'live' | 'archived' | 'completed';
    questions: Question[];
    grading_scale?: Record<string, number>;
    duration_minutes: number;
    is_proctored: boolean;
    instructions?: string;
}

// =====================================================
// SUB-COMPONENT: QUESTION FORM
// =====================================================
interface QuestionFormProps {
    examId: string;
    onSave: () => void;
    initialQuestion?: Question | null;
    closeDialog: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
    examId,
    onSave,
    initialQuestion = null,
    closeDialog,
}) => {
    // --- Form State ---
    const [qType, setQType] = useState<QuestionType>(
        initialQuestion?.question_type || 'MCQ'
    );
    const [qText, setQText] = useState(initialQuestion?.question_text || '');
    const [qInstructions, setQInstructions] = useState(
        initialQuestion?.question_instructions || ''
    );

    // State for MCQ/MSQ/TF options
    const [options, setOptions] = useState<Option[]>(
        initialQuestion?.options || [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
        ]
    );

    // State for Fill-in-the-Blank
    const [correctAnswerText, setCorrectAnswerText] = useState(
        initialQuestion?.correct_answer || ''
    );

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Math Dialog State ---
    const [mathDialogOpen, setMathDialogOpen] = useState(false);
    const [mathLatex, setMathLatex] = useState('');
    const [activeMathField, setActiveMathField] = useState<{ type: 'question' | 'option', index?: number }>({ type: 'question' });

    // --- Type Change Handler ---
    const handleTypeChange = (newType: QuestionType) => {
        setQType(newType);
        // Reset options based on type for better UX
        if (newType === 'TRUE_FALSE') {
            setOptions([
                { text: 'True', isCorrect: true },
                { text: 'False', isCorrect: false },
            ]);
        } else if (newType === 'MCQ' || newType === 'MSQ') {
            if (options.length < 2) {
                setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
            }
        }
    };

    // --- Option Handlers ---
    const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: any) => {
        const newOptions = [...options];

        // Logic for Single Choice: Only one can be correct
        if ((qType === 'MCQ' || qType === 'TRUE_FALSE') && field === 'isCorrect' && value === true) {
            newOptions.forEach((opt) => (opt.isCorrect = false));
        }

        newOptions[index] = { ...newOptions[index], [field]: value };
        setOptions(newOptions);
    };

    const addOption = () => setOptions([...options, { text: '', isCorrect: false }]);

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    // --- Submit Handler ---
    const handleSubmit = async () => {
        setError('');
        if (!qText.trim()) return setError('Question text is required.');

        // Prepare Payload
        const payload: any = {
            questionText: qText,
            questionType: qType,
            questionInstructions: qInstructions,
        };

        if (qType === 'MCQ' || qType === 'MSQ' || qType === 'TRUE_FALSE') {
            const validOptions = options.filter(o => o.text.trim() !== '');
            if (validOptions.length < 2) return setError('At least two options are required.');
            if (!validOptions.some(o => o.isCorrect)) return setError('Please mark at least one correct answer.');
            payload.options = validOptions;
        }
        else if (qType === 'FILL_BLANK') {
            if (!correctAnswerText.trim()) return setError('Correct answer text is required.');
            payload.correctAnswer = correctAnswerText;
        }

        setLoading(true);
        try {
            if (initialQuestion) {
                await updateQuestionInExam(examId, initialQuestion.id, payload);
            } else {
                await addQuestionToExam(examId, payload);
            }
            onSave();
            closeDialog();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save question.');
        } finally {
            setLoading(false);
        }
    };

    const openMathDialog = (type: 'question' | 'option', index?: number) => {
        setActiveMathField({ type, index });
        setMathDialogOpen(true);
    };

    const handleInsertMath = () => {
        // Use inline delimiters \( ... \)
        const formattedLatex = ` \\(${mathLatex}\\) `;

        if (activeMathField.type === 'question') {
            setQText(prev => prev + formattedLatex);
        } else if (activeMathField.type === 'option' && activeMathField.index !== undefined) {
            const newOptions = [...options];
            newOptions[activeMathField.index].text = (newOptions[activeMathField.index].text || '') + formattedLatex;
            setOptions(newOptions);
        }

        // Hide keyboard explicitly
        if ((window as any).mathVirtualKeyboard) {
            (window as any).mathVirtualKeyboard.hide();
        }

        setMathDialogOpen(false);
        setMathLatex('');
    };

    const handleCloseMathDialog = () => {
        // Hide keyboard explicitly
        if ((window as any).mathVirtualKeyboard) {
            (window as any).mathVirtualKeyboard.hide();
        }
        setMathDialogOpen(false);
    };

    return (
        <Box className="pt-2">
            <FormControl fullWidth margin="normal">
                <InputLabel>Question Type</InputLabel>
                <Select
                    value={qType}
                    label="Question Type"
                    onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                >
                    <MenuItem value="MCQ">Multiple Choice (Single Answer)</MenuItem>
                    <MenuItem value="MSQ">Multiple Select (Multiple Answers)</MenuItem>
                    <MenuItem value="TRUE_FALSE">True / False</MenuItem>
                    <MenuItem value="FILL_BLANK">Fill in the Blank</MenuItem>
                    <MenuItem value="ESSAY">Essay / Free Text</MenuItem>
                </Select>
            </FormControl>

            <Box sx={{ position: 'relative' }}>
                <TextField
                    label="Question Text"
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    helperText="You can insert math equations using the button on the right."
                    sx={{
                        '& .MuiInputBase-root': {
                            paddingRight: '40px', // Make space for the button
                        }
                    }}
                />
                <Tooltip title="Insert Math Equation">
                    <IconButton
                        onClick={() => openMathDialog('question')}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 24, // Adjust based on label height + margin
                            zIndex: 10,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 1)',
                            }
                        }}
                        color="primary"
                        size="small"
                    >
                        <FunctionsIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Preview Area */}
            {qText && (
                <Box sx={{ mt: 1, mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold', mb: 1, display: 'block' }}>
                        PREVIEW:
                    </Typography>
                    <Typography variant="body1">
                        <LatexRenderer text={qText} />
                    </Typography>
                </Box>
            )}

            <TextField
                label="Instructions (Optional)"
                placeholder="e.g., 'Select all that apply'"
                fullWidth
                margin="normal"
                size="small"
                value={qInstructions}
                onChange={(e) => setQInstructions(e.target.value)}
            />

            <Divider className="my-4" />

            {/* --- DYNAMIC INPUT AREA --- */}
            {(qType === 'MCQ' || qType === 'MSQ' || qType === 'TRUE_FALSE') && (
                <Box>
                    <Typography variant="subtitle2" className="mb-2 font-semibold text-gray-700">
                        Answer Options {qType === 'MSQ' ? '(Select all correct)' : '(Select one correct)'}
                    </Typography>

                    {options.map((opt, idx) => (
                        <Box key={idx} className="flex flex-col mb-3">
                            <Box className="flex items-center gap-2">
                                {qType === 'MSQ' ? (
                                    <Checkbox
                                        checked={opt.isCorrect}
                                        onChange={(e) => handleOptionChange(idx, 'isCorrect', e.target.checked)}
                                        color="success"
                                    />
                                ) : (
                                    <Radio
                                        checked={opt.isCorrect}
                                        onChange={() => handleOptionChange(idx, 'isCorrect', true)}
                                        color="success"
                                    />
                                )}

                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder={`Option ${idx + 1}`}
                                    value={opt.text}
                                    onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                                    disabled={qType === 'TRUE_FALSE'}
                                    InputProps={{
                                        endAdornment: qType !== 'TRUE_FALSE' && (
                                            <InputAdornment position="end">
                                                <Tooltip title="Insert Math">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openMathDialog('option', idx)}
                                                        edge="end"
                                                    >
                                                        <FunctionsIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                {qType !== 'TRUE_FALSE' && (
                                    <IconButton
                                        onClick={() => removeOption(idx)}
                                        disabled={options.length <= 2}
                                        color="error"
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                )}
                            </Box>

                            {/* Option Preview */}
                            {opt.text && (opt.text.includes('$$') || opt.text.includes('\\(')) && (
                                <Box sx={{ ml: 5, mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Preview: <LatexRenderer text={opt.text} />
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    ))}

                    {qType !== 'TRUE_FALSE' && (
                        <Button startIcon={<AddIcon />} onClick={addOption} size="small">
                            Add Option
                        </Button>
                    )}
                </Box>
            )}

            {qType === 'FILL_BLANK' && (
                <Box>
                    <Alert severity="info" className="mb-3">
                        Students must type the answer exactly as written below.
                    </Alert>
                    <TextField
                        label="Correct Answer"
                        fullWidth
                        value={correctAnswerText}
                        onChange={(e) => setCorrectAnswerText(e.target.value)}
                        color="success"
                        focused
                    />
                </Box>
            )}

            {qType === 'ESSAY' && (
                <Alert severity="info">
                    Essay questions require manual grading.
                </Alert>
            )}

            {error && <Alert severity="error" className="mt-3">{error}</Alert>}

            <DialogActions className="mt-4 p-0">
                <Button onClick={closeDialog} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                >
                    {loading ? 'Saving...' : 'Save Question'}
                </Button>
            </DialogActions>

            {/* Math Input Dialog */}
            <Dialog
                open={mathDialogOpen}
                onClose={handleCloseMathDialog}
                fullWidth
                maxWidth="sm"
                sx={{
                    '& .MuiDialog-paper': {
                        position: 'absolute',
                        top: '40px',
                        margin: 0
                    }
                }}
            >
                <DialogTitle>Insert Math Equation</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <MathInput value={mathLatex} onChange={setMathLatex} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseMathDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleInsertMath}>Insert</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};


// =====================================================
// MAIN PAGE COMPONENT
// =====================================================
const ExamBuilderPage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // UI States
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);

    // AI Dialog State
    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiCount, setAiCount] = useState(5);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSelectedTypes, setAiSelectedTypes] = useState<Record<QuestionType, { enabled: boolean; count: number }>>({
        MCQ: { enabled: true, count: 5 },
        MSQ: { enabled: false, count: 2 },
        TRUE_FALSE: { enabled: false, count: 2 },
        FILL_BLANK: { enabled: false, count: 2 },
        ESSAY: { enabled: false, count: 1 },
    });

    const enabledTypeCount = Object.values(aiSelectedTypes).filter(v => v.enabled).length;
    const totalAiQuestions = enabledTypeCount <= 1
        ? aiCount
        : Object.values(aiSelectedTypes).filter(v => v.enabled).reduce((sum, v) => sum + v.count, 0);

    const questionTypeLabels: Record<QuestionType, string> = {
        MCQ: 'Multiple Choice (MCQ)',
        MSQ: 'Multiple Select (MSQ)',
        TRUE_FALSE: 'True / False',
        FILL_BLANK: 'Fill in the Blank',
        ESSAY: 'Essay',
    };

    // Settings Form State
    const [settingsForm, setSettingsForm] = useState({
        duration: 60,
        isProctored: false,
        status: 'draft',
        gradingScale: { A: 90, B: 80, C: 70, D: 60, E: 50, F: 40 },
        instructions: ''
    });

    // --- Fetch Data ---
    const fetchExamData = useCallback(async () => {
        if (!examId) return;
        if (!exam) setLoading(true);

        try {
            const data = await getExamById(examId);
            setExam(data);

            setSettingsForm({
                duration: data.duration_minutes || 60,
                isProctored: data.is_proctored || false,
                status: data.status || 'draft',
                gradingScale: data.grading_scale || { A: 90, B: 80, C: 70, D: 60, E: 50, F: 40 },
                instructions: (data as any).instructions || ''
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load exam.');
        } finally {
            setLoading(false);
        }
    }, [examId]);

    useEffect(() => {
        fetchExamData();
    }, [fetchExamData]);

    // --- Handlers ---
    const handleSaveSettings = async () => {
        if (!exam) return;
        try {
            await updateExamSettings(exam.id, {
                duration_minutes: Number(settingsForm.duration),
                is_proctored: settingsForm.isProctored,
                status: settingsForm.status,
                grading_scale: settingsForm.gradingScale,
                instructions: settingsForm.instructions
            });
            setSettingsOpen(false);
            fetchExamData();
        } catch (err) {
            console.error(err);
            alert("Failed to update settings");
        }
    };

    const handleDeleteQuestion = async (qId: string) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;
        try {
            await deleteQuestion(exam!.id, qId);
            fetchExamData();
        } catch (err) {
            alert("Failed to delete question.");
        }
    };

    const handleGenerateAi = async () => {
        if (!aiTopic.trim()) return alert("Please enter a topic.");
        const enabledTypes = Object.entries(aiSelectedTypes).filter(([, v]) => v.enabled);
        if (enabledTypes.length === 0) return alert("Please select at least one question type.");

        setAiLoading(true);
        try {
            // Build the questionTypes map: { MCQ: 3, TRUE_FALSE: 2, ... }
            const questionTypes: Record<string, number> = {};
            if (enabledTypes.length === 1) {
                // Single type: use the total count
                questionTypes[enabledTypes[0][0]] = aiCount;
            } else {
                // Multiple types: use per-type counts
                for (const [type, val] of enabledTypes) {
                    questionTypes[type] = val.count;
                }
            }

            await generateAiQuestions({
                topic: aiTopic,
                questionTypes,
                examId: exam!.id
            });
            fetchExamData();
            setAiDialogOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to generate questions.");
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) return <Box className="flex justify-center items-center h-screen"><CircularProgress /></Box>;
    if (error) return <Alert severity="error" className="m-4">{error}</Alert>;
    if (!exam) return <Alert severity="warning" className="m-4">Exam not found.</Alert>;

    return (
        <Box>
            {/* --- PAGE HEADER --- */}
            <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <Box>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/courseadmin/exams')}
                        className="mb-2 text-gray-500"
                    >
                        Back to Exams
                    </Button>
                    <Typography variant="h4" className="font-bold text-gray-900">
                        {exam.title}
                    </Typography>
                    <Box className="flex flex-wrap gap-2 mt-2">
                        <Chip
                            icon={<TimerIcon />}
                            label={`${exam.duration_minutes} mins`}
                            size="small"
                            className="bg-blue-50 text-blue-700"
                        />
                        <Chip
                            icon={<SecurityIcon />}
                            label={exam.is_proctored ? "Proctored" : "Standard"}
                            color={exam.is_proctored ? "primary" : "default"}
                            size="small"
                        />
                        <Chip
                            label={exam.status}
                            color={exam.status === 'live' ? "success" : "warning"}
                            size="small"
                            className="uppercase font-bold"
                        />
                    </Box>
                </Box>
                <Box className="flex gap-3">
                    <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={() => setSettingsOpen(true)}
                    >
                        Settings
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => { setQuestionToEdit(null); setQuestionModalOpen(true); }}
                    >
                        Add Question
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={() => setAiDialogOpen(true)}
                        sx={{
                            borderColor: '#111A50',
                            color: '#111A50',
                            '&:hover': { backgroundColor: 'rgba(17,26,80,0.05)', borderColor: '#080D2B' }
                        }}
                    >
                        Generate with AI
                    </Button>
                </Box>
            </Box>

            {/* --- QUESTION LIST --- */}
            <Paper className="bg-white rounded-xl shadow-lg border border-gray-100 p-0 overflow-hidden">
                <Box className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <Typography variant="h6" className="font-semibold text-gray-700">
                        Questions ({exam.questions.length})
                    </Typography>
                </Box>

                <List className="divide-y divide-gray-100">
                    {exam.questions.length === 0 ? (
                        <Box className="p-10 text-center text-gray-500">
                            <DescriptionIcon style={{ fontSize: 48, opacity: 0.3 }} />
                            <Typography className="mt-2">No questions yet. Click "Add Question" to start.</Typography>
                        </Box>
                    ) : (
                        exam.questions.map((q, index) => (
                            <ListItem
                                key={q.id}
                                className="hover:bg-blue-50 transition-colors group"
                                secondaryAction={
                                    <Box>
                                        <Tooltip title="Edit">
                                            <IconButton onClick={() => { setQuestionToEdit(q); setQuestionModalOpen(true); }}>
                                                <EditIcon className="text-[#111A50]" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton onClick={() => handleDeleteQuestion(q.id)}>
                                                <DeleteIcon className="text-red-500" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                }
                            >
                                <Box className="w-full pr-12">
                                    <Box className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-gray-400">Q{index + 1}</span>
                                        <Chip
                                            label={q.question_type.replace('_', ' ')}
                                            size="small"
                                            className="text-xs h-5 bg-gray-200 font-bold text-gray-600"
                                        />
                                    </Box>
                                    <Typography className="text-gray-900 font-medium mb-1">
                                        {q.question_text}
                                    </Typography>

                                    {/* Preview Answer Key (Teacher View Only) */}
                                    <Box className="pl-4 border-l-2 border-green-200 mt-2">
                                        {q.options && q.options.map((opt, i) => (
                                            <Typography key={i} variant="body2" className={opt.isCorrect ? "text-green-700 font-medium" : "text-gray-500"}>
                                                {opt.isCorrect ? "● " : "○ "} {opt.text}
                                            </Typography>
                                        ))}
                                        {q.correct_answer && (
                                            <Typography variant="body2" className="text-green-700 font-medium">
                                                Answer: {q.correct_answer}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </ListItem>
                        ))
                    )}
                </List>
            </Paper>

            {/* --- SETTINGS MODAL --- */}
            <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Exam Settings</DialogTitle>
                <DialogContent>
                    <Box className="pt-4 flex flex-col gap-4">
                        <TextField
                            label="Duration (Minutes)"
                            type="number"
                            fullWidth
                            value={settingsForm.duration}
                            onChange={(e) => setSettingsForm({ ...settingsForm, duration: Number(e.target.value) })}
                        />

                        <Box className="border p-3 rounded-lg border-gray-200">
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settingsForm.isProctored}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, isProctored: e.target.checked })}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography className="font-semibold">Enable AI Proctoring</Typography>
                                        <Typography variant="caption" className="text-gray-500">
                                            Webcam, tab tracking, and face verification.
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Box>

                        <TextField
                            select
                            label="Status"
                            fullWidth
                            value={settingsForm.status}
                            onChange={(e) => setSettingsForm({ ...settingsForm, status: e.target.value as any })}
                        >
                            <MenuItem value="draft">Draft (Hidden)</MenuItem>
                            <MenuItem value="live">Live (Visible)</MenuItem>
                            <MenuItem value="archived">Archived</MenuItem>
                        </TextField>

                        <TextField
                            label="Exam Instructions (Markdown Supported)"
                            multiline
                            rows={6}
                            fullWidth
                            value={settingsForm.instructions}
                            onChange={(e) => setSettingsForm({ ...settingsForm, instructions: e.target.value })}
                            placeholder="Enter exam instructions here...&#10;&#10;Formatting tips:&#10;# Heading&#10;**bold text**&#10;*italic text*"
                            helperText="Use markdown formatting: # for headings, **bold**, *italic*"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveSettings}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* --- ADD/EDIT QUESTION MODAL --- */}
            <Dialog open={questionModalOpen} onClose={() => setQuestionModalOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>
                    {questionToEdit ? 'Edit Question' : 'Add New Question'}
                </DialogTitle>
                <DialogContent>
                    <QuestionForm
                        examId={exam.id}
                        onSave={fetchExamData}
                        initialQuestion={questionToEdit}
                        closeDialog={() => setQuestionModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* --- AI GENERATION DIALOG --- */}
            <Dialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon sx={{ color: '#111A50' }} />
                    Generate Questions with AI
                </DialogTitle>
                <DialogContent>
                    <Box className="pt-4 flex flex-col gap-4">
                        <TextField
                            label="Topic or Content"
                            multiline
                            rows={3}
                            fullWidth
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                            placeholder="e.g., 'Photosynthesis process', 'World War II', or paste text content..."
                            sx={{ '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#111A50' }, '& .MuiInputLabel-root.Mui-focused': { color: '#111A50' } }}
                        />

                        {/* --- Question Type Selection --- */}
                        <Box>
                            <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-2">
                                Question Types
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                {(Object.keys(aiSelectedTypes) as QuestionType[]).map((type) => (
                                    <Box key={type} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={aiSelectedTypes[type].enabled}
                                                    onChange={(e) => setAiSelectedTypes(prev => ({
                                                        ...prev,
                                                        [type]: { ...prev[type], enabled: e.target.checked }
                                                    }))}
                                                    sx={{ color: '#111A50', '&.Mui-checked': { color: '#111A50' } }}
                                                    size="small"
                                                />
                                            }
                                            label={<Typography variant="body2">{questionTypeLabels[type]}</Typography>}
                                        />
                                        {/* Show per-type count only when multiple types are selected */}
                                        {enabledTypeCount > 1 && aiSelectedTypes[type].enabled && (
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={aiSelectedTypes[type].count}
                                                onChange={(e) => setAiSelectedTypes(prev => ({
                                                    ...prev,
                                                    [type]: { ...prev[type], count: Math.max(1, Number(e.target.value)) }
                                                }))}
                                                inputProps={{ min: 1, max: 20 }}
                                                sx={{ width: 70, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#111A50' } }}
                                            />
                                        )}
                                    </Box>
                                ))}
                            </Paper>
                        </Box>

                        {/* Single total count when only 1 type is selected */}
                        {enabledTypeCount <= 1 && (
                            <TextField
                                label="Number of Questions"
                                type="number"
                                fullWidth
                                value={aiCount}
                                onChange={(e) => setAiCount(Math.max(1, Number(e.target.value)))}
                                inputProps={{ min: 1, max: 20 }}
                                sx={{ '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#111A50' }, '& .MuiInputLabel-root.Mui-focused': { color: '#111A50' } }}
                            />
                        )}

                        {/* Total summary when multiple types */}
                        {enabledTypeCount > 1 && (
                            <Typography variant="body2" sx={{ color: '#111A50', fontWeight: 600, textAlign: 'right' }}>
                                Total: {totalAiQuestions} question{totalAiQuestions !== 1 ? 's' : ''}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setAiDialogOpen(false)} sx={{ color: '#666' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleGenerateAi}
                        disabled={aiLoading || enabledTypeCount === 0}
                        startIcon={aiLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                        sx={{
                            backgroundColor: '#111A50',
                            '&:hover': { backgroundColor: '#080D2B' },
                            '&.Mui-disabled': { backgroundColor: '#9ca3af', color: '#fff' }
                        }}
                    >
                        {aiLoading ? 'Generating...' : `Generate ${totalAiQuestions} Question${totalAiQuestions !== 1 ? 's' : ''}`}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default ExamBuilderPage;