import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
        width: "100vw",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1920&auto=format&fit=crop)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        py: { xs: 0, md: 8 },
        px: { xs: 0, sm: 2 },
      }}
    >
      <Container
        component="main"
        maxWidth="sm"
        sx={{ m: "auto", px: { xs: 0, sm: 3 } }}
        disableGutters
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.97)",
            borderRadius: { xs: 0, sm: 4 },
            p: { xs: 3, sm: 5 },
            minHeight: { xs: "100vh", sm: "auto" },
            justifyContent: { xs: "center", sm: "flex-start" },
            boxShadow: {
              xs: "none",
              sm: "0 8px 32px 0 rgba(17, 26, 80, 0.15)",
            },
            backdropFilter: "blur(12px)",
            border: {
              xs: "none",
              sm: "1px solid rgba(255, 255, 255, 0.3)",
            },
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{
              alignSelf: "flex-start",
              mb: 3,
              textTransform: "none",
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            Back to Home
          </Button>

          <Box
            sx={{
              backgroundColor: "#111A50",
              borderRadius: "50%",
              p: 2,
              mb: 2,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: "2.5rem", color: "white" }} />
          </Box>

          <Typography
            component="h1"
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ fontSize: { xs: "1.6rem", sm: "2rem" } }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign in to continue to ZYNTRA
          </Typography>

          {/* Tabs for Admin / Student */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              width: "100%",
              mt: 1,
            }}
          >
            <Tabs
              value={loginType}
              onChange={handleTabChange}
              centered
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
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
            sx={{ mt: 3, width: "100%" }}
          >
            {loginType === "admin" ? (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {/* Links */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/forgot-password" style={{ color: "#666", textDecoration: 'none', fontSize: '0.875rem' }}>
                        Forgot password?
                    </Link>
                    <Link to="/register" style={{ color: "#111A50", textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                        Create an account
                    </Link>
                </Box>
              </>
            ) : (
              <TextField
                margin="normal"
                required
                fullWidth
                id="studentId"
                label="Student ID"
                name="studentId"
                autoFocus
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                sx={{ mb: 2 }}
              />
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 4,
                mb: 2,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
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
