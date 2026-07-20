import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import {
  FaCloud,
  FaSyncAlt,
  FaServer,
  FaPlug,
  FaGraduationCap,
  FaSignInAlt,
  FaExchangeAlt,
  FaExpandArrowsAlt,
  FaArrowLeft,
  FaRocket,
  FaEye,
  FaChartBar,
  FaFingerprint,
  FaCheckCircle,
  FaShieldAlt,
  FaLock,
  FaClock,
  FaDatabase,
  FaCodeBranch,
  FaNetworkWired,
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

const CloudIntegration: React.FC = () => {
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
            <FaCloud className="text-3xl text-white" />
          </Box>
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Cloud Integration
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8"
          >
            Enterprise-grade cloud infrastructure that connects ZYNTRA with
            your existing systems. Seamless integrations, scalable
            architecture, and 99.9% uptime guarantee.
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
              Your Exam Platform, Connected to Everything
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                Modern institutions don't operate in isolation — they rely on
                a complex ecosystem of learning management systems, student
                information systems, identity providers, and data analytics
                platforms. ZYNTRA's Cloud Integration layer is designed to fit
                seamlessly into this ecosystem, connecting with your existing
                tools through robust APIs and pre-built connectors.
              </p>
              <p>
                Our cloud-native architecture is built on industry-leading
                infrastructure providers, ensuring maximum reliability,
                security, and performance. Whether you're deploying ZYNTRA
                for a single department or across a multi-campus university
                system, our infrastructure scales elastically to meet demand
                without any manual intervention.
              </p>
              <p>
                From real-time data synchronization and single sign-on to
                comprehensive data migration tools and webhook-based event
                systems, ZYNTRA integrates with your workflow rather than
                replacing it. Our goal is to make ZYNTRA an invisible but
                indispensable part of your technology stack.
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
              <FaShieldAlt /> <span>Infrastructure Highlights</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">99.9% Uptime SLA:</strong>{" "}
                  Guaranteed availability with redundant infrastructure across
                  multiple availability zones and automatic failover.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Global CDN:</strong>{" "}
                  Content delivery network with edge nodes worldwide ensures
                  fast load times regardless of candidate location.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Auto-Scaling:</strong>{" "}
                  Infrastructure automatically scales to handle exam surges —
                  from 10 to 100,000 concurrent sessions.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">SOC 2 Type II:</strong>{" "}
                  All infrastructure is hosted in SOC 2 Type II certified
                  data centers with end-to-end encryption.
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
            Integration Capabilities
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Connect ZYNTRA with your entire technology ecosystem through
            robust integrations and industry-standard protocols.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <FeatureCard icon={<FaSyncAlt />} title="Seamless Data Sync">
              Real-time bidirectional data synchronization keeps student
              records, exam results, and enrollment data consistent across
              all connected systems. Changes propagate within seconds with
              conflict resolution built in.
            </FeatureCard>
            <FeatureCard icon={<FaServer />} title="Multi-Cloud Support">
              Deploy ZYNTRA on AWS, Azure, Google Cloud, or your own
              private cloud. Our containerized architecture runs consistently
              across any cloud provider, giving you full flexibility and
              avoiding vendor lock-in.
            </FeatureCard>
            <FeatureCard icon={<FaPlug />} title="API Integrations">
              A comprehensive RESTful API with full OpenAPI documentation
              enables custom integrations. Webhooks provide real-time event
              notifications, and our GraphQL endpoint supports complex
              data queries for advanced use cases.
            </FeatureCard>
            <FeatureCard icon={<FaGraduationCap />} title="LMS Connectivity">
              Pre-built integrations with Canvas, Blackboard, Moodle, D2L
              Brightspace, and Google Classroom. LTI 1.3 compliance ensures
              seamless gradebook sync, single-click exam launches, and
              automatic roster management.
            </FeatureCard>
          </Box>
        </Container>
      </Box>

      {/* SECTION 3: ADVANCED INTEGRATIONS */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Typography
          variant="h3"
          component="h2"
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
        >
          Enterprise Integration Features
        </Typography>
        <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Advanced integration capabilities designed for enterprise
          deployments and complex institutional requirements.
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <FeatureCard icon={<FaSignInAlt />} title="SSO Support">
            Integrate with your institution's identity provider through
            SAML 2.0, OAuth 2.0, or OpenID Connect. Support for Active
            Directory, Okta, Auth0, Azure AD, and custom LDAP providers
            ensures seamless single sign-on for all users.
          </FeatureCard>
          <FeatureCard icon={<FaExchangeAlt />} title="Data Migration Tools">
            Migrate your existing exam data, question banks, student records,
            and historical results into ZYNTRA with our guided migration
            wizards. Support for CSV, JSON, QTI, and direct database
            migration ensures zero data loss.
          </FeatureCard>
          <FeatureCard icon={<FaExpandArrowsAlt />} title="Scalable Infrastructure">
            Kubernetes-based orchestration automatically scales compute
            resources based on demand. Handle exam day surges with ease —
            our infrastructure has been load-tested to support over 200,000
            concurrent exam sessions.
          </FeatureCard>
          <FeatureCard icon={<FaClock />} title="99.9% Uptime Guarantee">
            Our multi-region, multi-availability-zone architecture with
            automatic failover ensures your exams are always accessible.
            Backed by an enterprise SLA with financial credits for any
            downtime exceeding our guarantee.
          </FeatureCard>
        </Box>
      </Container>

      {/* SECTION 4: ARCHITECTURE */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
          >
            Cloud Architecture
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Built on a modern, resilient cloud architecture designed for
            security, performance, and reliability.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaLock className="text-2xl text-[#111A50]" />,
                title: "End-to-End Encryption",
                desc: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Key management through HSM modules ensures cryptographic keys are never exposed.",
              },
              {
                icon: <FaDatabase className="text-2xl text-[#111A50]" />,
                title: "Distributed Database",
                desc: "Multi-region database replication with automatic failover ensures data durability and availability. RPO of zero and RTO under 30 seconds.",
              },
              {
                icon: <FaCodeBranch className="text-2xl text-[#111A50]" />,
                title: "CI/CD Pipeline",
                desc: "Automated deployment pipeline with blue-green deployments ensures zero-downtime updates. Rollback capabilities provide safety for every release.",
              },
              {
                icon: <FaNetworkWired className="text-2xl text-[#111A50]" />,
                title: "Microservices",
                desc: "Loosely coupled microservices architecture enables independent scaling, fault isolation, and rapid feature development without system-wide risk.",
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

      {/* SECTION 5: SUPPORTED INTEGRATIONS */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Box>
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Ecosystem
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Integrations That Just Work
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                ZYNTRA offers pre-built integrations with the most popular
                platforms in education and enterprise. Our integration team
                continuously adds new connectors and maintains existing ones
                to ensure compatibility with the latest versions.
              </p>
              <p>
                For platforms not on our pre-built list, our comprehensive
                API and webhook system enables custom integrations that can
                be built in hours, not weeks. Our developer documentation
                includes code samples, SDKs for popular languages, and a
                sandbox environment for testing.
              </p>
            </Box>
          </Box>
          <Paper
            elevation={0}
            className="p-6 sm:p-8 rounded-2xl bg-blue-50 border border-blue-100 shadow-xl"
          >
            <Typography
              variant="h5"
              className="font-semibold text-blue-900 mb-4"
            >
              Supported Platforms
            </Typography>
            <Box className="grid grid-cols-2 gap-3">
              {[
                "Canvas LMS",
                "Blackboard",
                "Moodle",
                "Google Classroom",
                "D2L Brightspace",
                "Microsoft Teams",
                "Okta SSO",
                "Azure AD",
                "Auth0",
                "Slack",
                "Zoom",
                "Salesforce",
              ].map((platform) => (
                <Box
                  key={platform}
                  className="flex items-center space-x-2 bg-white rounded-lg p-3 shadow-sm"
                >
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">
                    {platform}
                  </span>
                </Box>
              ))}
            </Box>
          </Paper>
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
            Cloud Integration powers every other ZYNTRA feature with reliable,
            scalable infrastructure.
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
                  Cloud infrastructure enables real-time AI processing for
                  proctoring sessions at massive scale.
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
                  Distributed data processing powers real-time analytics
                  dashboards and complex report generation.
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
                  Secure cloud processing ensures biometric data is handled
                  with the highest levels of encryption and compliance.
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
            Connect Your Entire Ecosystem
          </Typography>
          <Typography className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            ZYNTRA's cloud integration connects seamlessly with your existing
            tools and infrastructure. Enterprise-grade reliability, security,
            and scalability — without the complexity.
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

export default CloudIntegration;
