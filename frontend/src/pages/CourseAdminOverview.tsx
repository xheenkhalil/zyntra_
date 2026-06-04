// frontend/src/pages/CourseAdminOverview.tsx

import React, { useEffect, useState, useMemo, useRef } from "react";
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
    Divider,
    IconButton,
    TextField,
    Tooltip
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

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
    Tooltip as ChartTooltip,
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
    FaUserGraduate,
    FaClipboardList,
    FaBrain,
    FaHistory,
    FaClock,
    FaImage,
    FaFileCsv,
    FaChevronDown,
    FaChevronUp,
    FaSearch,
    FaExclamationTriangle,
    FaInfoCircle,
    FaShieldAlt
} from "react-icons/fa";

// --- API Service Imports ---
import { getTeacherDashboardBatch } from "../services/courseAdminService";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, ChartTooltip, Legend);

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
    participationRate: string;
    integrityAlertRate: string;
    strugglingStudentsCount: number;
    aiInsights: number;
    recommendationsList: string[];
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

interface ExamDetailedItem {
    id: string;
    title: string;
    status: string;
    created_at: string;
    duration_minutes: number;
    total_questions: number;
    submissions_count: number;
    average_score: number;
    high_score: number;
    low_score: number;
    passed_count: number;
    total_warnings: number;
    proctor_flags_count: number;
    passRate: string;
    completionRate: string;
}

interface StudentDetailedItem {
    id: string;
    full_name: string;
    email: string;
    student_id: string;
    status: string;
    exams_attempted: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
    total_warnings: number;
    proctor_flags_count: number;
    performanceStatus: string;
    riskStatus: string;
}

interface QuestionDetailedItem {
    id: string;
    questionText: string;
    questionType: string;
    correctCount: number;
    answeredCount: number;
    successRate: number;
    difficulty: string;
    options: any[] | null;
}

interface TeacherDashboardData {
    metrics: DashboardMetrics;
    performance: PerformanceData;
    distribution: DistributionData;
    examsDetailedList: ExamDetailedItem[];
    studentsDetailedList: StudentDetailedItem[];
    questionDetailedList: QuestionDetailedItem[];
}

// =======================================================
// MAIN COMPONENT
// =======================================================
const CourseAdminOverview: React.FC = () => {
    const [stats, setStats] = useState<TeacherDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedExamId, setSelectedExamId] = useState("all");
    const [activeTab, setActiveTab] = useState<"overview" | "exams" | "students" | "questions">("overview");

    // --- Search & Filter States ---
    const [examSearch, setExamSearch] = useState("");
    const [examStatusFilter, setExamStatusFilter] = useState("all");

    const [studentSearch, setStudentSearch] = useState("");
    const [studentPerformanceFilter, setStudentPerformanceFilter] = useState("all");
    const [studentRiskFilter, setStudentRiskFilter] = useState("all");

    const [questionSearch, setQuestionSearch] = useState("");
    const [questionTypeFilter, setQuestionTypeFilter] = useState("all");
    const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState("all");

    // --- Sorting States ---
    const [examSort, setExamSort] = useState<{ key: string; direction: "asc" | "desc" }>({
        key: "created_at",
        direction: "desc"
    });
    const [studentSort, setStudentSort] = useState<{ key: string; direction: "asc" | "desc" }>({
        key: "full_name",
        direction: "asc"
    });
    const [questionSort, setQuestionSort] = useState<{ key: string; direction: "asc" | "desc" }>({
        key: "successRate",
        direction: "asc" // default sorted from hardest to easiest
    });

    // --- Chart References for PNG Export ---
    const lineChartRef = useRef<any>(null);
    const doughnutChartRef = useRef<any>(null);

    // --- SORTING EVENT HANDLERS ---
    const handleExamSort = (key: string) => {
        setExamSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const handleStudentSort = (key: string) => {
        setStudentSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const handleQuestionSort = (key: string) => {
        setQuestionSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

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
                    borderColor: '#111A50',
                    backgroundColor: 'rgba(17, 26, 80, 0.1)',
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

    // --- CSV EXPORT HELPER ---
    const exportToCSV = (data: any[], headers: string[], keys: string[], filename: string) => {
        const csvRows = [];
        // 1. Add headers
        csvRows.push(headers.join(','));
        
        // 2. Add data rows
        for (const row of data) {
            const values = keys.map(key => {
                let val = row[key];
                if (val === null || val === undefined) {
                    val = '';
                } else {
                    // Escape quotes and handle commas
                    val = String(val).replace(/"/g, '""');
                    if (val.includes(',') || val.includes('\n') || val.includes('"')) {
                        val = `"${val}"`;
                    }
                }
                return val;
            });
            csvRows.push(values.join(','));
        }
        
        // 3. Trigger download
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        link.click();
    };

    // --- PNG CHART EXPORT ---
    const downloadChart = (chartRef: React.RefObject<any>, fileName: string) => {
        if (chartRef.current) {
            const base64 = chartRef.current.toBase64Image();
            const link = document.createElement('a');
            link.download = fileName;
            link.href = base64;
            link.click();
        }
    };

    // --- SORTING & FILTERING LOGIC ---
    const sortedExams = useMemo(() => {
        if (!stats || !stats.examsDetailedList) return [];

        let result = stats.examsDetailedList.filter((exam) => {
            const matchesSearch = exam.title.toLowerCase().includes(examSearch.toLowerCase());
            const matchesStatus = examStatusFilter === "all" || exam.status.toLowerCase() === examStatusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });

        result.sort((a: any, b: any) => {
            let valA = a[examSort.key];
            let valB = b[examSort.key];

            if (examSort.key === "passRate" || examSort.key === "completionRate") {
                valA = parseFloat(String(valA).replace("%", "")) || 0;
                valB = parseFloat(String(valB).replace("%", "")) || 0;
            }

            if (typeof valA === "string") {
                return examSort.direction === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            if (valA < valB) return examSort.direction === "asc" ? -1 : 1;
            if (valA > valB) return examSort.direction === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [stats, examSearch, examStatusFilter, examSort]);

    const sortedStudents = useMemo(() => {
        if (!stats || !stats.studentsDetailedList) return [];

        let result = stats.studentsDetailedList.filter((student) => {
            const matchesSearch = 
                student.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                student.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
                (student.student_id && student.student_id.toLowerCase().includes(studentSearch.toLowerCase()));
            
            const matchesPerformance = studentPerformanceFilter === "all" || student.performanceStatus === studentPerformanceFilter;
            const matchesRisk = studentRiskFilter === "all" || student.riskStatus === studentRiskFilter;

            return matchesSearch && matchesPerformance && matchesRisk;
        });

        result.sort((a: any, b: any) => {
            const valA = a[studentSort.key];
            const valB = b[studentSort.key];

            if (typeof valA === "string") {
                return studentSort.direction === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            if (valA < valB) return studentSort.direction === "asc" ? -1 : 1;
            if (valA > valB) return studentSort.direction === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [stats, studentSearch, studentPerformanceFilter, studentRiskFilter, studentSort]);

    const sortedQuestions = useMemo(() => {
        if (!stats || !stats.questionDetailedList) return [];

        let result = stats.questionDetailedList.filter((q) => {
            const matchesSearch = q.questionText.toLowerCase().includes(questionSearch.toLowerCase());
            const matchesType = questionTypeFilter === "all" || q.questionType === questionTypeFilter;
            const matchesDifficulty = questionDifficultyFilter === "all" || q.difficulty === questionDifficultyFilter;

            return matchesSearch && matchesType && matchesDifficulty;
        });

        result.sort((a: any, b: any) => {
            const valA = a[questionSort.key];
            const valB = b[questionSort.key];

            if (typeof valA === "string") {
                return questionSort.direction === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            if (valA < valB) return questionSort.direction === "asc" ? -1 : 1;
            if (valA > valB) return questionSort.direction === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [stats, questionSearch, questionTypeFilter, questionDifficultyFilter, questionSort]);


    if (loading)
        return (
            <Box className="flex justify-center items-center h-[calc(100vh-200px)]">
                <CircularProgress sx={{ color: "#111A50" }} />
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

    // --- SORT HEADER WIDGET ---
    const renderSortHeader = (
        label: string, 
        sortKey: string, 
        currentSort: { key: string; direction: "asc" | "desc" }, 
        onSort: (key: string) => void
    ) => {
        const isSorted = currentSort.key === sortKey;
        return (
            <th 
                onClick={() => onSort(sortKey)}
                className="px-6 py-3 text-left text-xs font-semibold text-[#111A50] uppercase tracking-wider cursor-pointer hover:bg-slate-100 hover:text-gray-900 transition-colors select-none"
            >
                <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    <span className="text-gray-400">
                        {isSorted ? (
                            currentSort.direction === "asc" ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />
                        ) : (
                            <div className="flex flex-col space-y-0.5 opacity-30">
                                <FaChevronUp size={8} />
                                <FaChevronDown size={8} />
                            </div>
                        )}
                    </span>
                </div>
            </th>
        );
    };

    return (
        <Box>
            {/* HEADER + GLOBAL FILTER */}
            <Box className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <Typography variant="h5" className="font-bold text-gray-900 flex items-center space-x-2">
                    <FaTachometerAlt className="text-[#111A50]" />
                    <span>Teacher Dashboard</span>
                </Typography>

                <FormControl sx={{ minWidth: 250 }} size="small" className="bg-white rounded-lg">
                    <InputLabel>Filter Overview by Exam</InputLabel>
                    <Select
                        value={selectedExamId}
                        label="Filter Overview by Exam"
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

            {/* TAB NAVIGATION */}
            <Box className="border-b border-gray-200 mb-6 bg-white p-1 rounded-lg shadow-sm flex flex-wrap gap-2">
                {(["overview", "exams", "students", "questions"] as const).map((tab) => {
                    const isActive = activeTab === tab;
                    const tabIcons = {
                        overview: <FaTachometerAlt className="mr-2" />,
                        exams: <FaClipboardList className="mr-2" />,
                        students: <FaUserGraduate className="mr-2" />,
                        questions: <FaBrain className="mr-2" />
                    };
                    const tabLabels = {
                        overview: "Overview Dashboard",
                        exams: "Exam Analytics",
                        students: "Student Performance",
                        questions: "Question Difficulty"
                    };

                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center py-2.5 px-4 rounded-lg font-semibold text-sm transition-all focus:outline-none ${
                                isActive
                                    ? "bg-[#111A50] text-white shadow-md"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-slate-100"
                            }`}
                        >
                            {tabIcons[tab]}
                            <span>{tabLabels[tab]}</span>
                        </button>
                    );
                })}
            </Box>

            {/* TAB CONTENT 1: OVERVIEW */}
            {activeTab === "overview" && (
                <Box>
                    {/* KPI CARDS */}
                    <Box className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                        <MetricCard
                            title="Total Students"
                            value={metrics.totalStudents}
                            subText="Enrolled"
                            icon={<FaUsers />}
                            iconBg="bg-blue-100"
                            iconColor="text-[#111A50]"
                            subTextColor="text-green-600"
                        />
                        <MetricCard
                            title="Active Exams"
                            value={metrics.activeExams}
                            subText="Live Status"
                            icon={<FaFileAlt />}
                            iconBg="bg-orange-100"
                            iconColor="text-orange-600"
                            subTextColor="text-orange-600"
                        />
                        <MetricCard
                            title="Average Score"
                            value={`${metrics.averageScore}%`}
                            subText="Overall Average"
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
                            title="Participation"
                            value={metrics.participationRate}
                            subText="Completion Rate"
                            icon={<FaClipboardList />}
                            iconBg="bg-indigo-100"
                            iconColor="text-[#111A50]"
                            subTextColor="text-indigo-600"
                        />
                        <MetricCard
                            title="Integrity Alerts"
                            value={metrics.integrityAlertRate}
                            subText="Flagged Submissions"
                            icon={<FaShieldAlt />}
                            iconBg="bg-red-100"
                            iconColor="text-red-600"
                            subTextColor="text-red-600"
                        />
                        <MetricCard
                            title="Struggling Students"
                            value={metrics.strugglingStudentsCount}
                            subText="Avg Score < 50%"
                            icon={<FaExclamationTriangle />}
                            iconBg="bg-rose-100"
                            iconColor="text-rose-600"
                            subTextColor="text-rose-600"
                        />
                        <MetricCard
                            title="AI Insights"
                            value={metrics.aiInsights}
                            subText="Recommendations"
                            icon={<FaBrain />}
                            iconBg="bg-purple-100"
                            iconColor="text-purple-600"
                            subTextColor="text-purple-600"
                        />
                    </Box>

                    {/* AI RECOMMENDATIONS CARD */}
                    {metrics.recommendationsList && metrics.recommendationsList.length > 0 && (
                        <Paper className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 mb-6 hover:shadow-xl transition-shadow">
                            <Typography variant="h6" className="font-semibold text-gray-900 mb-4 flex items-center">
                                <FaBrain className="text-purple-600 mr-2 animate-pulse" /> Zyntra AI Insights & Recommendations
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {metrics.recommendationsList.map((rec, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50/50 rounded-lg border border-purple-100/50 text-[#111A50]">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold mt-0.5">
                                            {index + 1}
                                        </span>
                                        <Typography variant="body2" className="text-gray-700 font-medium leading-relaxed">
                                            {rec}
                                        </Typography>
                                    </div>
                                ))}
                            </div>
                        </Paper>
                    )}

                    {/* CHARTS SECTION */}
                    <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* 1. Results Distribution Chart */}
                        <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 lg:col-span-1" sx={{ height: 420 }}>
                            <Box className="flex justify-between items-center mb-4">
                                <Typography variant="h6" className="font-semibold text-gray-900">
                                    Results Distribution
                                </Typography>
                                <IconButton 
                                    size="small" 
                                    onClick={() => downloadChart(doughnutChartRef, "results_distribution.png")}
                                    title="Download Chart as PNG"
                                    className="text-gray-400 hover:text-[#111A50]"
                                >
                                    <FaImage size={18} />
                                </IconButton>
                            </Box>
                            <Box sx={{ height: 320, display: 'flex', justifyContent: 'center' }}>
                                <Doughnut
                                    ref={doughnutChartRef}
                                    data={distributionChartData}
                                    options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" as const } } }}
                                />
                            </Box>
                        </Paper>

                        {/* 2. Performance Line Chart */}
                        <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 lg:col-span-2" sx={{ height: 420 }}>
                            <Box className="flex justify-between items-center mb-4">
                                <Typography variant="h6" className="font-semibold text-gray-900">
                                    Student Performance Trends (30 Days)
                                </Typography>
                                <IconButton 
                                    size="small" 
                                    onClick={() => downloadChart(lineChartRef, "student_performance_trends.png")}
                                    title="Download Chart as PNG"
                                    className="text-gray-400 hover:text-[#111A50]"
                                >
                                    <FaImage size={18} />
                                </IconButton>
                            </Box>
                            <Box sx={{ height: 320 }}>
                                <Line
                                    ref={lineChartRef}
                                    data={performanceChartData}
                                    options={performanceChartOptions()}
                                />
                            </Box>
                        </Paper>
                    </Box>

                    {/* RECENT ACTIVITY LOGS */}
                    <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <Box className="flex justify-between items-center mb-4">
                            <Typography variant="h6" className="font-semibold text-gray-900 flex items-center">
                                <FaHistory className="mr-2 text-gray-500" /> Recent Activity Log
                            </Typography>
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
            )}

            {/* TAB CONTENT 2: EXAMS */}
            {activeTab === "exams" && (
                <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <Box className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4">
                        <Box className="flex flex-1 gap-4 max-w-2xl flex-wrap">
                            <TextField
                                label="Search Exams"
                                size="small"
                                variant="outlined"
                                value={examSearch}
                                onChange={(e) => setExamSearch(e.target.value)}
                                className="flex-1 min-w-[200px]"
                                InputProps={{
                                    startAdornment: <FaSearch className="text-gray-400 mr-2" />
                                }}
                            />
                            <FormControl size="small" className="min-w-[150px]">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={examStatusFilter}
                                    label="Status"
                                    onChange={(e) => setExamStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="all">All Statuses</MenuItem>
                                    <MenuItem value="live">Live</MenuItem>
                                    <MenuItem value="draft">Draft</MenuItem>
                                    <MenuItem value="ended">Ended</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<FaFileCsv />}
                            className="border-[#111A50] text-[#111A50] hover:bg-[#111A50]/5"
                            onClick={() => exportToCSV(
                                sortedExams,
                                ["Exam Title", "Status", "Total Questions", "Completion Rate", "Submissions", "Average Score", "High Score", "Low Score", "Pass Rate", "Total Proctor Warnings", "Proctor Flags Count"],
                                ["title", "status", "total_questions", "completionRate", "submissions_count", "average_score", "high_score", "low_score", "passRate", "total_warnings", "proctor_flags_count"],
                                "exams_analytics_report.csv"
                            )}
                        >
                            Export CSV
                        </Button>
                    </Box>

                    {/* TABLE */}
                    <div className="overflow-x-auto border border-gray-100 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    {renderSortHeader("Exam Title", "title", examSort, handleExamSort)}
                                    {renderSortHeader("Status", "status", examSort, handleExamSort)}
                                    {renderSortHeader("Created At", "created_at", examSort, handleExamSort)}
                                    {renderSortHeader("Questions", "total_questions", examSort, handleExamSort)}
                                    {renderSortHeader("Submissions", "submissions_count", examSort, handleExamSort)}
                                    {renderSortHeader("Comp. Rate", "completionRate", examSort, handleExamSort)}
                                    {renderSortHeader("Avg Score", "average_score", examSort, handleExamSort)}
                                    {renderSortHeader("Pass Rate", "passRate", examSort, handleExamSort)}
                                    {renderSortHeader("High / Low", "high_score", examSort, handleExamSort)}
                                    {renderSortHeader("Alerts (Flags)", "proctor_flags_count", examSort, handleExamSort)}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedExams.length > 0 ? (
                                    sortedExams.map((exam) => (
                                        <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{exam.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`inline-flex px-2 text-xs font-semibold rounded-full leading-5 ${
                                                    exam.status === "live" ? "bg-green-100 text-green-800" :
                                                    exam.status === "draft" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"
                                                }`}>
                                                    {exam.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(exam.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{exam.total_questions}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{exam.submissions_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{exam.completionRate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{exam.average_score}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{exam.passRate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.high_score}% / {exam.low_score}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {exam.proctor_flags_count > 0 || exam.total_warnings > 0 ? (
                                                    <span className="inline-flex items-center text-red-600 font-bold space-x-1">
                                                        <FaExclamationTriangle size={12} />
                                                        <span>{exam.total_warnings} ({exam.proctor_flags_count})</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 font-medium">None</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-gray-500 font-medium">
                                            No exams found matching your search and filter criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Paper>
            )}

            {/* TAB CONTENT 3: STUDENTS */}
            {activeTab === "students" && (
                <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <Box className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4">
                        <Box className="flex flex-1 gap-4 max-w-3xl flex-wrap">
                            <TextField
                                label="Search Students"
                                size="small"
                                variant="outlined"
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                className="flex-1 min-w-[200px]"
                                InputProps={{
                                    startAdornment: <FaSearch className="text-gray-400 mr-2" />
                                }}
                            />
                            <FormControl size="small" className="min-w-[150px]">
                                <InputLabel>Performance Bracket</InputLabel>
                                <Select
                                    value={studentPerformanceFilter}
                                    label="Performance Bracket"
                                    onChange={(e) => setStudentPerformanceFilter(e.target.value)}
                                >
                                    <MenuItem value="all">All Brackets</MenuItem>
                                    <MenuItem value="Struggling">Struggling (&lt; 50%)</MenuItem>
                                    <MenuItem value="Average">Average (50% - 79%)</MenuItem>
                                    <MenuItem value="Excellent">Excellent (&gt;= 80%)</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" className="min-w-[150px]">
                                <InputLabel>Integrity Risk</InputLabel>
                                <Select
                                    value={studentRiskFilter}
                                    label="Integrity Risk"
                                    onChange={(e) => setStudentRiskFilter(e.target.value)}
                                >
                                    <MenuItem value="all">All Risks</MenuItem>
                                    <MenuItem value="Clear">Clear</MenuItem>
                                    <MenuItem value="Flagged">Flagged / High Risk</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<FaFileCsv />}
                            className="border-[#111A50] text-[#111A50] hover:bg-[#111A50]/5"
                            onClick={() => exportToCSV(
                                sortedStudents,
                                ["Student Name", "Email", "Student Code", "Status", "Exams Attempted", "Average Score", "Highest Score", "Lowest Score", "Total Warnings", "Proctor Flags Count", "Performance Status", "Integrity Risk"],
                                ["full_name", "email", "student_id", "status", "exams_attempted", "average_score", "highest_score", "lowest_score", "total_warnings", "proctor_flags_count", "performanceStatus", "riskStatus"],
                                "students_performance_report.csv"
                            )}
                        >
                            Export CSV
                        </Button>
                    </Box>

                    {/* TABLE */}
                    <div className="overflow-x-auto border border-gray-100 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    {renderSortHeader("Student Name", "full_name", studentSort, handleStudentSort)}
                                    {renderSortHeader("Email", "email", studentSort, handleStudentSort)}
                                    {renderSortHeader("Student ID", "student_id", studentSort, handleStudentSort)}
                                    {renderSortHeader("Exams Taken", "exams_attempted", studentSort, handleStudentSort)}
                                    {renderSortHeader("Avg Score", "average_score", studentSort, handleStudentSort)}
                                    {renderSortHeader("High / Low", "highest_score", studentSort, handleStudentSort)}
                                    {renderSortHeader("Integrity Status", "proctor_flags_count", studentSort, handleStudentSort)}
                                    {renderSortHeader("Performance Category", "performanceStatus", studentSort, handleStudentSort)}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedStudents.length > 0 ? (
                                    sortedStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{student.full_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{student.student_id || "N/A"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium text-center">{student.exams_attempted}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{student.exams_attempted > 0 ? `${student.average_score}%` : "—"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {student.exams_attempted > 0 ? `${student.highest_score}% / ${student.lowest_score}%` : "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {student.riskStatus === "Flagged" ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 space-x-1">
                                                        <FaExclamationTriangle size={10} />
                                                        <span>Flagged ({student.total_warnings} warnings)</span>
                                                    </span>
                                                ) : student.exams_attempted > 0 ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                        Clear
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                                                    student.performanceStatus === "Excellent" ? "bg-green-100 text-green-800" :
                                                    student.performanceStatus === "Average" ? "bg-blue-100 text-blue-800" :
                                                    student.performanceStatus === "Struggling" ? "bg-rose-100 text-rose-800" : "bg-gray-100 text-gray-500"
                                                }`}>
                                                    {student.performanceStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                                            No students found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Paper>
            )}

            {/* TAB CONTENT 4: QUESTIONS */}
            {activeTab === "questions" && (
                <Paper className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    {selectedExamId === "all" ? (
                        <Box className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <FaInfoCircle size={40} className="text-[#111A50] mb-4 opacity-50" />
                            <Typography variant="h6" className="text-[#111A50] font-bold mb-2">
                                Question Analytics Requires an Exam Filter
                            </Typography>
                            <Typography variant="body2" className="text-gray-500 max-w-md">
                                Please select a specific exam from the <strong>"Filter Overview by Exam"</strong> dropdown in the top right corner to inspect question success rates, type distributions, and difficulty analytics.
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            <Box className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4">
                                <Box className="flex flex-1 gap-4 max-w-3xl flex-wrap">
                                    <TextField
                                        label="Search Questions"
                                        size="small"
                                        variant="outlined"
                                        value={questionSearch}
                                        onChange={(e) => setQuestionSearch(e.target.value)}
                                        className="flex-1 min-w-[200px]"
                                        InputProps={{
                                            startAdornment: <FaSearch className="text-gray-400 mr-2" />
                                        }}
                                    />
                                    <FormControl size="small" className="min-w-[150px]">
                                        <InputLabel>Question Type</InputLabel>
                                        <Select
                                            value={questionTypeFilter}
                                            label="Question Type"
                                            onChange={(e) => setQuestionTypeFilter(e.target.value)}
                                        >
                                            <MenuItem value="all">All Types</MenuItem>
                                            <MenuItem value="MCQ">MCQ (Single Choice)</MenuItem>
                                            <MenuItem value="MSQ">MSQ (Multi Choice)</MenuItem>
                                            <MenuItem value="TRUE_FALSE">True / False</MenuItem>
                                            <MenuItem value="FILL_BLANK">Fill Blank</MenuItem>
                                            <MenuItem value="ESSAY">Essay</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" className="min-w-[150px]">
                                        <InputLabel>Difficulty</InputLabel>
                                        <Select
                                            value={questionDifficultyFilter}
                                            label="Difficulty"
                                            onChange={(e) => setQuestionDifficultyFilter(e.target.value)}
                                        >
                                            <MenuItem value="all">All Difficulties</MenuItem>
                                            <MenuItem value="Easy">Easy (&gt; 80% Success)</MenuItem>
                                            <MenuItem value="Medium">Medium (50% - 80% Success)</MenuItem>
                                            <MenuItem value="Hard">Hard (&lt; 50% Success)</MenuItem>
                                            <MenuItem value="Manual Review">Manual Review (Essay)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<FaFileCsv />}
                                    className="border-[#111A50] text-[#111A50] hover:bg-[#111A50]/5"
                                    onClick={() => exportToCSV(
                                        sortedQuestions,
                                        ["Question ID", "Question Text", "Question Type", "Answered Count", "Success Rate (%)", "Difficulty"],
                                        ["id", "questionText", "questionType", "answeredCount", "successRate", "difficulty"],
                                        "questions_difficulty_report.csv"
                                    )}
                                >
                                    Export CSV
                                </Button>
                            </Box>

                            {/* TABLE */}
                            <div className="overflow-x-auto border border-gray-100 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#111A50] uppercase tracking-wider">Question Content</th>
                                            {renderSortHeader("Type", "questionType", questionSort, handleQuestionSort)}
                                            {renderSortHeader("Response Count", "answeredCount", questionSort, handleQuestionSort)}
                                            {renderSortHeader("Success Rate (%)", "successRate", questionSort, handleQuestionSort)}
                                            {renderSortHeader("Difficulty Metric", "difficulty", questionSort, handleQuestionSort)}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {sortedQuestions.length > 0 ? (
                                            sortedQuestions.map((q) => (
                                                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-lg">
                                                        <Tooltip title={q.questionText} enterDelay={500}>
                                                            <div className="truncate text-gray-800">{q.questionText}</div>
                                                        </Tooltip>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">{q.questionType}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center font-semibold">{q.answeredCount}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                                        {q.questionType === "ESSAY" ? "—" : `${q.successRate}%`}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
                                                            q.difficulty === "Easy" ? "bg-green-100 text-green-800" :
                                                            q.difficulty === "Medium" ? "bg-blue-100 text-blue-800" :
                                                            q.difficulty === "Hard" ? "bg-rose-100 text-rose-800" : "bg-purple-100 text-purple-800"
                                                        }`}>
                                                            {q.difficulty}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                                                    No questions found matching your criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Box>
                    )}
                </Paper>
            )}
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
        <Paper className="metric-card bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all flex flex-col justify-between">
            <Box className="flex items-center justify-between mb-2">
                <Typography className="text-gray-550 text-xs font-semibold uppercase tracking-wider">{title}</Typography>
                <Box className={`w-8 h-8 ${iconBg} ${iconColor} text-sm rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {icon}
                </Box>
            </Box>
            <Box>
                <Typography className="text-xl sm:text-2xl font-bold text-gray-900 leading-none">{value}</Typography>
                <Typography className={`${subTextColor} text-[11px] font-semibold mt-1.5 flex items-center`}>
                    {subText}
                </Typography>
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
