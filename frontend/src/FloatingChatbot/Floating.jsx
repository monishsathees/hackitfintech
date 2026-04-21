import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  ChevronUp,
  ChevronDown,
  Mic,
} from "lucide-react";

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hello! I can help you with information about banking. What would you like to know?",
      sender: "bot",
    },
  ]);
  const recognitionRef = useRef(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const options = [
    "Tell me about HDFC Bank",
    "What are the current interest rates?",
    "How do I open an account?",
    "What are the different types of loans?",
    "Credit card information",
    "Online banking features",
    "Branch locations",
    "Contact customer service",
  ];

  const speak = async (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };
  
  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      handleVoiceInput(voiceText);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    return recognition;
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const fetchBotResponse = async (userPrompt) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/chatBot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: userPrompt }),
          mode: "cors",
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching bot response:", error);
      return {
        response: "Sorry, I encountered an error. Please try again later.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async (voiceText) => {
    if (voiceText) {
      // Add user message
      setMessages((prev) => [...prev, { text: voiceText, sender: "user" }]);

      // Add loading indicator
      setMessages((prev) => [
        ...prev,
        { text: "...", sender: "bot", isLoading: true },
      ]);

      // Get bot response from API
      const botData = await fetchBotResponse(voiceText);

      // Remove loading indicator and add actual response
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      
      const responseText = botData.response || "I didn't get a response. Please try again.";
      
      // Add response to messages
      setMessages((prev) => [
        ...prev,
        {
          text: responseText,
          sender: "bot",
        },
      ]);
      
      // Speak only the bot response
      speak(responseText);
    }
  };

  const handleSend = async () => {
    if (message.trim()) {
      // Add user message
      const userMessage = message.trim();
      setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
      setMessage("");

      // Add loading indicator
      setMessages((prev) => [
        ...prev,
        { text: "...", sender: "bot", isLoading: true },
      ]);

      // Get bot response from API
      const botData = await fetchBotResponse(userMessage);

      // Remove loading indicator and add actual response
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      setMessages((prev) => [
        ...prev,
        {
          text:
            botData.response || "I didn't get a response. Please try again.",
          sender: "bot",
        },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const selectOption = (option) => {
    setMessage(option);
    setIsOptionsOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 font-sans">
      {/* Chatbot Button */}
      <button
        onClick={toggleChat}
        className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl ${
          isOpen
            ? "bg-white text-blue-600 rotate-90"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col transform transition-all duration-300 ease-in-out scale-100 origin-bottom-right">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <h3 className="font-semibold">Banking Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-200 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3/4 p-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-blue-100 text-gray-800 rounded-bl-none"
                  } shadow-sm transition-all duration-200 hover:shadow-md`}
                >
                  {msg.isLoading ? (
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Options Section */}
          <div className="border-t border-gray-200">
            <div
              className="p-2 bg-blue-50 flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            >
              <span className="text-blue-600 font-medium">Quick Questions</span>
              {isOptionsOpen ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronUp size={18} />
              )}
            </div>

            {isOptionsOpen && (
              <div className="max-h-40 overflow-y-auto bg-white">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-blue-50 cursor-pointer transition-colors text-gray-700"
                    onClick={() => selectOption(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input Container */}
          <div className="p-3 bg-white border-t border-gray-200 flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={isLoading}
            />
            <button
              className={`p-2 ${
                isListening 
                  ? "bg-red-500 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              } transition-colors duration-200`}
              onClick={startListening}
              disabled={isLoading}
            >
              <Mic size={18} />
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className={`p-2 rounded-r-lg ${
                message.trim() && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-400"
              } transition-colors duration-200`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;

