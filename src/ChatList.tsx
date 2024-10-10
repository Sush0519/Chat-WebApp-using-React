import { useEffect, useRef, useState } from "react";
import { getLatestMessageTimestamp } from "./utils/calculateTimeAgo";
import { IoSearch } from "react-icons/io5";
import { ImSpinner } from "react-icons/im";

interface Message {
  timestamp: string;
}

interface ChatSession {
  id: number;
  name: string;
  messages: Message[];
  latestMessageTimestamp: string;
  image?: string;
}

export default function ChatList({
  onSelectSession,
}: {
  onSelectSession: (sessionId: number, sessionImage: string) => void;
}) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const images = [
    `${process.env.PUBLIC_URL}/Images/Profile1.png`,
    `${process.env.PUBLIC_URL}/Images/Profile2.png`,
    `${process.env.PUBLIC_URL}/Images/Profile3.png`,
    `${process.env.PUBLIC_URL}/Images/Profile4.png`,
  ];

  // Fetch chat sessions from the API
  const fetchChatSessions = async (page: number) => {
    if (isLoading || (totalPages && currentPage > totalPages)) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://admin-backend-docker-india-306034828043.asia-south2.run.app/nlp/api/chat_sessions?page=${page}&per_page=9`
      );
      const data = await response.json();

      if (data.chat_sessions && Array.isArray(data.chat_sessions)) {
        const updatedData = data.chat_sessions.map((session: ChatSession) => ({
          ...session,
          name: session.name.replace("Chat Session about ", ""),
          latestMessageTimestamp: getLatestMessageTimestamp(session.messages),
          image: getRandomImage(),
        }));

        // Update chat sessions and total pages
        setChatSessions((prevSessions) => [...prevSessions, ...updatedData]);
        setFilteredSessions((prevSessions) => [
          ...prevSessions,
          ...updatedData,
        ]);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatSessions(currentPage);
  }, [currentPage]);

  // Handle search input
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const filtered = chatSessions.filter((session) => {
        const sessionName = session.name.toLowerCase().trim();
        return (
          sessionName.startsWith(searchQuery.toLowerCase()) &&
          sessionName !== searchQuery.toLowerCase() &&
          sessionName !== "sessionname"
        );
      });

      setFilteredSessions(filtered);
    } else {
      setFilteredSessions(chatSessions);
    }
  };

  // Handle infinite scroll logic
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrolledToMidpoint = scrollTop + clientHeight >= scrollHeight / 2;

    // Load more sessions if the user scrolls past midpoint
    if (scrolledToMidpoint && !isLoading && currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // Get random image for session
  const getRandomImage = () => {
    return images[Math.floor(Math.random() * images.length)];
  };

  return (
    <div
      className="w-full md:w-[29rem] h-screen  flex justify-start pt-[2rem] bg-white overflow-y-scroll hide-scrollbar"
      onScroll={handleScroll}
      ref={containerRef}
    >
      <div className="w-full space-y-32 px-4 border-l-gray-200">
        {/* Search and page navigation */}
        <div className="w-full pl-1 fixed text-2xl z-50 mb-2 py-4 font-bold bg-white">
          Messaging{" "}
          <span className="font-thin">
            <span className="font-normal px-1 py-[0.9px] text-lg rounded-md border-2 border-gray-400">
              {currentPage}
            </span>
            |
            <span className=" font-normal px-1 py-[0.9px] text-lg rounded-md border-2 border-gray-400">
              {totalPages}
            </span>
          </span>
          {/* Search Input */}
          <div className="font-normal items-center mt-2 flex">
            <input
              type="text"
              placeholder="Search by session name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border focus:outline-none  text-sm h-10 w-52 py-1 px-2 rounded-s-lg "
            />
            <button
              onClick={handleSearch}
              className="w-10 h-10 flex text-xl items-center justify-center bg-violet-500 rounded-e-lg text-white"
            >
              <IoSearch />
            </button>
          </div>
        </div>

        {/* Display filtered sessions */}
        <div>
          {searchQuery && filteredSessions.length === 0 && (
            <p className="text-lg font-bold flex justify-center">
              No chat sessions found for "
              <span className="text-blue-600">{searchQuery}</span> "
            </p>
          )}

          {/* Render chat sessions */}
          {filteredSessions.map((session, index) => (
            <div key={`${session.id}-${index}`}>
              <div
                className="rounded-xl hover:bg-[#c5cfe9] mt-1 py-2 bg-white cursor-pointer border-b-[1px] border-r-[1px] border-gray-200"
                onClick={() => {
                  const imageToPass = session.image || "";
                  onSelectSession(session.id, imageToPass);
                }}
              >
                <div className="flex px-3">
                  <img
                    className="w-16 h-14 rounded-full bg-pink-200"
                    src={session.image || getRandomImage()}
                    alt=""
                  />
                  <div className="flex w-full px-2">
                    <span className="me-auto font-bold">{session.name}</span>
                    <span className="text-xs font-thin text-gray-400">
                      {session.latestMessageTimestamp
                        ? session.latestMessageTimestamp
                        : "No timestamp"}
                    </span>
                  </div>
                </div>
              </div>

              {index < filteredSessions.length - 1 && (
                <div className="border-b-[1px] py-1 mx-5 border-gray-300"></div>
              )}
            </div>
          ))}

          {/* Loading spinner */}
          {isLoading && (
            <div className="flex justify-center mt-96 space-x-2 items-center">
              <ImSpinner className="animate-spin text-3xl text-[#4946a5]" />
              <p>Loading more sessions...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
