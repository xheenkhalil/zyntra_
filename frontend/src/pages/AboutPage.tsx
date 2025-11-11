import React from "react";
import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
// Import components
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
// Import icons
import {
  FaEye,
  FaChartBar,
  FaLock,
  FaUsers,
  FaBuilding,
  FaUserGraduate,
  FaRocket,
  FaShieldAlt,
  FaBrain,
} from "react-icons/fa";

// A reusable Feature Card for this page
const FeatureCard: React.FC<{
  icon: React.ReactElement;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <Box className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
    <Box className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
      {React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<any, any>, {
            className: "text-blue-600 text-lg sm:text-xl",
          })
        : icon}
    </Box>
    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
      {title}
    </h3>
    <p className="text-gray-600 text-sm sm:text-base">{children}</p>
  </Box>
);

// The About Us Page Component
const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box className="bg-white">
      {/* 1. NAVIGATION */}
      <Navbar />

      {/* 2. HERO SECTION */}
      <Box className="relative bg-gradient-to-br from-blue-900 to-indigo-800 text-white py-20 md:py-32 text-center overflow-hidden">
        {/* Re-using the floating glass elements from HeroSection for consistency */}
        <Box className="absolute inset-0 overflow-hidden opacity-30">
          <Box className="floating-element absolute top-10 sm:top-20 left-5 sm:left-10 w-12 sm:w-16 h-12 sm:h-16 glass-effect rounded-full"></Box>
          <Box className="floating-element absolute top-32 sm:top-40 right-10 sm:right-20 w-8 sm:w-12 h-8 sm:h-12 glass-effect rounded-full"></Box>
          <Box className="floating-element absolute bottom-24 sm:bottom-32 left-1/4 w-16 sm:w-20 h-16 sm:h-20 glass-effect rounded-full"></Box>
        </Box>
        <Container maxWidth="md" className="relative z-10">
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            About ZYNTRA
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto"
          >
            We are redefining assessment for a smarter, more accessible, and
            secure world.
          </Typography>
        </Container>
      </Box>

      {/* 3. OUR MISSION & VISION */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Mission Text */}
          <Box>
            <Typography
              component="h2"
              className="text-sm font-semibold text-blue-600 uppercase mb-2"
            >
              Our Mission
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Making Assessment Secure, Insightful, and Fair.
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                Our mission is to make high-quality assessment secure,
                accessible, and truly insightful. We leverage cutting-edge
                artificial intelligence to uphold integrity in examinations while
                providing powerful, real-time analytics that empower both
                educators and learners.
              </p>
              <p>
                We believe the future of education and professional development
                depends on a trusted, flexible, and intelligent way to measure
                knowledge. ZYNTRA is our commitment to building that future.
              </p>
            </Box>
          </Box>
          {/* Vision Card */}
          <Paper
            elevation={0}
            className="p-6 sm:p-8 rounded-2xl bg-blue-50 border border-blue-100 shadow-xl"
          >
            <Typography
              variant="h5"
              className="font-semibold text-blue-900 mb-4 flex items-center space-x-2"
            >
              <FaRocket /> <span>Our Vision</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaShieldAlt className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Unmatched Integrity:</strong>{" "}
                  To be the global standard for secure, AI-proctored online
                  examinations.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaBrain className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Actionable Insights:</strong>{" "}
                  To turn assessment data into meaningful analytics that drive
                  learning outcomes.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaUsers className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Universal Access:</strong>{" "}
                  To empower every individual and organization with tools to
                  learn, test, and grow.
                </span>
              </li>
            </ul>
          </Paper>
        </Box>
      </Container>

      {/* 4. OUR SOLUTIONS (B2B & B2C) */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900"
          >
            An Ecosystem for Everyone
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* B2B Card */}
            <Box className="bg-white p-8 rounded-2xl shadow-lg border h-full flex flex-col">
              <FaBuilding className="text-5xl text-blue-600 mb-4" />
              <Typography
                variant="h4"
                component="h3"
                className="text-xl sm:text-2xl font-bold mb-3"
              >
                For Institutions (B2B)
              </Typography>
              <Typography className="text-gray-600 leading-relaxed mb-4 flex-grow">
                We provide universities, corporations, and certification bodies
                with a powerful, scalable platform for high-stakes examinations.
                Our end-to-end solution manages everything from biometric
                identity verification and AI-powered proctoring to automated
                grading and advanced performance analytics, ensuring total
                integrity and efficiency.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                className="mt-4"
              >
                Learn More for Business
              </Button>
            </Box>
            {/* B2C Card */}
            <Box className="bg-white p-8 rounded-2xl shadow-lg border h-full flex flex-col">
              <FaUserGraduate className="text-5xl text-blue-600 mb-4" />
              <Typography
                variant="h4"
                component="h3"
                className="text-xl sm:text-2xl font-bold mb-3"
              >
                For Individuals (B2C)
              </Typography>
              <Typography className="text-gray-600 leading-relaxed mb-4 flex-grow">
                We empower lifelong learners to sharpen their skills and prove
                their knowledge. Our platform offers a vast library of guest
                quizzes across dozens of categories. Test your skills, track your
                progress, and earn shareable badges to showcase your
                achievements. Our mobile-friendly platform means you can learn
                and test yourself anywhere, anytime.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/")} // Or to quiz page
                className="mt-4"
              >
                Start a Free Quiz
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 5. CORE FEATURES RECAP */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Typography
          variant="h3"
          component="h2"
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900"
        >
          Our Core Technology
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard
            icon={<FaEye />}
            title="AI Proctoring"
          >
            Advanced AI monitors exam sessions in real-time, ensuring academic
            integrity without human intervention.
          </FeatureCard>
          <FeatureCard
            icon={<FaChartBar />}
            title="Smart Analytics"
          >
            Get detailed insights into student performance with comprehensive
            analytics and reporting tools.
          </FeatureCard>
          <FeatureCard
            icon={<FaLock />}
            title="Secure Platform"
          >
            Bank-level security ensures your exam data is protected with
            end-to-end encryption and biometric verification.
          </FeatureCard>
        </Box>
      </Container>

      {/* 6. FINAL CTA (JOIN US) */}
      <Box className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 md:py-24">
        <Container maxWidth="md" className="text-center">
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-900"
          >
            Join the Future of Assessment
          </Typography>
          <Typography className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Whether you're an institution looking to secure your exams or an
            individual ready to prove your skills, ZYNTRA is your platform for
            growth.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              color="inherit"
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              sx={{ border: "none" }}
            >
              <span>Request a Demo</span>
            </Button>
            <Button
              variant="text"
              onClick={() => navigate("/")} // Or to quiz page
              className="px-6 py-3 text-blue-600 hover:bg-blue-50"
            >
              Take a Free Quiz
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 7. FOOTER */}
      <Footer />
    </Box>
  );
};

export default AboutPage;