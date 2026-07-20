import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, IconButton, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, InputLabel, FormControl,
  LinearProgress, Snackbar, Alert
} from '@mui/material';
import { Add, Delete, DragIndicator, AutoAwesome } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

import type { Certification, CertificationUnit, CertificationModule } from '../types/certification';

const SuperAdminCreateCertification: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingAi, setGeneratingAi] = useState<string | null>(null);

  // AI Course Generation state
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiModuleCount, setAiModuleCount] = useState(3);
  const [aiAudienceLevel, setAiAudienceLevel] = useState('Intermediate');
  const [aiDescription, setAiDescription] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });

  const [certification, setCertification] = useState<Partial<Certification>>({
    title: '',
    description: '',
    overview: '',
    image_url: '',
    price: 0,
    is_published: false,
    modules: []
  });

  useEffect(() => {
    if (isEditing) {
      fetchCertification();
    }
  }, [id]);

  const fetchCertification = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/certifications/${id}`, { withCredentials: true });
      setCertification(res.data);
    } catch (error) {
      console.error('Error fetching certification', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCertification({ ...certification, [e.target.name]: e.target.value });
  };

  const handleTogglePublish = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCertification({ ...certification, is_published: e.target.checked });
  };

  const addModule = () => {
    setCertification({
      ...certification,
      modules: [...(certification.modules || []), { id: Date.now().toString(), title: '', order_index: (certification.modules?.length || 0), units: [] }]
    });
  };

  const updateModule = (index: number, field: keyof CertificationModule, value: any) => {
    const newModules = [...(certification.modules || [])];
    newModules[index] = { ...newModules[index], [field]: value };
    setCertification({ ...certification, modules: newModules });
  };

  const removeModule = (index: number) => {
    const newModules = [...(certification.modules || [])];
    newModules.splice(index, 1);
    setCertification({ ...certification, modules: newModules });
  };

  const addUnit = (moduleIndex: number) => {
    const newModules = [...(certification.modules || [])];
    newModules[moduleIndex].units.push({
      id: Date.now().toString(),
      title: '',
      content: '',
      video_url: '',
      order_index: newModules[moduleIndex].units.length
    });
    setCertification({ ...certification, modules: newModules });
  };

  const updateUnit = (moduleIndex: number, unitIndex: number, field: keyof CertificationUnit, value: string) => {
    const newModules = [...(certification.modules || [])];
    newModules[moduleIndex].units[unitIndex] = {
      ...newModules[moduleIndex].units[unitIndex],
      [field]: value
    };
    setCertification({ ...certification, modules: newModules });
  };

  const removeUnit = (moduleIndex: number, unitIndex: number) => {
    const newModules = [...(certification.modules || [])];
    newModules[moduleIndex].units.splice(unitIndex, 1);
    setCertification({ ...certification, modules: newModules });
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/certifications/${id}`, certification, { withCredentials: true });
      } else {
        await axios.post(API_BASE_URL + '/certifications', certification, { withCredentials: true });
      }
      navigate('/superadmin/certifications');
    } catch (error) {
      console.error('Error saving certification', error);
      alert('Failed to save certification');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(API_BASE_URL + '/upload/image', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCertification({ ...certification, image_url: res.data.url });
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGenerateAssessment = async (moduleId: string) => {
    if (moduleId.length < 10 || moduleId.startsWith('ai-') || !moduleId.includes('-')) {
      alert("Please save the certification first before generating assessments. The module must exist in the database.");
      return;
    }
    setGeneratingAi(moduleId);
    try {
      await axios.post(API_BASE_URL + '/superadmin/ai/certification-assessment', { moduleId }, { withCredentials: true });
      alert("Assessment questions generated successfully!");
    } catch (error) {
      console.error('Failed to generate assessment', error);
      alert('Failed to generate assessment questions.');
    } finally {
      setGeneratingAi(null);
    }
  };

  // --- AI Full Course Generation ---
  const handleAiGenerateCourse = async () => {
    if (!aiTopic.trim()) {
      setSnackbar({ open: true, message: 'Please enter a topic for the course.', severity: 'error' });
      return;
    }

    setAiGenerating(true);
    try {
      const res = await axios.post(API_BASE_URL + '/superadmin/ai/generate-certification-course', {
        topic: aiTopic,
        moduleCount: aiModuleCount,
        audienceLevel: aiAudienceLevel,
        description: aiDescription,
      }, { withCredentials: true });

      const course = res.data;

      // Populate the form with AI-generated content
      setCertification({
        ...certification,
        title: course.title || certification.title,
        description: course.description || certification.description,
        overview: course.overview || certification.overview,
        modules: course.modules || [],
      });

      setAiDialogOpen(false);
      setAiTopic('');
      setAiDescription('');
      setSnackbar({ open: true, message: '✨ Course generated! Review the content below and save when ready.', severity: 'success' });
    } catch (error: any) {
      console.error('AI course generation failed:', error);
      setSnackbar({ open: true, message: error?.response?.data?.message || 'Failed to generate course. Please try again.', severity: 'error' });
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <Box>
      {/* --- Page Header with AI Button --- */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight="bold">
          {isEditing ? 'Edit Certification' : 'Create Certification'}
        </Typography>
        {!isEditing && (
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={() => setAiDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontWeight: 'bold',
              px: 3,
              py: 1.2,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '0.95rem',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4299 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            ✨ Generate Course with AI
          </Button>
        )}
      </Box>

      {/* --- AI Generation Dialog --- */}
      <Dialog open={aiDialogOpen} onClose={() => !aiGenerating && setAiDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome sx={{ color: '#667eea' }} />
          Generate Certification Course with AI
        </DialogTitle>
        <DialogContent>
          {aiGenerating && (
            <Box mb={2}>
              <LinearProgress sx={{ borderRadius: 4, height: 6, '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #667eea, #764ba2)' } }} />
              <Typography variant="body2" color="text.secondary" mt={1} textAlign="center">
                ✨ AI is building your course... This may take 30-60 seconds.
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            fullWidth
            label="Course Topic"
            placeholder="e.g. Cybersecurity Fundamentals, Data Science with Python, Project Management"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            margin="normal"
            disabled={aiGenerating}
            required
          />
          <TextField
            fullWidth
            label="Additional Description (optional)"
            placeholder="Any specific areas to focus on, prerequisites, or learning outcomes"
            value={aiDescription}
            onChange={(e) => setAiDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
            disabled={aiGenerating}
          />
          <Box display="flex" gap={2} mt={1}>
            <TextField
              label="Number of Modules"
              type="number"
              value={aiModuleCount}
              onChange={(e) => setAiModuleCount(Math.max(1, Math.min(8, parseInt(e.target.value) || 3)))}
              disabled={aiGenerating}
              inputProps={{ min: 1, max: 8 }}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Audience Level</InputLabel>
              <Select
                value={aiAudienceLevel}
                label="Audience Level"
                onChange={(e) => setAiAudienceLevel(e.target.value)}
                disabled={aiGenerating}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAiDialogOpen(false)} disabled={aiGenerating}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAiGenerateCourse}
            disabled={aiGenerating || !aiTopic.trim()}
            startIcon={<AutoAwesome />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4299 100%)' },
            }}
          >
            {aiGenerating ? 'Generating...' : 'Generate Course'}
          </Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>General Info</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66%' } }}>
            <TextField fullWidth label="Title" name="title" value={certification.title} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Brief Description" name="description" value={certification.description} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Detailed Overview" name="overview" value={certification.overview} onChange={handleChange} margin="normal" multiline rows={4} />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
            <Box display="flex" gap={1} alignItems="center">
              <TextField fullWidth label="Image URL" name="image_url" value={certification.image_url} onChange={handleChange} margin="normal" />
              <Button variant="contained" component="label" disabled={uploadingImage} sx={{ mt: 1, whiteSpace: 'nowrap' }}>
                {uploadingImage ? 'Uploading...' : 'Upload'}
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
            </Box>
            <TextField fullWidth label="Price ($)" name="price" type="number" value={certification.price} onChange={handleChange} margin="normal" />
            <FormControlLabel 
              control={<Switch checked={certification.is_published} onChange={handleTogglePublish} />} 
              label="Published" 
              sx={{ mt: 2 }}
            />
          </Box>
        </Box>
      </Paper>

      <Typography variant="h5" mb={2} fontWeight="bold">Curriculum</Typography>
      
      {certification.modules?.map((mod, mIndex) => (
        <Paper key={mod.id} sx={{ p: 3, mb: 3, borderLeft: '4px solid #111A50' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <DragIndicator sx={{ mr: 1, color: 'text.secondary' }} />
            <TextField 
              fullWidth 
              label={`Module ${mIndex + 1} Title`} 
              value={mod.title} 
              onChange={(e) => updateModule(mIndex, 'title', e.target.value)} 
            />
            <IconButton onClick={() => removeModule(mIndex)} color="error" sx={{ ml: 1 }}>
              <Delete />
            </IconButton>
          </Box>
          <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
            <FormControlLabel
              control={<Switch checked={mod.has_assessment || false} onChange={(e) => updateModule(mIndex, 'has_assessment', e.target.checked)} />}
              label="Has Assessment"
            />
            {mod.has_assessment && (
              <>
                <TextField 
                  label="Passing Rate (%)" 
                  type="number" 
                  size="small" 
                  value={mod.passing_rate ?? 80.0} 
                  onChange={(e) => updateModule(mIndex, 'passing_rate', parseFloat(e.target.value))} 
                />
                <TextField 
                  label="# of Questions" 
                  type="number" 
                  size="small" 
                  value={mod.assessment_question_count ?? 5} 
                  onChange={(e) => updateModule(mIndex, 'assessment_question_count', parseInt(e.target.value, 10))} 
                />
                <Button 
                  variant="contained" 
                  color="secondary" 
                  startIcon={<AutoAwesome />} 
                  onClick={() => handleGenerateAssessment(mod.id)}
                  disabled={generatingAi === mod.id}
                >
                  {generatingAi === mod.id ? 'Generating...' : 'Generate Assessment via AI'}
                </Button>
              </>
            )}
          </Box>

          <Box pl={4}>
            {mod.units.map((unit, uIndex) => (
              <Box key={unit.id} mb={3} p={2} border={1} borderColor="grey.300" borderRadius={1}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">Unit {uIndex + 1}</Typography>
                  <IconButton onClick={() => removeUnit(mIndex, uIndex)} color="error" size="small"><Delete /></IconButton>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <TextField fullWidth size="small" label="Unit Title" value={unit.title} onChange={(e) => updateUnit(mIndex, uIndex, 'title', e.target.value)} />
                  </Box>
                  <Box>
                    <TextField fullWidth size="small" label="Video URL (YouTube/Vimeo)" value={unit.video_url} onChange={(e) => updateUnit(mIndex, uIndex, 'video_url', e.target.value)} />
                  </Box>
                  <Box>
                    <TextField fullWidth multiline rows={3} label="Content (Markdown/HTML)" value={unit.content} onChange={(e) => updateUnit(mIndex, uIndex, 'content', e.target.value)} />
                  </Box>
                </Box>
              </Box>
            ))}
            <Button variant="outlined" startIcon={<Add />} onClick={() => addUnit(mIndex)} size="small">
              Add Unit
            </Button>
          </Box>
        </Paper>
      ))}

      <Button variant="outlined" fullWidth startIcon={<Add />} onClick={addModule} sx={{ py: 2, mb: 4, border: '2px dashed grey' }}>
        Add Module
      </Button>

      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" onClick={() => navigate('/superadmin/certifications')}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSave} size="large">Save Certification</Button>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SuperAdminCreateCertification;
