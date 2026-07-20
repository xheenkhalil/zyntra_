import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Collapse, Button, LinearProgress, Drawer, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { ExpandLess, ExpandMore, CheckCircle, Menu as MenuIcon, Lock, Assignment } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import type { Certification, CertificationUnit } from '../types/certification';
import ModuleAssessment from '../components/certification/ModuleAssessment';

const CourseViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [certification, setCertification] = useState<Certification | null>(null);
  const [activeUnit, setActiveUnit] = useState<CertificationUnit | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null); // moduleId
  const [openModules, setOpenModules] = useState<{ [key: string]: boolean }>({});
  const [completedUnits, setCompletedUnits] = useState<string[]>([]);
  const [moduleProgress, setModuleProgress] = useState<{ module_id: string, passed: boolean }[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchCourseDetails();
    fetchProgress();
  }, [id]);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const fetchCourseDetails = async () => {
    try {
      const res = await axios.get(`/api/certifications/${id}`);
      setCertification(res.data);
      if (res.data.modules?.length > 0 && res.data.modules[0].units?.length > 0) {
        setActiveUnit(res.data.modules[0].units[0]);
        setOpenModules({ [res.data.modules[0].id]: true });
      }
    } catch (error) {
      console.error('Error fetching course', error);
    }
  };

  const fetchProgress = async () => {
    try {
      // Get enrollment progress if logged in
      const res = await axios.get(`/api/certifications/${id}/enrollment`, { withCredentials: true });
      if (res.data.enrolled) {
        setCompletedUnits(res.data.completed_units || []);
        setModuleProgress(res.data.module_progress || []);
      }
    } catch (error) {
      console.error('User not enrolled or not logged in', error);
    }
  };

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleUnitClick = (unit: CertificationUnit) => {
    setActiveUnit(unit);
    setActiveAssessment(null);
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleAssessmentClick = (moduleId: string) => {
    setActiveAssessment(moduleId);
    setActiveUnit(null);
    if (isMobile) setIsSidebarOpen(false);
  };

  const markComplete = async () => {
    if (!activeUnit) return;
    try {
      await axios.post(`/api/certifications/units/${activeUnit.id}/complete`, { is_completed: true }, { withCredentials: true });
      setCompletedUnits(prev => [...new Set([...prev, activeUnit.id])]);
    } catch (error) {
      console.error('Failed to mark complete. Please login and enroll.', error);
      alert('You must be logged in and enrolled to track progress.');
    }
  };

  if (!certification) return <Box p={4}><Typography>Loading course...</Typography></Box>;

  const totalUnits = certification.modules?.reduce((acc, mod) => acc + (mod.units?.length || 0), 0) || 0;
  const progressPercentage = totalUnits > 0 ? Math.round((completedUnits.length / totalUnits) * 100) : 0;

  const drawerWidth = 300;

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
      <Box p={3} borderBottom="1px solid #e2e8f0">
        <Typography variant="h6" fontWeight="bold" color="primary">{certification.title}</Typography>
        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">Progress</Typography>
            <Typography variant="body2" fontWeight="bold">{progressPercentage}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progressPercentage} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        <List component="nav" disablePadding>
          {certification.modules?.map((mod, idx) => {
            // Determine if module is locked
            let isLocked = false;
            if (idx > 0) {
              const prevMod = certification.modules![idx - 1];
              const prevUnitsCompleted = prevMod.units?.every(u => completedUnits.includes(u.id));
              const prevAssessmentPassed = !prevMod.has_assessment || moduleProgress.some(mp => mp.module_id === prevMod.id && mp.passed);
              isLocked = !(prevUnitsCompleted && prevAssessmentPassed);
            }

            return (
              <React.Fragment key={mod.id}>
                <ListItem 
                  onClick={() => !isLocked && toggleModule(mod.id)} 
                  sx={{ 
                    cursor: isLocked ? 'not-allowed' : 'pointer', 
                    bgcolor: openModules[mod.id] ? '#f1f5f9' : 'transparent', 
                    borderBottom: '1px solid #e2e8f0',
                    opacity: isLocked ? 0.6 : 1
                  }}
                >
                  <ListItemText primary={<Typography fontWeight="bold">Module {idx + 1}: {mod.title}</Typography>} />
                  {isLocked ? <Lock sx={{ color: 'text.secondary', fontSize: 20 }} /> : (openModules[mod.id] ? <ExpandLess /> : <ExpandMore />)}
                </ListItem>
                <Collapse in={openModules[mod.id] && !isLocked} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {mod.units?.map((unit, uIdx) => {
                      const isCompleted = completedUnits.includes(unit.id);
                      const isActive = activeUnit?.id === unit.id;
                      return (
                        <ListItem 
                          key={unit.id} 
                          onClick={() => handleUnitClick(unit)}
                          sx={{ cursor: 'pointer', pl: 4, bgcolor: isActive ? '#e0f2fe' : 'transparent', '&:hover': { bgcolor: '#f1f5f9' } }}
                        >
                          <CheckCircle sx={{ fontSize: 18, mr: 1, color: isCompleted ? '#22c55e' : '#cbd5e1' }} />
                          <ListItemText primary={<Typography variant="body2" fontWeight={isActive ? 'bold' : 'normal'}>{idx+1}.{uIdx+1} {unit.title}</Typography>} />
                        </ListItem>
                      );
                    })}
                    {mod.has_assessment && (
                      <ListItem 
                        onClick={() => handleAssessmentClick(mod.id)}
                        sx={{ cursor: 'pointer', pl: 4, bgcolor: activeAssessment === mod.id ? '#e0f2fe' : 'transparent', '&:hover': { bgcolor: '#f1f5f9' } }}
                      >
                        <Assignment sx={{ fontSize: 18, mr: 1, color: moduleProgress.some(mp => mp.module_id === mod.id && mp.passed) ? '#22c55e' : '#f59e0b' }} />
                        <ListItemText primary={<Typography variant="body2" fontWeight={activeAssessment === mod.id ? 'bold' : 'normal'}>Module Assessment</Typography>} />
                      </ListItem>
                    )}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fdfdfd' }}>
      {/* Mobile Header with Hamburger */}
      {isMobile && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, bgcolor: 'white', zIndex: 1000, display: 'flex', alignItems: 'center', px: 2, boxShadow: 1 }}>
          <IconButton onClick={() => setIsSidebarOpen(true)}><MenuIcon /></IconButton>
          <Typography variant="h6" fontWeight="bold" ml={2} noWrap>{certification.title}</Typography>
        </Box>
      )}

      {/* Sidebar Navigation */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 'none' },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 6 }, 
          mt: { xs: '60px', md: 0 },
          width: { sm: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        {activeAssessment ? (
          <ModuleAssessment 
            certificationId={certification.id} 
            moduleId={activeAssessment} 
            onPass={fetchProgress}
          />
        ) : activeUnit ? (
          <Box maxWidth="800px" mx="auto">
            <Typography variant="h4" fontWeight="extrabold" mb={4} color="#111A50">{activeUnit.title}</Typography>
            
            {activeUnit.video_url && (
              <Box sx={{ position: 'relative', pt: '56.25%', mb: 4, borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                <iframe 
                  src={activeUnit.video_url} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                />
              </Box>
            )}

            <Paper sx={{ p: {xs: 3, md: 5}, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div dangerouslySetInnerHTML={{ __html: activeUnit.content }} className="prose max-w-none text-gray-700" />
            </Paper>

            <Box mt={6} display="flex" justifyContent="space-between" alignItems="center">
              <Button variant="outlined" size="large">Previous Unit</Button>
              <Button 
                variant="contained" 
                size="large" 
                color="success" 
                startIcon={<CheckCircle />}
                onClick={markComplete}
                disabled={completedUnits.includes(activeUnit.id)}
              >
                {completedUnits.includes(activeUnit.id) ? 'Completed' : 'Mark as Complete & Continue'}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box textAlign="center" mt={10}>
            <Typography variant="h5" color="text.secondary">Select a unit from the sidebar to begin.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CourseViewerPage;
