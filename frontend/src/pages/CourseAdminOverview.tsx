// /frontend/src/pages/CourseAdminOverview.tsx
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
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { getCourseAdminStats } from "../services/analyticsService";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ScoreboardIcon from "@mui/icons-material/Scoreboard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, ChartTitle, Tooltip, Legend);

// ✅ StatCard Props Interface
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = "primary.main" }) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      display: "flex",
      alignItems: "center",
      height: "100%",
      borderRadius: 3,
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
        transform: "translateY(-4px)",
      },
    }}
  >
    <Box
      sx={{
        mr: 2,
        p: 1.5,
        borderRadius: "50%",
        bgcolor: color,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Box>
  </Paper>
);

// ✅ Data Interfaces
interface PassFailKPI {
  pass_count: number;
  fail_count: number;
}
interface KPI {
  total_students: number;
  active_exams: number;
  average_score: number;
  pass_fail: PassFailKPI;
}
interface TopStudent {
  id: string;
  full_name: string;
  average_score: number;
}
interface ExamFilter {
  id: string;
  title: string;
}
interface CourseAdminStats {
  kpis: KPI;
  topStudents: TopStudent[];
  filterExams?: ExamFilter[];
}

// ✅ Main Component
const CourseAdminOverview: React.FC = () => {
  const [stats, setStats] = useState<CourseAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("all");

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      setLoading(true);
      try {
        const data = await getCourseAdminStats(selectedExamId);
        setStats(data);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load dashboard stats.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    void fetchStats();
  }, [selectedExamId]);

  const handleFilterChange = (event: SelectChangeEvent<string>): void => {
    setSelectedExamId(event.target.value as string);
  };

  const passFailData = useMemo(() => {
    if (!stats) return { labels: [], datasets: [] };
    return {
      labels: ["Pass", "Fail"],
      datasets: [
        {
          data: [stats.kpis.pass_fail?.pass_count || 0, stats.kpis.pass_fail?.fail_count || 0],
          backgroundColor: ["#4caf50", "#f44336"],
          borderColor: ["#ffffff"],
          borderWidth: 2,
        },
      ],
    };
  }, [stats]);

  const topStudentsData = useMemo(() => {
    if (!stats) return { labels: [], datasets: [] };
    return {
      labels: stats.topStudents.map((s) => s.full_name),
      datasets: [
        {
          label: "Average Score (%)",
          data: stats.topStudents.map((s) => s.average_score),
          backgroundColor: "rgba(60, 77, 206, 0.7)",
          borderRadius: 6,
        },
      ],
    };
  }, [stats]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
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

  const totalSubmissions =
    (stats.kpis.pass_fail?.pass_count || 0) + (stats.kpis.pass_fail?.fail_count || 0);
  const passRate =
    totalSubmissions > 0 ? (stats.kpis.pass_fail.pass_count / totalSubmissions) * 100 : 0;
  const failRate =
    totalSubmissions > 0 ? (stats.kpis.pass_fail.fail_count / totalSubmissions) * 100 : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* HEADER + FILTER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Dashboard Overview
        </Typography>

        <FormControl sx={{ minWidth: 250 }} size="small">
          <InputLabel>Filter by Exam</InputLabel>
          <Select value={selectedExamId} label="Filter by Exam" onChange={handleFilterChange}>
            <MenuItem value="all">
              <em>All Exams</em>
            </MenuItem>
            {stats.filterExams?.map((exam) => (
              <MenuItem key={exam.id} value={exam.id}>
                {exam.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* KPI CARDS — replaced Grid with Box-based CSS grid for safety */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          mb: 5,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(5, 1fr)",
          },
        }}
      >
        <StatCard title="Total Students" value={stats.kpis.total_students || 0} icon={<PeopleAltIcon />} />
        <StatCard title="Active Exams" value={stats.kpis.active_exams || 0} icon={<AssignmentIcon />} />
        <StatCard title="Average Score" value={`${stats.kpis.average_score || 0}%`} icon={<ScoreboardIcon />} />
        <StatCard title="Pass Rate" value={`${passRate.toFixed(1)}%`} icon={<CheckCircleIcon />} color="success.main" />
        <StatCard title="Failure Rate" value={`${failRate.toFixed(1)}%`} icon={<CancelIcon />} color="error.main" />
      </Box>

      {/* CHARTS SECTION */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
        }}
      >
        <Paper
          elevation={3}
          sx={{ p: 3, height: 420, borderRadius: 3, display: "flex", flexDirection: "column" }}
        >
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Pass vs. Fail Rate
          </Typography>
          <Box sx={{ flexGrow: 1, position: "relative" }}>
            <Doughnut
              data={passFailData}
              options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
            />
          </Box>
        </Paper>

        <Paper
          elevation={3}
          sx={{ p: 3, height: 420, borderRadius: 3, display: "flex", flexDirection: "column" }}
        >
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Top Performing Students
          </Typography>
          <Box sx={{ flexGrow: 1, position: "relative" }}>
            <Bar
              data={topStudentsData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } },
                plugins: { legend: { display: false } },
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CourseAdminOverview;
