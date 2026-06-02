import React, { useState, useEffect } from "react";
import {
  FaUserPlus,
  FaTimes,
  FaTrophy,
  FaStar,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Define the component's props
interface GuestRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: string;
  category: string;
}

const GuestRegistrationModal: React.FC<GuestRegistrationModalProps> = ({
  isOpen,
  onClose,
  score,
  category,
}) => {
  const navigate = useNavigate();

  // --- React Hooks for Form State ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Form Validation Logic ---
  const handleRegistration = () => {
    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!termsAccepted) {
      alert("Please accept the Terms of Service and Privacy Policy.");
      return;
    }
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    // Simulate successful registration
    alert(
      `Welcome ${firstName}! Your account has been created successfully. You can now access premium features and track your progress.`
    );
    onClose(); // Close the modal
    navigate("/login"); // Redirect to login as requested
  };

  // --- Side effect to block body scroll ---
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // --- Handle 'Maybe Later' & outside click ---
  const handleClose = () => {
    // Reset form fields
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setTermsAccepted(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Don't render anything if not open
  }

  return (
    // Modal container
    <div
      id="guest-registration-modal"
      // Use "show" class to display
      className="modal show"
      // Close modal if overlay is clicked
      onClick={handleClose}
    >
      <div
        className="modal-content p-6 sm:p-8"
        // Stop click from bubbling up to the overlay
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#3C4DCE] rounded-lg flex items-center justify-center">
              <FaUserPlus className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Great Job! 🎉</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#3C4DCE] rounded-full flex items-center justify-center mx-auto mb-4 success-animation">
            <FaTrophy className="text-white text-2xl" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Quiz Completed!
          </h4>
          <p className="text-gray-600 mb-4">
            You scored{" "}
            <span id="quiz-score" className="font-bold text-blue-600">
              {score}
            </span>{" "}
            on your{" "}
            <span id="quiz-category" className="font-semibold">
              {category}
            </span>{" "}
            quiz.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Want to save your progress and unlock more features?
          </p>
        </div>

        <div className="bg-[#3C4DCE] rounded-lg p-4 mb-6">
          <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FaStar className="text-yellow-500" />
            <span>Create an account to unlock:</span>
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500 text-xs" />
              <span>Save quiz results</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500 text-xs" />
              <span>Track your progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500 text-xs" />
              <span>Earn badges & certificates</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500 text-xs" />
              <span>Access premium quizzes</span>
            </div>
          </div>
        </div>

        {/* --- Converted Form --- */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="input-group">
              <input
                type="text"
                id="guest-first-name"
                placeholder=" "
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <label htmlFor="guest-first-name" className="text-gray-500">
                First Name
              </label>
            </div>
            <div className="input-group">
              <input
                type="text"
                id="guest-last-name"
                placeholder=" "
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <label htmlFor="guest-last-name" className="text-gray-500">
                Last Name
              </label>
            </div>
          </div>

          <div className="input-group">
            <input
              type="email"
              id="guest-email"
              placeholder=" "
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="guest-email" className="text-gray-500">
              Email Address
            </label>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              id="guest-password"
              placeholder=" "
              className="w-full px-3 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="guest-password" className="text-gray-500">
              Create Password
            </label>
            {/* --- THIS IS THE FIX --- */}
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {/* --- END OF FIX --- */}
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="guest-terms"
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="guest-terms" className="text-sm text-gray-600">
              I agree to the{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Maybe Later
          </button>
          <button
            onClick={handleRegistration}
            className="flex-1 px-4 py-3 bg-[#3C4DCE] hover:bg-[#2C31B9] text-white rounded-lg font-semibold"
          >
            Create Account
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Already have an account?{" "}
            <button
              onClick={() => {
                onClose();
                navigate("/login");
              }}
              className="text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestRegistrationModal;