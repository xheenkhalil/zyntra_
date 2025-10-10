import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth"; 

const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* === NAVBAR === */}
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "#0D47A1", // deep blue for consistency
          color: "#FFFFFF",
          boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
          py: 0.5,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, sm: 4 },
          }}
        >
          {/* === LOGO & BRAND === */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MenuBookIcon sx={{ fontSize: 28 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              Zyntra Student Portal
            </Typography>
          </Box>

          {/* === USER INFO & LOGOUT === */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {user?.fullName || "Student"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}
              >
                {user?.email || ""}
              </Typography>
            </Box>

            <Tooltip title="Logout">
              <IconButton
                color="inherit"
                onClick={logout}
                sx={{
                  border: "1px solid rgba(255,255,255,0.5)",
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  "&:hover": {
                    bgcolor: "#1976D2",
                    borderColor: "#FFFFFF",
                  },
                }}
              >
                <LogoutIcon fontSize="small" />
                <Typography
                  variant="body2"
                  sx={{
                    ml: 1,
                    display: { xs: "none", sm: "inline" },
                    fontWeight: 500,
                  }}
                >
                  Logout
                </Typography>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

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
