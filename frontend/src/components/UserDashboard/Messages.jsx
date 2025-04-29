import React, { useState, useEffect } from "react";
import Chat from "../Chat";
import { MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL;

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  query: { userId: JSON.parse(localStorage.getItem("currentUser"))?._id },
});

const Messages = () => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${currentUser.refreshToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const formattedConversations = Array.isArray(data.data)
          ? data.data.map((conv) => {
              const receiver = conv.participants;
              return {
                roomId: conv.roomId,
                receiverId: receiver._id,
                receiverName: receiver.fullname || "Unknown User",
                receiverAvatar: receiver.avatar || "/placeholder.svg",
                lastMessage: conv.lastMessage?.content,
                unreadCount: conv.unreadCount || 0,
              };
            })
          : [];
        setConversations(formattedConversations);
      } else {
        throw new Error("Failed to fetch conversations");
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError("Unable to load conversations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in");
      return;
    }

    const params = new URLSearchParams(location.search);
    const roomId = params.get("roomId");
    const receiverId = params.get("receiverId");

    if (roomId && receiverId) {
      setSelectedConversation({
        roomId,
        receiverId,
        receiverName: location.state?.agentName || "Unknown User",
        receiverAvatar: location.state?.agentAvatar || "/placeholder.svg",
      });
    }

    fetchConversations();

    socket.on("updateUnreadCount", fetchConversations);
    socket.on("deleteMessage", fetchConversations); // Refresh on message deletion

    return () => {
      socket.off("updateUnreadCount");
      socket.off("deleteMessage");
    };
  }, [location.search, location.state, currentUser, navigate]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    navigate(
      `/messages?roomId=${conversation.roomId}&receiverId=${conversation.receiverId}`,
      {
        replace: true,
        state: {
          agentAvatar: conversation.receiverAvatar,
          agentName: conversation.receiverName,
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-6 bg-white rounded-xl shadow-sm min-h-screen">
        {error}
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row h-[600px] bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Conversations List */}
          <div className="w-full md:w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-teal-700 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Conversations
            </h3>
            {conversations.length === 0 ? (
              <p className="text-gray-500">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.roomId}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-3 rounded-lg cursor-pointer flex items-center space-x-3 ${
                    selectedConversation?.roomId === conv.roomId
                      ? "bg-teal-50"
                      : "hover:bg-gray-50"
                  } mb-2`}
                >
                  <img
                    src={conv.receiverAvatar}
                    alt={conv.receiverName}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => (e.target.src = "/placeholder.svg")}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-800">
                        {conv.receiverName}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage || "No messages"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1">
            {selectedConversation ? (
              <Chat
                userId={currentUser._id}
                roomId={selectedConversation.roomId}
                receiverId={selectedConversation.receiverId}
                receiverAvatar={selectedConversation.receiverAvatar}
                receiverName={selectedConversation.receiverName}
                currentUserAvatar={currentUser.avatar || "/placeholder.svg"}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
