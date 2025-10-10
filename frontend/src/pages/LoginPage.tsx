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
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

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
        // Admin login
        loginData = await login({ email, password });
      } else {
        // Student login
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
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <LockOutlinedIcon
          sx={{ m: 1, fontSize: "2rem", color: "primary.main" }}
        />
        <Typography component="h1" variant="h5" fontWeight={700}>
          Zyntra Login
        </Typography>

        {/* Tabs for Admin / Student */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            width: "100%",
            mt: 3,
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
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            sx={{ mt: 4, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
