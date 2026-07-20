import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import {
  FaBriefcase,
  FaUserTie,
  FaCertificate,
  FaClipboardList,
  FaChartBar,
  FaChartLine,
  FaCogs,
  FaUsers,
  FaShieldAlt,
  FaPlug,
  FaArrowLeft,
  FaRocket,
  FaUniversity,
  FaTrophy,
  FaLightbulb,
  FaHandshake,
  FaCheckCircle,
  FaUserGraduate,
  FaSyncAlt,
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

const CorporateTrainingPage: React.FC = () => {
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
            <FaBriefcase className="text-blue-300" />
            <span className="text-sm text-blue-200 font-medium">Enterprise Solutions</span>
          </Box>
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Corporate Training & Assessment
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8"
          >
            Empower your workforce with measurable, scalable assessment and
            certification programmes. From onboarding to upskilling, ZYNTRA
            drives performance at every level of your organisation.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-[#111A50] rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all no-underline"
            >
              Request Enterprise Demo
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-all no-underline"
            >
              Contact Sales
            </Link>
          </Box>
        </Container>
      </Box>

      {/* STATS BANNER */}
      <Box className="bg-[#0D1440]">
        <Container maxWidth="lg">
          <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
            <StatCard value="1,200+" label="Enterprise Clients" />
            <StatCard value="5M+" label="Assessments Completed" />
            <StatCard value="92%" label="Training Completion Rate" />
            <StatCard value="40%" label="Faster Onboarding" />
          </Box>
        </Container>
      </Box>

      {/* SECTION 1: EMPLOYEE ASSESSMENT & CERTIFICATION */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Box>
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Assessment & Certification
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Employee Assessment & Professional Certification
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                ZYNTRA enables organisations to build comprehensive assessment
                programmes that measure real competency. Design certifications
                that validate critical skills, from technical proficiency to
                leadership capabilities, with assessments that go beyond simple
                multiple-choice tests.
              </p>
              <p>
                Our platform supports complex question types including
                scenario-based assessments, case studies, simulations, and
                practical demonstrations. Certifications can be configured with
                expiry dates and renewal workflows, ensuring your team's
                credentials remain current and meaningful.
              </p>
              <p>
                Automated certificate generation with custom branding, digital
                signatures, and blockchain-verified credentials provides your
                employees with portable proof of achievement that carries weight
                in the industry.
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
              <FaCertificate /> <span>Certification Features</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Custom Certification Paths:</strong>{" "}
                  Design multi-level certification programmes with prerequisites,
                  electives, and specialisation tracks tailored to your industry.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaSyncAlt className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Renewal Management:</strong>{" "}
                  Automated reminders and streamlined recertification workflows
                  ensure compliance certifications never lapse.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaShieldAlt className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Verified Credentials:</strong>{" "}
                  Blockchain-backed digital certificates that employers and
                  regulatory bodies can instantly verify for authenticity.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaUserGraduate className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Learning Pathways:</strong>{" "}
                  Integrate assessments into broader learning journeys with
                  pre-training diagnostics and post-training evaluations.
                </span>
              </li>
            </ul>
          </Paper>
        </Box>
      </Container>

      {/* SECTION 2: COMPLIANCE TRAINING */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Box className="text-center mb-12">
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Compliance Training
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Regulatory Compliance Made Simple
            </Typography>
            <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Stay ahead of regulatory requirements with automated compliance
              training programmes. ZYNTRA ensures your entire workforce is
              assessed, certified, and documented — eliminating the risk of
              non-compliance penalties.
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard icon={<FaShieldAlt />} title="Mandatory Training Tracking">
              Assign mandatory assessments by role, department, or location.
              Automated escalation alerts notify managers when team members
              are overdue, and compliance dashboards provide real-time
              visibility into completion rates across the entire organisation.
            </FeatureCard>
            <FeatureCard icon={<FaClipboardList />} title="Audit-Ready Documentation">
              Every assessment attempt, score, and certification is logged
              with tamper-proof records. Generate compliance reports for
              ISO, SOX, HIPAA, and industry-specific regulations with a
              single click — perfect for auditors and regulatory reviews.
            </FeatureCard>
            <FeatureCard icon={<FaCogs />} title="Policy Acknowledgement">
              Beyond traditional assessments, ZYNTRA supports policy
              acknowledgement workflows where employees read, understand,
              and digitally sign off on company policies, with versioned
              tracking when policies are updated.
            </FeatureCard>
          </Box>
        </Container>
      </Box>

      {/* SECTION 3: SKILLS GAP ANALYSIS */}
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
              <FaLightbulb /> <span>Skills Intelligence</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaChartBar className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Competency Mapping:</strong>{" "}
                  Define competency frameworks for every role and map assessment
                  questions to specific skills, generating a detailed heat map
                  of organisational capability.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaChartLine className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Gap Identification:</strong>{" "}
                  AI-powered analysis highlights critical skill gaps at
                  individual, team, and organisational levels — with actionable
                  recommendations for targeted training interventions.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaUsers className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Benchmarking:</strong>{" "}
                  Compare your workforce's skills profile against industry
                  benchmarks and internal targets to quantify competitive
                  advantage and investment priorities.
                </span>
              </li>
            </ul>
          </Paper>
          <Box className="order-1 md:order-2">
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Skills Gap Analysis
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Identify, Measure, and Close Skills Gaps
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                Understanding where your organisation's strengths and weaknesses
                lie is the first step to building a high-performing workforce.
                ZYNTRA's skills gap analysis engine transforms assessment data
                into strategic intelligence.
              </p>
              <p>
                By mapping every question to specific competencies and skill
                domains, our platform generates detailed skills profiles for
                individuals and teams. Leaders can see exactly where targeted
                training will deliver the highest return on investment, enabling
                data-driven decisions about learning budgets and talent
                development priorities.
              </p>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* SECTION 4: ONBOARDING EVALUATIONS */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Box className="text-center mb-12">
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Onboarding
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Accelerate Onboarding with Smart Evaluations
            </Typography>
            <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Reduce time-to-productivity for new hires with structured
              onboarding assessments that verify knowledge, identify training
              needs, and set clear performance baselines from day one.
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard icon={<FaUserTie />} title="Pre-boarding Diagnostics">
              Assess new hires before their first day to understand their
              baseline knowledge. Use results to personalise onboarding
              programmes, so each employee receives exactly the training they
              need — nothing more, nothing less.
            </FeatureCard>
            <FeatureCard icon={<FaClipboardList />} title="Milestone Assessments">
              Set checkpoint assessments at 30, 60, and 90 days to measure
              knowledge acquisition and cultural alignment. Automated progress
              reports help managers intervene early if a new hire is struggling,
              reducing early attrition.
            </FeatureCard>
            <FeatureCard icon={<FaHandshake />} title="Role-Specific Pathways">
              Create tailored onboarding tracks for different departments,
              roles, and seniority levels. Sales teams, engineers, and
              executives each receive assessments relevant to their function,
              accelerating their path to full contribution.
            </FeatureCard>
          </Box>
        </Container>
      </Box>

      {/* SECTION 5: PERFORMANCE BENCHMARKING & ANALYTICS */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="text-center mb-12">
          <Typography
            component="h2"
            className="text-sm font-semibold text-[#111A50] uppercase mb-2"
          >
            Analytics & Benchmarking
          </Typography>
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
          >
            Performance Benchmarking & Team Analytics
          </Typography>
          <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Turn assessment data into a strategic asset. ZYNTRA's enterprise
            analytics suite provides executive-level dashboards, granular team
            reports, and predictive insights that connect assessment performance
            to real business outcomes.
          </Typography>
        </Box>
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Paper
            elevation={0}
            className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-lg"
          >
            <FaChartBar className="text-4xl text-[#111A50] mb-4" />
            <Typography variant="h5" className="font-semibold text-gray-900 mb-3">
              Executive Dashboards
            </Typography>
            <Typography className="text-gray-600 leading-relaxed">
              C-suite leaders get real-time visibility into workforce capability
              across every business unit. Track certification rates, skills
              readiness scores, compliance status, and learning ROI from a
              single, interactive dashboard. Drill down from organisational
              summaries to individual performance profiles to understand the
              full picture at every level of your hierarchy.
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-lg"
          >
            <FaChartLine className="text-4xl text-[#111A50] mb-4" />
            <Typography variant="h5" className="font-semibold text-gray-900 mb-3">
              Team Performance Reports
            </Typography>
            <Typography className="text-gray-600 leading-relaxed">
              Managers receive detailed reports on team assessment performance
              with trend analysis, peer comparisons, and improvement
              trajectories. Identify your top performers, rising stars, and team
              members who need additional support. Export data to your BI tools
              or access our API to build custom reporting workflows that align
              with your organisation's performance management cycle.
            </Typography>
          </Paper>
        </Box>
      </Container>

      {/* SECTION 6: HR INTEGRATION */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Box className="text-center mb-12">
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              HR Integration
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Seamless Integration with Your HR Stack
            </Typography>
            <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              ZYNTRA integrates natively with the tools your HR and L&D teams
              already use — eliminating data silos and creating a unified view
              of employee development across your entire technology ecosystem.
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard icon={<FaPlug />} title="HRIS Integration">
              Bi-directional sync with Workday, SAP SuccessFactors, BambooHR,
              and ADP. Employee records, role assignments, and organisational
              changes flow automatically, keeping ZYNTRA in perfect sync with
              your source of truth.
            </FeatureCard>
            <FeatureCard icon={<FaCogs />} title="LMS & LXP Connectivity">
              Connect ZYNTRA assessments to your learning management or
              experience platform. Trigger assessments upon course completion,
              gate content access behind certification requirements, and sync
              results across systems seamlessly.
            </FeatureCard>
            <FeatureCard icon={<FaSyncAlt />} title="API & Webhooks">
              Our enterprise-grade REST API and webhook system enables custom
              integrations with any proprietary system. Build automated
              workflows that connect assessment outcomes to performance reviews,
              compensation planning, and succession management tools.
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
            See how ZYNTRA powers assessment across every context.
          </Typography>
        </Box>
        <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/solutions/schools-universities"
            className="p-6 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition-colors no-underline"
          >
            <FaUniversity className="text-2xl text-[#111A50] mx-auto mb-2" />
            <Typography className="font-semibold text-gray-900">
              Schools & Universities
            </Typography>
            <Typography className="text-sm text-gray-600">
              Academic exam management
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
            <FaTrophy className="text-2xl text-[#111A50] mx-auto mb-2" />
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
            Ready to Elevate Your Workforce?
          </Typography>
          <Typography className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Join 1,200+ enterprises using ZYNTRA to assess, certify, and develop
            their teams. Schedule a personalised demo to see how we can
            transform your corporate training programmes.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
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

export default CorporateTrainingPage;
