// frontend/src/pages/CourseAdminOverview.tsx

import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useNavigate } from "react-router-dom";
// --- Chart Imports ---
import { Doughnut, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";
import type { ChartData } from 'chart.js';

// --- Icon Imports ---
import {
    FaUsers,
    FaFileAlt,
    FaChartLine,
    FaCheckCircle,
    FaTachometerAlt,
    FaAngleDoubleRight,
    FaUserGraduate,
    FaClipboardList,
    FaBrain,
    FaHistory,
    FaClock
} from "react-icons/fa";

// --- API Service Imports ---
import { getTeacherDashboardBatch } from "../services/courseAdminService";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);


// --- Data Interfaces ---
interface ActivityLog {
    action: string;
    details: string;
    timestamp: string;
}

interface ExamItem {
    id: string;
    title: string;
}

interface DashboardMetrics {
    totalStudents: number;
    activeExams: number;
    averageScore: number;
    passRate: string;
    aiInsights: number;
    passRateChange: string;
    recentActivity: ActivityLog[];
    examList: ExamItem[];
}

interface PerformanceData {
    labels: string[];
    avgScores: number[];
    passRates: number[];
}

interface DistributionData {
    labels: string[];
    data: number[];
    colors: string[];
}

// =======================================================
// MAIN COMPONENT
// =======================================================
const CourseAdminOverview: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<{ metrics: DashboardMetrics, performance: PerformanceData, distribution: DistributionData } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedExamId, setSelectedExamId] = useState("all");

    // --- DATA FETCHING ---
    const fetchStats = async (examId: string = 'all'): Promise<void> => {
        setLoading(true);
        setError("");
        try {
            const data = await getTeacherDashboardBatch(examId);
            setStats(data);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to load dashboard stats.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchStats(selectedExamId);
    }, [selectedExamId]);

    // --- CHART DATA PROCESSING ---
    const performanceChartData: ChartData<'line'> = useMemo(() => {
        if (!stats) return { datasets: [] };

        return {
            labels: stats.performance.labels,
            datasets: [
                {
                    label: "Average Score (%)",
                    data: stats.performance.avgScores,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4,
                    fill: true,
                },
                {
                    label: "Pass Rate (%)",
                    data: stats.performance.passRates,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4,
                    fill: false,
                },
            ],
        };
    }, [stats]);

    const distributionChartData: ChartData<'doughnut'> = useMemo(() => {
        if (!stats) return { datasets: [] };

        return {
            labels: stats.distribution.labels,
            datasets: [
                {
                    data: stats.distribution.data,
                    backgroundColor: stats.distribution.colors,
                    borderColor: "#ffffff",
                    borderWidth: 2,
                },
            ],
        };
    }, [stats]);


    if (loading)
        return (
            <Box className="flex justify-center items-center h-[calc(100vh-200px)]">
                <CircularProgress />
            </Box>
        );

    if (error) return <Alert severity="error">{error}</Alert>;
    if (!stats)
        return (
            <Alert severity="warning">
                No stats available. Make sure students have completed at least one exam.
            </Alert>
        );

    const metrics = stats.metrics;

    return (
        <Box>
            {/* HEADER + FILTER */}
            <Box className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <Typography variant="h5" className="font-bold text-gray-900 flex items-center space-x-2">
                    <FaTachometerAlt className="text-[#111A50]" />
                    <span>Teacher Dashboard</span>
                </Typography>

                <FormControl sx={{ minWidth: 250 }} size="small" className="bg-white rounded-lg">
                    <InputLabel>Filter by Exam</InputLabel>
                    <Select
                        value={selectedExamId}
                        label="Filter by Exam"
                        onChange={(e: SelectChangeEvent<string>) => setSelectedExamId(e.target.value)}
                    >
                        <MenuItem value="all">
                            <em>All Exams</em>
                        </MenuItem>
                        {metrics.examList && metrics.examList.map((exam) => (
                            <MenuItem key={exam.id} value={exam.id}>{exam.title}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* KPI CARDS */}
            <Box className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <MetricCard
                    title="Total Students"
                    value={metrics.totalStudents}
                    subText={`Enrolled`}
                    icon={<FaUsers />}
                    iconBg="bg-blue-100"
                    iconColor="text-[#111A50]"
                    subTextColor="text-green-600"
                />
                <MetricCard
                    title="Active Exams"
                    value={metrics.activeExams}
                    subText={`Live`}
                    icon={<FaFileAlt />}
                    iconBg="bg-orange-100"
                    iconColor="text-orange-600"
                    subTextColor="text-orange-600"
                />
                <MetricCard
                    title="Average Score"
                    value={`${metrics.averageScore}%`}
                    subText={`Overall`}
                    icon={<FaChartLine />}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                    subTextColor="text-green-600"
                />
                <MetricCard
                    title="Pass Rate"
                    value={metrics.passRate}
                    subText={`${metrics.passRateChange} vs prior`}
                    icon={<FaCheckCircle />}
                    iconBg="bg-teal-100"
                    iconColor="text-teal-600"
                    subTextColor="text-teal-600"
                />
                <MetricCard
                    title="AI Insights"
                    value={metrics.aiInsights}
                    subText={`Recommendations`}
                    icon={<FaAngleDoubleRight />}
                    iconBg="bg-purple-100"
                    iconColor="text-purple-600"
                    subTextColor="text-purple-600"
                />
            </Box>

            {/* CHARTS SECTION */}
            <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* 1. Results Distribution Chart */}
                <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 lg:col-span-1" sx={{ height: 420 }}>
                    <Typography variant="h6" className="font-semibold text-gray-900 mb-4">
                        Results Distribution
                    </Typography>
                    <Box sx={{ height: 320, display: 'flex', justifyContent: 'center' }}>
                        <Doughnut
                            data={distributionChartData}
                            options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" as const } } }}
                        />
                    </Box>
                </Paper>

                {/* 2. Performance Line Chart */}
                <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 lg:col-span-2" sx={{ height: 420 }}>
                    <Typography variant="h6" className="font-semibold text-gray-900 mb-4">
                        Student Performance Trends (30 Days)
                    </Typography>
                    <Box sx={{ height: 320 }}>
                        <Line
                            data={performanceChartData}
                            options={performanceChartOptions()}
                        />
                    </Box>
                </Paper>
            </Box>

            {/* QUICK ACTIONS SECTION */}
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <QuickActionCard
                    title="Manage Students"
                    description="Add, edit, or remove students"
                    icon={<FaUserGraduate />}
                    color="bg-blue-50 text-[#111A50]"
                    onClick={() => navigate('/courseadmin/students')}
                />
                <QuickActionCard
                    title="Create Exams"
                    description="Design and schedule exams"
                    icon={<FaClipboardList />}
                    color="bg-orange-50 text-orange-600"
                    onClick={() => navigate('/courseadmin/exams')}
                />
                <QuickActionCard
                    title="AI Insights"
                    description="Get personalized feedback"
                    icon={<FaBrain />}
                    color="bg-purple-50 text-purple-600"
                    onClick={() => navigate('/courseadmin/insights')} // Placeholder route
                />
            </Box>

            {/* RECENT ACTIVITY LOGS */}
            <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <Box className="flex justify-between items-center mb-4">
                    <Typography variant="h6" className="font-semibold text-gray-900 flex items-center">
                        <FaHistory className="mr-2 text-gray-500" /> Recent Activity
                    </Typography>
                    <Button size="small" color="primary">View All</Button>
                </Box>

                <List>
                    {metrics.recentActivity && metrics.recentActivity.length > 0 ? (
                        metrics.recentActivity.map((log, index) => (
                            <React.Fragment key={index}>
                                <ListItem alignItems="flex-start" className="hover:bg-gray-50 rounded-lg transition-colors">
                                    <ListItemIcon className="mt-1">
                                        <Box className="p-2 bg-gray-100 rounded-full text-gray-600">
                                            <FaClock size={16} />
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" className="font-medium text-gray-900">
                                                {log.action}
                                            </Typography>
                                        }
                                        secondary={
                                            <React.Fragment>
                                                <Typography component="span" variant="body2" className="text-gray-600 block">
                                                    {log.details}
                                                </Typography>
                                                <Typography component="span" variant="caption" className="text-gray-400 mt-1 block">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </Typography>
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                                {index < metrics.recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="No recent activity found." />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Box>
    );
};

export default CourseAdminOverview;

// =======================================================
// HELPER COMPONENTS & CHART OPTIONS
// =======================================================

// --- Metric Card ---
const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement; iconBg: string; iconColor: string; subText: string; subTextColor: string }> =
    ({ title, value, icon, iconBg, iconColor, subText, subTextColor }) => (
        <Paper className="metric-card bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-shadow">
            <Box className="flex items-center justify-between">
                <Box>
                    <Typography className="text-gray-600 text-sm font-medium">{title}</Typography>
                    <Typography className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</Typography>
                    <Typography className={`${subTextColor} text-sm mt-2 flex items-center`}>
                        {subText}
                    </Typography>
                </Box>
                <Box className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBg} ${iconColor} text-lg sm:text-xl rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {icon}
                </Box>
            </Box>
        </Paper>
    );

// --- Quick Action Card ---
const QuickActionCard: React.FC<{ title: string; description: string; icon: React.ReactElement; color: string; onClick: () => void }> =
    ({ title, description, icon, color, onClick }) => (
        <Paper
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all cursor-pointer flex items-center space-x-4"
            onClick={onClick}
        >
            <Box className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${color}`}>
                {icon}
            </Box>
            <Box>
                <Typography variant="h6" className="font-bold text-gray-900">
                    {title}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                    {description}
                </Typography>
            </Box>
            <Box className="ml-auto text-gray-400">
                <FaAngleDoubleRight />
            </Box>
        </Paper>
    );

// --- Chart Options ---
const performanceChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: {
                usePointStyle: true,
            },
        },
    },
    scales: {
        y1: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            min: 0,
            max: 100,
            title: {
                display: true,
                text: 'Score/Rate (%)'
            }
        },
    },
});