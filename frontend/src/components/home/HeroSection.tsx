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
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop", // Modern laptop/tech
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop", // Students studying
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop", // Modern diverse team/tech
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
        <div className="absolute inset-0 bg-[#111A50]/70"></div>
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

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
          <span className="block">ZYNTRA</span>
          <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light mt-2 sm:mt-4 text-gray-200">
            The Future of
          </span>
          <span className="block text-white mt-1">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mt-12">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <FaUsers className="text-3xl text-white mb-3 mx-auto opacity-90" />
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-wide">10K+</div>
            <div className="text-gray-200 font-medium text-sm sm:text-base mt-1 uppercase tracking-wider">
              Active Users
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <FaFileAlt className="text-3xl text-white mb-3 mx-auto opacity-90" />
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-wide">50K+</div>
            <div className="text-gray-200 font-medium text-sm sm:text-base mt-1 uppercase tracking-wider">
              Exams Conducted
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <FaShieldAlt className="text-3xl text-white mb-3 mx-auto opacity-90" />
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
              99.9%
            </div>
            <div className="text-gray-200 font-medium text-sm sm:text-base mt-1 uppercase tracking-wider">
              Security Rate
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;