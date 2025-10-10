import React, { useEffect, useState, useMemo } from "react";
import {
    Box, Typography, CircularProgress, Alert, Grid, Paper,
    FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    ArcElement, Title, Tooltip, Legend
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { getCourseAdminStats } from "../services/analyticsService";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ScoreboardIcon from "@mui/icons-material/Scoreboard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from '@mui/icons-material/Cancel';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const StatCard = ({ title, value, icon, color = 'primary.main' }) => (
    <Paper
        elevation={3}
        sx={{
            p: 3, display: "flex", alignItems: "center", height: "100%", borderRadius: 3,
            transition: "all 0.3s ease",
            "&:hover": { boxShadow: "0 6px 15px rgba(0,0,0,0.15)", transform: "translateY(-4px)" },
        }}
    >
        <Box sx={{ mr: 2, p: 1.5, borderRadius: "50%", bgcolor: color, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
    </Paper>
);

const CourseAdminOverview: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // NEW: State for the filter
    const [selectedExamId, setSelectedExamId] = useState('all');

    // UPDATED: useEffect now refetches data when the filter changes
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await getCourseAdminStats(selectedExamId);
                setStats(data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load dashboard stats.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedExamId]); // Dependency array now watches for changes to the filter

    // NEW: Handler for the filter dropdown
    const handleFilterChange = (event: SelectChangeEvent) => {
        setSelectedExamId(event.target.value);
    };

    const passFailData = useMemo(() => {
        if (!stats) return { labels: [], datasets: [] };
        return {
            labels: ["Pass", "Fail"],
            datasets: [{
                data: [stats.kpis.pass_fail?.pass_count || 0, stats.kpis.pass_fail?.fail_count || 0],
                backgroundColor: ["#4caf50", "#f44336"],
                borderColor: ["#ffffff"],
                borderWidth: 2,
            }],
        };
    }, [stats]);

    const topStudentsData = useMemo(() => {
        if (!stats) return { labels: [], datasets: [] };
        return {
            labels: stats.topStudents.map((s: any) => s.full_name),
            datasets: [{
                label: "Average Score (%)",
                data: stats.topStudents.map((s: any) => s.average_score),
                backgroundColor: "rgba(60, 77, 206, 0.7)",
                borderRadius: 6,
            }],
        };
    }, [stats]);

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!stats) return <Alert severity="warning">No stats available. Make sure students have completed at least one exam.</Alert>;

    const totalSubmissions = (stats.kpis.pass_fail?.pass_count || 0) + (stats.kpis.pass_fail?.fail_count || 0);
    const passRate = totalSubmissions > 0 ? (stats.kpis.pass_fail.pass_count / totalSubmissions) * 100 : 0;
    const failRate = totalSubmissions > 0 ? (stats.kpis.pass_fail.fail_count / totalSubmissions) * 100 : 0;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" fontWeight={700}>Dashboard Overview</Typography>
                
                {/* NEW: Filter Dropdown */}
                <FormControl sx={{ minWidth: 250 }} size="small">
                    <InputLabel>Filter by Exam</InputLabel>
                    <Select value={selectedExamId} label="Filter by Exam" onChange={handleFilterChange}>
                        <MenuItem value="all"><em>All Exams</em></MenuItem>
                        {stats.filterExams?.map((exam: any) => (
                            <MenuItem key={exam.id} value={exam.id}>{exam.title}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* UPDATED: Grid now has 5 items, using 2.4 columns for a perfect fit */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12} sm={6} md={2.4}><StatCard title="Total Students" value={stats.kpis.total_students || 0} icon={<PeopleAltIcon />} /></Grid>
                <Grid item xs={12} sm={6} md={2.4}><StatCard title="Active Exams" value={stats.kpis.active_exams || 0} icon={<AssignmentIcon />} /></Grid>
                <Grid item xs={12} sm={6} md={2.4}><StatCard title="Average Score" value={`${stats.kpis.average_score || 0}%`} icon={<ScoreboardIcon />} /></Grid>
                <Grid item xs={12} sm={6} md={2.4}><StatCard title="Pass Rate" value={`${passRate.toFixed(1)}%`} icon={<CheckCircleIcon />} color="success.main" /></Grid>
                {/* NEW: Failure Rate Card */}
                <Grid item xs={12} sm={6} md={2.4}><StatCard title="Failure Rate" value={`${failRate.toFixed(1)}%`} icon={<CancelIcon />} color="error.main" /></Grid>
            </Grid>

            {/* Your excellent charts section */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, height: 420, borderRadius: 3, display: "flex", flexDirection: "column" }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>Pass vs. Fail Rate</Typography>
                        <Box sx={{ flexGrow: 1, position: 'relative' }}>
                            <Doughnut data={passFailData} options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}/>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, height: 420, borderRadius: 3, display: "flex", flexDirection: "column" }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>Top Performing Students</Typography>
                        <Box sx={{ flexGrow: 1, position: 'relative' }}>
                            <Bar data={topStudentsData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } }, plugins: { legend: { display: false } } }}/>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CourseAdminOverview;