import React, { useState, Suspense, lazy } from "react";

// --- Standard Component Imports ---
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import HeroSection from "../components/home/HeroSection";
import FeaturesPreview from "../components/home/FeaturesPreview";
import GuestRegistrationModal from "../components/modals/GuestRegistrationModal";
import LoadingSpinner from "../components/common/LoadingSpinner"; // A simple fallback

// --- Lazy-Loaded Component Imports ---
type GuestQuizProps = {
  onQuizClick: (category: string, score: number) => void;
};

const GuestQuizSection = lazy(() =>
  import("../components/GuestQuizSection") as Promise<{
    default: React.ComponentType<GuestQuizProps>;
  }>
);
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

        {/* 4. Features Preview (Loads instantly) */}
        <FeaturesPreview />
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