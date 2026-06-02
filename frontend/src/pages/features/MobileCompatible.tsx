import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import {
  FaMobileAlt,
  FaTabletAlt,
  FaDesktop,
  FaWifi,
  FaSyncAlt,
  FaHandPointer,
  FaVideo,
  FaTachometerAlt,
  FaArrowLeft,
  FaRocket,
  FaEye,
  FaChartBar,
  FaFingerprint,
  FaCheckCircle,
  FaShieldAlt,
  FaApple,
  FaAndroid,
  FaGlobe,
  FaDownload,
  FaBatteryFull,
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

const MobileCompatible: React.FC = () => {
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
            <FaMobileAlt className="text-3xl text-white" />
          </Box>
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Mobile Compatible
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8"
          >
            Take exams anywhere, on any device. ZYNTRA delivers a seamless,
            native-quality experience across smartphones, tablets, and
            desktops — with full proctoring and offline support.
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
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Overview
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Exams Without Boundaries
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                The modern world is mobile-first. Over 60% of internet traffic
                now comes from mobile devices, yet most exam platforms still
                deliver a subpar experience on anything smaller than a laptop.
                ZYNTRA changes that fundamentally with a platform engineered
                from the ground up for mobile excellence.
              </p>
              <p>
                Our responsive architecture automatically adapts to any screen
                size, while our progressive web app (PWA) technology delivers
                near-native performance without requiring app store downloads.
                Whether a candidate is using the latest flagship smartphone,
                an affordable Android device, or a desktop computer, they
                receive the same polished, intuitive experience.
              </p>
              <p>
                Mobile compatibility isn't just about responsive design — it's
                about rethinking the entire exam experience for touch-first
                interactions, variable network conditions, and the unique
                constraints of mobile devices. ZYNTRA addresses every challenge
                to make mobile exams not just possible, but exceptional.
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
              <FaShieldAlt /> <span>Platform Support</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaApple className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">iOS:</strong>{" "}
                  Full support for iPhone and iPad running iOS 15+ with
                  Safari, Chrome, and PWA installation.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaAndroid className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Android:</strong>{" "}
                  Compatible with Android 10+ devices across all major
                  browsers including Chrome, Firefox, and Samsung Internet.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaDesktop className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Desktop:</strong>{" "}
                  Optimized for Windows, macOS, and Linux with Chrome, Firefox,
                  Edge, and Safari support.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaGlobe className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">PWA:</strong>{" "}
                  Install ZYNTRA as a progressive web app for app-like
                  performance without app store dependency.
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
            Mobile-First Features
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Every feature is designed with mobile users in mind, ensuring a
            seamless experience regardless of device or connectivity.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <FeatureCard icon={<FaTabletAlt />} title="Responsive Design">
              Fluid layouts and adaptive components ensure every element —
              from question text and images to navigation controls — displays
              perfectly on screens of all sizes, from 4-inch phones to
              32-inch monitors.
            </FeatureCard>
            <FeatureCard icon={<FaMobileAlt />} title="Native Mobile Experience">
              Smooth animations, gesture-based navigation, haptic feedback,
              and platform-specific UI patterns deliver an experience that
              feels native to each device. Swipe between questions, pinch to
              zoom on images, and more.
            </FeatureCard>
            <FeatureCard icon={<FaDownload />} title="Offline Mode">
              Download exams before going offline and take them without an
              internet connection. Answers are stored securely on the device
              and automatically synced when connectivity is restored, ensuring
              no work is ever lost.
            </FeatureCard>
            <FeatureCard icon={<FaSyncAlt />} title="Cross-Device Sync">
              Start an exam on your desktop at home and continue on your
              tablet during your commute. Real-time synchronization ensures
              your progress, answers, and timer state transfer seamlessly
              between devices.
            </FeatureCard>
          </Box>
        </Container>
      </Box>

      {/* SECTION 3: ADVANCED MOBILE FEATURES */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Typography
          variant="h3"
          component="h2"
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
        >
          Advanced Mobile Capabilities
        </Typography>
        <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Beyond basic responsiveness — features built specifically for the
          challenges and opportunities of mobile exam-taking.
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard icon={<FaHandPointer />} title="Touch-Optimized Interface">
            Every interactive element is designed for touch — large tap targets,
            swipe gestures for navigation, drag-and-drop for ordering questions,
            and pinch-to-zoom for images and diagrams. No more frustrating
            misclicks on tiny buttons.
          </FeatureCard>
          <FeatureCard icon={<FaVideo />} title="Mobile Proctoring">
            Full AI proctoring functionality on mobile devices using the
            front-facing camera. Our lightweight proctoring engine is optimized
            for mobile processors and battery life, providing the same security
            guarantees as desktop proctoring.
          </FeatureCard>
          <FeatureCard icon={<FaTachometerAlt />} title="Bandwidth Optimization">
            Adaptive streaming quality, efficient data compression, and
            intelligent caching minimize data usage. Our system automatically
            adjusts to available bandwidth, ensuring reliable performance even
            on 3G connections or congested networks.
          </FeatureCard>
        </Box>
      </Container>

      {/* SECTION 4: PERFORMANCE OPTIMIZATION */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
          >
            Optimized for Performance
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Every millisecond matters during an exam. Our platform is
            engineered for speed and reliability on every device.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaTachometerAlt className="text-2xl text-[#111A50]" />,
                title: "< 2s Load Time",
                desc: "Initial exam page load completes in under 2 seconds on 4G networks, with subsequent pages loading in under 500ms from cache.",
              },
              {
                icon: <FaBatteryFull className="text-2xl text-[#111A50]" />,
                title: "Battery Efficient",
                desc: "Optimized rendering and minimal background processing ensure that mobile exams consume less than 5% battery per hour.",
              },
              {
                icon: <FaWifi className="text-2xl text-[#111A50]" />,
                title: "Low Data Usage",
                desc: "Adaptive compression and intelligent caching keep data usage under 50MB per hour, even with proctoring enabled.",
              },
              {
                icon: <FaSyncAlt className="text-2xl text-[#111A50]" />,
                title: "Auto-Save",
                desc: "Answers are auto-saved every 10 seconds both locally and to the cloud, protecting against connection drops and device issues.",
              },
            ].map((item) => (
              <Box
                key={item.title}
                className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-[#111A50] text-center"
              >
                <Box className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-4">
                  {item.icon}
                </Box>
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

      {/* SECTION 5: ACCESSIBILITY */}
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
              <FaGlobe /> <span>Accessibility First</span>
            </Typography>
            <Box className="text-gray-700 space-y-3 text-sm sm:text-base">
              <p>
                Our mobile experience is built with accessibility at its core.
                ZYNTRA is fully compliant with WCAG 2.1 AA standards, ensuring
                that candidates with disabilities can take exams on their
                preferred mobile devices without barriers.
              </p>
              <p>
                Screen reader support, adjustable font sizes, high-contrast
                modes, and keyboard navigation are built into every component.
                Voice input for text responses and alternative input methods
                are available for candidates who need them.
              </p>
              <p>
                We believe that mobile compatibility means compatibility for
                everyone — regardless of ability, device, or network condition.
              </p>
            </Box>
          </Paper>
          <Box>
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Inclusive Design
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Accessible to Every Candidate
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  WCAG 2.1 AA compliance across all mobile interfaces
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Full screen reader and voice-over support
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Adjustable font sizes, contrast, and color themes
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Voice input and alternative input method support
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  RTL language support for international deployments
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
            Mobile compatibility is enhanced by ZYNTRA's broader feature
            ecosystem.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/features/ai-proctoring" className="block group">
              <Paper
                elevation={0}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full"
              >
                <FaEye className="text-3xl text-[#111A50] mb-4" />
                <Typography variant="h6" className="font-semibold text-gray-900 mb-2 group-hover:text-[#111A50] transition-colors">
                  AI Proctoring
                </Typography>
                <Typography className="text-gray-600 text-sm">
                  Full proctoring capabilities on mobile devices with
                  optimized camera and audio processing.
                </Typography>
              </Paper>
            </Link>
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
                  Use mobile camera for facial recognition and ID
                  verification with optimized mobile processing.
                </Typography>
              </Paper>
            </Link>
            <Link to="/features/cloud-integration" className="block group">
              <Paper
                elevation={0}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full"
              >
                <FaChartBar className="text-3xl text-[#111A50] mb-4" />
                <Typography variant="h6" className="font-semibold text-gray-900 mb-2 group-hover:text-[#111A50] transition-colors">
                  Cloud Integration
                </Typography>
                <Typography className="text-gray-600 text-sm">
                  Seamless cloud sync ensures mobile exam data is instantly
                  available across all platforms.
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
            Exams That Go Where You Go
          </Typography>
          <Typography className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Give your candidates the freedom to take exams on any device,
            anywhere. ZYNTRA's mobile-first platform ensures a flawless
            experience from smartphone to desktop.
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

export default MobileCompatible;
