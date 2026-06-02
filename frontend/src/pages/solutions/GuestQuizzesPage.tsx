import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import {
  FaPlay,
  FaListAlt,
  FaBolt,
  FaUserSecret,
  FaTrophy,
  FaCheckCircle,
  FaShareAlt,
  FaArrowLeft,
  FaRocket,
  FaUniversity,
  FaBriefcase,
  FaCertificate,
  FaChartLine,
  FaGlobe,
  FaMobileAlt,
  FaStar,
  FaBook,
  FaCode,
  FaFlask,
  FaCalculator,
  FaLaptopCode,
  FaUsers,
  FaClock,
  FaLightbulb,
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

// Category Card
const CategoryCard: React.FC<{
  icon: React.ReactElement;
  title: string;
  quizCount: string;
}> = ({ icon, title, quizCount }) => (
  <Box className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300 text-center">
    <Box className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
      {React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<any, any>, {
            className: "text-blue-600 text-xl",
          })
        : icon}
    </Box>
    <Typography className="font-semibold text-gray-900 mb-1">{title}</Typography>
    <Typography className="text-sm text-gray-500">{quizCount}</Typography>
  </Box>
);

const GuestQuizzesPage: React.FC = () => {
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
            <FaPlay className="text-blue-300" />
            <span className="text-sm text-blue-200 font-medium">Free for Everyone</span>
          </Box>
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Guest Quizzes
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8"
          >
            Test your knowledge instantly — no account required. Choose from
            hundreds of free quizzes across dozens of categories, get instant
            feedback, and compete on global leaderboards.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/guest-quiz"
              className="px-8 py-3 bg-white text-[#111A50] rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all no-underline"
            >
              Start a Free Quiz Now
            </Link>
            <Link
              to="/solutions/earn-badges"
              className="px-8 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-all no-underline"
            >
              Earn Badges
            </Link>
          </Box>
        </Container>
      </Box>

      {/* HOW IT WORKS */}
      <Box className="bg-[#0D1440] py-12">
        <Container maxWidth="lg">
          <Box className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Box className="text-center">
              <Box className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">1</span>
              </Box>
              <Typography className="text-white font-semibold mb-1">Choose a Topic</Typography>
              <Typography className="text-white/60 text-sm">Browse categories and pick a quiz</Typography>
            </Box>
            <Box className="text-center">
              <Box className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">2</span>
              </Box>
              <Typography className="text-white font-semibold mb-1">Take the Quiz</Typography>
              <Typography className="text-white/60 text-sm">Answer questions at your own pace</Typography>
            </Box>
            <Box className="text-center">
              <Box className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">3</span>
              </Box>
              <Typography className="text-white font-semibold mb-1">Get Results</Typography>
              <Typography className="text-white/60 text-sm">Instant scoring with detailed feedback</Typography>
            </Box>
            <Box className="text-center">
              <Box className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">4</span>
              </Box>
              <Typography className="text-white font-semibold mb-1">Share & Compete</Typography>
              <Typography className="text-white/60 text-sm">Share results and climb leaderboards</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* SECTION 1: FREE PRACTICE TESTS */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Box>
            <Typography
              component="h2"
              className="text-sm font-semibold text-blue-600 uppercase mb-2"
            >
              Practice Tests
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Hundreds of Free Practice Tests
            </Typography>
            <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                ZYNTRA's guest quiz library is one of the most comprehensive
                free assessment resources available online. Whether you're
                preparing for a professional certification, studying for an
                academic exam, or simply curious about a new topic, our quizzes
                provide a high-quality testing experience without any cost or
                commitment.
              </p>
              <p>
                Every quiz is crafted by subject-matter experts and reviewed for
                accuracy, relevance, and educational value. Questions range from
                beginner to advanced difficulty, allowing learners at every level
                to find challenging content that pushes their understanding forward.
              </p>
              <p>
                New quizzes are added weekly across trending topics, emerging
                technologies, and popular certification paths — ensuring the
                library stays fresh, current, and relevant to today's learners.
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
              <FaStar /> <span>Quiz Highlights</span>
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaGlobe className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">500+ Quizzes:</strong>{" "}
                  A vast and growing library covering technology, science,
                  business, humanities, and more — all completely free.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaLightbulb className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Expert-Crafted:</strong>{" "}
                  Every question is written and reviewed by industry professionals
                  and academic experts for accuracy and educational value.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaClock className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Flexible Timing:</strong>{" "}
                  Take quizzes at your own pace with optional timers, or challenge
                  yourself with timed mode to simulate real exam conditions.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FaMobileAlt className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Mobile-Friendly:</strong>{" "}
                  Take quizzes on any device — desktop, tablet, or phone. Our
                  responsive design ensures a perfect experience everywhere.
                </span>
              </li>
            </ul>
          </Paper>
        </Box>
      </Container>

      {/* SECTION 2: TOPIC CATEGORIES */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Box className="text-center mb-12">
            <Typography
              component="h2"
              className="text-sm font-semibold text-blue-600 uppercase mb-2"
            >
              Categories
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              Quizzes Across Every Topic
            </Typography>
            <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Browse our extensive category library and find quizzes that match
              your interests, career goals, or study needs. From computer science
              to creative writing, there's something for everyone.
            </Typography>
          </Box>
          <Box className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <CategoryCard icon={<FaLaptopCode />} title="Programming" quizCount="85+ Quizzes" />
            <CategoryCard icon={<FaFlask />} title="Science" quizCount="60+ Quizzes" />
            <CategoryCard icon={<FaCalculator />} title="Mathematics" quizCount="45+ Quizzes" />
            <CategoryCard icon={<FaBook />} title="Literature" quizCount="35+ Quizzes" />
            <CategoryCard icon={<FaBriefcase />} title="Business" quizCount="50+ Quizzes" />
            <CategoryCard icon={<FaGlobe />} title="General Knowledge" quizCount="70+ Quizzes" />
            <CategoryCard icon={<FaCode />} title="Web Dev" quizCount="55+ Quizzes" />
            <CategoryCard icon={<FaChartLine />} title="Data Science" quizCount="40+ Quizzes" />
            <CategoryCard icon={<FaUsers />} title="Psychology" quizCount="30+ Quizzes" />
            <CategoryCard icon={<FaCertificate />} title="Certifications" quizCount="65+ Quizzes" />
            <CategoryCard icon={<FaStar />} title="Aptitude" quizCount="40+ Quizzes" />
            <CategoryCard icon={<FaLightbulb />} title="Logic & Reasoning" quizCount="35+ Quizzes" />
          </Box>
        </Container>
      </Box>

      {/* SECTION 3: INSTANT SCORING & FEEDBACK */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="text-center mb-12">
          <Typography
            component="h2"
            className="text-sm font-semibold text-blue-600 uppercase mb-2"
          >
            Instant Feedback
          </Typography>
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
          >
            Learn as You Go with Instant Scoring
          </Typography>
          <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Don't just test — learn. Every quiz provides immediate, detailed
            feedback so you understand not just what the right answer is, but
            why it's right. Turn every mistake into a learning opportunity.
          </Typography>
        </Box>
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard icon={<FaBolt />} title="Real-Time Results">
            See your score the moment you submit. No waiting, no delays — your
            results are calculated and displayed instantly with a comprehensive
            breakdown of your performance by topic, difficulty, and question type.
          </FeatureCard>
          <FeatureCard icon={<FaCheckCircle />} title="Detailed Explanations">
            Every question comes with a thorough explanation of the correct
            answer, including references and additional context. Understand the
            reasoning behind each answer to deepen your knowledge and avoid
            repeating mistakes.
          </FeatureCard>
          <FeatureCard icon={<FaChartLine />} title="Performance Insights">
            Visual charts show your strengths and weaknesses across different
            topics and difficulty levels. Track your improvement over time by
            retaking quizzes and comparing your progress against your previous
            attempts.
          </FeatureCard>
        </Box>
      </Container>

      {/* SECTION 4: NO REGISTRATION & LEADERBOARDS */}
      <Box className="bg-gray-50 py-16 md:py-24">
        <Container maxWidth="lg">
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <Box>
              <Typography
                component="h2"
                className="text-sm font-semibold text-blue-600 uppercase mb-2"
              >
                Zero Friction
              </Typography>
              <Typography
                variant="h3"
                component="h2"
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
              >
                No Registration Required
              </Typography>
              <Box className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
                <p>
                  We believe learning should be frictionless. That's why ZYNTRA
                  guest quizzes require absolutely no sign-up, no email, and no
                  personal information. Just pick a quiz and start answering —
                  it's that simple.
                </p>
                <p>
                  Of course, creating a free account unlocks additional features
                  like progress tracking, leaderboard participation, badge
                  earning, and personalised quiz recommendations. But the choice
                  is always yours — our core quiz experience is completely free
                  and open to everyone.
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
                <FaTrophy /> <span>Leaderboards & Competition</span>
              </Typography>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <FaTrophy className="text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong className="text-gray-900">Global Rankings:</strong>{" "}
                    Compete against quiz-takers worldwide. See where you stand
                    on daily, weekly, and all-time leaderboards for every category.
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaUsers className="text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong className="text-gray-900">Friends & Groups:</strong>{" "}
                    Create private leaderboards to compete with friends,
                    classmates, or colleagues in a friendly competition.
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaStar className="text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong className="text-gray-900">Streak Rewards:</strong>{" "}
                    Build quiz-taking streaks and earn bonus points. Daily
                    challenges keep you motivated and coming back for more.
                  </span>
                </li>
              </ul>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* SECTION 5: SKILL VALIDATION & SHARING */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="text-center mb-12">
          <Typography
            component="h2"
            className="text-sm font-semibold text-blue-600 uppercase mb-2"
          >
            Validation & Sharing
          </Typography>
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900"
          >
            Validate Your Skills & Share Your Results
          </Typography>
          <Typography className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Your quiz results are more than just a score — they're a statement
            about your knowledge and dedication. Share your achievements,
            validate your expertise, and build your professional profile.
          </Typography>
        </Box>
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard icon={<FaShareAlt />} title="Shareable Results">
            Generate beautiful result cards optimised for social media. Share
            your scores on LinkedIn, Twitter, Facebook, or via direct link.
            Challenge your network to beat your score and spark healthy
            competition among peers.
          </FeatureCard>
          <FeatureCard icon={<FaCheckCircle />} title="Skill Validation">
            High quiz scores contribute to your ZYNTRA skill profile. Employers
            and peers can see your verified quiz performance across different
            domains, providing an informal but meaningful validation of your
            expertise.
          </FeatureCard>
          <FeatureCard icon={<FaCertificate />} title="Path to Badges">
            Outstanding quiz performance unlocks{" "}
            <Link to="/solutions/earn-badges" className="text-blue-600 hover:underline">
              digital badges
            </Link>{" "}
            that you can add to your professional portfolio. Complete themed quiz
            series to earn category-specific badges that showcase your depth
            of knowledge.
          </FeatureCard>
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
              Discover everything ZYNTRA has to offer.
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/solutions/schools-universities"
              className="p-6 bg-white rounded-xl text-center hover:shadow-lg transition-all no-underline border border-gray-200"
            >
              <FaUniversity className="text-2xl text-blue-600 mx-auto mb-2" />
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
              <FaBriefcase className="text-2xl text-blue-600 mx-auto mb-2" />
              <Typography className="font-semibold text-gray-900">
                Corporate Training
              </Typography>
              <Typography className="text-sm text-gray-600">
                Enterprise assessments & certifications
              </Typography>
            </Link>
            <Link
              to="/solutions/earn-badges"
              className="p-6 bg-white rounded-xl text-center hover:shadow-lg transition-all no-underline border border-gray-200"
            >
              <FaTrophy className="text-2xl text-blue-600 mx-auto mb-2" />
              <Typography className="font-semibold text-gray-900">
                Earn Badges
              </Typography>
              <Typography className="text-sm text-gray-600">
                Digital credentials & achievements
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
            Ready to Test Your Knowledge?
          </Typography>
          <Typography className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Jump into a free quiz right now — no sign-up needed. Challenge
            yourself, learn something new, and see how you stack up against
            learners around the world.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/guest-quiz"
              className="flex items-center space-x-2 px-8 py-3 bg-white text-[#111A50] rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all no-underline"
            >
              <FaRocket />
              <span>Start a Free Quiz</span>
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

export default GuestQuizzesPage;
