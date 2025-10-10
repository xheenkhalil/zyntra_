// /frontend/src/pages/DashboardPage.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useAuth } from "../context/useAuth"; // ✅ updated import path if we split context

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "flex-start",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Welcome to your Dashboard, {user?.fullName || "User"}!
      </Typography>

      <Typography variant="subtitle1" color="text.secondary">
        Your role: <strong>{user?.role || "N/A"}</strong>
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={logout}
        sx={{ mt: 3, textTransform: "none", fontWeight: 500 }}
      >
        Log Out
      </Button>
    </Box>
  );
};

export default DashboardPage;
