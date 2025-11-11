import React, { useState, useRef, useEffect } from "react";
import {
  FaComments,
  FaTimes,
  FaRobot,
  FaPaperPlane,
} from "react-icons/fa";

// --- Types for Chat ---
type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
  quickReplies?: string[];
};

type KnowledgeBase = {
  [key: string]: {
    response: string;
    followUp?: string[];
  };
};

// --- Chatbot Logic and Data ---
const chatbotKnowledge: KnowledgeBase = {
  "ai proctoring": {
    response:
      "Our AI proctoring system uses advanced computer vision to monitor exam sessions in real-time, detecting suspicious behavior.",
    followUp: ["How accurate is it?", "What happens if cheating is detected?"],
  },
  pricing: {
    response:
      "We offer three main plans: Freemium, Basic, and Advanced. Each plan includes different features and AI capabilities.",
    followUp: ["What's in the free plan?", "Can I upgrade anytime?"],
  },
  "sign up": {
    response:
      "Creating an account is easy! Click the 'Create Account' button in the top navigation and follow the steps.",
    followUp: ["How long does setup take?", "Can I start with a free plan?"],
  },
  support: {
    response:
      "I'm here to help! For technical issues, I can connect you with our customer service team.",
    followUp: ["Connect me to customer service", "Account recovery help"],
  },
  default: {
    response: "I'm not sure I understand. Can you rephrase that?",
    followUp: ["AI Proctoring", "Pricing", "Support"],
  },
};

const Chatbot: React.FC = () => {
  // --- React Hooks ---
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I'm your ZYNTRA assistant. How can I help you today?",
      quickReplies: [
        "AI Proctoring",
        "Pricing",
        "Sign Up",
        "Support",
      ],
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Effect to scroll to bottom ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- Event Handlers ---
  const toggleChatbot = () => setIsOpen(!isOpen);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    // Add user message
    const newUserMessage: Message = {
      id: Date.now(),
      sender: "user",
      text,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    // Trigger bot response
    setIsTyping(true);
    setTimeout(() => {
      getBotResponse(text);
    }, 1000 + Math.random() * 1000); // Simulate network delay
  };

  const handleQuickReply = (text: string) => {
    // Add user message (as if they typed it)
    const newUserMessage: Message = {
      id: Date.now(),
      sender: "user",
      text,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Trigger bot response
    setIsTyping(true);
    setTimeout(() => {
      getBotResponse(text);
    }, 800);
  };

  const getBotResponse = (userText: string) => {
    const lowerText = userText.toLowerCase();
    let botReply = chatbotKnowledge.default; // Default reply

    // Find a matching keyword
    for (const key in chatbotKnowledge) {
      if (lowerText.includes(key)) {
        botReply = chatbotKnowledge[key];
        break;
      }
    }

    const newBotMessage: Message = {
      id: Date.now() + 1,
      sender: "bot",
      text: botReply.response,
      quickReplies: botReply.followUp,
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, newBotMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      <button
        id="chatbot-button"
        className={`chatbot-button ${isOpen ? "active" : ""}`}
        onClick={toggleChatbot}
      >
        {isOpen ? (
          <FaTimes id="chatbot-icon" />
        ) : (
          <FaComments id="chatbot-icon" />
        )}
      </button>

      <div id="chatbot-window" className={`chatbot-window ${isOpen ? "open" : ""}`}>
        {/* Chatbot Header */}
        <div className="chatbot-header">
          <div className="bot-info">
            <div className="bot-avatar">
              <FaRobot />
            </div>
            <div>
              <div className="font-semibold">ZYNTRA Assistant</div>
              <div className="bot-status">
                <div className="status-dot"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleChatbot}
            className="text-white hover:text-gray-200 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Messages Container */}
        <div id="chatbot-messages" className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {msg.sender === "bot" && (
                <div className="message-avatar">
                  <FaRobot />
                </div>
              )}
              <div>
                <div className="message-content">{msg.text}</div>
                {msg.quickReplies && (
                  <div className="quick-replies">
                    {msg.quickReplies.map((reply) => (
                      <div
                        key={reply}
                        className="quick-reply"
                        onClick={() => handleQuickReply(reply)}
                      >
                        {reply}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="message bot" id="typing-indicator">
              <div className="message-avatar">
                <FaRobot />
              </div>
              <div className="typing-indicator">
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          {/* Empty div to scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chatbot-input">
          <div className="input-container">
            <input
              type="text"
              id="chatbot-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              id="send-button"
              className="send-button"
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;