import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import {
  FaMedal,
  FaCertificate,
  FaCheckCircle,
  FaShareAlt,
  FaBriefcase,
  FaStar,
  FaArrowLeft,
  FaRocket,
  FaUniversity,
  FaPlay,
  FaGem,
  FaShieldAlt,
  FaLinkedin,
  FaGlobe,
  FaChartLine,
  FaLaptopCode,
  FaFlask,
  FaBook,
  FaCode,
  FaLightbulb,
  FaCrown,
  FaAward,
  FaLayerGroup,
  FaUserTie,
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

// Badge Tier Card
const BadgeTierCard: React.FC<{
  icon: React.ReactElement;
  tier: string;
  color: string;
  description: string;
  requirement: string;
}> = ({ icon, tier, color, description, requirement }) => (
  <Box className={`rounded-xl border-2 ${color} p-6 text-center hover:shadow-lg transition-all duration-300`}>
    <Box className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white shadow-md">
      {React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<any, any>, {
            className: "text-3xl",
          })
        : icon}
    </Box>
    <Typography className="font-bold text-gray-900 text-lg mb-2">{tier}</Typography>
    <Typography className="text-gray-600 text-sm mb-3">{description}</Typography>
    <Typography className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1 inline-block">
      {requirement}
    </Typography>
  </Box>
);

const EarnBadgesPage: React.FC = () => {
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
            <FaMedal className="text-yellow-300" />
            <span className="text-sm text-blue-200 font-medium">Achievements & Recognition</span>
          </Box>
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Earn Badges & Certifications
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8"
          >
            Showcase your expertise with verified digital badges. Build a
            professional portfolio of achievements, share them with employers,
            and let your skills speak for themselves.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/guest-quiz"
              className="px-8 py-3 bg-white text-[#111A50] rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all no-underline"
            >
              Start Earning Badges
            </Link>
            <Link
              to="/solutions/guest-quizzes"
              className="px-8 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-all no-underline"
            >
              Browse Free Quizzes
            </Link>
          </Box>
        </Container>
      </Box>

      {/* BADGE STATS BANNER */}
      <Box className="bg-[#0D1440]">
        <Container maxWidth="lg">
          <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
            <Box className="text-center p-4">
              <Typography className="text-3xl sm:text-4xl font-bold text-white mb-2">150+</Typography>
              <Typography className="text-white/70 text-sm sm:text-base">Badges Available</Typography>
            </Box>
            <Box className="text-center p-4">
              <Typography className="text-3xl sm:text-4xl font-bold text-white mb-2">500K+</Typography>
              <Typography className="text-white/70 text-sm sm:text-base">Badges Earned</Typography>
            </Box>
            <Box className="text-center p-4">
              <Typography className="text-3xl sm:text-4xl font-bold text-white mb-2">25+</Typography>
              <Typography className="text-white/70 text-sm sm:text-base">Skill Categories</Typography>
            </Box>
            <Box className="text-center p-4">
              <Typography className="text-3xl sm:text-4xl font-bold text-white mb-2">4</Typography>
              <Typography className="text-white/70 text-sm sm:text-base">Achievement Tiers</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* SECTION 1: DIGITAL BADGES & CERTIFICATIONS */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Box>
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Digital Badges
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Verified Digital Badges & Certifications
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                ZYNTRA digital badges are more than just icons — they're
                cryptographically verified credentials that prove your competency
                in specific skill areas. Each badge is backed by assessment data,
                making it a trustworthy representation of your knowledge that
                employers, educators, and peers can verify instantly.
              </p>
              <p>
                Our badges follow the Open Badges 3.0 standard, ensuring maximum
                portability and interoperability. Add them to your LinkedIn
                profile, embed them in your resume, or display them on your
                personal website. Each badge links back to a verification page
                showing exactly what skills were assessed and what criteria were
                met.
              </p>
              <p>
                From foundational knowledge badges to expert-level certifications,
                our tiered system recognises learners at every stage of their
                journey. As you progress, your badge collection tells a
                compelling story of growth and dedication.
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
              <FaShieldAlt /> <span>Badge Verification</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Cryptographic Verification:</strong>{" "}
                  Every badge includes a unique verification hash. Anyone can
                  verify its authenticity through our public verification portal.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaGlobe className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Open Badges Standard:</strong>{" "}
                  Built on Open Badges 3.0 for maximum portability across
                  platforms, wallets, and credential management systems.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaChartLine className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Evidence-Based:</strong>{" "}
                  Each badge links to the specific assessments and criteria
                  that were met, providing transparent proof of competency.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCertificate className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Expiry & Renewal:</strong>{" "}
                  Time-sensitive badges include expiry dates with automated
                  renewal reminders, ensuring your credentials stay current.
                </span>
              </li>
            </ul>
          </Paper>
        </Box>
      </Container>

      {/* SECTION 2: ACHIEVEMENT TIERS */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Box className="text-center mb-12">
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Achievement Milestones
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Four Tiers of Achievement
            </Typography>
            <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Progress through our tiered achievement system as you demonstrate
              deeper expertise. Each tier represents a higher level of mastery
              and unlocks exclusive recognition and opportunities.
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <BadgeTierCard
              icon={<FaStar className="text-green-500" />}
              tier="Explorer"
              color="border-green-300 bg-green-50"
              description="Begin your learning journey with foundational knowledge badges."
              requirement="Complete 5+ quizzes with 60%+ score"
            />
            <BadgeTierCard
              icon={<FaAward className="text-blue-500" />}
              tier="Achiever"
              color="border-blue-300 bg-blue-50"
              description="Demonstrate solid competency across multiple skill domains."
              requirement="Complete 15+ quizzes with 75%+ score"
            />
            <BadgeTierCard
              icon={<FaGem className="text-purple-500" />}
              tier="Expert"
              color="border-purple-300 bg-purple-50"
              description="Prove advanced expertise with consistently high performance."
              requirement="Complete 30+ quizzes with 85%+ score"
            />
            <BadgeTierCard
              icon={<FaCrown className="text-yellow-500" />}
              tier="Master"
              color="border-yellow-300 bg-yellow-50"
              description="Reach the pinnacle of achievement with elite-level mastery."
              requirement="Complete 50+ quizzes with 90%+ score"
            />
          </Box>
        </Container>
      </Box>

      {/* SECTION 3: PORTFOLIO BUILDING */}
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
              <FaLayerGroup /> <span>Portfolio Features</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaGlobe className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Public Profile:</strong>{" "}
                  Create a shareable public profile page showcasing all your
                  earned badges, certifications, and assessment history with
                  a unique URL.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaChartLine className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Skills Radar:</strong>{" "}
                  A visual radar chart displays your competency across different
                  domains, giving visitors an instant overview of your skill
                  profile.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCertificate className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Downloadable Certificates:</strong>{" "}
                  Generate professional PDF certificates for each badge with
                  custom layouts, suitable for printing or attaching to
                  applications.
                </span>
              </li>
            </ul>
          </Paper>
          <Box className="order-1 md:order-2">
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Portfolio Building
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Build Your Professional Skills Portfolio
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                Your ZYNTRA badge portfolio is more than a collection of
                achievements — it's a dynamic, living resume of your verified
                skills. As you earn badges across different categories, your
                portfolio paints a comprehensive picture of your capabilities
                that goes far beyond what a traditional CV can convey.
              </p>
              <p>
                Organise your badges by category, date, or tier. Highlight your
                most impressive achievements. Add personal notes about what
                each badge means to you and how you applied the knowledge in
                real-world contexts. Your portfolio becomes a powerful tool for
                career advancement and professional networking.
              </p>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* SECTION 4: SOCIAL SHARING & EMPLOYER RECOGNITION */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Box className="text-center mb-12">
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Sharing & Recognition
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Share Your Achievements, Get Recognised
            </Typography>
            <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Your badges deserve to be seen. ZYNTRA makes it effortless to
              share your achievements across social platforms and professional
              networks, putting your verified skills in front of the people
              who matter.
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard icon={<FaLinkedin />} title="LinkedIn Integration">
              Add ZYNTRA badges directly to your LinkedIn profile with a single
              click. Your connections and recruiters see your verified
              credentials alongside your work experience, making your profile
              stand out in a competitive job market.
            </FeatureCard>
            <FeatureCard icon={<FaShareAlt />} title="Social Sharing">
              Share beautiful badge cards on Twitter, Facebook, Instagram, and
              more. Custom-designed social graphics are generated automatically,
              optimised for each platform's requirements, making your
              achievements look professional everywhere they appear.
            </FeatureCard>
            <FeatureCard icon={<FaUserTie />} title="Employer Recognition">
              ZYNTRA badges are increasingly recognised by employers worldwide.
              Our employer network programme connects badge earners with
              companies that value verified skills, opening doors to new
              career opportunities and professional growth.
            </FeatureCard>
          </Box>
        </Container>
      </Box>

      {/* SECTION 5: BADGE CATEGORIES */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="text-center mb-12">
          <Typography
            component="h2"
            className="text-sm font-semibold text-[#111A50] uppercase mb-2"
          >
            Badge Categories
          </Typography>
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
          >
            Badges Across Every Domain
          </Typography>
          <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            From programming to project management, our badge categories span
            the full spectrum of professional and academic skills. Find badges
            that align with your career goals and start building your
            credentials today.
          </Typography>
        </Box>
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Box className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <FaLaptopCode className="text-3xl text-[#111A50] mb-3" />
            <Typography className="font-semibold text-gray-900 mb-2">Technology & Programming</Typography>
            <Typography className="text-gray-600 text-sm mb-3">
              Python, JavaScript, cloud computing, cybersecurity, data
              structures, DevOps, and more. Prove your technical chops with
              badges that developers and engineers respect.
            </Typography>
            <Typography className="text-[#111A50] text-sm font-medium">45+ badges available</Typography>
          </Box>
          <Box className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <FaFlask className="text-3xl text-[#111A50] mb-3" />
            <Typography className="font-semibold text-gray-900 mb-2">Science & Research</Typography>
            <Typography className="text-gray-600 text-sm mb-3">
              Biology, chemistry, physics, environmental science, and research
              methodology. Academic badges that complement your degree and
              demonstrate interdisciplinary breadth.
            </Typography>
            <Typography className="text-[#111A50] text-sm font-medium">30+ badges available</Typography>
          </Box>
          <Box className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <FaBriefcase className="text-3xl text-[#111A50] mb-3" />
            <Typography className="font-semibold text-gray-900 mb-2">Business & Management</Typography>
            <Typography className="text-gray-600 text-sm mb-3">
              Marketing, finance, leadership, strategy, operations, and
              entrepreneurship. Business badges that validate your commercial
              acumen and management skills.
            </Typography>
            <Typography className="text-[#111A50] text-sm font-medium">35+ badges available</Typography>
          </Box>
          <Box className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <FaBook className="text-3xl text-[#111A50] mb-3" />
            <Typography className="font-semibold text-gray-900 mb-2">Humanities & Languages</Typography>
            <Typography className="text-gray-600 text-sm mb-3">
              History, philosophy, creative writing, foreign languages, and
              cultural studies. Broaden your intellectual profile with badges
              that showcase analytical and communication skills.
            </Typography>
            <Typography className="text-[#111A50] text-sm font-medium">20+ badges available</Typography>
          </Box>
          <Box className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <FaCode className="text-3xl text-[#111A50] mb-3" />
            <Typography className="font-semibold text-gray-900 mb-2">Data & Analytics</Typography>
            <Typography className="text-gray-600 text-sm mb-3">
              SQL, machine learning, statistical analysis, data visualisation,
              and business intelligence. Data badges for the data-driven
              professional building an analytics career.
            </Typography>
            <Typography className="text-[#111A50] text-sm font-medium">25+ badges available</Typography>
          </Box>
          <Box className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <FaLightbulb className="text-3xl text-[#111A50] mb-3" />
            <Typography className="font-semibold text-gray-900 mb-2">Professional Skills</Typography>
            <Typography className="text-gray-600 text-sm mb-3">
              Communication, critical thinking, problem solving, teamwork,
              and project management. Soft-skill badges that round out your
              professional credentials.
            </Typography>
            <Typography className="text-[#111A50] text-sm font-medium">20+ badges available</Typography>
          </Box>
        </Box>
      </Container>

      {/* CROSS-LINKS */}
      <Box className="bg-gray-50 py-12">
        <Container maxWidth="lg">
          <Box className="text-center mb-8">
            <Typography
              variant="h4"
              component="h2"
              className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
            >
              Explore More Solutions
            </Typography>
            <Typography className="text-gray-600">
              Discover the full ZYNTRA ecosystem.
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/solutions/schools-universities"
              className="p-6 bg-white rounded-xl text-center hover:shadow-lg transition-all no-underline border border-gray-200"
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
              to="/solutions/corporate-training"
              className="p-6 bg-white rounded-xl text-center hover:shadow-lg transition-all no-underline border border-gray-200"
            >
              <FaBriefcase className="text-2xl text-[#111A50] mx-auto mb-2" />
              <Typography className="font-semibold text-gray-900">
                Corporate Training
              </Typography>
              <Typography className="text-sm text-gray-600">
                Enterprise assessments & certifications
              </Typography>
            </Link>
            <Link
              to="/solutions/guest-quizzes"
              className="p-6 bg-white rounded-xl text-center hover:shadow-lg transition-all no-underline border border-gray-200"
            >
              <FaPlay className="text-2xl text-[#111A50] mx-auto mb-2" />
              <Typography className="font-semibold text-gray-900">
                Guest Quizzes
              </Typography>
              <Typography className="text-sm text-gray-600">
                Free practice tests for everyone
              </Typography>
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
            Ready to Start Earning Badges?
          </Typography>
          <Typography className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Take a free quiz, demonstrate your knowledge, and earn your first
            digital badge today. Your skills portfolio starts here — build it
            one badge at a time.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/guest-quiz"
              className="flex items-center space-x-2 px-8 py-3 bg-white text-[#111A50] rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all no-underline"
            >
              <FaRocket />
              <span>Start Earning Now</span>
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

export default EarnBadgesPage;
