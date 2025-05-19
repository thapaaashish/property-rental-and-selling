import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import Popup from "../components/common/Popup";
import { generateRoomId } from "../utils/roomId";

const API_BASE = import.meta.env.VITE_API_URL;

const StartChatButton = ({
  receiverId,
  receiverEmail,
  buttonText = "Start Chat",
  className = "",
}) => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartChat = async () => {
    if (!currentUser) {
      setError("You need to be logged in to start a chat");
      return; // ⛔ Don't continue execution
    }

    if (!receiverId && !receiverEmail) {
      console.error("Receiver ID or email is required");
      setError("Unable to start chat: Receiver not specified");
      return;
    }

    if (receiverId && receiverId === currentUser._id) {
      console.error("Cannot start chat with yourself");
      setError("You cannot start a chat with yourself");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let fetchedReceiverId = receiverId;
      let receiverName = "Unknown User";
      let receiverAvatar = "/placeholder.svg";

      if (!receiverId || receiverEmail) {
        const endpoint = receiverId
          ? `${API_BASE}/api/user/by-id/${receiverId}`
          : `${API_BASE}/api/user/by-email?email=${encodeURIComponent(
              receiverEmail
            )}`;
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error("User not found");
          throw new Error("Failed to fetch user details");
        }

        const userData = await response.json();
        fetchedReceiverId = userData._id;
        receiverName = userData.fullname || "Unknown User";
        receiverAvatar = userData.avatar || "/placeholder.svg";

        if (fetchedReceiverId === currentUser._id) {
          throw new Error("You cannot start a chat with yourself");
        }
      }

      if (!fetchedReceiverId) {
        throw new Error("Receiver ID not returned from API");
      }

      const roomId = generateRoomId(currentUser._id, fetchedReceiverId);
      navigate(`/messages?roomId=${roomId}&receiverId=${fetchedReceiverId}`, {
        state: {
          agentAvatar: receiverAvatar,
          agentName: receiverName,
        },
      });

      // ✅ Only show success popup after successful navigation
      setShowPopup(true);
    } catch (error) {
      console.error("Error starting chat:", error.message);
      setError(
        error.message === "User not found" ||
          error.message === "You cannot start a chat with yourself"
          ? error.message
          : `Failed to start chat: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleStartChat}
        disabled={isLoading}
        className={`flex items-center justify-center px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-all text-sm disabled:bg-teal-300 disabled:cursor-not-allowed ${className}`}
        aria-label={`Start chat with ${receiverEmail || "user"}`}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
        ) : (
          <MessageSquare className="h-4 w-4 mr-2" />
        )}
        {buttonText}
      </button>
      {showPopup && (
        <Popup
          message="Conversation started!"
          type="success"
          duration={3000}
          onClose={() => setShowPopup(false)}
        />
      )}
      {error && (
        <Popup
          message={error}
          type="error"
          duration={5000}
          onClose={() => setError(null)}
        />
      )}
    </>
  );
};

export default StartChatButton;
