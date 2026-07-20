import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import {
  FaEye,
  FaUserShield,
  FaBrain,
  FaDesktop,
  FaCamera,
  FaFlag,
  FaUserCheck,
  FaFileAlt,
  FaArrowLeft,
  FaRocket,
  FaChartBar,
  FaFingerprint,
  FaShieldAlt,
  FaCheckCircle,
  FaLock,
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
            className: "text-[#111A50] text-lg sm:text-xl",
          })
        : icon}
    </Box>
    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
      {title}
    </h3>
    <p className="text-gray-600 text-sm sm:text-base">{children}</p>
  </Box>
);

const AIProctoring: React.FC = () => {
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
            <FaEye className="text-3xl text-white" />
          </Box>
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            AI-Powered Proctoring
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8"
          >
            Ensure complete exam integrity with our advanced artificial intelligence
            that monitors, detects, and reports suspicious behavior in real time —
            without disrupting the test-taking experience.
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
              to="/register"
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
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Overview
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Intelligent Exam Monitoring That Never Sleeps
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                ZYNTRA's AI Proctoring engine represents a paradigm shift in how
                examination integrity is maintained. Unlike traditional human
                proctoring that is expensive, inconsistent, and limited in scale,
                our system leverages state-of-the-art deep learning models to
                continuously monitor every exam session with unwavering precision
                and consistency.
              </p>
              <p>
                From the moment a candidate initiates their exam, our AI begins
                analyzing video feeds, audio streams, and system-level activity
                to build a comprehensive behavioral profile. The system is trained
                on millions of data points to distinguish normal test-taking
                behavior from genuine attempts at academic dishonesty, significantly
                reducing false positives while catching even the most sophisticated
                cheating techniques.
              </p>
              <p>
                Whether you're administering a classroom quiz or a global
                certification exam with thousands of simultaneous candidates,
                ZYNTRA's proctoring scales effortlessly while maintaining the same
                level of vigilance and accuracy across every single session.
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
              <FaShieldAlt /> <span>Why AI Proctoring?</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">24/7 Vigilance:</strong>{" "}
                  AI never gets tired, distracted, or needs breaks — every
                  second of every exam is monitored with equal attention.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Cost Effective:</strong>{" "}
                  Eliminate the need for one-to-one human proctors, reducing
                  costs by up to 80% while improving detection rates.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Scalable:</strong>{" "}
                  Monitor 10 or 10,000 candidates simultaneously without any
                  degradation in performance or accuracy.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Fair & Consistent:</strong>{" "}
                  Every candidate is evaluated against the same standards,
                  eliminating human bias from the proctoring process.
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
            Core Proctoring Capabilities
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Our multi-layered AI system combines several detection technologies
            to create the most comprehensive proctoring solution available.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <FeatureCard icon={<FaEye />} title="Real-Time Monitoring">
              Continuous video and audio analysis throughout the entire exam
              session. Our AI processes frames in real-time to detect
              irregularities the moment they occur, enabling instant intervention
              when necessary.
            </FeatureCard>
            <FeatureCard icon={<FaUserShield />} title="Facial Recognition">
              Advanced facial recognition verifies the candidate's identity
              throughout the exam, ensuring the person who registered is the
              person taking the test. The system detects face swaps, masks, and
              unauthorized individuals.
            </FeatureCard>
            <FeatureCard icon={<FaBrain />} title="Behavior Analysis">
              Our deep learning models analyze eye movements, head positioning,
              and body language to detect patterns associated with cheating —
              such as looking off-screen, whispering, or interacting with
              unauthorized materials.
            </FeatureCard>
            <FeatureCard icon={<FaDesktop />} title="Tab-Switching Detection">
              System-level monitoring detects when candidates attempt to
              navigate away from the exam window, open other applications, or
              use browser developer tools. Every attempt is logged with
              timestamps and screenshots.
            </FeatureCard>
          </Box>
        </Container>
      </Box>

      {/* SECTION 3: ADVANCED FEATURES */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Typography
          variant="h3"
          component="h2"
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
        >
          Advanced Detection Features
        </Typography>
        <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Beyond basic monitoring, ZYNTRA employs cutting-edge technologies to
          address modern cheating methods and ensure the highest levels of integrity.
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <FeatureCard icon={<FaCamera />} title="Multi-Camera Support">
            Support for secondary camera views — including mobile devices — to
            capture the candidate's environment from multiple angles. Ideal for
            high-stakes exams requiring room scans and desk verification.
          </FeatureCard>
          <FeatureCard icon={<FaFlag />} title="Automated Flagging">
            Suspicious activities are automatically flagged with severity
            levels (low, medium, high, critical). Administrators receive
            real-time alerts for critical flags while lower-severity events
            are compiled into post-exam reports.
          </FeatureCard>
          <FeatureCard icon={<FaUserCheck />} title="Human Review Integration">
            For flagged events, human reviewers can access timestamped video
            clips, screenshots, and AI-generated analysis summaries. This
            hybrid approach combines AI efficiency with human judgment for
            the most accurate outcomes.
          </FeatureCard>
          <FeatureCard icon={<FaFileAlt />} title="Integrity Reports">
            Comprehensive exam integrity reports are generated for every
            session, including risk scores, behavioral timelines, flagged
            events, and AI confidence ratings. Reports can be exported as
            PDF or integrated with your LMS.
          </FeatureCard>
        </Box>
      </Container>

      {/* SECTION 4: HOW IT WORKS */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
          >
            How AI Proctoring Works
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            A seamless four-step process that ensures exam integrity from
            start to finish.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Identity Verification",
                desc: "Before the exam begins, candidates complete a biometric identity check using facial recognition and government-issued ID verification to confirm their identity.",
              },
              {
                step: "02",
                title: "Environment Scan",
                desc: "Candidates perform a 360-degree room scan using their webcam or mobile device to verify their testing environment is free of unauthorized materials.",
              },
              {
                step: "03",
                title: "Continuous Monitoring",
                desc: "Throughout the exam, AI models analyze video, audio, and system activity in real-time, flagging any suspicious behavior with contextual evidence.",
              },
              {
                step: "04",
                title: "Report Generation",
                desc: "After the exam, a comprehensive integrity report is generated with risk scores, flagged events, and AI recommendations for administrator review.",
              },
            ].map((item) => (
              <Box
                key={item.step}
                className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-[#111A50]"
              >
                <Typography className="text-3xl font-bold text-[#111A50]/20 mb-2">
                  {item.step}
                </Typography>
                <Typography
                  variant="h6"
                  className="font-semibold text-gray-900 mb-3"
                >
                  {item.title}
                </Typography>
                <Typography className="text-gray-600 text-sm">
                  {item.desc}
                </Typography>
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
          AI Proctoring integrates seamlessly with other ZYNTRA features for a
          complete exam security ecosystem.
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/features/biometric-verification" className="block group">
            <Paper
              elevation={0}
              className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full"
            >
              <FaFingerprint className="text-3xl text-[#111A50] mb-4" />
              <Typography variant="h6" className="font-semibold text-gray-900 mb-2 group-hover:text-[#111A50] transition-colors">
                Biometric Verification
              </Typography>
              <Typography className="text-gray-600 text-sm">
                Strengthen identity verification with multi-factor biometric
                authentication and liveness detection.
              </Typography>
            </Paper>
          </Link>
          <Link to="/features/smart-analytics" className="block group">
            <Paper
              elevation={0}
              className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full"
            >
              <FaChartBar className="text-3xl text-[#111A50] mb-4" />
              <Typography variant="h6" className="font-semibold text-gray-900 mb-2 group-hover:text-[#111A50] transition-colors">
                Smart Analytics
              </Typography>
              <Typography className="text-gray-600 text-sm">
                Transform proctoring data into actionable insights with
                advanced analytics dashboards and reports.
              </Typography>
            </Paper>
          </Link>
          <Link to="/features/cloud-integration" className="block group">
            <Paper
              elevation={0}
              className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full"
            >
              <FaLock className="text-3xl text-[#111A50] mb-4" />
              <Typography variant="h6" className="font-semibold text-gray-900 mb-2 group-hover:text-[#111A50] transition-colors">
                Cloud Integration
              </Typography>
              <Typography className="text-gray-600 text-sm">
                Secure cloud infrastructure ensures reliable, scalable
                proctoring sessions with 99.9% uptime.
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
            Ready to Secure Your Exams?
          </Typography>
          <Typography className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Join thousands of institutions worldwide that trust ZYNTRA's AI
            Proctoring to maintain exam integrity at scale. Start protecting
            the value of your credentials today.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
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

export default AIProctoring;
