import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // === UI and State ===
  const [loginType, setLoginType] = useState<"admin" | "student">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // === Redirect Logic ===
  const getRedirectPath = (role: string) => {
    switch (role) {
      case "superadmin":
        return "/superadmin";
      case "centraladmin":
        return "/centraladmin";
      case "courseadmin":
        return "/courseadmin";
      case "student":
        return "/student";
      default:
        return "/dashboard";
    }
  };

  // === Auto-redirect if already logged in ===
  useEffect(() => {
    if (user) {
      navigate(getRedirectPath(user.role));
    }
  }, [user, navigate]);

  // === Form Submit ===
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      let loginData;
      if (loginType === "admin") {
        loginData = await login({ email, password });
      } else {
        loginData = await login({ studentId });
      }

      navigate(getRedirectPath(loginData.user.role));
    } catch (err: unknown) {
      console.error("Login Failed:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // === Tab Switching ===
  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: "admin" | "student"
  ) => {
    setLoginType(newValue);
    setError("");
  };

  // === Render ===
  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: { md: "100vh" },
        width: "100vw",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1920&auto=format&fit=crop)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: { xs: "auto", md: "hidden" },
        py: { xs: 2, md: 0 },
        px: { xs: 0, sm: 2 },
      }}
    >
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          m: "auto",
          maxWidth: { xs: "100%", sm: 440 },
          px: { xs: 0, sm: 2 },
        }}
        disableGutters
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.80)",
            borderRadius: { xs: 0, sm: 3 },
            p: { xs: 2.5, sm: 3.5 },
            minHeight: { xs: "100vh", sm: "auto" },
            justifyContent: { xs: "center", sm: "flex-start" },
            boxShadow: {
              xs: "none",
              sm: "0 12px 32px 0 rgba(17, 26, 80, 0.15)",
            },
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: {
              xs: "none",
              sm: "1px solid rgba(255, 255, 255, 0.5)",
            },
          }}
        >
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: "1rem" }} />}
            onClick={() => navigate("/")}
            size="small"
            sx={{
              alignSelf: "flex-start",
              mb: 1,
              textTransform: "none",
              color: "text.secondary",
              fontWeight: 500,
              fontSize: "0.825rem",
              p: 0.5,
              "&:hover": { color: "#111A50", bgcolor: "transparent" },
            }}
          >
            Back to Home
          </Button>

          <Box
            sx={{
              backgroundColor: "#111A50",
              borderRadius: "50%",
              p: 1.25,
              mb: 1.25,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: "1.75rem", color: "white" }} />
          </Box>

          <Typography
            component="h1"
            variant="h5"
            fontWeight={700}
            sx={{ fontSize: { xs: "1.35rem", sm: "1.55rem" }, mb: 0.25, color: "#111A50" }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: "0.825rem" }}>
            Sign in to continue to ZYNTRA
          </Typography>

          {/* Tabs for Admin / Student */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              width: "100%",
            }}
          >
            <Tabs
              value={loginType}
              onChange={handleTabChange}
              centered
              sx={{
                minHeight: 36,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  minHeight: 36,
                  py: 0.5,
                },
                "& .Mui-selected": {
                  color: "#111A50 !important",
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#111A50",
                },
              }}
            >
              <Tab label="Admin Login" value="admin" />
              <Tab label="Student Login" value="student" />
            </Tabs>
          </Box>

          {/* Login Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 2, width: "100%" }}
          >
            {loginType === "admin" ? (
              <>
                <TextField
                  size="small"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    mb: 1.5,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                />
                <TextField
                  size="small"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {/* Links */}
                <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Link to="/forgot-password" style={{ color: "#666", textDecoration: "none", fontSize: "0.8rem" }}>
                    Forgot password?
                  </Link>
                  <Link to="/register" style={{ color: "#111A50", textDecoration: "none", fontWeight: 600, fontSize: "0.8rem" }}>
                    Create an account
                  </Link>
                </Box>
              </>
            ) : (
              <TextField
                size="small"
                required
                fullWidth
                id="studentId"
                label="Student ID"
                name="studentId"
                autoFocus
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255, 255, 255, 0.7)",
                  },
                }}
              />
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 1.5, py: 0.25, fontSize: "0.825rem", width: "100%" }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="medium"
              sx={{
                mt: 2,
                mb: 0.5,
                py: 1.1,
                fontSize: "0.95rem",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 1.5,
                backgroundColor: "#111A50",
                "&:hover": { backgroundColor: "#080D2B" },
              }}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
