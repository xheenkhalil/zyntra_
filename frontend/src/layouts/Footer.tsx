import React from "react";
import { Box, Container } from "@mui/material";
import { Link } from "react-router-dom";

// Importing all icons for the footer from your HTML
import {
  FaGraduationCap,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaLaptopCode,
  FaBrain,
  FaShieldAlt,
  FaMobileAlt,
  FaQuestionCircle,
  FaInfoCircle,
  FaBriefcase,
  FaNewspaper,
  FaHandshake,
  FaEnvelope,
  FaCode,
  FaTag,
  FaLifeRing,
  FaBook,
} from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <Box component="footer" className="bg-gray-900 text-white">
      <Container
        maxWidth={false}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="text-white text-lg sm:text-xl" />
              </div>
              <span className="text-xl sm:text-2xl font-bold">ZYNTRA</span>
            </div>
            <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              Revolutionizing online examinations with AI-powered proctoring and
              intelligent analytics for educational institutions worldwide.
            </p>
            {/* --- FIX: Added 'text-white' to social links --- */}
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <a
                href="#"
                className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 text-white no-underline"
              >
                <FaFacebookF className="text-sm" />
              </a>
              <a
                href="#"
                className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 text-white no-underline"
              >
                <FaTwitter className="text-sm" />
              </a>
              <a
                href="#"
                className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 text-white no-underline"
              >
                <FaLinkedinIn className="text-sm" />
              </a>
              <a
                href="#"
                className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 text-white no-underline"
              >
                <FaInstagram className="text-sm" />
              </a>
              <a
                href="#"
                className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 text-white no-underline"
              >
                <FaYoutube className="text-sm" />
              </a>
            </div>
          </div>

          {/* Products (with icons) */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
              Products
            </h3>
            {/* --- FIX: Added 'list-none m-0 p-0' --- */}
            <ul className="space-y-2 sm:space-y-3 list-none m-0 p-0">
              <li>
                {/* --- FIX: Added 'no-underline' --- */}
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaLaptopCode className="text-xs" />
                  <span>Online Proctoring</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaBrain className="text-xs" />
                  <span>Smart Analytics</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaShieldAlt className="text-xs" />
                  <span>Secure Testing</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaMobileAlt className="text-xs" />
                  <span>Mobile App</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaQuestionCircle className="text-xs" />
                  <span>Guest Quizzes</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Company (with icons) */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
              Company
            </h3>
            {/* --- FIX: Added 'list-none m-0 p-0' --- */}
            <ul className="space-y-2 sm:space-y-3 list-none m-0 p-0">
              <li>
                {/* --- FIX: Added 'no-underline' --- */}
                <Link to="/about"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaInfoCircle className="text-xs" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaBriefcase className="text-xs" />
                  <span>Careers</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaNewspaper className="text-xs" />
                  <span>News & Press</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaHandshake className="text-xs" />
                  <span>Partners</span>
                </a>
              </li>
              <li>
                <Link to="/contact"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaEnvelope className="text-xs" />
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources (with icons) */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
              Resources
            </h3>
            {/* --- FIX: Added 'list-none m-0 p-0' --- */}
            <ul className="space-y-2 sm:space-y-3 list-none m-0 p-0">
              <li>
                {/* --- FIX: Added 'no-underline' --- */}
                <a
                  href="http://localhost:5000/api-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaCode className="text-xs" />
                  <span>API Documentation</span>
                </a>
              </li>
              <li>
                <Link to="/pricing"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaTag className="text-xs" />
                  <span>Pricing</span>
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaLifeRing className="text-xs" />
                  <span>Support Center</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaBook className="text-xs" />
                  <span>Documentation</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base no-underline"
                >
                  <FaGraduationCap className="text-xs" />
                  <span>Learning Center</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} ZYNTRA. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
              <Link
                to="/privacy-policy"
                className="text-gray-400 hover:text-white transition-colors duration-200 no-underline"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="text-gray-400 hover:text-white transition-colors duration-200 no-underline"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookie-policy"
                className="text-gray-400 hover:text-white transition-colors duration-200 no-underline"
              >
                Cookie Policy
              </Link>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200 no-underline"
              >
                Security
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Box>
  );
};

export default Footer;