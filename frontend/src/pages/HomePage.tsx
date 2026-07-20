import React, { useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";

// --- Standard Component Imports ---
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import HeroSection from "../components/home/HeroSection";
import FeaturesPreview from "../components/home/FeaturesPreview";
import GuestRegistrationModal from "../components/modals/GuestRegistrationModal";
import LoadingSpinner from "../components/common/LoadingSpinner";

// --- Lazy-Loaded Component Imports ---
type GuestQuizProps = {
  onQuizClick: (category: string, score: number) => void;
};

const GuestQuizSection = lazy(() =>
  import("../components/GuestQuizSection") as Promise<{
    default: React.ComponentType<GuestQuizProps>;
  }>
);
const CertificationCoursesSection = lazy(() => import("../components/home/CertificationCoursesSection"));
const Chatbot = lazy(() => import("../components/chatbot/Chatbot"));

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizDetails, setQuizDetails] = useState({ score: "0%", category: "" });

  // This handler is passed down to the quiz cards
  const handleQuizComplete = (category: string, score: number) => {
    setQuizDetails({
      score: `${score}%`,
      category: category,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white">
      {/* 1. Navigation */}
      <Navbar />

      <main>
        {/* 2. Hero Section (Loads instantly) */}
        <HeroSection />

        {/* 3. Lazy-Loaded Guest Quiz Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <GuestQuizSection
            onQuizClick={(category, score) =>
              handleQuizComplete(category, score)
            }
          />
        </Suspense>

        {/* --- NEW: Certification Courses Section --- */}
        <Suspense fallback={<LoadingSpinner />}>
          <CertificationCoursesSection />
        </Suspense>

        {/* 4. Features Preview (Loads instantly) */}
        <FeaturesPreview />

        {/* CTA Section */}
        <section className="bg-[#111A50] py-16 sm:py-24 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Ready to Transform Your Assessment Process?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of institutions and educators using Zyntra to deliver secure, intelligent, and scalable exams today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-white text-[#111A50] font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-colors duration-200">
                Get Started for Free
              </Link>
              <Link to="/contact" className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-[#111A50] transition-colors duration-200">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <Footer />

      {/* 6. Lazy-Loaded Chatbot (loads in the background) */}
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>

      {/* 7. Registration Modal (Always available, shown with state) */}
      <GuestRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        score={quizDetails.score}
        category={quizDetails.category}
      />
    </div>
  );
};

export default HomePage;