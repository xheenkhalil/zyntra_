import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import {
  FaChartBar,
  FaChartLine,
  FaUserGraduate,
  FaPuzzlePiece,
  FaTachometerAlt,
  FaBalanceScale,
  FaFileExport,
  FaLightbulb,
  FaBolt,
  FaArrowLeft,
  FaRocket,
  FaEye,
  FaFingerprint,
  FaRobot,
  FaCheckCircle,
  FaShieldAlt,
  FaDatabase,
} from "react-icons/fa";

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

const SmartAnalytics: React.FC = () => {
  return (
    <Box className="bg-white">
      {/* NAVIGATION */}
      <Navbar />

      {/* HERO SECTION */}
      <Box className="relative bg-[#111A50] text-white py-20 md:py-32 text-center overflow-hidden">
        <Box className="absolute inset-0 overflow-hidden opacity-30">
          <Box className="floating-element absolute top-10 sm:top-20 left-5 sm:left-10 w-12 sm:w-16 h-12 sm:h-16 glass-effect rounded-full"></Box>
          <Box className="floating-element absolute top-32 sm:top-40 right-10 sm:right-20 w-8 sm:w-12 h-8 sm:h-12 glass-effect rounded-full"></Box>
          <Box className="floating-element absolute bottom-24 sm:bottom-32 left-1/4 w-16 sm:w-20 h-16 sm:h-20 glass-effect rounded-full"></Box>
          <Box className="floating-element absolute top-16 right-1/3 w-10 sm:w-14 h-10 sm:h-14 glass-effect rounded-full"></Box>
          <Box className="floating-element absolute bottom-16 right-10 w-12 sm:w-16 h-12 sm:h-16 glass-effect rounded-full"></Box>
        </Box>
        <Container maxWidth="md" className="relative z-10">
          <Box className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
            <FaChartBar className="text-3xl text-white" />
          </Box>
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Smart Analytics
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8"
          >
            Transform raw exam data into powerful, actionable insights. Our
            analytics engine helps educators understand performance patterns,
            optimize assessments, and drive better learning outcomes.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Home</span>
            </Link>
            <Link
              to="/login"
              className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-100 text-[#111A50] rounded-lg font-medium shadow-lg transition-colors"
            >
              <FaRocket />
              <span>Get Started</span>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* SECTION 1: OVERVIEW */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Box>
            <Typography
              component="h2"
              className="text-sm font-semibold text-blue-600 uppercase mb-2"
            >
              Overview
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Data-Driven Decisions for Better Education
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                In today's educational landscape, data is the most valuable
                resource available to institutions. ZYNTRA's Smart Analytics
                platform transforms the vast amounts of data generated during
                every exam into clear, actionable insights that drive meaningful
                improvements in both teaching and assessment practices.
              </p>
              <p>
                Our analytics engine processes millions of data points in real
                time — from individual question response times and answer
                patterns to cohort-level performance trends and exam difficulty
                metrics. The result is a comprehensive understanding of how
                students learn, where they struggle, and how assessments can be
                optimized for fairness and effectiveness.
              </p>
              <p>
                Whether you're a course instructor looking to understand why
                students are struggling with a particular topic, or a department
                head needing to compare performance across multiple sections,
                ZYNTRA's analytics gives you the clarity you need to take action.
              </p>
            </Box>
          </Box>
          <Paper
            elevation={0}
            className="p-6 sm:p-8 rounded-2xl bg-blue-50 border border-blue-100 shadow-xl"
          >
            <Typography
              variant="h5"
              className="font-semibold text-blue-900 mb-4 flex items-center space-x-2"
            >
              <FaShieldAlt /> <span>Analytics at a Glance</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Real-Time Dashboards:</strong>{" "}
                  Live data visualizations that update as exams are being taken,
                  giving you instant visibility into performance.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Predictive Models:</strong>{" "}
                  Machine learning algorithms identify at-risk students early,
                  enabling timely intervention and support.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Exportable Reports:</strong>{" "}
                  Generate beautiful PDF and CSV reports for stakeholders,
                  accreditation bodies, and institutional records.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Historical Trends:</strong>{" "}
                  Track performance over semesters and years to measure the
                  impact of curriculum changes and teaching strategies.
                </span>
              </li>
            </ul>
          </Paper>
        </Box>
      </Container>

      {/* SECTION 2: CORE CAPABILITIES */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
          >
            Analytics Capabilities
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            From individual student insights to institution-wide metrics, our
            analytics suite covers every dimension of assessment data.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <FeatureCard icon={<FaTachometerAlt />} title="Performance Dashboards">
              Interactive dashboards with drag-and-drop widgets provide
              real-time visibility into exam performance, completion rates,
              average scores, and pass/fail distributions across your entire
              institution.
            </FeatureCard>
            <FeatureCard icon={<FaUserGraduate />} title="Student Progress Tracking">
              Track individual student journeys over time with detailed
              progress charts, skill mastery levels, and personalized
              performance summaries. Identify struggling students before
              they fall behind.
            </FeatureCard>
            <FeatureCard icon={<FaPuzzlePiece />} title="Question Difficulty Analysis">
              Automatically analyze each question's difficulty index,
              discrimination index, and distractor effectiveness. Use
              psychometric data to build better assessments and maintain
              consistent difficulty levels.
            </FeatureCard>
            <FeatureCard icon={<FaChartLine />} title="Scoring Trends">
              Visualize scoring trends across cohorts, semesters, and exam
              versions. Spot anomalies, track improvement, and measure the
              impact of curriculum changes with time-series analysis tools.
            </FeatureCard>
          </Box>
        </Container>
      </Box>

      {/* SECTION 3: ADVANCED ANALYTICS */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Typography
          variant="h3"
          component="h2"
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
        >
          Advanced Insights
        </Typography>
        <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Go beyond basic metrics with predictive analytics, comparative
          benchmarking, and AI-powered recommendations.
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <FeatureCard icon={<FaBalanceScale />} title="Comparative Analytics">
            Compare performance across sections, campuses, regions, or
            demographics. Benchmark your results against historical data or
            industry standards to understand where your institution stands.
          </FeatureCard>
          <FeatureCard icon={<FaFileExport />} title="Exportable Reports">
            Generate comprehensive reports in PDF, CSV, and Excel formats with
            customizable templates. Schedule automated reports for stakeholders
            or integrate directly with your institutional reporting systems.
          </FeatureCard>
          <FeatureCard icon={<FaLightbulb />} title="Predictive Insights">
            Our AI engine uses historical performance data to predict future
            outcomes, identify at-risk students, and recommend interventions.
            Stay ahead of problems before they impact learning outcomes.
          </FeatureCard>
          <FeatureCard icon={<FaBolt />} title="Real-Time Data Processing">
            All analytics are powered by our real-time data pipeline, ensuring
            that dashboards and reports reflect the most current information.
            No waiting for batch processing — insights are available instantly.
          </FeatureCard>
        </Box>
      </Container>

      {/* SECTION 4: USE CASES */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
          >
            Analytics in Action
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            See how different roles benefit from ZYNTRA's analytics platform.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaUserGraduate className="text-3xl text-blue-600 mb-4" />,
                title: "For Educators",
                items: [
                  "Identify which topics need more classroom time",
                  "Evaluate the effectiveness of teaching methods",
                  "Track individual student progress and intervene early",
                  "Optimize question pools for fairness and validity",
                ],
              },
              {
                icon: <FaDatabase className="text-3xl text-blue-600 mb-4" />,
                title: "For Administrators",
                items: [
                  "Monitor institution-wide performance metrics",
                  "Generate accreditation-ready compliance reports",
                  "Compare performance across departments and campuses",
                  "Track resource allocation effectiveness",
                ],
              },
              {
                icon: <FaChartBar className="text-3xl text-blue-600 mb-4" />,
                title: "For Students",
                items: [
                  "View personalized performance summaries",
                  "Understand strengths and areas for improvement",
                  "Track progress toward learning objectives",
                  "Access detailed feedback on each assessment",
                ],
              },
            ].map((item) => (
              <Box
                key={item.title}
                className="bg-white rounded-xl p-6 shadow-lg border"
              >
                {item.icon}
                <Typography
                  variant="h6"
                  className="font-semibold text-gray-900 mb-4"
                >
                  {item.title}
                </Typography>
                <ul className="space-y-2">
                  {item.items.map((point, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0 text-sm" />
                      <span className="text-gray-600 text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* SECTION 5: RELATED FEATURES */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Typography
          variant="h3"
          component="h2"
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
        >
          Works Best With
        </Typography>
        <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Smart Analytics integrates seamlessly with other ZYNTRA features to
          provide a complete assessment intelligence platform.
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/features/ai-proctoring" className="block group">
            <Paper
              elevation={0}
              className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full"
            >
              <FaEye className="text-3xl text-blue-600 mb-4" />
              <Typography variant="h6" className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                AI Proctoring
              </Typography>
              <Typography className="text-gray-600 text-sm">
                Combine proctoring data with analytics to understand the
                relationship between exam integrity and performance.
              </Typography>
            </Paper>
          </Link>
          <Link to="/features/auto-grading" className="block group">
            <Paper
              elevation={0}
              className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full"
            >
              <FaRobot className="text-3xl text-blue-600 mb-4" />
              <Typography variant="h6" className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Auto-Grading
              </Typography>
              <Typography className="text-gray-600 text-sm">
                Feed grading data directly into analytics for instant
                performance dashboards and scoring trend analysis.
              </Typography>
            </Paper>
          </Link>
          <Link to="/features/cloud-integration" className="block group">
            <Paper
              elevation={0}
              className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full"
            >
              <FaFingerprint className="text-3xl text-blue-600 mb-4" />
              <Typography variant="h6" className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Cloud Integration
              </Typography>
              <Typography className="text-gray-600 text-sm">
                Export analytics data to your existing BI tools and LMS
                platforms through our cloud integration APIs.
              </Typography>
            </Paper>
          </Link>
        </Box>
      </Container>

      {/* CTA SECTION */}
      <Box className="bg-[#111A50] py-16 md:py-24">
        <Container maxWidth="md" className="text-center">
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-white"
          >
            Unlock the Power of Your Data
          </Typography>
          <Typography className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Stop guessing and start knowing. ZYNTRA's Smart Analytics turns
            every exam into an opportunity to learn, improve, and grow. See the
            difference data-driven decisions can make.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/login"
              className="flex items-center space-x-2 px-8 py-3 bg-white hover:bg-gray-100 text-[#111A50] rounded-lg font-medium shadow-lg transition-colors"
            >
              <FaRocket />
              <span>Request a Demo</span>
            </Link>
            <Link
              to="/"
              className="flex items-center space-x-2 px-8 py-3 text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Home</span>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* FOOTER */}
      <Footer />
    </Box>
  );
};

export default SmartAnalytics;
