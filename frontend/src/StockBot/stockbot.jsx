import React, { useState, useRef } from "react";
import { Send, Paperclip, Trash, Loader2, X } from "lucide-react";
import axios from "axios";

export default function ScamPrevention() {
  const [userPrompt, setUserPrompt] = useState("");
  const [files, setFiles] = useState([]);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  // Function to convert files to base64 for API submission
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userPrompt.trim() === "" && files.length === 0) return;

    setIsLoading(true);
    setHasSubmitted(true);

    try {
      let response;

      if (userPrompt.trim() !== "") {
        // Text submission
        const payload_text = { prompt: userPrompt };

        console.log("Text Request Payload:", payload_text);
        localStorage.setItem(
          "scamPreventionPayload",
          JSON.stringify(payload_text)
        );

        response = await axios.post(
          "http://localhost:8000/api/fundAnalyzer",
          payload_text,
          { headers: { "Content-Type": "application/json" } }
        );
      } else if (files.length > 0) {
        // File submission
        const filePromises = files.map(async (file) => {
          const base64Content = await fileToBase64(file);
          return {
            name: file.name,
            type: file.type,
            content: base64Content,
          };
        });

        const processedFiles = await Promise.all(filePromises);
        const payload_pdf = { files: processedFiles };

        console.log("File Request Payload:", payload_pdf);

        response = await axios.post(
          "http://localhost:8000/api/scamDetectorFile",
          payload_pdf,
          { headers: { "Content-Type": "application/json" } }
        );
      }

      // Console log the API response
      console.log("API Response Data:", response.data);

      // Format and process the response
      const formattedResponse = formatResponseData(response.data);

      setResponse({
        content: formattedResponse,
        jsonResponse: response.data,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Show modal with response
      setShowModal(true);
    } catch (error) {
      console.error("Error processing request:", error);

      setResponse({
        content: `Error occurred: ${error.message}. In a production environment, proper error handling would be implemented.`,
        errorDetails: error,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Show modal even for errors
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to format the entire response data
  const formatResponseData = (data) => {
    // Extract relevant information or use the raw response
    const responseText = data.response || "No response data received";

    // Parse the response text to identify sections like Category, Summary, etc.
    const formattedSections = parseResponseSections(responseText);

    return formattedSections;
  };

  // Function to parse the response into structured sections
  const parseResponseSections = (text) => {
    const sections = {};

    // Try to extract sections using regex patterns
    const categoryMatch = text.match(/\*\*Category:\*\*\s*(.*?)(?=\*\*|$)/s);
    const summaryMatch = text.match(/\*\*Summary:\*\*\s*(.*?)(?=\*\*|$)/s);
    const analysisMatch = text.match(/\*\*Analysis:\*\*\s*(.*?)(?=\*\*|$)/s);
    const recommendationsMatch = text.match(
      /\*\*Recommendations:\*\*\s*(.*?)(?=\*\*|$)/s
    );

    // Extract checkmark or cross indicators
    let categoryIndicator = "❓";
    if (categoryMatch && categoryMatch[1]) {
      if (categoryMatch[1].toLowerCase().includes("legitimate")) {
        categoryIndicator = "✅";
      } else if (
        categoryMatch[1].toLowerCase().includes("scam") ||
        categoryMatch[1].toLowerCase().includes("fraud")
      ) {
        categoryIndicator = "❌";
      }
    }

    // Format each section
    if (categoryMatch && categoryMatch[1]) {
      sections.category = {
        indicator: categoryIndicator,
        text: categoryMatch[1].trim(),
      };
    }

    if (summaryMatch && summaryMatch[1]) {
      sections.summary = summaryMatch[1].trim();
    }

    if (analysisMatch && analysisMatch[1]) {
      sections.analysis = analysisMatch[1].trim();
    }

    if (recommendationsMatch && recommendationsMatch[1]) {
      sections.recommendations = recommendationsMatch[1].trim();
    }

    // If we couldn't parse structured sections, use the original text
    if (Object.keys(sections).length === 0) {
      return { rawText: text };
    }

    return sections;
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...uploadedFiles]);
  };

  const removeFile = (fileToRemove) => {
    setFiles(files.filter((file) => file !== fileToRemove));
  };

  const resetChat = () => {
    setUserPrompt("");
    setFiles([]);
    setResponse(null);
    setHasSubmitted(false);
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-white text-blue-900">
      {/* Header */}
      <header className="border-b border-blue-100 p-6">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
              <span className="text-xl font-bold text-white">AI</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Intelligence Assistant
            </h1>
          </div>

          {hasSubmitted && (
            <button
              onClick={resetChat}
              className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
            >
              New Question
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col p-6">
          {!hasSubmitted && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mb-10">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-6">
                <span className="text-4xl text-white">✨</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-blue-800">
                How can I assist you today?
              </h2>
              <p className="text-blue-600 max-w-md">
                Ask me anything or upload documents for analysis. I'll provide a
                concise, informative response.
              </p>
            </div>
          )}

          {hasSubmitted && (
            <div className="flex-1 overflow-y-auto mb-6">
              {/* User query recap */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-500 mb-1">Your query:</div>
                <div className="font-medium text-blue-800">{userPrompt}</div>
                {files.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center bg-blue-100 rounded-md px-2 py-1"
                      >
                        <span className="text-xs text-blue-700">
                          {file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-40">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                  <p className="text-blue-600">Processing request...</p>
                  <p className="text-xs text-blue-400 mt-2">
                    Check console for request and response logs
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Input area - shown only if not submitted or if reset */}
          {!hasSubmitted && (
            <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-lg">
              {/* File preview area */}
              {files.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-50 rounded-md px-3 py-2 group"
                    >
                      <span className="text-sm text-blue-700 mr-2">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(file)}
                        className="text-blue-400 hover:text-red-500 transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input form */}
              <form onSubmit={handleSubmit} className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    className="w-full bg-blue-50 border border-blue-100 rounded-lg py-4 pl-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-800 placeholder-blue-400 min-h-[100px]"
                    placeholder="Ask anything..."
                    rows={3}
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 bottom-3 text-blue-400 hover:text-blue-600 transition-colors"
                    onClick={triggerFileInput}
                  >
                    <Paperclip size={20} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg p-4 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 transition-all"
                  disabled={userPrompt.trim() === "" && files.length === 0}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modal Popup for Response */}
      {showModal && response && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <span className="text-sm font-bold text-white">AI</span>
                </div>
                <div>
                  <h3 className="font-bold text-blue-800">
                    Assistant Response
                  </h3>
                  <div className="text-xs text-blue-500">
                    {response.timestamp}
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="h-8 w-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose max-w-none text-blue-800">
                {response.content.rawText ? (
                  <p className="whitespace-pre-line">
                    {response.content.rawText}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {/* Category Section */}
                    {response.content.category && (
                      <div className="flex items-start">
                        <div className="font-semibold text-blue-800 min-w-[100px]">
                          Category:
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">
                            {response.content.category.indicator}
                          </span>
                          <span
                            className={`font-medium ${
                              response.content.category.indicator === "✅"
                                ? "text-green-600"
                                : response.content.category.indicator === "❌"
                                ? "text-red-600"
                                : "text-blue-700"
                            }`}
                          >
                            {response.content.category.text}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Summary Section */}
                    {response.content.summary && (
                      <div className="space-y-2">
                        <div className="font-semibold text-blue-800">
                          Summary:
                        </div>
                        <div className="pl-4">{response.content.summary}</div>
                      </div>
                    )}

                    {/* Analysis Section */}
                    {response.content.analysis && (
                      <div className="space-y-2">
                        <div className="font-semibold text-blue-800">
                          Analysis:
                        </div>
                        <div className="pl-4 whitespace-pre-line">
                          {response.content.analysis}
                        </div>
                      </div>
                    )}

                    {/* Recommendations Section */}
                    {response.content.recommendations && (
                      <div className="space-y-2">
                        <div className="font-semibold text-blue-800">
                          Recommendations:
                        </div>
                        <div className="pl-4">
                          {response.content.recommendations
                            .split("-")
                            .filter((item) => item.trim())
                            .map((item, index) => (
                              <div
                                key={index}
                                className="flex items-start mb-2"
                              >
                                <span className="mr-2">•</span>
                                <span>{item.trim()}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-blue-100 p-4 bg-blue-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
