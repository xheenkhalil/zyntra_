import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { getPublicQuizzes } from "../services/guestService";

interface Quiz {
  id: string;
  title: string;
  category: string;
  participant_count: string;
  average_rating: string | null;
}

const GuestQuizSection: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicQuizzes();
      setQuizzes(data || []);
    } catch {
      setError("Could not load public quizzes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      const ratingSubmitted = localStorage.getItem("guestQuizRatingSubmitted");
      if (ratingSubmitted === "true") {
        console.log("Rating submitted, re-fetching quizzes...");
        fetchQuizzes();
        localStorage.removeItem("guestQuizRatingSubmitted");
      }
    };

    fetchQuizzes();
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchQuizzes]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography
        variant="h4"
        align="center"
        sx={{ fontWeight: 700, mb: 4 }}
      >
        Sharpen Your Skills
      </Typography>

      {/* Responsive grid layout using Box */}
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr 1fr",
        }}
        gap={3}
        justifyContent="center"
      >
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <Box key={quiz.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: 6,
                  },
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                  >
                    {quiz.category}
                  </Typography>
                  <Typography variant="h5" component="div">
                    {quiz.title}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "text.secondary",
                      mt: 2,
                    }}
                  >
                    <PeopleAltIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {parseInt(quiz.participant_count).toLocaleString()} took
                      this
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "text.secondary",
                      mt: 1,
                    }}
                  >
                    <StarIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "#ffb400" }}
                    />
                    <Typography variant="body2">
                      {quiz.average_rating
                        ? `${quiz.average_rating} Stars`
                        : "Not Rated Yet"}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                  >
                    Start Quiz
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))
        ) : (
          <Typography>
            No public quizzes available at the moment. Check back soon!
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default GuestQuizSection;
