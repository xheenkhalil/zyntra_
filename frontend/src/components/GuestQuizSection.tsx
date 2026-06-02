import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Import react-icons, which are used in your HTML/Tailwind code
import { FaStar, FaUsers } from "react-icons/fa";
import { getPublicQuizzes } from "../services/guestService"; // Your service remains the same

// Your interface remains the same
interface Quiz {
  id: string;
  title: string;
  category: string;
  participant_count: string;
  average_rating: string | null;
}

const GuestQuizSection: React.FC = () => {
  const navigate = useNavigate();
  // All your state and data-fetching logic is preserved
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicQuizzes();
      setQuizzes(data || []);
    } catch {
      setError("Could not load public quizzes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      const ratingSubmitted = localStorage.getItem("guestQuizRatingSubmitted");
      if (ratingSubmitted === "true") {
        console.log("Rating submitted, re-fetching quizzes...");
        fetchQuizzes();
        localStorage.removeItem("guestQuizRatingSubmitted");
      }
    };

    fetchQuizzes();
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchQuizzes]);

  // --- Converted Loading Spinner ---
  if (loading) {
    return (
      <div className="flex justify-center mt-4">
        {/* Tailwind CSS spinner */}
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Converted Error Alert ---
  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        role="alert"
      >
        {error}
      </div>
    );
  }

  // --- Converted Tailwind JSX ---
  return (
    <div className="w-full">
      {/* Converted Typography to h2 with Tailwind classes */}
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 md:mb-12 text-center">
        Sharpen Your Skills
      </h2>

      {/* Converted Box grid to Tailwind grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            // --- Converted Card to a div with "glass-card" styles ---
            // We apply the glass effect directly using Tailwind's arbitrary values
            // and add utility classes from your HTML for hover effects.
            <div
              key={quiz.id}
              className="quiz-card flex flex-col h-full rounded-2xl shadow-md p-6 
                         transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 
                         bg-white border-2 border-[#111A50]/10 hover:border-[#111A50]/30"
            >
              {/* Converted CardContent to div */}
              <div className="flex-grow">
                <p className="text-xs tracking-wider uppercase text-[#111A50] font-bold mb-2">
                  {quiz.category}
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {quiz.title}
                </h3>

                <div className="flex items-center text-gray-600 mt-2">
                  <FaUsers className="mr-2" />
                  <p className="text-sm">
                    {parseInt(quiz.participant_count).toLocaleString()} took
                    this
                  </p>
                </div>

                <div className="flex items-center text-gray-600 mt-1">
                  <FaStar className="mr-2 text-yellow-400" />
                  <p className="text-sm">
                    {quiz.average_rating
                      ? `${quiz.average_rating} Stars`
                      : "Not Rated Yet"}
                  </p>
                </div>
              </div>

              {/* Converted CardActions to div */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  className="w-full py-3 bg-[#111A50] hover:bg-[#080D2B] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-1 md:col-span-4 text-center text-gray-600">
            No public quizzes available at the moment. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
};

export default GuestQuizSection;