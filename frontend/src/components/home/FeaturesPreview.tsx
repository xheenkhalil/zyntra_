import React from "react";
import { FaEye, FaChartBar, FaLock, FaCogs, FaBolt } from "react-icons/fa";

const FeaturesPreview: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Why Choose ZYNTRA?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the next generation of online examination with our
            cutting-edge features
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Feature 1: AI Proctoring */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <FaEye className="text-[#111A50] text-lg sm:text-xl" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              AI Proctoring
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Advanced AI monitors exam sessions in real-time, ensuring academic
              integrity without human intervention.
            </p>
          </div>

          {/* Feature 2: Smart Analytics */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <FaChartBar className="text-[#111A50] text-lg sm:text-xl" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Smart Analytics
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Get detailed insights into student performance with comprehensive
              analytics and reporting tools.
            </p>
          </div>

          {/* Feature 3: Secure Platform */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <FaLock className="text-[#111A50] text-lg sm:text-xl" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Secure Platform
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Bank-level security ensures your exam data is protected with
              end-to-end encryption.
            </p>
          </div>

          {/* Feature 4: Customizable Exams */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <FaCogs className="text-[#111A50] text-lg sm:text-xl" />
            </div>
            <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
              Customizable Exams
            </h3>
            <p className="text-gray-600 text-xs sm:text-base">
              Tailor your assessments with flexible question formats and dynamic time limits.
            </p>
          </div>

          {/* Feature 6: Instant Feedback */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <FaBolt className="text-[#111A50] text-lg sm:text-xl" />
            </div>
            <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
              Instant Feedback
            </h3>
            <p className="text-gray-600 text-xs sm:text-base">
              Automated grading systems provide immediate results and rich feedback to students.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesPreview;