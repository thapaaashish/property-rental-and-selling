import React, { useState, useEffect } from "react";
import Chat from "../Chat";
import {
  MessageSquare,
  Search,
  ChevronLeft,
  Settings,
  ArrowLeft,
} from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

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
                lastMessageTime: conv.lastMessage?.timestamp
                  ? new Date(conv.lastMessage.timestamp)
                  : null,
                unreadCount: conv.unreadCount || 0,
              };
            })
          : [];
        formattedConversations.sort((a, b) => {
          if (!a.lastMessageTime) return 1;
          if (!b.lastMessageTime) return -1;
          return b.lastMessageTime - a.lastMessageTime;
        });
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
      if (window.innerWidth < 768) {
        setShowSidebar(false);
        setIsMobileView(true);
      }
    }

    fetchConversations();

    socket.on("updateUnreadCount", fetchConversations);
    socket.on("deleteMessage", fetchConversations);

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      if (!isMobile) {
        setShowSidebar(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      socket.off("updateUnreadCount");
      socket.off("deleteMessage");
      window.removeEventListener("resize", handleResize);
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

    if (isMobileView) {
      setShowSidebar(false);
    }
  };

  const handleBackToConversations = () => {
    setShowSidebar(true);
    setSelectedConversation(null);
    navigate("/messages", { replace: true });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.receiverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-teal-800 font-medium">
            Loading conversations...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="text-red-500 text-lg mb-4">Error</div>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchConversations}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 mt-4 min-h-max py-4 md:py-8 px-2 md:px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 min-h-0 h-[90vh] md:h-[75vh]">
          <div className="flex h-full min-h-0 relative">
            {/* Mobile overlay for sidebar */}
            {isMobileView && showSidebar && selectedConversation && (
              <div
                className="absolute inset-0 bg-black bg-opacity-50 z-20"
                onClick={() => setShowSidebar(false)}
              />
            )}

            {/* Conversations Sidebar */}
            <div
              className={`
              ${
                isMobileView
                  ? showSidebar
                    ? "absolute inset-y-0 left-0 w-full z-30 transform translate-x-0"
                    : "absolute inset-y-0 left-0 w-full z-30 transform -translate-x-full"
                  : "w-1/3 lg:w-1/4 relative"
              } 
              border-r border-gray-200 flex flex-col h-full min-h-0 bg-gray-50 transition-transform duration-300 ease-in-out
            `}
            >
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-teal-700 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Messages
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-teal-600 p-1 rounded-full hover:bg-gray-100">
                      {/* <Settings className="h-5 w-5" /> */}
                    </button>
                    {isMobileView && (
                      <button
                        onClick={() => setShowSidebar(false)}
                        className="text-gray-400 hover:text-teal-600 p-1 rounded-full hover:bg-gray-100 md:hidden"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3 relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                    {searchTerm
                      ? "No matching conversations found"
                      : "No conversations yet"}
                    <p className="text-sm mt-2 text-gray-400">
                      {searchTerm
                        ? "Try a different search term"
                        : "Start a conversation to begin messaging"}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.roomId}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-4 cursor-pointer flex items-center space-x-3 transition-all border-l-4 ${
                        selectedConversation?.roomId === conv.roomId
                          ? "bg-gradient-to-r from-teal-50 to-white border-l-teal-500"
                          : "border-l-transparent hover:bg-gray-50"
                      } border-b border-gray-100`}
                    >
                      <div className="relative">
                        <img
                          src={conv.receiverAvatar}
                          alt={conv.receiverName}
                          className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                          onError={(e) => (e.target.src = "/placeholder.svg")}
                        />
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p
                            className={`font-medium ${
                              conv.unreadCount > 0
                                ? "text-teal-800"
                                : "text-gray-800"
                            } truncate`}
                          >
                            {conv.receiverName}
                          </p>
                          {conv.lastMessageTime && (
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {formatLastMessageTime(conv.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm truncate ${
                            conv.unreadCount > 0
                              ? "text-gray-800 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {conv.lastMessage || "No messages"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div
              className={`flex-1 flex flex-col min-h-0 ${
                isMobileView && showSidebar ? "hidden" : ""
              }`}
            >
              {selectedConversation ? (
                <div className="h-full flex flex-col min-h-0">
                  {/* Mobile header with back button */}
                  {isMobileView && (
                    <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between shadow-sm md:hidden">
                      <button
                        onClick={handleBackToConversations}
                        className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        <span className="font-medium">Back</span>
                      </button>
                      <div className="flex items-center space-x-3">
                        <img
                          src={selectedConversation.receiverAvatar}
                          alt={selectedConversation.receiverName}
                          className="h-8 w-8 rounded-full object-cover border-2 border-teal-50"
                          onError={(e) => (e.target.src = "/placeholder.svg")}
                        />
                        <span className="font-semibold text-gray-800 truncate max-w-32">
                          {selectedConversation.receiverName}
                        </span>
                      </div>
                      <div className="w-12"></div>
                    </div>
                  )}

                  {/* Chat component */}
                  <div className="flex-1 min-h-0">
                    <Chat
                      userId={currentUser._id}
                      roomId={selectedConversation.roomId}
                      receiverId={selectedConversation.receiverId}
                      receiverAvatar={selectedConversation.receiverAvatar}
                      receiverName={selectedConversation.receiverName}
                      currentUserAvatar={
                        currentUser.avatar || "/placeholder.svg"
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-0 bg-gradient-to-r from-blue-50 to-teal-50 p-8 memorized-text-center">
                  <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="h-10 w-10 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      No conversation selected
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Select a conversation from the list to start messaging or
                      search for a specific contact.
                    </p>
                    {isMobileView && (
                      <button
                        onClick={() => setShowSidebar(true)}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                      >
                        View Conversations
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
