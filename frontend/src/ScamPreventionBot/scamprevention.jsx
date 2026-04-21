import React, { useState, useEffect, useRef } from "react";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isThinking, setIsThinking] = useState(false);

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingSpeed = 20; // milliseconds per character (faster than word-by-word)

  // Character-by-character animation
  useEffect(() => {
    if (currentResponse && charIndex < currentResponse.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentResponse.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, typingSpeed);

      return () => clearTimeout(timer);
    } else if (currentResponse && charIndex === currentResponse.length) {
      // Done typing, add to messages
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          text: currentResponse,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setCurrentResponse("");
      setCharIndex(0);
    }
  }, [currentResponse, charIndex]);

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, displayedText]);

  // Focus on input when loading stops
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message with timestamp
    const userMessage = {
      text: input,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input and start loading
    setInput("");
    setIsLoading(true);

    // Simulate "thinking" state before typing
    setIsThinking(true);

    try {
      // Simulate network delay (remove in production)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(
        "http://localhost:8000/api/scamDetectorText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: input }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // Stop thinking, start typing
      setIsThinking(false);

      // Add placeholder for bot response that will be filled in character by character
      setMessages((prev) => [
        ...prev,
        {
          text: "",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      setCurrentResponse(
        data.response || "I'm sorry, I couldn't process that request."
      );
    } catch (error) {
      console.error("Error:", error);
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error processing your request.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced formatting function
  const formatText = (text) => {
    if (!text) return "";

    // Handle bold text (**text**)
    text = text.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold">$1</strong>'
    );

    // Handle italic text (*text*)
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Handle code blocks (```code```)
    text = text.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-gray-800 text-gray-200 p-3 rounded-md my-2 overflow-x-auto font-mono text-sm">$1</pre>'
    );

    // Handle inline code (`code`)
    text = text.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-200 px-1 rounded font-mono text-sm">$1</code>'
    );

    // Add spacing between paragraphs (double line breaks)
    text = text.replace(/\n\n/g, '<div class="my-4"></div>');

    // Add spacing for single line breaks
    text = text.replace(/\n/g, '<div class="my-2"></div>');

    return text;
  };

  // Generate typing indicator with random periods
  const TypingIndicator = () => {
    const [dots, setDots] = useState(".");

    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : "."));
      }, 500);

      return () => clearInterval(interval);
    }, []);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="flex-none p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Scam Prevention Bot</h1>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-grow overflow-hidden">
        <div
          ref={chatContainerRef}
          className="h-full overflow-y-auto p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-8 h-8 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  How can I help you today?
                </h2>
                <p className="text-gray-500 max-w-md mb-6">
                  Ask me anything about fraud prevention, financial security, or
                  suspicious activities.
                </p>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex mb-4 ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex ${
                    message.isUser ? "flex-row-reverse" : "flex-row"
                  } max-w-[80%] items-end`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 ${
                      message.isUser ? "ml-2" : "mr-2"
                    } mb-1`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isUser
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {message.isUser ? "U" : "AI"}
                    </div>
                  </div>

                  {/* Message content */}
                  <div className="flex flex-col">
                    <div
                      className={`p-3 rounded-2xl shadow-sm ${
                        message.isUser
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {message.isUser ? (
                        <div className="whitespace-pre-wrap">
                          {message.text}
                        </div>
                      ) : index === messages.length - 1 && currentResponse ? (
                        <div
                          className="whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: formatText(displayedText),
                          }}
                        />
                      ) : (
                        <div
                          className="whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: formatText(message.text),
                          }}
                        />
                      )}
                    </div>

                    {/* Timestamp */}
                    <div
                      className={`text-xs text-gray-500 mt-1 ${
                        message.isUser ? "text-right" : "text-left"
                      }`}
                    >
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {(isLoading || currentResponse) && (
              <div className="flex items-start mb-4">
                <TypingIndicator />
              </div>
            )}

            {/* Bottom space for better UX */}
            <div className="h-4"></div>
          </div>
        </div>
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex-none p-4 border-t border-gray-200 bg-white shadow-lg"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex rounded-full border border-gray-300 overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow p-3 focus:outline-none px-4"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-3 flex items-center justify-center disabled:bg-blue-400 transition-colors"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
         
        </div>
      </form>
    </div>
  );
};

export default ChatBot;