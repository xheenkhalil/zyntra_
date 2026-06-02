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
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: 4,
            p: 4,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ alignSelf: "flex-start", mb: 2, textTransform: "none", color: "text.secondary" }}
          >
            Back to Home
          </Button>

          <Box
            sx={{
              backgroundColor: "primary.main",
              borderRadius: "50%",
              p: 2,
              mb: 2,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: "3rem", color: "white" }} />
          </Box>

          <Typography component="h1" variant="h4" fontWeight={700} gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign in to continue to Zyntra Exams
          </Typography>

          {/* Tabs for Admin / Student */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              width: "100%",
              mt: 2,
            }}
          >
            <Tabs value={loginType} onChange={handleTabChange} centered>
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
