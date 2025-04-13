import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/user.model.js";

// Load .env from the root directory
dotenv.config({
  path: "C:/Users/Ripple/OneDrive/Desktop/College/FINAL YEAR PROJECT/Property Rental/.env",
});

console.log("MONGO variable from .env:", process.env.MONGO);

const runUpdate = async () => {
  try {
    const mongoUri = process.env.MONGO;

    if (!mongoUri) {
      console.error("❌ MONGO URI is not defined in .env file!");
      return;
    }

    await mongoose.connect(mongoUri);
    console.log("🔌 Connected to MongoDB");

    const usersToUpdate = await User.find({
      $or: [
        { bio: { $exists: false } }, // Missing
        { bio: { $type: "object" } }, // Not a string
        { $expr: { $gt: [{ $strLenCP: "$bio" }, 200] } }, // Too long
      ],
    });

    console.log(`📊 Found ${usersToUpdate.length} users to update`);

    const defaultBio = "This user hasn't added a bio yet.";
    let updatedCount = 0;

    for (const user of usersToUpdate) {
      const bio =
        typeof user.bio === "string" ? user.bio.slice(0, 200) : defaultBio;

      await User.updateOne(
        { _id: user._id },
        {
          $set: { bio },
        }
      );

      updatedCount++;
      console.log(`🔄 Updated user ${user._id}`);
    }

    console.log(`✅ Successfully updated ${updatedCount} users`);
  } catch (err) {
    console.error("❌ Error updating documents:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

runUpdate();
