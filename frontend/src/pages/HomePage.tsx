import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  Link,
  Menu,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import SchoolIcon from "@mui/icons-material/School";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import StarIcon from "@mui/icons-material/Star";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

// ✅ Import the new GuestQuizSection component
import GuestQuizSection from "../components/GuestQuizSection";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ overflowX: "hidden" }}>
      {/* ================= HEADER ================= */}
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Zyntra
            </Typography>

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 3,
              }}
            >
              <Link
                component="button"
                color="inherit"
                underline="none"
                onMouseEnter={handleMenuOpen}
                sx={{ fontWeight: 500, cursor: "pointer" }}
              >
                Solutions
              </Link>
              <Link
                href="#features"
                color="inherit"
                underline="none"
                sx={{ fontWeight: 500 }}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                color="inherit"
                underline="none"
                sx={{ fontWeight: 500 }}
              >
                Pricing
              </Link>

              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{ borderRadius: 2 }}
              >
                Admin Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{ borderRadius: 2 }}
              >
                Student Login
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ================= MEGA MENU ================= */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{ onMouseLeave: handleMenuClose }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ width: 600, p: 2 }}>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
            gap={2}
          >
            {/* --- Left Column --- */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}
              >
                FOR INSTITUTIONS
              </Typography>
              <List dense>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <SchoolIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Schools & Universities" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <BusinessCenterIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Corporate Training" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>

            {/* --- Right Column --- */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}
              >
                FOR INDIVIDUALS
              </Typography>
              <List dense>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <PeopleAltIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Guest Quizzes" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <StarIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Earn Badges" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
          </Box>
        </Box>
      </Menu>

      {/* ================= HERO SECTION ================= */}
      <Box
        sx={{
          position: "relative",
          py: { xs: 10, md: 14 },
          textAlign: "center",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #1a1f71 0%, #2b2e91 40%, #12143a 100%)",
          color: "white",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(93,105,255,0.4) 0%, transparent 70%)",
            top: "-150px",
            left: "-150px",
            filter: "blur(80px)",
            animation: "pulse 8s ease-in-out infinite alternate",
            "@keyframes pulse": {
              from: { transform: "scale(1)" },
              to: { transform: "scale(1.25)" },
            },
          }}
        />

        <Container
          maxWidth="md"
          sx={{
            position: "relative",
            zIndex: 2,
            animation: "fadeUp 1.2s ease-out forwards",
            "@keyframes fadeUp": {
              from: { opacity: 0, transform: "translateY(40px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <Typography
            component="h1"
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              background: "linear-gradient(to right, #ffffff, #b3baff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            The Intelligent Assessment Platform
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.85)",
              mb: 5,
              maxWidth: "750px",
              margin: "auto",
            }}
          >
            Empower your organization with AI-driven exams or test your own
            skills with our free knowledge quizzes. The future of assessment is
            here.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
              mt: 6,
              animation: "fadeUp 1.8s ease-out forwards",
            }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                bgcolor: "#ffffff",
                color: "#1a1f71",
                fontWeight: 600,
                "&:hover": { bgcolor: "#f0f0ff" },
              }}
              onClick={() => navigate("/request-demo")}
            >
              Request a Demo
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                color: "white",
                borderColor: "white",
                fontWeight: 600,
                "&:hover": { borderColor: "#b3baff", color: "#b3baff" },
              }}
              onClick={() => navigate("/guest-quizzes")}
            >
              Take a Free Quiz
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ================= QUIZ SECTION ================= */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <GuestQuizSection />
      </Container>

      {/* ================= FOOTER ================= */}
      <Box
        component="footer"
        sx={{
          bgcolor: "text.primary",
          color: "background.paper",
          py: 6,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "2fr 1fr 1fr" }}
            gap={4}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Zyntra
              </Typography>
              <Typography variant="body2" sx={{ color: "grey.400" }}>
                The Intelligent Assessment Platform for institutions and
                individuals.
              </Typography>
            </Box>

            <Box>
              <Typography variant="overline" sx={{ fontWeight: 700 }}>
                Solutions
              </Typography>
              <List dense>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="none">
                    For Schools
                  </Link>
                </ListItem>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="none">
                    For Business
                  </Link>
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="overline" sx={{ fontWeight: 700 }}>
                Company
              </Typography>
              <List dense>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="none">
                    About
                  </Link>
                </ListItem>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="none">
                    Careers
                  </Link>
                </ListItem>
              </List>
            </Box>
          </Box>

          <Divider sx={{ my: 4, bgcolor: "grey.800" }} />
          <Typography
            variant="body2"
            align="center"
            sx={{ color: "grey.500" }}
          >
            © {new Date().getFullYear()} Zyntra. All Rights Reserved. Jos,
            Nigeria.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
