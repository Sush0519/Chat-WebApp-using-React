import { useEffect, useState } from "react";
import "./App.css";
import Header from "./Header";
import ChatList from "./ChatList";
import ChatDisplay from "./ChatDisplay";

function App() {
  // State to keep track of the currently selected chat session ID
  const [sessionId, setSessionId] = useState<number | null>(null);
  // State to keep track of the session image URL
  const [sessionImage, setSessionImage] = useState<string>("");
  // State to determine if the viewport is mobile-sized
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Function to check if the window is in mobile view
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768); // Set isMobile based on window width
  };

  useEffect(() => {
    handleResize(); // Check initial size on mount
    window.addEventListener("resize", handleResize); // Add event listener for window resize

    // Cleanup function to remove the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Function to handle session selection
  const handleSelectSession = (id: number, image: string) => {
    setSessionId(id); // Set the selected session ID
    setSessionImage(image); // Set the image for the selected session
  };

  // Function to handle back navigation
  const handleBack = () => {
    setSessionId(null); // Reset the selected session ID
    setSessionImage(""); // Clear the session image
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Header /> {/* Render the header component */}
      {isMobile ? (
        // Mobile View
        sessionId ? (
          // If a session is selected, show ChatDisplay
          <ChatDisplay
            sessionId={sessionId}
            sessionImage={sessionImage}
            onBack={handleBack} // Pass back handler
          />
        ) : (
          // If no session is selected, show ChatList
          <ChatList onSelectSession={handleSelectSession} />
        )
      ) : (
        // Desktop View
        <>
          <ChatList onSelectSession={handleSelectSession} />
          {sessionId ? (
            // If a session is selected, show ChatDisplay
            <ChatDisplay
              sessionId={sessionId}
              sessionImage={sessionImage}
              onBack={handleBack} // Pass back handler
            />
          ) : (
            // If no session is selected, show an empty ChatDisplay
            <ChatDisplay
              sessionId={null}
              sessionImage={sessionImage}
              onBack={handleBack} // Pass back handler
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
