import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Divider
} from "@mui/material";
import {
    FaChalkboardTeacher,
    FaUserGraduate,
    FaFileAlt,
    FaChartLine,
    FaHistory,
    FaClock
} from "react-icons/fa";
import { getOrganizationStats, getOrganizationLogs } from "../services/centralAdminService";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// --- Mock Data / Interfaces ---
interface DashboardMetrics {
    totalTeachers: number;
    totalStudents: number;
    totalExams: number;
    activeSessions: number;
    teacherGrowth: string;
    studentGrowth: string;
    examGrowth: string;
    chartData?: {
        studentMonthly: { month: string; count: string }[];
        teacherMonthly: { month: string; count: string }[];
        examStatus: { completed: number; inProgress: number; notStarted: number };
    };
}

interface ActivityLog {
    id: string;
    action: string;
    details: string;
    timestamp: string;
}

const CentralAdminOverview: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsData, logsData] = await Promise.all([
                    getOrganizationStats(),
                    getOrganizationLogs()
                ]);

                if (statsData) {
                    setMetrics(statsData);
                }

                if (logsData) {
                    const formattedLogs = logsData.map((log: any) => ({
                        id: log.id,
                        action: log.action,
                        details: log.details,
                        timestamp: log.created_at
                    }));
                    setRecentActivity(formattedLogs);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Chart Data Processing ---
    const processGrowthData = () => {
        if (!metrics?.chartData) return { labels: [], datasets: [] };

        const { studentMonthly, teacherMonthly } = metrics.chartData;

        // Generate last 6 months labels chronologically
        const labels: string[] = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(d.toLocaleString('default', { month: 'short' }));
        }

        // Map data to the generated labels
        const studentData = labels.map(label => {
            const found = studentMonthly.find(d => d.month === label);
            return found ? parseInt(found.count) : 0;
        });

        const teacherData = labels.map(label => {
            const found = teacherMonthly.find(d => d.month === label);
            return found ? parseInt(found.count) : 0;
        });

        return {
            labels,
            datasets: [
                {
                    label: 'Students',
                    data: studentData,
                    borderColor: 'rgb(79, 70, 229)', // Indigo
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true,
                },
                {
                    label: 'Teachers',
                    data: teacherData,
                    borderColor: 'rgb(16, 185, 129)', // Emerald
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                },
            ],
        };
    };

    const processExamStatusData = () => {
        if (!metrics?.chartData?.examStatus) return { labels: [], datasets: [] };
        const { completed, inProgress, notStarted } = metrics.chartData.examStatus;

        return {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [
                {
                    data: [completed, inProgress, notStarted],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)', // Emerald
                        'rgba(245, 158, 11, 0.8)', // Amber
                        'rgba(107, 114, 128, 0.8)', // Gray
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    const growthChartData = processGrowthData();
    const examCompletionData = processExamStatusData();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className="p-4">
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1f2937', mb: 4 }} className="animate-fade-in-down">
                Organization Overview
            </Typography>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <MetricCard
                        title="Total Teachers"
                        value={metrics?.totalTeachers || 0}
                        growth={metrics?.teacherGrowth || "0"}
                        icon={<FaChalkboardTeacher />}
                        color="indigo"
                    />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <MetricCard
                        title="Total Students"
                        value={metrics?.totalStudents || 0}
                        growth={metrics?.studentGrowth || "0"}
                        icon={<FaUserGraduate />}
                        color="emerald"
                    />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <MetricCard
                        title="Total Exams"
                        value={metrics?.totalExams || 0}
                        growth={metrics?.examGrowth || "0"}
                        icon={<FaFileAlt />}
                        color="amber"
                    />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <MetricCard
                        title="Active Sessions"
                        value={metrics?.activeSessions || 0}
                        growth="Live"
                        icon={<FaChartLine />}
                        color="rose"
                    />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <div className="bg-white/80 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>Growth Trends</Typography>
                        <Box sx={{ height: 300 }}>
                            <Line data={growthChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                        </Box>
                    </div>
                </div>
                <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <div className="bg-white/80 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>Exam Status</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Doughnut data={examCompletionData} options={{ maintainAspectRatio: false, responsive: true }} />
                        </Box>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <div className="bg-white/80 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FaHistory className="text-gray-500 mr-2" />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>Recent Activity</Typography>
                    </Box>
                    <Divider sx={{ mb: 2, borderColor: 'rgba(0,0,0,0.05)' }} />
                    {recentActivity.map((log) => (
                        <Box key={log.id} sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }} className="hover:bg-gray-50/50 p-2 rounded-lg transition-colors duration-200">
                            <Box sx={{
                                p: 1,
                                borderRadius: '50%',
                                bgcolor: 'rgba(243, 244, 246, 0.8)',
                                color: 'grey.600',
                                mr: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FaClock size={14} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1f2937' }}>{log.action}</Typography>
                                <Typography variant="body2" color="text.secondary">{log.details}</Typography>
                                <Typography variant="caption" color="text.disabled">
                                    {new Date(log.timestamp).toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </div>
            </div>
        </Box>
    );
};

// --- Helper Component ---
const MetricCard: React.FC<{ title: string; value: number | string; growth: string; icon: React.ReactElement; color: string }> =
    ({ title, value, growth, icon, color }) => {
        // Map color names to hex/classes roughly
        const colorMap: Record<string, { bg: string, text: string }> = {
            indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
            emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
            amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
            rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
        };
        const theme = colorMap[color] || colorMap.indigo;

        return (
            <div className="bg-white/80 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 h-full group cursor-default">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="body2" className="text-gray-500 font-medium tracking-wide uppercase text-xs">
                            {title}
                        </Typography>
                        <Typography variant="h4" className="font-bold my-2 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                            {value}
                        </Typography>
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${growth.includes('+') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {growth}
                        </div>
                    </Box>
                    <div className={`p-3 rounded-xl bg-[#3C4DCE] text-white shadow-md group-hover:shadow-lg group-hover:rotate-12 transition-all duration-300`}>
                        <div className="text-xl">
                            {icon}
                        </div>
                    </div>
                </Box>
            </div>
        );
    };

export default CentralAdminOverview;
