import { useEffect, useState } from "react";
import { ImSpinner } from "react-icons/im";
import { FaArrowLeft } from "react-icons/fa";

interface Message {
  id: number;
  action: string;
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: number;
  name: string;
  messages: Message[];
}

export default function ChatDisplay({
  sessionId,
  sessionImage,
  onBack,
}: {
  sessionId: number | null;
  sessionImage: string;
  onBack: () => void;
}) {
  // State to hold the current chat session
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);
  // State to handle any errors during data fetching
  const [error, setError] = useState<string | null>(null);

  // Fetch the selected chat session data when the sessionId changes
  useEffect(() => {
    const fetchChatSession = async () => {
      if (sessionId !== null) {
        setIsLoading(true);
        setError(null); // Reset error before fetching

        try {
          // Fetch chat session data from the API
          const response = await fetch(
            `https://admin-backend-docker-india-306034828043.asia-south2.run.app/nlp/api/chat_sessions?page=1&per_page=500`
          );
          const data = await response.json();

          // Check if the response is valid and contains chat sessions
          if (!response.ok || !data.chat_sessions) {
            throw new Error("Failed to fetch chat sessions");
          }

          // Find the specific chat session by sessionId
          const selectedSession = data.chat_sessions.find(
            (session: ChatSession) => session.id === sessionId
          );

          if (selectedSession) {
            setChatSession(selectedSession); // Set the fetched chat session
          } else {
            setChatSession(null); // If session not found, clear the session
            setError("Session not found");
          }
        } catch (error) {
          console.error("Error fetching chat sessions:", error);
          setError("Error fetching chat sessions"); // Set error if fetch fails
        } finally {
          setIsLoading(false); // Stop loading indicator
        }
      }
    };

    fetchChatSession();
  }, [sessionId]); // Effect runs when sessionId changes

  // Format the timestamp to a more readable time format (12-hour clock)
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // If the data is still loading, show a spinner and loading message
  if (isLoading && sessionId !== null) {
    return (
      <div className="flex justify-center items-center lg:w-[1150px] sm:w-[600px] h-screen bg-white">
        <div className="flex flex-col justify-center items-center h-full">
          <ImSpinner className="animate-spin text-5xl text-[#4946a5]" />
          <p className="mt-4 font-semibold text-xl">Loading chat messages...</p>
        </div>
      </div>
    );
  }

  // If there is an error, display the error message
  if (error) {
    return (
      <div className="overflow-y-scroll pt-16 lg:w-[1150px] sm:w-[600px] h-screen bg-white">
        {error}
      </div>
    );
  }

  // If no chat session is selected or session not found, show a placeholder screen
  if (!chatSession) {
    return (
      <div className="overflow-y-scroll pt-16 lg:w-[1150px] sm:w-[600px] h-screen">
        <div className="flex flex-col justify-center items-center h-full">
          <img
            className="w-64 h-64 md:w-80 md:h-80"
            src={`${process.env.PUBLIC_URL}/Images/image1.png`}
            alt="No Session"
          />
          <p className="text-2xl md:text-3xl text-center text-[#9976b0] font-bold">
            Your conversations are waiting
          </p>
          <p className="text-sm md:text-lg text-center font-normal">
            Select a chat to dive back into your discussions
          </p>
        </div>
      </div>
    );
  }

  const displayName = chatSession.name.replace("Chat Session about ", "");

  // Main UI for displaying the chat session
  return (
    <div className="overflow-y-scroll hide-scrollbar pt-8 lg:w-[1150px] md:w-[600px] z-50 h-screen bg-white">
      <div className="flex flex-col">
        {/* Header with Back Button and Session Information */}
        <header className="w-full items-center flex fixed px-5 py-3 shadow-sm shadow-gray-200 bg-white">
          {/* Back button for mobile view */}
          <button className="mr-2 md:hidden" onClick={onBack}>
            <FaArrowLeft className="text-xl" />
          </button>
          <div className="flex space-x-2">
            {/* Session Image */}
            <img
              className="w-10 h-10 rounded-full bg-pink-200"
              src={sessionImage}
              alt="Session"
            />
            {/* Display Chat Session Name */}
            <span className="text-lg font-bold">{displayName}</span>
          </div>
        </header>

        {/* Displaying the chat messages */}
        <div className="flex flex-col pt-24 px-5 overflow-y-scroll">
          {chatSession.messages.map((message) => (
            <div
              key={message.id}
              className={message.action === "USER" ? "user" : "AI"} // Conditionally apply class based on message action
            >
              {/* Display message content */}
              <div>{message.content}</div>
              {/* Display formatted timestamp */}
              <span>{formatTime(message.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
