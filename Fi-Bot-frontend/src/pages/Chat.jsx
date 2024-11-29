import React, { useState, useEffect, useRef } from "react";
import { RiSendPlaneFill, RiRobot2Fill, RiUser3Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

function Chat({ userData, setUserData }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat-messages");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            type: "bot",
            text: "Hello! I'm Fi-Bot, your AI financial advisor. How can I help you today?",
          },
        ];
  });

  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [budget, setBudget] = useState("");

  const messagesEndRef = useRef(null);

  const baseURL = "http://localhost:3005/api/";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (userData !== "") {
      navigate("/chat");
    } else {
      navigate("/signin");
    }
  }, [userData]);

  useEffect(() => {
    localStorage.setItem("chat-messages", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const loadingMessage = {
      id: Date.now() + 1,
      type: "bot",
      text: "generating...",
    };
    setMessages((prev) => [...prev, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(baseURL + "trainedmodel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (response.ok) {
        const data = await response.json();
        const botText = data.response.candidates[0].content.parts[0].text;

        setMessages((prev) =>
          prev.slice(0, -1).concat({ id: Date.now(), type: "bot", text: botText })
        );
      } else {
        throw new Error("Failed to fetch bot response");
      }
    } catch (error) {
      console.error("Error fetching bot response:", error);
      setMessages((prev) =>
        prev
          .slice(0, -1)
          .concat({
            id: Date.now(),
            type: "bot",
            text: "Sorry, something went wrong. Please try again.",
          })
      );
    } finally {
      setIsLoading(false);
    }

    setMessages((prev) => {
      const trimmedMessages = prev.slice(-10);
      localStorage.setItem("chat-messages", JSON.stringify(trimmedMessages));
      return trimmedMessages;
    });
  };

  const handleSetBudget = async () => {
    if (!budget || isNaN(budget)) {
      alert("Please enter a valid budget.");
      return;
    }

    try {
      const response = await fetch(baseURL + "setBudget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ budget: parseInt(budget) }),
      });

      if (response.ok) {
        alert("Budget set successfully!");
        setShowPopup(false);
        setBudget("");
      } else {
        alert("Failed to set budget. Please try again.");
      }
    } catch (error) {
      console.error("Error setting budget:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 h-[calc(100vh-144px)] relative">
      <div className="card h-full flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${
                message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === "bot" ? "bg-primary" : "bg-gray-700"
                }`}
              >
                {message.type === "bot" ? <RiRobot2Fill /> : <RiUser3Fill />}
              </div>
              <div
                className={`prose max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${
                  message.type === "user"
                    ? "bg-primary text-white"
                    : "bg-dark-light text-gray-100"
                }`}
              >
                <ReactMarkdown
                  children={message.text}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                />
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-gray-700">
          <div className="flex space-x-2 sm:space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="input flex-grow text-sm sm:text-base"
              disabled={isLoading}
            />
            <button type="submit" className="btn-primary px-4 sm:px-6" disabled={isLoading}>
              <RiSendPlaneFill className="text-xl" />
            </button>
          </div>
        </form>
        
      </div>

      <button
          className="relative bottom-20 -left-40 btn-primary"
          onClick={() => setShowPopup(true)}
        >
          Set Budget
        </button>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-slate-900 p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Set Your Budget</h2>
            <input
              type="number"
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter your budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="btn-secondary px-4 py-2"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary px-4 py-2"
                onClick={handleSetBudget}
              >
                Set Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
