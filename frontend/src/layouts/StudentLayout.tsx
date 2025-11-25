import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import StudentHeader from "../components/StudentHeader";

const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* === NAVBAR === */}
      <StudentHeader
        student={{
          name: user?.fullName || "Student",
          email: user?.email || "",
          studentId: user?.student_id || ""
        }}
        onLogout={logout}
      />

      {/* === MAIN CONTENT === */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: "background.default",
          minHeight: "calc(100vh - 64px)",
          animation: "fadeIn 0.6s ease-out",
          "@keyframes fadeIn": {
            from: { opacity: 0, transform: "translateY(15px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default StudentLayout;
