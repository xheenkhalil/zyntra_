import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import {
  FaUniversity,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaClipboardCheck,
  FaSitemap,
  FaShieldAlt,
  FaPlug,
  FaServer,
  FaChartLine,
  FaArrowLeft,
  FaRocket,
  FaCertificate,
  FaGlobe,
  FaUsers,
  FaLock,
} from "react-icons/fa";

// Reusable Feature Card
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

// Stat Card
const StatCard: React.FC<{ value: string; label: string }> = ({
  value,
  label,
}) => (
  <Box className="text-center p-6">
    <Typography className="text-3xl sm:text-4xl font-bold text-white mb-2">
      {value}
    </Typography>
    <Typography className="text-white/70 text-sm sm:text-base">
      {label}
    </Typography>
  </Box>
);

const SchoolsUniversitiesPage: React.FC = () => {
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
          <Box className="floating-element absolute bottom-10 right-10 w-20 sm:w-24 h-20 sm:h-24 glass-effect rounded-full"></Box>
        </Box>
        <Container maxWidth="md" className="relative z-10">
          <Box className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <FaUniversity className="text-blue-300" />
            <span className="text-sm text-blue-200 font-medium">Academic Solutions</span>
          </Box>
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Schools & Universities
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8"
          >
            The complete examination platform built for academic institutions.
            Manage exams at scale, ensure integrity, and unlock powerful insights
            across every department and faculty.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/login"
              className="px-8 py-3 bg-white text-[#111A50] rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all no-underline"
            >
              Request a Demo
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-all no-underline"
            >
              Talk to Sales
            </Link>
          </Box>
        </Container>
      </Box>

      {/* STATS BANNER */}
      <Box className="bg-[#0D1440]">
        <Container maxWidth="lg">
          <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
            <StatCard value="500+" label="Institutions Worldwide" />
            <StatCard value="2M+" label="Exams Delivered" />
            <StatCard value="99.9%" label="Platform Uptime" />
            <StatCard value="50+" label="LMS Integrations" />
          </Box>
        </Container>
      </Box>

      {/* SECTION 1: EXAM MANAGEMENT */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Box>
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Exam Management
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Comprehensive Exam Lifecycle Management
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                ZYNTRA provides a complete end-to-end solution for managing
                examinations across your entire institution. From creating question
                banks and designing exam papers to scheduling sessions and
                distributing results, every step is streamlined through our
                intuitive dashboard.
              </p>
              <p>
                Faculty members can build exams using our rich question editor
                supporting multiple choice, essay, mathematical notation, and
                coding questions. Our intelligent randomisation engine ensures
                every student receives a unique paper whilst maintaining
                equivalent difficulty levels across all variants.
              </p>
              <p>
                Automated scheduling handles conflicts, room assignments, and
                capacity constraints. Students receive personalised timetables
                with push notifications ensuring nobody misses an assessment.
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
              <FaClipboardCheck /> <span>Key Capabilities</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaChartLine className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Question Banks:</strong>{" "}
                  Build and organise thousands of questions by subject, topic,
                  and difficulty level with version control.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaServer className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Auto-Scheduling:</strong>{" "}
                  Intelligent scheduling algorithms prevent conflicts and
                  optimise room utilisation across campuses.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaUsers className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Collaborative Authoring:</strong>{" "}
                  Multiple faculty members can co-author exams with role-based
                  permissions and approval workflows.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaGlobe className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Multi-Language Support:</strong>{" "}
                  Deliver exams in multiple languages to serve diverse student
                  populations across international campuses.
                </span>
              </li>
            </ul>
          </Paper>
        </Box>
      </Container>

      {/* SECTION 2: DEPARTMENT-LEVEL CONTROL */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Box className="text-center mb-12">
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Organisational Structure
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Granular Department-Level Control
            </Typography>
            <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              ZYNTRA mirrors your institutional hierarchy. Every faculty, school,
              and department gets its own workspace with customisable permissions,
              branding, and administrative controls — all under a single
              institutional umbrella.
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard icon={<FaSitemap />} title="Hierarchical Administration">
              Configure multi-tier administration from the Vice-Chancellor
              level down to individual course coordinators. Each level inherits
              permissions while retaining the ability to customise policies
              for their scope.
            </FeatureCard>
            <FeatureCard icon={<FaChalkboardTeacher />} title="Faculty Workspaces">
              Each department enjoys its own isolated workspace for creating
              exams, managing question banks, and reviewing results. Faculty
              members only see the data relevant to their courses and students.
            </FeatureCard>
            <FeatureCard icon={<FaChartLine />} title="Cross-Department Analytics">
              University leadership gains bird's-eye dashboards comparing
              performance metrics, pass rates, and assessment quality across
              all departments — perfect for strategic planning and accreditation
              reporting.
            </FeatureCard>
          </Box>
        </Container>
      </Box>

      {/* SECTION 3: STUDENT ENROLLMENT */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Paper
            elevation={0}
            className="p-6 sm:p-8 rounded-2xl bg-blue-50 border border-blue-100 shadow-xl order-2 md:order-1"
          >
            <Typography
              variant="h5"
              className="font-semibold text-blue-900 mb-4 flex items-center space-x-2"
            >
              <FaUserGraduate /> <span>Enrollment Features</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaUsers className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Bulk Import:</strong>{" "}
                  Upload thousands of students via CSV or direct SIS
                  integration. Automatic deduplication and validation ensure
                  clean records from day one.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaShieldAlt className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Identity Verification:</strong>{" "}
                  Biometric enrollment with facial recognition ensures the
                  right student sits the right exam, preventing impersonation.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaPlug className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Self-Registration:</strong>{" "}
                  Students can self-enrol using institutional SSO, with
                  automatic course and exam group assignment based on their
                  registration data.
                </span>
              </li>
            </ul>
          </Paper>
          <Box className="order-1 md:order-2">
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Student Enrollment
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Seamless Student Enrollment Workflows
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                Getting students onto the platform should never be a bottleneck.
                ZYNTRA supports multiple enrollment pathways — from bulk CSV
                imports and Student Information System (SIS) synchronisation to
                self-service registration via institutional single sign-on.
              </p>
              <p>
                Our enrollment engine handles special accommodations automatically.
                Students with extended time, alternative formats, or assistive
                technology requirements are flagged and configured at enrollment,
                ensuring every exam session is set up correctly without manual
                intervention from administrators.
              </p>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* SECTION 4: COMPLIANCE & ACCREDITATION */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Box className="text-center mb-12">
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Compliance & Accreditation
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Built for Regulatory Compliance
            </Typography>
            <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Whether you are preparing for an accreditation review or meeting
              data protection regulations, ZYNTRA provides the tools, reports,
              and audit trails that keep your institution compliant and audit-ready
              at all times.
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard icon={<FaCertificate />} title="Accreditation Reports">
              Generate comprehensive reports aligned with major accreditation
              frameworks including ABET, AACSB, and regional bodies. Map
              learning outcomes to assessment items automatically and track
              achievement across cohorts.
            </FeatureCard>
            <FeatureCard icon={<FaLock />} title="Data Privacy & GDPR">
              ZYNTRA is fully GDPR, FERPA, and CCPA compliant. Student data
              is encrypted at rest and in transit. Data retention policies are
              configurable, and students can exercise their data rights through
              built-in request workflows.
            </FeatureCard>
            <FeatureCard icon={<FaShieldAlt />} title="Complete Audit Trails">
              Every action on the platform is logged with immutable audit
              trails. From exam creation edits to proctoring flag reviews,
              administrators can reconstruct the full history of any assessment
              event for dispute resolution or compliance audits.
            </FeatureCard>
          </Box>
        </Container>
      </Box>

      {/* SECTION 5: LMS INTEGRATION */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="text-center mb-12">
          <Typography
            component="h2"
            className="text-sm font-semibold text-[#111A50] uppercase mb-2"
          >
            Integrations
          </Typography>
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
          >
            Deep LMS & SIS Integration
          </Typography>
          <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            ZYNTRA plugs directly into your existing educational technology
            stack. No rip-and-replace — just seamless integration with the
            tools your faculty and students already use every day.
          </Typography>
        </Box>
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Paper
            elevation={0}
            className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-lg"
          >
            <FaPlug className="text-4xl text-[#111A50] mb-4" />
            <Typography variant="h5" className="font-semibold text-gray-900 mb-3">
              Learning Management Systems
            </Typography>
            <Typography className="text-gray-600 leading-relaxed">
              Native integrations with Canvas, Blackboard, Moodle, D2L
              Brightspace, and Google Classroom. LTI 1.3 support means
              students launch ZYNTRA exams directly from their course pages
              with automatic grade passback. No separate logins, no context
              switching — just a seamless assessment experience within the LMS
              workflow your institution already relies on.
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-lg"
          >
            <FaServer className="text-4xl text-[#111A50] mb-4" />
            <Typography variant="h5" className="font-semibold text-gray-900 mb-3">
              Student Information Systems
            </Typography>
            <Typography className="text-gray-600 leading-relaxed">
              Bi-directional synchronisation with Banner, PeopleSoft, Jenzabar,
              and other major SIS platforms. Student enrollment, course
              assignments, and exam results flow automatically between systems.
              Our REST API and webhook architecture allow custom integrations
              with any proprietary system your institution may have, ensuring
              ZYNTRA fits into your ecosystem — not the other way round.
            </Typography>
          </Paper>
        </Box>
      </Container>

      {/* SECTION 6: SCALABLE DELIVERY & INTEGRITY */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Box className="text-center mb-12">
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Scale & Integrity
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Scalable Delivery with Uncompromising Integrity
            </Typography>
            <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Whether you're delivering 50 quizzes to a single class or 50,000
              high-stakes exams across multiple campuses simultaneously, ZYNTRA
              scales effortlessly while maintaining the highest standards of
              academic integrity.
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard icon={<FaServer />} title="Cloud-Native Infrastructure">
              Built on globally distributed cloud infrastructure with
              auto-scaling capabilities. Handle peak exam periods without
              performance degradation — our platform has supported over 100,000
              concurrent exam sessions.
            </FeatureCard>
            <FeatureCard icon={<FaShieldAlt />} title="AI-Powered Proctoring">
              Our advanced AI monitors exam sessions in real-time using facial
              recognition, gaze tracking, and environmental analysis. Suspicious
              activity is flagged instantly, and faculty can review incidents
              with timestamped video evidence.
            </FeatureCard>
            <FeatureCard icon={<FaLock />} title="Secure Browser & Lockdown">
              ZYNTRA's secure browser mode prevents access to external
              applications, copy-paste functionality, and screen capture during
              exams. Combined with device fingerprinting and IP monitoring,
              academic integrity is maintained at every layer.
            </FeatureCard>
          </Box>
        </Container>
      </Box>

      {/* CROSS-LINKS */}
      <Container maxWidth="lg" className="py-12">
        <Box className="text-center mb-8">
          <Typography
            variant="h4"
            component="h2"
            className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
          >
            Explore More Solutions
          </Typography>
          <Typography className="text-gray-600">
            Discover how ZYNTRA serves every segment of the assessment
            ecosystem.
          </Typography>
        </Box>
        <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/solutions/corporate-training"
            className="p-6 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition-colors no-underline"
          >
            <FaUsers className="text-2xl text-[#111A50] mx-auto mb-2" />
            <Typography className="font-semibold text-gray-900">
              Corporate Training
            </Typography>
            <Typography className="text-sm text-gray-600">
              Enterprise assessments & certifications
            </Typography>
          </Link>
          <Link
            to="/solutions/guest-quizzes"
            className="p-6 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition-colors no-underline"
          >
            <FaRocket className="text-2xl text-[#111A50] mx-auto mb-2" />
            <Typography className="font-semibold text-gray-900">
              Guest Quizzes
            </Typography>
            <Typography className="text-sm text-gray-600">
              Free practice tests for everyone
            </Typography>
          </Link>
          <Link
            to="/solutions/earn-badges"
            className="p-6 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition-colors no-underline"
          >
            <FaCertificate className="text-2xl text-[#111A50] mx-auto mb-2" />
            <Typography className="font-semibold text-gray-900">
              Earn Badges
            </Typography>
            <Typography className="text-sm text-gray-600">
              Digital credentials & achievements
            </Typography>
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
            Ready to Transform Your Institution's Exams?
          </Typography>
          <Typography className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Join hundreds of universities and schools already using ZYNTRA to
            deliver secure, scalable, and insightful assessments. Get started
            with a free demo today.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/login"
              className="flex items-center space-x-2 px-8 py-3 bg-white text-[#111A50] rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all no-underline"
            >
              <FaRocket />
              <span>Get Started</span>
            </Link>
            <Link
              to="/"
              className="flex items-center space-x-2 px-8 py-3 text-white border border-white/30 rounded-lg font-medium hover:bg-white/10 transition-all no-underline"
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

export default SchoolsUniversitiesPage;
