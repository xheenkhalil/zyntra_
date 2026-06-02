import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Button,
  IconButton,
  Collapse,
  Drawer,
} from "@mui/material";
// Importing all icons needed for the component and its menus
import {
  FaGraduationCap,
  FaCogs,
  FaChevronDown,
  FaStar,
  FaTag,
  FaBars,
  FaTimes,
  FaUserPlus,
  FaSignInAlt,
  FaBuilding,
  FaSchool,
  FaBriefcase,
  FaUser,
  FaQuestionCircle,
  FaMedal,
  FaEye,
  FaBrain,
  FaFingerprint,
  FaMobileAlt,
  FaCloud,
  FaRobot,
} from "react-icons/fa";

// --- 1. Desktop-only Mega-Menu Components ---
// These are styled exactly like your HTML's desktop menu

const DesktopSolutionsMenu = () => (
  <div className="mega-menu absolute top-full left-0 w-[500px] bg-white shadow-xl rounded-lg border border-gray-100 mt-2 p-6 z-50">
    <div className="grid grid-cols-2 gap-6">
      {/* For Institutions */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <FaBuilding className="text-[#111A50]" />
          <span>For Institutions</span>
        </h3>
        <div className="space-y-3">
          <Link to="/solutions/schools-universities" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer no-underline">
            <FaSchool className="text-[#111A50] text-lg" />
            <div>
              <h4 className="font-semibold text-gray-900">
                Schools & Universities
              </h4>
              <p className="text-sm text-gray-600">
                Academic examination solutions
              </p>
            </div>
          </Link>
          <Link to="/solutions/corporate-training" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer no-underline">
            <FaBriefcase className="text-[#111A50] text-lg" />
            <div>
              <h4 className="font-semibold text-gray-900">Corporate Training</h4>
              <p className="text-sm text-gray-600">
                Employee assessment & certification
              </p>
            </div>
          </Link>
        </div>
      </div>
      {/* For Individuals */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <FaUser className="text-[#111A50]" />
          <span>For Individuals</span>
        </h3>
        <div className="space-y-3">
          <Link to="/solutions/guest-quizzes" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer no-underline">
            <FaQuestionCircle className="text-[#111A50] text-lg" />
            <div>
              <h4 className="font-semibold text-gray-900">Guest Quizzes</h4>
              <p className="text-sm text-gray-600">
                Free practice tests & assessments
              </p>
            </div>
          </Link>
          <Link to="/solutions/earn-badges" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer no-underline">
            <FaMedal className="text-[#111A50] text-lg" />
            <div>
              <h4 className="font-semibold text-gray-900">Earn Badges</h4>
              <p className="text-sm text-gray-600">
                Achievement & skill recognition
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const DesktopFeaturesMenu = () => (
  <div className="mega-menu absolute top-full left-0 w-[600px] bg-white shadow-xl rounded-lg border border-gray-100 mt-2 p-6 z-50">
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <Link to="/features/ai-proctoring" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer no-underline">
          <FaEye className="text-[#111A50] text-lg" />
          <div>
            <h4 className="font-semibold text-gray-900">AI Proctoring</h4>
            <p className="text-sm text-gray-600">
              Real-time monitoring & cheating detection
            </p>
          </div>
        </Link>
        <Link to="/features/smart-analytics" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer no-underline">
          <FaBrain className="text-[#111A50] text-lg" />
          <div>
            <h4 className="font-semibold text-gray-900">Smart Analytics</h4>
            <p className="text-sm text-gray-600">
              Advanced performance insights
            </p>
          </div>
        </Link>
        <Link to="/features/biometric-verification" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer no-underline">
          <FaFingerprint className="text-[#111A50] text-lg" />
          <div>
            <h4 className="font-semibold text-gray-900">
              Biometric Verification
            </h4>
            <p className="text-sm text-gray-600">
              Face & voice recognition security
            </p>
          </div>
        </Link>
      </div>
      <div className="space-y-4">
        <Link to="/features/mobile-compatible" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer no-underline">
          <FaMobileAlt className="text-[#111A50] text-lg" />
          <div>
            <h4 className="font-semibold text-gray-900">Mobile Compatible</h4>
            <p className="text-sm text-gray-600">Take exams on any device</p>
          </div>
        </Link>
        <Link to="/features/cloud-integration" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer no-underline">
          <FaCloud className="text-[#111A50] text-lg" />
          <div>
            <h4 className="font-semibold text-gray-900">Cloud Integration</h4>
            <p className="text-sm text-gray-600">Seamless data synchronization</p>
          </div>
        </Link>
        <Link to="/features/auto-grading" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer no-underline">
          <FaRobot className="text-[#111A50] text-lg" />
          <div>
            <h4 className="font-semibold text-gray-900">Auto-Grading</h4>
            <p className="text-sm text-gray-600">
              Instant results with AI scoring
            </p>
          </div>
        </Link>
      </div>
    </div>
  </div>
);

// --- 2. Mobile-only Mega-Menu Components ---
// These are styled simply, exactly like your HTML's mobile menu

const MobileSolutionsMenu: React.FC = () => (
  <div className="space-y-4">
    <div>
      <h4 className="font-semibold text-gray-900 mb-2">For Institutions</h4>
      <div className="space-y-2 ml-4">
        <Link to="/solutions/schools-universities" className="block text-gray-600 hover:text-[#111A50] py-1 no-underline">
          Schools & Universities
        </Link>
        <Link to="/solutions/corporate-training" className="block text-gray-600 hover:text-[#111A50] py-1 no-underline">
          Corporate Training
        </Link>
      </div>
    </div>
    <div>
      <h4 className="font-semibold text-gray-900 mb-2">For Individuals</h4>
      <div className="space-y-2 ml-4">
        <Link to="/solutions/guest-quizzes" className="block text-gray-600 hover:text-[#111A50] py-1 no-underline">
          Guest Quizzes
        </Link>
        <Link to="/solutions/earn-badges" className="block text-gray-600 hover:text-[#111A50] py-1 no-underline">
          Earn Badges
        </Link>
      </div>
    </div>
  </div>
);

const MobileFeaturesMenu: React.FC = () => (
  <div className="space-y-2">
    <Link to="/features/ai-proctoring" className="block text-gray-600 hover:text-[#111A50] py-1 no-underline">
      AI Proctoring
    </Link>
    <Link to="/features/smart-analytics" className="block text-gray-600 hover:text-[#111A50] py-1 no-underline">
      Smart Analytics
    </Link>
    <Link to="/features/biometric-verification" className="block text-gray-600 hover:text-[#111A50] py-1 no-underline">
      Biometric Verification
    </Link>
    <Link to="/features/mobile-compatible" className="block text-gray-600 hover:text-[#111A50] py-1 no-underline">
      Mobile Compatible
    </Link>
    <Link to="/features/cloud-integration" className="block text-gray-600 hover:text-[#111A50] py-1 no-underline">
      Cloud Integration
    </Link>
    <Link to="/features/auto-grading" className="block text-gray-600 hover:text-[#111A50] py-1 no-underline">
      Auto-Grading
    </Link>
  </div>
);

// --- 3. Main Navbar Component ---

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setMobileAccordion(null); // Close accordions when closing menu
  };

  const toggleAccordion = (menu: string) => {
    setMobileAccordion(mobileAccordion === menu ? null : menu);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  return (
    <AppBar
      position="sticky"
      component="nav"
      // These classes match your HTML file exactly
      className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50"
    >
      <Container maxWidth={false} className="max-w-7xl">
        <Toolbar
          disableGutters
          className="flex justify-between items-center h-16 md:h-20"
        >
          {/* Logo */}
          <Box
            className="flex items-center cursor-pointer"
            onClick={() => handleNavigate("/")}
          >
            <Box className="flex items-center space-x-2">
              <Box className="w-8 h-8 md:w-10 md:h-10 bg-[#111A50] rounded-lg flex items-center justify-center">
                <FaGraduationCap className="text-white text-lg md:text-xl" />
              </Box>
              <span className="text-xl md:text-2xl font-bold text-[#111A50]">
                ZYNTRA
              </span>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          <Box className="hidden lg:flex items-center space-x-8">
            {/* === 1:1 STYLING FIX: Use a simple <span> for menu triggers, not <Button> --- */}
            <Box className="nav-item relative group">
              <span className="flex items-center space-x-1 text-gray-700 hover:text-[#111A50] font-medium transition-colors duration-200 cursor-pointer">
                <FaCogs className="text-sm" />
                <span>Solutions</span>
                <FaChevronDown className="text-xs" />
              </span>
              <DesktopSolutionsMenu />
            </Box>

            <Box className="nav-item relative group">
              <span className="flex items-center space-x-1 text-gray-700 hover:text-[#111A50] font-medium transition-colors duration-200 cursor-pointer">
                <FaStar className="text-sm" />
                <span>Features</span>
                <FaChevronDown className="text-xs" />
              </span>
              <DesktopFeaturesMenu />
            </Box>

            <Link to="/pricing"
              className="flex items-center space-x-1 text-gray-700 hover:text-[#111A50] font-medium transition-colors duration-200 no-underline"
            >
              <FaTag className="text-sm" />
              <span>Pricing</span>
            </Link>
          </Box>

          {/* Login & Create Account Buttons */}
          <Box className="hidden md:flex items-center space-x-2 lg:space-x-3">
            {/* === 1:1 STYLING FIX: Use variant="text" to make the Login button a text link --- */}
            <Button
              variant="text" // This is the fix!
              onClick={() => handleNavigate("/login")}
              className="flex items-center space-x-2 px-3 md:px-4 py-2 !text-[#111A50] hover:!text-[#080D2B] font-semibold transition-colors duration-200"
              startIcon={<FaSignInAlt className="text-sm" />}
            >
              <span className="hidden sm:inline">Login</span>
            </Button>
            {/* This button is styled with Tailwind, so we reset MUI's default color */}
            <Button
              color="inherit" // This stops MUI from overriding Tailwind
              onClick={() => handleNavigate("/login")}
              className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-[#111A50] hover:bg-[#080D2B] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              startIcon={<FaUserPlus className="text-sm" />}
            >
              <span className="hidden sm:inline">Create Account</span>
              <span className="sm:hidden">Sign Up</span>
            </Button>
          </Box>

          {/* Mobile Menu Button */}
          <Box className="lg:hidden">
            <IconButton
              className="text-gray-700 hover:text-[#111A50] p-2"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* === MOBILE DRAWER: slides in from the right side === */}
      <Drawer
        anchor="right"
        open={isMobileMenuOpen}
        onClose={toggleMobileMenu}
        PaperProps={{
          sx: {
            width: '85%',
            maxWidth: 360,
            backgroundColor: '#fff',
          }
        }}
      >
        <Box className="h-full flex flex-col">
          {/* Drawer Header */}
          <Box className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#111A50] rounded-lg flex items-center justify-center">
                <FaGraduationCap className="text-white text-sm" />
              </div>
              <span className="text-lg font-bold text-[#111A50]">ZYNTRA</span>
            </div>
            <IconButton onClick={toggleMobileMenu} className="!text-gray-500 hover:!text-red-500">
              <FaTimes className="text-lg" />
            </IconButton>
          </Box>

          {/* Drawer Content */}
          <Box className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Solutions Mobile */}
            <div>
              <div
                className="mobile-menu-item flex items-center justify-between text-gray-700 hover:text-[#111A50] py-2 cursor-pointer"
                onClick={() => toggleAccordion("solutions")}
              >
                <div className="flex items-center space-x-2">
                  <FaCogs className="text-sm" />
                  <span>Solutions</span>
                </div>
                <FaChevronDown
                  className={`text-xs transition-transform duration-200 ${
                    mobileAccordion === "solutions" ? "rotate-180" : ""
                  }`}
                />
              </div>
              <Collapse
                in={mobileAccordion === "solutions"}
                className="ml-4 mt-2"
              >
                <MobileSolutionsMenu />
              </Collapse>
            </div>

            {/* Features Mobile */}
            <div>
              <div
                className="mobile-menu-item flex items-center justify-between text-gray-700 hover:text-[#111A50] py-2 cursor-pointer"
                onClick={() => toggleAccordion("features")}
              >
                <div className="flex items-center space-x-2">
                  <FaStar className="text-sm" />
                  <span>Features</span>
                </div>
                <FaChevronDown
                  className={`text-xs transition-transform duration-200 ${
                    mobileAccordion === "features" ? "rotate-180" : ""
                  }`}
                />
              </div>
              <Collapse
                in={mobileAccordion === "features"}
                className="ml-4 mt-2"
              >
                <MobileFeaturesMenu />
              </Collapse>
            </div>

            {/* Pricing */}
            <Link
              to="/pricing"
              onClick={toggleMobileMenu}
              className="flex items-center space-x-2 text-gray-700 hover:text-[#111A50] py-2 no-underline"
            >
              <FaTag className="text-sm" />
              <span>Pricing</span>
            </Link>
          </Box>

          {/* Drawer Footer Buttons */}
          <Box className="flex flex-col space-y-2 p-4 border-t border-gray-100">
            <Button
              variant="text"
              onClick={() => handleNavigate("/login")}
              className="flex items-center justify-center space-x-2 px-4 py-2 !text-[#111A50] hover:!text-[#080D2B] font-medium"
              startIcon={<FaSignInAlt className="text-sm" />}
            >
              Login
            </Button>
            <Button
              color="inherit"
              onClick={() => handleNavigate("/login")}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#111A50] hover:bg-[#080D2B] text-white rounded-lg font-medium"
              startIcon={<FaUserPlus className="text-sm" />}
            >
              Create Account
            </Button>
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;