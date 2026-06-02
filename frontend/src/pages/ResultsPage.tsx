// /frontend/src/pages/ResultsPage.tsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  Stack,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { getExams, getExamResults } from "../services/examService";
import Papa from "papaparse";

interface Exam {
  id: string;
  title: string;
  status: string;
}

interface Result {
  submission_id: string;
  student_name: string;
  student_id: string;
  score_percentage: string;
  grade: string;
  submitted_at: string;
}

const ResultsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getExams();
        setExams(
          (data as Exam[]).filter(
            (exam: Exam) => exam.status === "completed" || exam.status === "live"
          )
        );
      } catch {
        setError("Failed to load exams.");
      } finally {
        setLoadingExams(false);
      }
    };
    fetchExams();
  }, []);

  const handleExamChange = async (event: SelectChangeEvent) => {
    const examId = event.target.value;
    setSelectedExamId(examId);
    if (examId) {
      setLoadingResults(true);
      setError("");
      try {
        const data = await getExamResults(examId);
        setResults(data);
      } catch {
        setError("Failed to load results for this exam.");
        setResults([]);
      } finally {
        setLoadingResults(false);
      }
    } else {
      setResults([]);
    }
  };

  const handleExportCsv = () => {
    const selectedExam = exams.find((e) => e.id === selectedExamId);
    if (!selectedExam) return;

    const csvData = results.map((r) => ({
      "Student Name": r.student_name,
      "Student ID": r.student_id,
      "Score (%)": r.score_percentage,
      Grade: r.grade,
      "Submission Date": new Date(r.submitted_at).toLocaleString(),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${selectedExam.title}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loadingExams)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress size={60} thickness={4.5} />
      </Box>
    );

  if (error && exams.length === 0)
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        {error}
      </Alert>
    );

  return (
    <Fade in timeout={700}>
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          mt: 6,
          p: 3,
        }}
      >
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background:
              "#1A1F91, rgba(156,39,176,0.1))",
            backdropFilter: "blur(10px)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Typography variant="h4" fontWeight={700} color="primary">
              Exam Results
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportCsv}
              disabled={results.length === 0}
              sx={{
                bgcolor: "primary.main",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "translateY(-1px)",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                },
              }}
            >
              Export CSV
            </Button>
          </Stack>
        </Paper>

        {/* Exam Selector */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="exam-select-label">
              Select an Exam to View Results
            </InputLabel>
            <Select
              labelId="exam-select-label"
              label="Select an Exam to View Results"
              value={selectedExamId}
              onChange={handleExamChange}
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem value="">
                <em>-- Select an Exam --</em>
              </MenuItem>
              {exams.map((exam) => (
                <MenuItem key={exam.id} value={exam.id}>
                  {exam.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* Results Section */}
        {loadingResults ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 6,
              height: "40vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error && selectedExamId ? (
          <Alert severity="error">{error}</Alert>
        ) : selectedExamId ? (
          <Fade in timeout={500}>
            <TableContainer
              component={Paper}
              elevation={3}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.main" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                      Student Name
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                      Student ID
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                      Score (%)
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                      Grade
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                      Submitted At
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.length > 0 ? (
                    results.map((result, index) => (
                      <TableRow
                        key={result.submission_id}
                        sx={{
                          backgroundColor:
                            index % 2 === 0
                              ? "rgba(0,0,0,0.02)"
                              : "transparent",
                          "&:hover": {
                            backgroundColor: "rgba(33,150,243,0.1)",
                          },
                          transition: "background 0.2s ease",
                        }}
                      >
                        <TableCell>{result.student_name}</TableCell>
                        <TableCell>{result.student_id}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {result.score_percentage}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color:
                              result.grade === "A"
                                ? "success.main"
                                : result.grade === "B"
                                ? "info.main"
                                : result.grade === "C"
                                ? "warning.main"
                                : "error.main",
                          }}
                        >
                          {result.grade}
                        </TableCell>
                        <TableCell>
                          {new Date(result.submitted_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No submissions found for this exam yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Fade>
        ) : (
          <Typography
            align="center"
            sx={{ mt: 8, color: "text.secondary", fontStyle: "italic" }}
          >
            Select an exam above to view its results.
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

export default ResultsPage;
