import React, { useState, useEffect, useRef } from "react";
import { RiSendPlaneFill, RiRobot2Fill, RiUser3Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

function Chat({userData, setUserData}) {
  // const [userData, setUserData] = UseLocalStorage("userData", "");
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat-messages");
    return saved
      ? JSON.parse(saved)
      : [
        { id: 1, type: "bot", text: "Hello! I'm Fi-Bot, your AI financial advisor. How can I help you today?" },
      ];
  });

  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const baseURL = "http://localhost:3005/api/"; // Replace with your actual API base URL

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if(userData !== ""){
      navigate('/chat');
    }else{
      navigate('/signin');
    }
  }, [userData]);

  useEffect(() => {
    localStorage.setItem("chat-messages", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to the chat
    const userMessage = {
      id: Date.now(),
      type: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Add a loading indicator for bot response
    const loadingMessage = {
      id: Date.now() + 1,
      type: "bot",
      text: "generating...",
    };
    setMessages((prev) => [...prev, loadingMessage]);
    setIsLoading(true);

    try {
      // Call the API with user's input
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

        // Replace loading message with bot's response
        setMessages((prev) =>
          prev
            .slice(0, -1) // Remove loading message
            .concat({ id: Date.now(), type: "bot", text: botText })
        );
      } else {
        throw new Error("Failed to fetch bot response");
      }
    } catch (error) {
      console.error("Error fetching bot response:", error);
      setMessages((prev) =>
        prev
          .slice(0, -1) // Remove loading message
          .concat({ id: Date.now(), type: "bot", text: "Sorry, something went wrong. Please try again." })
      );
    } finally {
      setIsLoading(false);
    }

    // Keep only the last 10 messages
    setMessages((prev) => {
      const trimmedMessages = prev.slice(-10);
      localStorage.setItem("chat-messages", JSON.stringify(trimmedMessages));
      return trimmedMessages;
    });
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<span class="text-xl font-bold">$1</span>') // Replace **text** with bold HTML + Tailwind CSS
      .replace(/\*(.*?)\*/g, '<b>$1</b>') // Replace *text* with <b>
      .replace(/^\d+\.\s/gm, '<br><br>$&'); // Add spacing for numbered lines
  };


  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 h-[calc(100vh-64px)]">
      <div className="card h-full flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === "bot" ? "bg-primary" : "bg-gray-700"
                  }`}
              >
                {message.type === "bot" ? <RiRobot2Fill /> : <RiUser3Fill />}
              </div>
              <div
                className={`prose max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${message.type === "user"
                    ? "bg-primary text-white"
                    : "bg-dark-light text-gray-100"
                  }`}
                id={`msg${message.id}`}
              >
                <ReactMarkdown children={message.text} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}
                components={{
                  h2: ({ children }) => <h2 className="text-2xl font-bold my-4">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-semibold my-3">{children}</h3>,
                  p: ({ children }) => <p className="text-base">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 my-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 my-2">{children}</ol>,
                  li: ({ children }) => <li className="text-base">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  br: () => <br className="my-2" />,
                }}
                />
                

                {/* {parse((message.text))} */}
                {console.log(message.text)}
                {/* {message.text} */}

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
    </div>
  );
}

export default Chat;
