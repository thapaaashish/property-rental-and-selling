import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const saveMessage = async (req, res) => {
  try {
    const { roomId, senderId, receiverId, content, timestamp } = req.body;

    // Validate required fields
    if (!roomId || !senderId || !receiverId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify sender and receiver exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Sender or receiver not found" });
    }

    const message = new Message({
      roomId,
      senderId,
      receiverId,
      content,
      timestamp,
      read: false,
    });

    const savedMessage = await message.save();
    res.status(201).json({ data: savedMessage });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate roomId
    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.status(200).json({ data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get conversations (updated to include unread counts)
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$roomId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", userId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            otherUserId: {
              $cond: [
                { $eq: ["$lastMessage.senderId", userId] },
                "$lastMessage.receiverId",
                "$lastMessage.senderId",
              ],
            },
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$otherUserId"] } } },
            { $project: { _id: 1, fullname: 1, avatar: 1 } },
          ],
          as: "participants",
        },
      },
      { $unwind: "$participants" },
      {
        $project: {
          roomId: "$_id",
          lastMessage: { content: 1, timestamp: 1 },
          participants: 1,
          unreadCount: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get number of user with unread messages
// This endpoint returns the count of unique senders who have sent unread messages to the current user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get distinct senders who have sent unread messages to the current user
    const unreadConversations = await Message.distinct("senderId", {
      receiverId: userId,
      read: false,
    });

    // Return the count of unique senders with unread messages
    res.json({
      success: true,
      unreadCount: unreadConversations.length,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Mark messages as read for a room
export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;

    // Mark messages as read
    await Message.updateMany(
      { roomId, receiverId: userId, read: false },
      { $set: { read: true } }
    );

    // Fetch updated messages without populating senderId/receiverId
    const messages = await Message.find({ roomId })
      .sort({ timestamp: 1 })
      .lean(); // Use lean() to avoid Mongoose documents

    res.status(200).json({ data: messages });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get unread message count for a user
export const getUnreadMessagesCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      read: false,
    });
    res.status(200).json({ success: true, data: unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the user is the sender
    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this message" });
    }

    // Delete the message
    await Message.deleteOne({ _id: messageId });
    console.log(`Deleted message ${messageId} by user ${userId}`); // Debug
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Server error" });
  }
};
