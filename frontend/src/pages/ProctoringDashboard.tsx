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
} from 'react-icons/fa';

// --- Chart.js ---
import { Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
} from 'chart.js';

// --- Service ---
import { getProctoringDashboardBatch, type ProctoringBatchData } from '../services/proctoringService';

// Register Charts
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const ProctoringDashboard: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();

    // State
    const [data, setData] = useState<ProctoringBatchData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Filter State
    const [viewFilter, setViewFilter] = useState('all');

    // --- Fetch Data ---
    const refreshDashboard = useCallback(async () => {
        if (!examId) return;
        try {
            // Silent update if data already exists
            if (!data) setLoading(true);

            const batchData = await getProctoringDashboardBatch(examId);
            setData(batchData);
            setError('');
        } catch (err: any) {
            console.error("Proctoring load failed:", err);
            // Only set error if we don't have data yet
            if (!data) setError('Failed to load proctoring stream.');
        } finally {
            setLoading(false);
        }
    }, [examId, data]);

    // Initial Load & Polling
    useEffect(() => {
        refreshDashboard();
        // Poll every 10 seconds to simulate live feed
        const interval = setInterval(refreshDashboard, 10000);
        return () => clearInterval(interval);
    }, [refreshDashboard]);

    // --- Helper: Format Time ---

    if (loading) return <Box className="h-screen flex items-center justify-center bg-gray-900 text-white"><CircularProgress color="inherit" /></Box>;
    if (error) return <Box className="h-screen flex items-center justify-center bg-gray-900"><Alert severity="error">{error}</Alert></Box>;
    if (!data) return null;

    return (
        <Box className="flex h-screen bg-gray-50 overflow-hidden">

            {/* === 1. PROCTORING SIDEBAR (Dark Theme) === */}
            <Box
                component="aside"
                className={`bg-gray-900 text-white transition-all duration-300 flex flex-col border-r border-gray-800 ${sidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                <Box className="p-4 border-b border-gray-800 flex items-center justify-between h-16">
                    {/* Logo Area */}
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
                            <NavButton icon={<FaVideo />} label="Live Feeds" active={true} expanded={sidebarOpen} badge={data.metrics.activeCandidates} />
                            <NavButton icon={<FaExclamationTriangle />} label="Alerts" active={false} expanded={sidebarOpen} badge={data.metrics.totalAlerts} badgeColor="bg-red-500" />
                            <NavButton icon={<FaChartLine />} label="Analytics" active={false} expanded={sidebarOpen} />
                            <NavButton icon={<FaHistory />} label="Session History" active={false} expanded={sidebarOpen} />
                        </div>
                    </Box>

                    {/* AI Detection Section */}
                    <Box>
                        {sidebarOpen && <Typography variant="caption" className="text-gray-500 uppercase font-bold mb-2 block px-2">AI Detection</Typography>}
                        <div className="space-y-1">
                            <NavButton icon={<FaUsers />} label="Face Detection" expanded={sidebarOpen} />
                            <NavButton icon={<FaMicrophone />} label="Audio Analysis" expanded={sidebarOpen} />
                            <NavButton icon={<FaDesktop />} label="Screen Monitor" expanded={sidebarOpen} />
                            <NavButton icon={<FaBrain />} label="Behavior AI" expanded={sidebarOpen} />
                        </div>
                    </Box>

                    {/* Settings Section */}
                    <Box>
                        {sidebarOpen && <Typography variant="caption" className="text-gray-500 uppercase font-bold mb-2 block px-2">Settings</Typography>}
                        <div className="space-y-1">
                            <NavButton icon={<FaCog />} label="Configuration" expanded={sidebarOpen} />
                            <NavButton icon={<FaShieldAlt />} label="Security Rules" expanded={sidebarOpen} />
                        </div>
                    </Box>
                </Box>
            </Box>

            {/* === 2. MAIN CONTENT === */}
            <Box className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <Box component="header" className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
                    <Typography variant="h6" className="font-bold text-gray-800 flex items-center">
                        <span className="mr-2 text-blue-600"><FaVideo /></span> Proctoring Dashboard
                    </Typography>

                    <Box className="flex items-center space-x-4">
                        <Chip
                            label="System Active"
                            className="bg-green-100 text-green-700 font-bold border-none"
                            icon={<Box className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1" />}
                        />
                        <IconButton className="relative">
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

                    {/* 1. METRICS ROW */}
                    <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <MetricCard title="Active Candidates" value={data.metrics.activeCandidates} icon={<FaUsers />} color="text-blue-600" bg="bg-blue-100" />
                        <MetricCard title="Security Alerts" value={data.metrics.totalAlerts} icon={<FaExclamationTriangle />} color="text-red-600" bg="bg-red-100" isAlert />
                        <MetricCard title="Verified Sessions" value={data.metrics.verifiedSessions} icon={<FaCheckCircle />} color="text-green-600" bg="bg-green-100" />
                        <MetricCard title="AI Detections" value={data.metrics.aiDetections} icon={<FaBrain />} color="text-purple-600" bg="bg-purple-100" />
                    </Box>

                    {/* 2. CHARTS & ALERTS ROW */}
                    <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Detection Distribution */}
                        <Paper className="p-4 rounded-xl shadow-sm border border-gray-100">
                            <Typography variant="subtitle1" className="font-bold text-gray-800 mb-4 flex items-center">
                                <FaChartLine className="mr-2 text-blue-500" /> Detection Types
                            </Typography>
                            <Box className="h-48 flex justify-center">
                                <Doughnut
                                    data={{
                                        labels: data.charts.detection.labels,
                                        datasets: [{
                                            data: data.charts.detection.data,
                                            backgroundColor: ['#EF4444', '#F59E0B', '#EAB308', '#3B82F6', '#6B7280'],
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
                        <Paper className="p-4 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                            <Typography variant="subtitle1" className="font-bold text-gray-800 mb-4">
                                Real-Time Threat Levels
                            </Typography>
                            <Box className="h-48">
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

                    {/* 3. LIVE VIDEO FEEDS */}
                    <Paper className="rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <Box className="bg-[#1A1F91] px-6 py-4 flex justify-between items-center">
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
                                {data.candidates.length === 0 ? (
                                    <Typography className="text-gray-500 col-span-full text-center py-10">
                                        No active candidates in this exam session.
                                    </Typography>
                                ) : (
                                    data.candidates.map((candidate) => (
                                        <CandidateCard key={candidate.submission_id} candidate={candidate} />
                                    ))
                                )}
                            </Box>
                        </Box>
                    </Paper>

                </Box>
            </Box>
        </Box>
    );
};

// --- SUB-COMPONENTS ---

const NavButton: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; expanded: boolean; badge?: number; badgeColor?: string }> = ({ icon, label, active, expanded, badge, badgeColor }) => (
    <div className={`flex items-center px-4 py-3 cursor-pointer rounded-lg transition-colors ${active ? 'bg-blue-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
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
    // Determine status styling
    const isFlagged = candidate.warning_count > 0;
    const borderColor = isFlagged ? (candidate.warning_count > 2 ? 'border-red-500' : 'border-yellow-500') : 'border-green-500';
    const statusLabel = isFlagged ? (candidate.warning_count > 2 ? 'CRITICAL' : 'WARNING') : 'VERIFIED';
    const statusColor = isFlagged ? (candidate.warning_count > 2 ? 'bg-red-600' : 'bg-yellow-600') : 'bg-green-600';

    return (
        <Box className={`bg-white rounded-lg overflow-hidden border-2 ${borderColor} shadow-md relative group`}>
            {/* Simulated Video Feed Area */}
            <Box className="relative aspect-video bg-gray-900">
                {candidate.latest_image_url ? (
                    <img src={candidate.latest_image_url} alt="Feed" className="w-full h-full object-cover opacity-80" />
                ) : (
                    <Box className="w-full h-full flex items-center justify-center text-gray-600">
                        <FaVideo className="text-4xl opacity-20" />
                    </Box>
                )}

                {/* Overlays */}
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

            {/* Details Panel */}
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