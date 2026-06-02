import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import {
  FaRobot,
  FaClipboardCheck,
  FaListOl,
  FaRulerCombined,
  FaBolt,
  FaAdjust,
  FaPenFancy,
  FaCopy,
  FaChartPie,
  FaArrowLeft,
  FaRocket,
  FaEye,
  FaChartBar,
  FaCloud,
  FaCheckCircle,
  FaShieldAlt,
  FaCogs,
  FaClock,
  FaPercentage,
  FaFileAlt,
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

const AutoGrading: React.FC = () => {
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
            <FaRobot className="text-3xl text-white" />
          </Box>
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Auto-Grading
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8"
          >
            Eliminate grading bottlenecks with AI-powered scoring that handles
            everything from multiple-choice to essays. Instant, accurate, and
            consistent results — every time.
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
              Grading at the Speed of AI
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                Manual grading is one of the biggest bottlenecks in education.
                For a single exam with 500 students and 50 questions, an
                instructor can spend over 40 hours grading — time that could
                be spent on teaching, mentoring, and curriculum development.
                ZYNTRA's Auto-Grading engine eliminates this burden entirely.
              </p>
              <p>
                Our AI-powered grading system handles every question type —
                from simple multiple-choice and true/false to complex essays,
                coding problems, and mathematical proofs. The system delivers
                results within seconds of exam submission, providing students
                with immediate feedback and educators with instant access to
                performance data.
              </p>
              <p>
                But speed doesn't come at the cost of accuracy. Our grading
                engine uses sophisticated natural language processing,
                rubric-based evaluation, and pattern matching to achieve
                scoring accuracy that consistently matches or exceeds human
                graders — with none of the inconsistency, fatigue, or bias
                that affects manual grading.
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
              <FaShieldAlt /> <span>Grading by the Numbers</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">&lt; 5 Seconds:</strong>{" "}
                  Average time to grade a complete exam with up to 100
                  questions, including essay-type responses.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">98.5% Accuracy:</strong>{" "}
                  Our AI grading engine matches human grader agreement rates
                  for essay evaluation and subjective responses.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">15+ Question Types:</strong>{" "}
                  Support for MCQ, true/false, fill-in-the-blank, matching,
                  ordering, essay, coding, math, and more.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">40+ Hours Saved:</strong>{" "}
                  Average time saved per instructor per exam cycle, freeing
                  time for high-impact teaching activities.
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
            Grading Capabilities
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            From objective questions to subjective essays, our grading engine
            handles every assessment type with precision.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <FeatureCard icon={<FaClipboardCheck />} title="AI-Powered Scoring">
              Advanced machine learning models evaluate responses against
              answer keys, rubrics, and trained patterns. The AI continuously
              improves its accuracy through feedback loops and calibration
              with expert-graded samples.
            </FeatureCard>
            <FeatureCard icon={<FaListOl />} title="Multiple Question Types">
              Native support for over 15 question types including
              multiple-choice, multiple-select, true/false, fill-in-the-blank,
              matching, ordering, hotspot, drag-and-drop, coding challenges,
              mathematical expressions, and long-form essays.
            </FeatureCard>
            <FeatureCard icon={<FaRulerCombined />} title="Rubric-Based Grading">
              Define detailed rubrics with weighted criteria, point scales,
              and exemplar responses. The AI maps student responses against
              each rubric dimension, providing transparent scoring that
              educators can verify and adjust.
            </FeatureCard>
            <FeatureCard icon={<FaBolt />} title="Instant Results">
              Students receive their scores, feedback, and detailed
              breakdowns within seconds of submitting their exam. No more
              waiting days or weeks for grades — instant gratification
              drives engagement and learning.
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
          Advanced Grading Features
        </Typography>
        <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Beyond basic scoring — intelligent features that handle the
          nuances of real-world assessment.
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <FeatureCard icon={<FaAdjust />} title="Partial Credit Support">
            Award partial credit for partially correct answers based on
            configurable rules. The system recognizes correct steps in
            multi-step problems, awards proportional credit for partially
            correct multi-select answers, and supports custom scoring logic.
          </FeatureCard>
          <FeatureCard icon={<FaPenFancy />} title="Essay Evaluation">
            Our NLP engine evaluates essay responses across multiple
            dimensions — content accuracy, argument structure, grammar
            and mechanics, citation quality, and critical thinking. Each
            dimension maps to rubric criteria for transparent scoring.
          </FeatureCard>
          <FeatureCard icon={<FaCopy />} title="Plagiarism Detection">
            Built-in plagiarism detection compares student responses against
            a vast database of academic content, submitted responses within
            the same exam, and internet sources. Similarity scores and
            highlighted matches are provided for review.
          </FeatureCard>
          <FeatureCard icon={<FaChartPie />} title="Grade Analytics">
            Comprehensive grade analytics provide insights into score
            distributions, question-level performance, grading consistency,
            and statistical reliability metrics. Identify questions that
            need revision and track grading patterns over time.
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
            How Auto-Grading Works
          </Typography>
          <Typography className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            A sophisticated pipeline that processes, evaluates, and delivers
            results with speed and accuracy.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Exam Submission",
                desc: "When a student submits their exam, all responses are encrypted and queued for processing. The grading pipeline begins within milliseconds of submission.",
              },
              {
                step: "02",
                title: "Response Analysis",
                desc: "Each response is routed to the appropriate grading module based on question type. Objective questions are scored against answer keys; subjective responses are analyzed by NLP models.",
              },
              {
                step: "03",
                title: "Rubric Application",
                desc: "For subjective questions, the AI applies configured rubric criteria, weighing each dimension according to the instructor's specifications. Partial credit rules are applied automatically.",
              },
              {
                step: "04",
                title: "Results & Feedback",
                desc: "Scored results with detailed feedback, correct answers, and explanations are delivered to the student. Aggregate data flows to the analytics dashboard for educator review.",
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

      {/* SECTION 5: GRADING CONFIGURATION */}
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
              <FaCogs /> <span>Flexible Configuration</span>
            </Typography>
            <Box className="text-gray-700 space-y-3 text-sm sm:text-base">
              <p>
                Every institution has unique grading requirements. ZYNTRA's
                auto-grading engine is fully configurable to match your
                specific needs — from simple pass/fail thresholds to complex
                weighted rubrics with multiple evaluation dimensions.
              </p>
              <p>
                Instructors can set up grading rules through an intuitive
                visual interface — no coding required. Define point values,
                partial credit rules, penalty schemes for incorrect answers,
                time-based bonuses, and custom scoring formulas.
              </p>
              <p>
                For essay and subjective questions, instructors can provide
                exemplar responses at different quality levels to train the
                AI. The system calibrates its scoring against these examples,
                ensuring alignment with instructor expectations.
              </p>
            </Box>
          </Paper>
          <Box>
            <Typography
              component="h2"
              className="text-sm font-semibold text-[#111A50] uppercase mb-2"
            >
              Configuration Options
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Grade Your Way
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaPercentage className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Custom point values and weighting per question and section
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaClock className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Time-based bonuses and late submission penalties
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaAdjust className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Configurable partial credit rules and negative marking
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaFileAlt className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Multi-dimensional rubrics with weighted criteria
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaRobot className="text-[#111A50] mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  AI calibration with instructor-provided exemplar responses
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
            Auto-Grading integrates with ZYNTRA's analytics, proctoring, and
            cloud features for a complete assessment solution.
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  Feed grading results directly into analytics for instant
                  performance dashboards and scoring trend analysis.
                </Typography>
              </Paper>
            </Link>
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
                  Cross-reference grading results with proctoring data to
                  identify potential integrity issues automatically.
                </Typography>
              </Paper>
            </Link>
            <Link to="/features/cloud-integration" className="block group">
              <Paper
                elevation={0}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full"
              >
                <FaCloud className="text-3xl text-[#111A50] mb-4" />
                <Typography variant="h6" className="font-semibold text-gray-900 mb-2 group-hover:text-[#111A50] transition-colors">
                  Cloud Integration
                </Typography>
                <Typography className="text-gray-600 text-sm">
                  Sync grades automatically to your LMS gradebook through
                  cloud integrations with Canvas, Blackboard, and more.
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
            Grade Smarter, Not Harder
          </Typography>
          <Typography className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Reclaim hundreds of hours per semester with ZYNTRA's Auto-Grading.
            Instant results, consistent scoring, and detailed analytics — let
            AI handle the grading while you focus on teaching.
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

export default AutoGrading;
