import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Import icons used in this section
import {
  FaRocket,
  FaPlay,
  FaVideo,
  FaUsers,
  FaFileAlt,
  FaShieldAlt,
} from "react-icons/fa";

// --- Slider Configuration ---
// Store slide images in an array
const slides = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
];

const HeroSection: React.FC = () => {
  // --- React Logic for Slider ---
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Set up the interval
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); // Change slide every 5 seconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center justify-center overflow-hidden bg-blue-900">
      {/* Background Image Slider */}
      <div className="hero-slider absolute inset-0">
        {slides.map((src, index) => (
          <div
            key={src}
            className={`hero-slide ${index === currentSlide ? "active" : ""}`}
          >
            <img
              src={src}
              alt="Students taking exams"
              className="opacity-20"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-blue-900 bg-opacity-80"></div>
      </div>

      {/* Floating Glass Elements (No logic, just JSX) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element absolute top-10 sm:top-20 left-5 sm:left-10 w-12 sm:w-16 h-12 sm:h-16 glass-effect rounded-full"></div>
        <div className="floating-element absolute top-32 sm:top-40 right-10 sm:right-20 w-8 sm:w-12 h-8 sm:h-12 glass-effect rounded-full"></div>
        <div className="floating-element absolute bottom-24 sm:bottom-32 left-1/4 w-16 sm:w-20 h-16 sm:h-20 glass-effect rounded-full"></div>
        <div className="floating-element absolute bottom-10 sm:bottom-20 right-1/4 w-10 sm:w-14 h-10 sm:h-14 glass-effect rounded-full"></div>
        <div className="floating-element absolute top-26 sm:top-34 right-10 sm:right-20 w-8 sm:w-12 h-8 sm:h-12 glass-effect rounded-full"></div>
        <div className="floating-element absolute top-10 sm:top-20 left-5 sm:left-10 w-12 sm:w-16 h-12 sm:h-16 glass-effect rounded-full"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center space-x-2 glass-effect rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6">
            <FaRocket className="text-white text-xs sm:text-sm" />
            <span className="text-white text-xs sm:text-sm font-medium">
              Powered by AI Technology
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          <span className="block">ZYNTRA</span>
          <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light mt-1 sm:mt-2">
            The Future of
          </span>
          <span className="block text-blue-300">
            Intelligent Exams
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white text-opacity-90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
          Transform your examination process with AI-powered proctoring,
          advanced analytics, and seamless user experience.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 mb-8 sm:mb-12">
          {/* Replaced <button> with <Link> and added the 'to' prop */}
          <Link to="/login" className="flex items-center space-x-2 bg-white text-blue-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-100 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 w-full sm:w-auto no-underline border-none">
            <FaPlay className="text-sm" />
            <span>Start Free Trial</span>
          </Link>
  
              {/* Also replaced this <button> with <Link> */}
          <Link
            to="/#demo" // You can change this path (e.g., to /pricing or /contact)
            className="flex items-center space-x-2 glass-effect text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200 transform hover:-translate-y-1 w-full sm:w-auto no-underline border-none">
            <FaVideo className="text-sm" />
            <span>Watch Demo</span>
          </Link>
</div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
          <div className="glass-effect rounded-xl p-4 sm:p-6 text-center transform hover:-translate-y-2 transition-all duration-300">
            <FaUsers className="text-2xl sm:text-3xl text-white mb-2 sm:mb-3 mx-auto" />
            <div className="text-xl sm:text-2xl font-bold text-white">10K+</div>
            <div className="text-white text-opacity-80 text-sm sm:text-base">
              Active Users
            </div>
          </div>
          <div className="glass-effect rounded-xl p-4 sm:p-6 text-center transform hover:-translate-y-2 transition-all duration-300">
            <FaFileAlt className="text-2xl sm:text-3xl text-white mb-2 sm:mb-3 mx-auto" />
            <div className="text-xl sm:text-2xl font-bold text-white">50K+</div>
            <div className="text-white text-opacity-80 text-sm sm:text-base">
              Exams Conducted
            </div>
          </div>
          <div className="glass-effect rounded-xl p-4 sm:p-6 text-center transform hover:-translate-y-2 transition-all duration-300">
            <FaShieldAlt className="text-2xl sm:text-3xl text-white mb-2 sm:mb-3 mx-auto" />
            <div className="text-xl sm:text-2xl font-bold text-white">
              99.9%
            </div>
            <div className="text-white text-opacity-80 text-sm sm:text-base">
              Security Rate
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;