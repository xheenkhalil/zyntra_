// frontend/src/pages/ProctoringDashboard.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    Button,
    Select,
    MenuItem,
    Chip,
    Divider,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment,
} from '@mui/material';
import {
    FaShieldAlt,
    FaBars,
    FaBell,
    FaVideo,
    FaExclamationTriangle,
    FaChartLine,
    FaHistory,
    FaUsers,
    FaMicrophone,
    FaDesktop,
    FaBrain,
    FaCog,
    FaCheckCircle,
    FaEye,
    FaSearch,
    FaMouse,
} from 'react-icons/fa';

// --- Chart.js ---
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
} from 'chart.js';

// --- Service ---
import { getProctoringDashboardBatch, type ProctoringBatchData, type HistoryRecord } from '../services/proctoringService';

// Register Charts
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

type TabId = 'live-feeds' | 'alerts' | 'analytics' | 'session-history' | 'face-detection' | 'audio-analysis' | 'screen-monitor' | 'behavior-ai' | 'configuration' | 'security-rules';

const ProctoringDashboard: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();

    // State
    const [data, setData] = useState<ProctoringBatchData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<TabId>('live-feeds');

    // Filter State
    const [viewFilter, setViewFilter] = useState('all');
    const [alertSearch, setAlertSearch] = useState('');
    const [reportDialog, setReportDialog] = useState<HistoryRecord | null>(null);

    // --- Fetch Data ---
    const refreshDashboard = useCallback(async () => {
        if (!examId) return;
        try {
            if (!data) setLoading(true);
            const batchData = await getProctoringDashboardBatch(examId);
            setData(batchData);
            setError('');
        } catch (err: any) {
            console.error("Proctoring load failed:", err);
            const msg = err?.response?.data?.message || err?.message || 'Unknown error';
            const status = err?.response?.status || '';
            if (!data) setError(`Failed to load proctoring stream. ${status ? `(${status})` : ''} ${msg}`);
        } finally {
            setLoading(false);
        }
    }, [examId, data]);

    // Initial Load & Polling
    useEffect(() => {
        refreshDashboard();
        const interval = setInterval(refreshDashboard, 10000);
        return () => clearInterval(interval);
    }, [refreshDashboard]);

    if (loading) return <Box className="h-screen flex items-center justify-center bg-gray-900 text-white"><CircularProgress color="inherit" /></Box>;
    if (error) return <Box className="h-screen flex items-center justify-center bg-gray-900"><Alert severity="error">{error}</Alert></Box>;
    if (!data) return null;

    // Filter alerts by type for AI detection panels
    const filterAlertsByType = (types: string[]) => {
        return (data.alerts || []).filter(a => types.includes(a.type));
    };

    return (
        <Box className="flex h-screen bg-gray-50 overflow-hidden">

            {/* === 1. PROCTORING SIDEBAR (Dark Theme) === */}
            <Box
                component="aside"
                className={`bg-gray-900 text-white transition-all duration-300 flex flex-col border-r border-gray-800 ${sidebarOpen ? 'w-64' : 'w-20'}`}
            >
                <Box className="p-4 border-b border-gray-800 flex items-center justify-between h-16">
                    <Box className="flex items-center space-x-3 overflow-hidden">
                        <Box className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                            <FaShieldAlt />
                        </Box>
                        <span className={`font-bold text-lg transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            ZYNTRA
                        </span>
                    </Box>
                    <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
                        <FaBars size={14} />
                    </IconButton>
                </Box>

                <Box className="flex-1 overflow-y-auto p-3 space-y-6">
                    {/* Monitoring Section */}
                    <Box>
                        {sidebarOpen && <Typography variant="caption" className="text-gray-500 uppercase font-bold mb-2 block px-2">Monitoring</Typography>}
                        <div className="space-y-1">
                            <NavButton icon={<FaVideo />} label="Live Feeds" active={activeTab === 'live-feeds'} expanded={sidebarOpen} badge={data.metrics.activeCandidates} onClick={() => setActiveTab('live-feeds')} />
                            <NavButton icon={<FaExclamationTriangle />} label="Alerts" active={activeTab === 'alerts'} expanded={sidebarOpen} badge={data.metrics.totalAlerts} badgeColor="bg-red-500" onClick={() => setActiveTab('alerts')} />
                            <NavButton icon={<FaChartLine />} label="Analytics" active={activeTab === 'analytics'} expanded={sidebarOpen} onClick={() => setActiveTab('analytics')} />
                            <NavButton icon={<FaHistory />} label="Session History" active={activeTab === 'session-history'} expanded={sidebarOpen} onClick={() => setActiveTab('session-history')} />
                        </div>
                    </Box>

                    {/* AI Detection Section */}
                    <Box>
                        {sidebarOpen && <Typography variant="caption" className="text-gray-500 uppercase font-bold mb-2 block px-2">AI Detection</Typography>}
                        <div className="space-y-1">
                            <NavButton icon={<FaUsers />} label="Face Detection" active={activeTab === 'face-detection'} expanded={sidebarOpen} onClick={() => setActiveTab('face-detection')} />
                            <NavButton icon={<FaMicrophone />} label="Audio Analysis" active={activeTab === 'audio-analysis'} expanded={sidebarOpen} onClick={() => setActiveTab('audio-analysis')} />
                            <NavButton icon={<FaDesktop />} label="Screen Monitor" active={activeTab === 'screen-monitor'} expanded={sidebarOpen} onClick={() => setActiveTab('screen-monitor')} />
                            <NavButton icon={<FaBrain />} label="Behavior AI" active={activeTab === 'behavior-ai'} expanded={sidebarOpen} onClick={() => setActiveTab('behavior-ai')} />
                        </div>
                    </Box>

                    {/* Settings Section */}
                    <Box>
                        {sidebarOpen && <Typography variant="caption" className="text-gray-500 uppercase font-bold mb-2 block px-2">Settings</Typography>}
                        <div className="space-y-1">
                            <NavButton icon={<FaCog />} label="Configuration" active={activeTab === 'configuration'} expanded={sidebarOpen} onClick={() => setActiveTab('configuration')} />
                            <NavButton icon={<FaShieldAlt />} label="Security Rules" active={activeTab === 'security-rules'} expanded={sidebarOpen} onClick={() => setActiveTab('security-rules')} />
                        </div>
                    </Box>
                </Box>
            </Box>

            {/* === 2. MAIN CONTENT === */}
            <Box className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <Box component="header" className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
                    <Typography variant="h6" className="font-bold text-gray-800 flex items-center">
                        <span className="mr-2 text-[#111A50]"><FaVideo /></span> Proctoring Dashboard
                    </Typography>

                    <Box className="flex items-center space-x-4">
                        <Chip
                            label="System Active"
                            className="bg-green-100 text-green-700 font-bold border-none"
                            icon={<Box className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1" />}
                        />
                        <IconButton className="relative" onClick={() => setActiveTab('alerts')}>
                            <FaBell className="text-gray-600" />
                            {data.metrics.totalAlerts > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                        <Box className="text-right hidden sm:block">
                            <Typography variant="subtitle2" className="text-gray-900 leading-tight">Course Admin</Typography>
                            <Typography variant="caption" className="text-gray-500">Supervisor</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Scrollable Content */}
                <Box className="flex-1 overflow-y-auto p-6">

                    {/* Metrics Row - Always visible */}
                    <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <MetricCard title="Active Candidates" value={data.metrics.activeCandidates} icon={<FaUsers />} color="text-[#111A50]" bg="bg-blue-100" />
                        <MetricCard title="Security Alerts" value={data.metrics.totalAlerts} icon={<FaExclamationTriangle />} color="text-red-600" bg="bg-red-100" isAlert />
                        <MetricCard title="Verified Sessions" value={data.metrics.verifiedSessions} icon={<FaCheckCircle />} color="text-green-600" bg="bg-green-100" />
                        <MetricCard title="AI Detections" value={data.metrics.aiDetections} icon={<FaBrain />} color="text-purple-600" bg="bg-purple-100" />
                    </Box>

                    {/* === TAB CONTENT === */}
                    {activeTab === 'live-feeds' && (
                        <LiveFeedsPanel data={data} viewFilter={viewFilter} setViewFilter={setViewFilter} />
                    )}

                    {activeTab === 'alerts' && (
                        <AlertsPanel alerts={data.alerts} search={alertSearch} setSearch={setAlertSearch} />
                    )}

                    {activeTab === 'analytics' && (
                        <AnalyticsPanel data={data} />
                    )}

                    {activeTab === 'session-history' && (
                        <SessionHistoryPanel history={data.history || []} onViewReport={setReportDialog} />
                    )}

                    {activeTab === 'face-detection' && (
                        <FilteredAlertsPanel title="Face Detection Alerts" icon={<FaUsers />} alerts={filterAlertsByType(['SUBJECT_MISMATCH', 'NO_FACE_DETECTED', 'FACE_BLURRED'])} emptyMessage="No face detection violations recorded." />
                    )}

                    {activeTab === 'audio-analysis' && (
                        <ComingSoonPanel title="Audio Analysis" icon={<FaMicrophone />} description="Audio monitoring and analysis capabilities are coming soon. This feature will detect suspicious audio patterns during proctored exams." />
                    )}

                    {activeTab === 'screen-monitor' && (
                        <FilteredAlertsPanel title="Screen Monitor - Tab Switches & Mouse Tracking" icon={<FaDesktop />} alerts={filterAlertsByType(['TAB_SWITCH', 'MOUSE_LEFT'])} emptyMessage="No tab switch or mouse tracking violations recorded." />
                    )}

                    {activeTab === 'behavior-ai' && (
                        <FilteredAlertsPanel title="Behavior AI - Gaze Tracking" icon={<FaBrain />} alerts={filterAlertsByType(['LOOKING_AWAY'])} emptyMessage="No gaze deviation violations recorded." />
                    )}

                    {activeTab === 'configuration' && (
                        <ConfigurationPanel />
                    )}

                    {activeTab === 'security-rules' && (
                        <SecurityRulesPanel />
                    )}
                </Box>
            </Box>

            {/* Report Dialog */}
            {reportDialog && (
                <Dialog open={!!reportDialog} onClose={() => setReportDialog(null)} maxWidth="md" fullWidth>
                    <DialogTitle className="font-bold">Proctoring Report - {reportDialog.full_name}</DialogTitle>
                    <DialogContent>
                        <Box className="space-y-4 mt-2">
                            <Box className="grid grid-cols-2 gap-4">
                                <Box className="bg-gray-50 p-3 rounded-lg">
                                    <Typography variant="caption" className="text-gray-500">Student ID</Typography>
                                    <Typography className="font-bold">{reportDialog.student_id}</Typography>
                                </Box>
                                <Box className="bg-gray-50 p-3 rounded-lg">
                                    <Typography variant="caption" className="text-gray-500">Status</Typography>
                                    <Typography className="font-bold">{reportDialog.status}</Typography>
                                </Box>
                                <Box className="bg-gray-50 p-3 rounded-lg">
                                    <Typography variant="caption" className="text-gray-500">Score</Typography>
                                    <Typography className="font-bold">{reportDialog.score_percentage != null ? `${reportDialog.score_percentage}%` : 'N/A'}</Typography>
                                </Box>
                                <Box className="bg-gray-50 p-3 rounded-lg">
                                    <Typography variant="caption" className="text-gray-500">Warnings</Typography>
                                    <Typography className="font-bold text-red-600">{reportDialog.warning_count}</Typography>
                                </Box>
                            </Box>
                            {reportDialog.proctoring_report && (
                                <Box className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
                                    <Typography variant="subtitle2" className="text-white mb-2">Zyntra AI Report</Typography>
                                    <pre>{JSON.stringify(reportDialog.proctoring_report, null, 2)}</pre>
                                </Box>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setReportDialog(null)}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

// =======================================
// PANEL COMPONENTS
// =======================================

const LiveFeedsPanel: React.FC<{ data: ProctoringBatchData; viewFilter: string; setViewFilter: (v: string) => void }> = ({ data, viewFilter, setViewFilter }) => {
    const filteredCandidates = data.candidates.filter(c => {
        if (viewFilter === 'flagged') return c.warning_count > 0;
        if (viewFilter === 'high-risk') return c.warning_count > 2;
        return true;
    });

    return (
        <Paper className="rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Box className="bg-[#111A50] px-6 py-4 flex justify-between items-center">
                <Box className="flex items-center text-white">
                    <FaVideo className="mr-3 text-lg" />
                    <Typography variant="h6" className="font-bold">Live Candidate Monitoring</Typography>
                </Box>
                <Box className="flex gap-3">
                    <Select
                        value={viewFilter}
                        onChange={(e) => setViewFilter(e.target.value)}
                        size="small"
                        className="bg-white/20 text-white border-white/30"
                        sx={{ color: 'white', '.MuiSvgIcon-root': { color: 'white' } }}
                    >
                        <MenuItem value="all">All Candidates</MenuItem>
                        <MenuItem value="flagged">Flagged Only</MenuItem>
                        <MenuItem value="high-risk">High Risk</MenuItem>
                    </Select>
                </Box>
            </Box>

            <Box className="p-6 bg-gray-50">
                <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredCandidates.length === 0 ? (
                        <Typography className="text-gray-500 col-span-full text-center py-10">
                            No active candidates in this exam session.
                        </Typography>
                    ) : (
                        filteredCandidates.map((candidate) => (
                            <CandidateCard key={candidate.submission_id} candidate={candidate} />
                        ))
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

const AlertsPanel: React.FC<{ alerts: any[]; search: string; setSearch: (s: string) => void }> = ({ alerts, search, setSearch }) => {
    const filtered = alerts.filter(a =>
        !search || a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.type?.toLowerCase().includes(search.toLowerCase())
    );

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            'SUBJECT_MISMATCH': 'bg-red-100 text-red-700',
            'NO_FACE_DETECTED': 'bg-orange-100 text-orange-700',
            'MULTIPLE_PEOPLE': 'bg-red-100 text-red-700',
            'LOOKING_AWAY': 'bg-yellow-100 text-yellow-700',
            'PHONE_DETECTED': 'bg-purple-100 text-purple-700',
            'TAB_SWITCH': 'bg-blue-100 text-blue-700',
            'MOUSE_LEFT': 'bg-indigo-100 text-indigo-700',
            'FACE_BLURRED': 'bg-gray-100 text-gray-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    return (
        <Paper className="rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Box className="bg-[#111A50] px-6 py-4 flex justify-between items-center">
                <Box className="flex items-center text-white">
                    <FaExclamationTriangle className="mr-3 text-lg" />
                    <Typography variant="h6" className="font-bold">All Alerts Log</Typography>
                    <Chip label={`${alerts.length} total`} size="small" className="ml-3 bg-white/20 text-white" />
                </Box>
                <TextField
                    size="small"
                    placeholder="Search alerts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><FaSearch className="text-gray-400" /></InputAdornment>,
                    }}
                    className="bg-white rounded"
                    sx={{ width: 250 }}
                />
            </Box>
            <Box className="p-4 max-h-[600px] overflow-y-auto">
                {filtered.length === 0 ? (
                    <Typography className="text-gray-500 text-center py-10">No alerts found.</Typography>
                ) : (
                    <Box className="space-y-3">
                        {filtered.map((alert, idx) => (
                            <Box key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                                <Box className="flex items-center space-x-4">
                                    <Box className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                        <FaExclamationTriangle />
                                    </Box>
                                    <Box>
                                        <Typography className="font-bold text-gray-800">{alert.full_name}</Typography>
                                        <Typography variant="caption" className="text-gray-500">{alert.email}</Typography>
                                    </Box>
                                </Box>
                                <Box className="flex items-center space-x-3">
                                    <Chip label={alert.type?.replace(/_/g, ' ')} size="small" className={`font-bold ${getTypeBadge(alert.type)}`} />
                                    <Typography variant="caption" className="text-gray-400">
                                        {alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : ''}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

const AnalyticsPanel: React.FC<{ data: ProctoringBatchData }> = ({ data }) => (
    <Box className="space-y-6">
        <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Detection Distribution */}
            <Paper className="p-6 rounded-xl shadow-sm border border-gray-100">
                <Typography variant="subtitle1" className="font-bold text-gray-800 mb-4 flex items-center">
                    <FaChartLine className="mr-2 text-blue-500" /> Detection Types
                </Typography>
                <Box className="h-64 flex justify-center">
                    <Doughnut
                        data={{
                            labels: data.charts.detection.labels,
                            datasets: [{
                                data: data.charts.detection.data,
                                backgroundColor: ['#EF4444', '#F59E0B', '#EAB308', '#3B82F6', '#6B7280', '#8B5CF6', '#10B981', '#EC4899'],
                                borderWidth: 0
                            }]
                        }}
                        options={{
                            plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 11 } } } },
                            maintainAspectRatio: false
                        }}
                    />
                </Box>
            </Paper>

            {/* Threat Level Over Time */}
            <Paper className="p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                <Typography variant="subtitle1" className="font-bold text-gray-800 mb-4">
                    Real-Time Threat Levels
                </Typography>
                <Box className="h-64">
                    <Line
                        data={{
                            labels: data.charts.threatLevel.labels,
                            datasets: [
                                {
                                    label: 'Critical',
                                    data: data.charts.threatLevel.critical,
                                    borderColor: '#EF4444',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    fill: true,
                                    tension: 0.4
                                },
                                {
                                    label: 'High',
                                    data: data.charts.threatLevel.high,
                                    borderColor: '#F59E0B',
                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                    fill: true,
                                    tension: 0.4
                                },
                                {
                                    label: 'Medium',
                                    data: data.charts.threatLevel.medium,
                                    borderColor: '#3B82F6',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    fill: true,
                                    tension: 0.4
                                }
                            ]
                        }}
                        options={{
                            plugins: { legend: { position: 'top' } },
                            maintainAspectRatio: false,
                            scales: { y: { beginAtZero: true, grid: { display: true } }, x: { grid: { display: false } } }
                        }}
                    />
                </Box>
            </Paper>
        </Box>

        {/* Violations by Type - Bar Chart */}
        <Paper className="p-6 rounded-xl shadow-sm border border-gray-100">
            <Typography variant="subtitle1" className="font-bold text-gray-800 mb-4">
                Violations by Type
            </Typography>
            <Box className="h-64">
                <Bar
                    data={{
                        labels: data.charts.detection.labels,
                        datasets: [{
                            label: 'Count',
                            data: data.charts.detection.data,
                            backgroundColor: ['#EF4444', '#F59E0B', '#EAB308', '#3B82F6', '#6B7280', '#8B5CF6', '#10B981', '#EC4899'],
                            borderRadius: 6,
                        }]
                    }}
                    options={{
                        plugins: { legend: { display: false } },
                        maintainAspectRatio: false,
                        scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
                    }}
                />
            </Box>
        </Paper>
    </Box>
);

const SessionHistoryPanel: React.FC<{ history: HistoryRecord[]; onViewReport: (r: HistoryRecord) => void }> = ({ history, onViewReport }) => (
    <Paper className="rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Box className="bg-[#111A50] px-6 py-4 flex items-center text-white">
            <FaHistory className="mr-3 text-lg" />
            <Typography variant="h6" className="font-bold">Completed Session History</Typography>
            <Chip label={`${history.length} sessions`} size="small" className="ml-3 bg-white/20 text-white" />
        </Box>
        <TableContainer className="max-h-[600px]">
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell className="font-bold">Student</TableCell>
                        <TableCell className="font-bold">Student ID</TableCell>
                        <TableCell className="font-bold">Status</TableCell>
                        <TableCell className="font-bold">Score</TableCell>
                        <TableCell className="font-bold">Grade</TableCell>
                        <TableCell className="font-bold">Warnings</TableCell>
                        <TableCell className="font-bold">Submitted</TableCell>
                        <TableCell className="font-bold">Report</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-10 text-gray-500">No completed sessions yet.</TableCell>
                        </TableRow>
                    ) : (
                        history.map((row) => (
                            <TableRow key={row.submission_id} hover>
                                <TableCell className="font-medium">{row.full_name}</TableCell>
                                <TableCell>{row.student_id}</TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        label={row.status === 'submitted_auto' ? 'Auto-Submitted' : 'Completed'}
                                        className={row.status === 'submitted_auto' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                                    />
                                </TableCell>
                                <TableCell>{row.score_percentage != null ? `${Number(row.score_percentage).toFixed(1)}%` : '\u2014'}</TableCell>
                                <TableCell><span className="font-bold">{row.grade || '\u2014'}</span></TableCell>
                                <TableCell>
                                    <span className={`font-bold ${row.warning_count > 0 ? 'text-red-600' : 'text-green-600'}`}>{row.warning_count}</span>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">{row.submitted_at ? new Date(row.submitted_at).toLocaleString() : '\u2014'}</TableCell>
                                <TableCell>
                                    <Button size="small" variant="outlined" startIcon={<FaEye />} onClick={() => onViewReport(row)}>View</Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
);

const FilteredAlertsPanel: React.FC<{ title: string; icon: React.ReactNode; alerts: any[]; emptyMessage: string }> = ({ title, icon, alerts, emptyMessage }) => (
    <Paper className="rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Box className="bg-[#111A50] px-6 py-4 flex items-center text-white">
            <span className="mr-3 text-lg">{icon}</span>
            <Typography variant="h6" className="font-bold">{title}</Typography>
            <Chip label={`${alerts.length} events`} size="small" className="ml-3 bg-white/20 text-white" />
        </Box>
        <Box className="p-4 max-h-[600px] overflow-y-auto">
            {alerts.length === 0 ? (
                <Box className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <FaCheckCircle className="text-4xl mb-3 text-green-400" />
                    <Typography>{emptyMessage}</Typography>
                </Box>
            ) : (
                <Box className="space-y-3">
                    {alerts.map((alert, idx) => (
                        <Box key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg">
                            <Box className="flex items-center space-x-4">
                                <Box className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                    <FaExclamationTriangle />
                                </Box>
                                <Box>
                                    <Typography className="font-bold text-gray-800">{alert.full_name}</Typography>
                                    <Typography variant="caption" className="text-gray-500">{alert.type?.replace(/_/g, ' ')}</Typography>
                                </Box>
                            </Box>
                            <Typography variant="caption" className="text-gray-400">
                                {alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : ''}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    </Paper>
);

const ComingSoonPanel: React.FC<{ title: string; icon: React.ReactNode; description: string }> = ({ title, icon, description }) => (
    <Paper className="rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Box className="bg-[#111A50] px-6 py-4 flex items-center text-white">
            <span className="mr-3 text-lg">{icon}</span>
            <Typography variant="h6" className="font-bold">{title}</Typography>
        </Box>
        <Box className="flex flex-col items-center justify-center py-24 px-6">
            <Box className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-3xl mb-6">
                {icon}
            </Box>
            <Typography variant="h5" className="font-bold text-gray-700 mb-2">Coming Soon</Typography>
            <Typography className="text-gray-500 text-center max-w-md">{description}</Typography>
        </Box>
    </Paper>
);

const ConfigurationPanel: React.FC = () => (
    <Paper className="rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Box className="bg-[#111A50] px-6 py-4 flex items-center text-white">
            <FaCog className="mr-3 text-lg" />
            <Typography variant="h6" className="font-bold">Proctoring Configuration</Typography>
        </Box>
        <Box className="p-6 space-y-4">
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Typography variant="caption" className="text-gray-500 uppercase font-bold">Capture Interval</Typography>
                    <Typography variant="h5" className="font-bold text-gray-800">Configured per exam</Typography>
                    <Typography variant="body2" className="text-gray-500 mt-1">Set in Exam Builder → Settings → Proctoring Check Interval</Typography>
                </Box>
                <Box className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Typography variant="caption" className="text-gray-500 uppercase font-bold">Analysis Provider</Typography>
                    <Typography variant="h5" className="font-bold text-gray-800">Zyntra AI</Typography>
                    <Typography variant="body2" className="text-gray-500 mt-1">Face matching, gaze tracking, object detection</Typography>
                </Box>
                <Box className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Typography variant="caption" className="text-gray-500 uppercase font-bold">Fail-Open Strategy</Typography>
                    <Typography variant="h5" className="font-bold text-green-600">Enabled</Typography>
                    <Typography variant="body2" className="text-gray-500 mt-1">Students can proceed even if AI service is temporarily unavailable</Typography>
                </Box>
                <Box className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Typography variant="caption" className="text-gray-500 uppercase font-bold">Dashboard Polling</Typography>
                    <Typography variant="h5" className="font-bold text-gray-800">Every 10 seconds</Typography>
                    <Typography variant="body2" className="text-gray-500 mt-1">Live feed refreshes automatically</Typography>
                </Box>
            </Box>
        </Box>
    </Paper>
);

const SecurityRulesPanel: React.FC = () => (
    <Paper className="rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Box className="bg-[#111A50] px-6 py-4 flex items-center text-white">
            <FaShieldAlt className="mr-3 text-lg" />
            <Typography variant="h6" className="font-bold">Security Rules</Typography>
        </Box>
        <Box className="p-6 space-y-4">
            <Box className="space-y-3">
                <Box className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <Box className="flex items-center space-x-3">
                        <Box className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><FaDesktop /></Box>
                        <Box>
                            <Typography className="font-bold text-gray-800">Tab Switch Limit</Typography>
                            <Typography variant="caption" className="text-gray-500">Auto-submit exam after exceeding limit</Typography>
                        </Box>
                    </Box>
                    <Chip label="3 switches" className="bg-blue-100 text-blue-700 font-bold" />
                </Box>
                <Box className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <Box className="flex items-center space-x-3">
                        <Box className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600"><FaExclamationTriangle /></Box>
                        <Box>
                            <Typography className="font-bold text-gray-800">Max Warnings Before Auto-Submit</Typography>
                            <Typography variant="caption" className="text-gray-500">Automatic submission on critical threshold</Typography>
                        </Box>
                    </Box>
                    <Chip label="3 warnings" className="bg-red-100 text-red-700 font-bold" />
                </Box>
                <Box className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <Box className="flex items-center space-x-3">
                        <Box className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600"><FaMouse /></Box>
                        <Box>
                            <Typography className="font-bold text-gray-800">Mouse Leave Detection</Typography>
                            <Typography variant="caption" className="text-gray-500">Tracks when cursor leaves the exam window</Typography>
                        </Box>
                    </Box>
                    <Chip label="Active" className="bg-green-100 text-green-700 font-bold" />
                </Box>
                <Box className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <Box className="flex items-center space-x-3">
                        <Box className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600"><FaBrain /></Box>
                        <Box>
                            <Typography className="font-bold text-gray-800">Gaze Deviation Detection</Typography>
                            <Typography variant="caption" className="text-gray-500">AI-powered eye tracking for suspicious behavior</Typography>
                        </Box>
                    </Box>
                    <Chip label="Active" className="bg-green-100 text-green-700 font-bold" />
                </Box>
                <Box className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <Box className="flex items-center space-x-3">
                        <Box className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600"><FaUsers /></Box>
                        <Box>
                            <Typography className="font-bold text-gray-800">Multiple Person Detection</Typography>
                            <Typography variant="caption" className="text-gray-500">Flags when additional people appear in frame</Typography>
                        </Box>
                    </Box>
                    <Chip label="Active" className="bg-green-100 text-green-700 font-bold" />
                </Box>
            </Box>
        </Box>
    </Paper>
);

// =======================================
// SUB-COMPONENTS
// =======================================

const NavButton: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; expanded: boolean; badge?: number; badgeColor?: string; onClick?: () => void }> = ({ icon, label, active, expanded, badge, badgeColor, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center px-4 py-3 cursor-pointer rounded-lg transition-colors ${active ? 'bg-blue-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
    >
        <span className="text-lg">{icon}</span>
        <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{label}</span>
        {expanded && badge !== undefined && (
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full text-white ${badgeColor || 'bg-blue-600'}`}>{badge}</span>
        )}
    </div>
);

const MetricCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string; bg: string; isAlert?: boolean }> = ({ title, value, icon, color, bg, isAlert }) => (
    <Paper className="p-4 border border-gray-100 rounded-xl shadow-sm flex items-center justify-between relative overflow-hidden">
        {isAlert && value > 0 && <span className="absolute top-0 left-0 w-1 h-full bg-red-500"></span>}
        <div>
            <Typography variant="caption" className="text-gray-500 font-bold uppercase">{title}</Typography>
            <Typography variant="h4" className="font-bold text-gray-800 mt-1">{value}</Typography>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${bg} ${color}`}>
            {icon}
        </div>
    </Paper>
);

const CandidateCard: React.FC<{ candidate: any }> = ({ candidate }) => {
    const isFlagged = candidate.warning_count > 0;
    const borderColor = isFlagged ? (candidate.warning_count > 2 ? 'border-red-500' : 'border-yellow-500') : 'border-green-500';
    const statusLabel = isFlagged ? (candidate.warning_count > 2 ? 'CRITICAL' : 'WARNING') : 'VERIFIED';
    const statusColor = isFlagged ? (candidate.warning_count > 2 ? 'bg-red-600' : 'bg-yellow-600') : 'bg-green-600';

    return (
        <Box className={`bg-white rounded-lg overflow-hidden border-2 ${borderColor} shadow-md relative group`}>
            <Box className="relative aspect-video bg-gray-900">
                {candidate.latest_image_url ? (
                    <img src={candidate.latest_image_url} alt="Feed" className="w-full h-full object-cover opacity-80" />
                ) : (
                    <Box className="w-full h-full flex items-center justify-center text-gray-600">
                        <FaVideo className="text-4xl opacity-20" />
                    </Box>
                )}

                <Box className="absolute top-2 left-2">
                    <span className={`${statusColor} text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide`}>
                        {statusLabel}
                    </span>
                </Box>

                <Box className="absolute top-2 right-2 flex gap-1">
                    <Box className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white text-xs backdrop-blur-sm"><FaVideo /></Box>
                    <Box className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white text-xs backdrop-blur-sm"><FaMicrophone /></Box>
                </Box>

                <Box className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8">
                    <Typography className="text-white text-sm font-bold leading-none truncate">{candidate.full_name}</Typography>
                    <Typography className="text-gray-300 text-xs truncate">{candidate.student_id}</Typography>
                </Box>
            </Box>

            <Box className="p-3">
                <Box className="flex justify-between items-center mb-2">
                    <Typography variant="caption" className="text-gray-500">Violations</Typography>
                    <Typography variant="body2" className={`font-bold ${isFlagged ? 'text-red-600' : 'text-green-600'}`}>
                        {candidate.warning_count}
                    </Typography>
                </Box>
                <Box className="flex justify-between items-center mb-3">
                    <Typography variant="caption" className="text-gray-500">Time Left</Typography>
                    <Typography variant="body2" className="font-mono text-gray-700">
                        {Math.floor(candidate.time_remaining_seconds / 60)}m
                    </Typography>
                </Box>

                <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    className={`text-xs border-gray-200 ${isFlagged ? 'text-red-600 hover:bg-red-50 border-red-200' : 'text-gray-600 hover:bg-gray-50'}`}
                    startIcon={<FaEye />}
                >
                    Monitor
                </Button>
            </Box>
        </Box>
    );
};

export default ProctoringDashboard;