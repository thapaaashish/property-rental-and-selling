import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { Send, Trash2, Paperclip, Smile, MoreVertical, Check, CheckCheck, Clock, Image, MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  query: { userId: JSON.parse(localStorage.getItem("currentUser"))?._id },
});

const Chat = ({
  userId,
  roomId,
  receiverId,
  receiverAvatar,
  receiverName,
  currentUserAvatar,
}) => {
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(null); // Message ID for context menu
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [lastReadTimestamp, setLastReadTimestamp] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Normalize senderId/receiverId to string
  const normalizeMessage = (msg) => ({
    ...msg,
    senderId:
      typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId,
    receiverId:
      typeof msg.receiverId === "object" ? msg.receiverId._id : msg.receiverId,
  });

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format date for divider
  const formatDateDivider = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Debounce socket message handling
  const handleSocketMessage = useCallback((message) => {
    console.log("Received socket message:", message); // Debug
    setMessages((prevMessages) => {
      const exists = prevMessages.some((msg) => msg._id === message._id);
      if (exists) return prevMessages;
      return [...prevMessages, normalizeMessage(message)];
    });
  }, []);

  // Handle delete message event
  const handleDeleteMessage = useCallback(({ messageId }) => {
    console.log("Received deleteMessage:", messageId); // Debug
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg._id !== messageId)
    );
    setShowContextMenu(null);
  }, []);

  // Track if we're near the bottom of the chat
  const isNearBottom = () => {
    if (!chatContainerRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  useEffect(() => {
    if (!currentUser || !userId || userId !== currentUser._id) {
      console.error("User ID mismatch:", {
        userId,
        currentUserId: currentUser?._id,
      });
      setError("User authentication error. Please sign in again.");
      setIsLoading(false);
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    socket.emit("joinRoom", roomId);

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const messagesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/messages/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.refreshToken}`,
            },
          }
        );
        if (!messagesResponse.ok) {
          throw new Error("Failed to fetch messages");
        }
        const messagesData = await messagesResponse.json();
        console.log("Fetched messages:", messagesData.data); // Debug
        const normalizedMessages = Array.isArray(messagesData.data)
          ? messagesData.data.map(normalizeMessage)
          : [];
        setMessages(normalizedMessages);

        const readResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/mark-read/${roomId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${currentUser.refreshToken}`,
            },
          }
        );
        if (readResponse.ok) {
          const readData = await readResponse.json();
          console.log("Marked messages as read:", readData.data); // Debug
          if (Array.isArray(readData.data) && readData.data.length > 0) {
            setMessages(readData.data.map(normalizeMessage));
            setLastReadTimestamp(new Date());
          }
        } else {
          console.warn("Failed to mark messages as read");
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        setError("Unable to load messages. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    socket.on("message", handleSocketMessage);
    socket.on("deleteMessage", handleDeleteMessage);
    socket.on("typing", (data) => {
      if (data.roomId === roomId && data.userId === receiverId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    // Click outside to close context menu
    const handleClickOutside = () => setShowContextMenu(null);
    document.addEventListener('click', handleClickOutside);

    return () => {
      socket.off("message", handleSocketMessage);
      socket.off("deleteMessage", handleDeleteMessage);
      socket.off("typing");
      socket.emit("leaveRoom", roomId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [roomId, currentUser, userId, receiverId, handleSocketMessage, handleDeleteMessage]);

  useEffect(() => {
    // Only scroll to bottom if we're already near the bottom
    const wasNearBottom = isNearBottom();
    if (wasNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      roomId,
      senderId: userId,
      receiverId,
      content: newMessage,
      timestamp: new Date(),
    };

    console.log("Sending message:", messageData); // Debug

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          body: JSON.stringify(messageData),
        }
      );

      if (response.ok) {
        const savedMessage = await response.json();
        console.log("Saved message:", savedMessage.data); // Debug
        socket.emit("sendMessage", savedMessage.data);
        setNewMessage("");
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  const handleDelete = async (messageId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
        }
      );

      if (response.ok) {
        console.log("Deleted message:", messageId); // Debug
        socket.emit("deleteMessage", { roomId, messageId });
      } else {
        throw new Error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      setError("Failed to delete message. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    socket.emit("typing", { roomId, userId });
  };

  const handleContextMenu = (e, messageId) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(messageId === showContextMenu ? null : messageId);
  };

  // Handle image click
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  // Check if message contains an image URL
  const containsImageUrl = (message) => {
    const urlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
    return urlRegex.test(message);
  };

  // Extract image URL from message
  const extractImageUrl = (message) => {
    const urlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
    const match = message.match(urlRegex);
    return match ? match[0] : null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-50 to-teal-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-teal-500 animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-teal-600 font-medium">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);
  const sortedDates = Object.keys(groupedMessages).sort((a, b) => 
    new Date(a) - new Date(b)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <img
            src={receiverAvatar}
            alt={receiverName}
            className="h-10 w-10 rounded-full object-cover border-2 border-teal-50 shadow-sm"
            onError={(e) => (e.target.src = "/placeholder.svg")}
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {receiverName}
            </h3>
            {isTyping ? (
              <p className="text-xs text-teal-600">typing...</p>
            ) : (
              <p className="text-xs text-gray-500">Last seen recently</p>
            )}
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
      
      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col space-y-2"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm max-w-sm">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Messaging</h3>
              <p className="text-gray-600">
                No messages yet. Send your first message to {receiverName} to start the conversation!
              </p>
            </div>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="space-y-2">
              <div className="flex justify-center my-3">
                <div className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-500 shadow-sm">
                  {formatDateDivider(date)}
                </div>
              </div>
              
              {groupedMessages[date].map((msg, index) => {
                const isSender = msg.senderId.toString() === userId.toString();
                const showAvatar = 
                  index === 0 || 
                  groupedMessages[date][index - 1].senderId.toString() !== 
                  msg.senderId.toString();
                
                const imageUrl = containsImageUrl(msg.content) ? extractImageUrl(msg.content) : null;
                const showContextMenuBtn = isSender && !imageUrl;
                
                return (
                  <div 
                    key={msg._id} 
                    onContextMenu={(e) => handleContextMenu(e, msg._id)}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-1`}
                  >
                    {!isSender && showAvatar && (
                      <img
                        src={receiverAvatar}
                        alt={receiverName}
                        className="h-8 w-8 rounded-full object-cover mr-2 self-end mb-1"
                        onError={(e) => (e.target.src = "/placeholder.svg")}
                      />
                    )}
                    {!isSender && !showAvatar && <div className="w-8 mr-2" />}
                    
                    <div 
                      className={`relative group ${showContextMenuBtn ? 'pr-8' : ''} max-w-xs lg:max-w-md`}
                    >
                      {imageUrl ? (
                        <div 
                          className={`rounded-lg overflow-hidden ${isSender ? 'bg-teal-500' : 'bg-white border border-gray-200'}`}
                          onClick={() => handleImageClick(imageUrl)}
                        >
                          <img 
                            src={imageUrl} 
                            alt="Shared image" 
                            className="max-w-full cursor-pointer"
                            onError={(e) => {
                              // Show text content if image can't load
                              e.target.outerHTML = `<div class="p-3 text-sm ${isSender ? 'text-white' : 'text-gray-800'}">${msg.content}</div>`;
                            }}
                          />
                          <div className={`px-2 py-1 text-xs ${isSender ? 'text-teal-100' : 'text-gray-500'} flex justify-between items-center`}>
                            <span>Image</span>
                            <span className="flex items-center">
                              {formatMessageTime(msg.timestamp)}
                              {isSender && msg.read && <CheckCheck className="h-3 w-3 ml-1" />}
                              {isSender && !msg.read && <Check className="h-3 w-3 ml-1" />}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={`p-3 rounded-lg ${
                            isSender 
                              ? 'bg-teal-500 text-white rounded-tr-none' 
                              : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className="text-xs mt-1 flex justify-end items-center gap-1">
                            <Clock className="h-3 w-3 opacity-75" />
                            <span>{formatMessageTime(msg.timestamp)}</span>
                            {isSender && msg.read && (
                              <CheckCheck className={`h-3 w-3 ${isSender ? 'text-teal-100' : 'text-gray-400'}`} />
                            )}
                            {isSender && !msg.read && (
                              <Check className={`h-3 w-3 ${isSender ? 'text-teal-100' : 'text-gray-400'}`} />
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Context Menu */}
                      {showContextMenu === msg._id && (
                        <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 border border-gray-100">
                          <button
                            onClick={(e) => handleDelete(msg._id, e)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                      
                      {/* Delete button that appears on hover */}
                      {showContextMenuBtn && (
                        <button
                          onClick={(e) => handleContextMenu(e, msg._id)}
                          className="absolute -right-2 top-0 p-1 rounded-full bg-gray-100 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    {isSender && showAvatar && (
                      <img
                        src={currentUserAvatar}
                        alt="You"
                        className="h-8 w-8 rounded-full object-cover ml-2 self-end mb-1"
                        onError={(e) => (e.target.src = "/placeholder.svg")}
                      />
                    )}
                    {isSender && !showAvatar && <div className="w-8 ml-2" />}
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="max-w-4xl max-h-[90vh] overflow-auto p-2">
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-gray-200 bg-white"
      >
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="w-full p-2 pl-3 pr-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full ${
              newMessage.trim() 
                ? 'bg-teal-500 text-white hover:bg-teal-600' 
                : 'bg-gray-200 text-gray-400'
            } transition-colors`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;