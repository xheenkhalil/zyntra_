import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import {
  FaFingerprint,
  FaUserShield,
  FaIdCard,
  FaSmile,
  FaBan,
  FaKey,
  FaBalanceScale,
  FaDatabase,
  FaArrowLeft,
  FaRocket,
  FaEye,
  FaChartBar,
  FaCloud,
  FaCheckCircle,
  FaShieldAlt,
  FaLock,
  FaUserCheck,
  FaCamera,
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

const BiometricVerification: React.FC = () => {
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
            <FaFingerprint className="text-3xl text-white" />
          </Box>
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Biometric Verification
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8"
          >
            Confirm every candidate's identity with military-grade biometric
            technology. Our multi-layered verification system ensures that the
            right person is taking the right exam — every single time.
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
              Identity Assurance Beyond Passwords
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                In the age of remote examinations, verifying a candidate's
                identity is one of the most critical challenges facing
                educational institutions and certification bodies. Traditional
                methods like passwords and security questions are easily
                compromised — shared, stolen, or guessed. ZYNTRA's Biometric
                Verification system eliminates these vulnerabilities entirely.
              </p>
              <p>
                Our platform combines advanced facial recognition technology
                with liveness detection, anti-spoofing measures, and government
                ID validation to create a multi-layered identity verification
                process that is both secure and seamless. Candidates complete
                the verification in under 30 seconds, minimizing friction while
                maximizing security.
              </p>
              <p>
                Every biometric data point is processed with the highest
                standards of privacy and security, fully compliant with GDPR,
                CCPA, and other international data protection regulations. We
                don't just verify identity — we protect it.
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
              <FaShieldAlt /> <span>Security Highlights</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">99.7% Accuracy:</strong>{" "}
                  Our facial recognition engine achieves industry-leading
                  accuracy rates across all skin tones and lighting conditions.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Sub-30s Verification:</strong>{" "}
                  The entire identity verification process completes in under
                  30 seconds, keeping candidates focused on their exam.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">GDPR Compliant:</strong>{" "}
                  All biometric data is encrypted, processed locally where
                  possible, and deleted after the verification window expires.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Anti-Spoofing:</strong>{" "}
                  Advanced 3D depth analysis and texture mapping defeat
                  photos, videos, masks, and deepfake attempts.
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
            Verification Technologies
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Multiple layers of biometric and document verification work together
            to create an impenetrable identity assurance system.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <FeatureCard icon={<FaCamera />} title="Facial Recognition">
              Our deep learning facial recognition engine maps over 128 unique
              facial landmarks to create a precise biometric profile. The system
              works reliably across diverse skin tones, lighting conditions, and
              camera qualities.
            </FeatureCard>
            <FeatureCard icon={<FaIdCard />} title="Identity Verification">
              Candidates scan their government-issued photo ID during the
              verification process. Our OCR engine extracts and validates
              identity details, then cross-references the ID photo with the
              live webcam image using facial matching.
            </FeatureCard>
            <FeatureCard icon={<FaSmile />} title="Liveness Detection">
              Prevent impersonation with active liveness checks that require
              candidates to perform randomized actions — blinking, turning
              their head, or smiling — to prove they are a real, present
              person and not a static image or recording.
            </FeatureCard>
            <FeatureCard icon={<FaBan />} title="Anti-Spoofing">
              Advanced 3D depth analysis, texture mapping, and temporal
              pattern detection defeat sophisticated spoofing attempts
              including printed photos, screen replays, 3D masks, and
              AI-generated deepfakes.
            </FeatureCard>
          </Box>
        </Container>
      </Box>

      {/* SECTION 3: AUTHENTICATION & COMPLIANCE */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Typography
          variant="h3"
          component="h2"
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
        >
          Authentication & Compliance
        </Typography>
        <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Enterprise-grade authentication with full regulatory compliance
          ensures both security and legal protection.
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard icon={<FaKey />} title="Multi-Factor Authentication">
            Combine biometric verification with additional authentication
            factors — including institutional SSO, email verification, and
            one-time passwords — for layered security appropriate to the
            stakes of each exam.
          </FeatureCard>
          <FeatureCard icon={<FaBalanceScale />} title="GDPR & Privacy Compliance">
            Full compliance with GDPR, CCPA, and international privacy
            regulations. Biometric data is encrypted at rest and in transit,
            processed with minimal retention, and candidates maintain full
            control over their data through our privacy dashboard.
          </FeatureCard>
          <FeatureCard icon={<FaDatabase />} title="Secure Data Handling">
            All biometric data is processed using end-to-end encryption with
            AES-256 standards. Data is stored in SOC 2 Type II certified
            facilities with automatic purging after configurable retention
            periods. Full audit trails ensure accountability.
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
            Verification Process
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            A seamless three-step process that verifies identity in under
            30 seconds.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Document Capture",
                desc: "Candidates position their government-issued photo ID in front of their webcam. Our OCR engine captures, validates, and extracts identity information in real-time, checking for document authenticity markers.",
              },
              {
                step: "02",
                title: "Facial Match & Liveness",
                desc: "A live webcam capture is compared against the ID photo using 128-point facial landmark mapping. Simultaneously, the candidate performs a randomized liveness challenge to prove physical presence.",
              },
              {
                step: "03",
                title: "Verification Complete",
                desc: "Once identity is confirmed, the candidate receives clearance to proceed to their exam. All verification data is encrypted and stored securely with a full audit trail for institutional review.",
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

      {/* SECTION 5: CONTINUOUS VERIFICATION */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Paper
            elevation={0}
            className="p-6 sm:p-8 rounded-2xl bg-blue-50 border border-blue-100 shadow-xl"
          >
            <Typography
              variant="h5"
              className="font-semibold text-blue-900 mb-4 flex items-center space-x-2"
            >
              <FaLock /> <span>Continuous Verification</span>
            </Typography>
            <Box className="text-gray-700 space-y-3 text-sm sm:text-base">
              <p>
                Identity verification doesn't stop after the initial check.
                ZYNTRA performs continuous biometric monitoring throughout the
                entire exam session to ensure the verified candidate remains
                present.
              </p>
              <p>
                Our AI periodically captures facial snapshots and compares
                them against the verified baseline profile. If the system
                detects a different person, the exam is automatically flagged
                and administrators are notified in real-time.
              </p>
              <p>
                This continuous verification model prevents "proxy testing"
                where one person completes the identity check and another
                takes the exam — one of the most common forms of exam fraud
                in remote testing environments.
              </p>
            </Box>
          </Paper>
          <Box>
            <Typography
              component="h2"
              className="text-sm font-semibold text-blue-600 uppercase mb-2"
            >
              Beyond the Login
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Verification That Lasts the Entire Exam
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaUserCheck className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Periodic facial re-verification at configurable intervals
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaUserShield className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Instant detection if a different person appears on camera
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCamera className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Timestamped verification snapshots for audit trail
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaShieldAlt className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Seamless background checks that don't interrupt the exam
                </span>
              </li>
            </ul>
          </Box>
        </Box>
      </Container>

      {/* SECTION 6: RELATED FEATURES */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
          >
            Works Best With
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Biometric Verification integrates seamlessly with ZYNTRA's security
            and monitoring features.
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
                  Combine biometric verification with continuous AI monitoring
                  for complete exam session security.
                </Typography>
              </Paper>
            </Link>
            <Link to="/features/smart-analytics" className="block group">
              <Paper
                elevation={0}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full"
              >
                <FaChartBar className="text-3xl text-blue-600 mb-4" />
                <Typography variant="h6" className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Smart Analytics
                </Typography>
                <Typography className="text-gray-600 text-sm">
                  Track verification success rates, failure patterns, and
                  security metrics through analytics dashboards.
                </Typography>
              </Paper>
            </Link>
            <Link to="/features/cloud-integration" className="block group">
              <Paper
                elevation={0}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full"
              >
                <FaCloud className="text-3xl text-blue-600 mb-4" />
                <Typography variant="h6" className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Cloud Integration
                </Typography>
                <Typography className="text-gray-600 text-sm">
                  Secure cloud infrastructure ensures biometric data is
                  protected with enterprise-grade encryption and compliance.
                </Typography>
              </Paper>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* CTA SECTION */}
      <Box className="bg-[#111A50] py-16 md:py-24">
        <Container maxWidth="md" className="text-center">
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-white"
          >
            Protect Your Exam Integrity
          </Typography>
          <Typography className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Ensure every candidate is who they claim to be with ZYNTRA's
            advanced biometric verification. Secure, compliant, and seamless —
            identity assurance for the modern assessment era.
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

export default BiometricVerification;
