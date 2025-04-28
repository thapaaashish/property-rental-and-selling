import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/user.model.js";

dotenv.config({
  path: "C:/Users/Ripple/OneDrive/Desktop/College/FINAL YEAR PROJECT/Property Rental/.env",
});

const removeProfileCompletedField = async () => {
  try {
    const mongoUri = process.env.MONGO;

    if (!mongoUri) {
      console.error("❌ MONGO URI is not defined in .env file!");
      return;
    }

    await mongoose.connect(mongoUri);
    console.log("🔌 Connected to MongoDB");

    const result = await User.updateMany(
      { profileCompleted: { $exists: true } },
      { $unset: { profileCompleted: "" } }
    );

    console.log(
      `✅ Removed 'profileCompleted' field from ${result.modifiedCount} users`
    );
  } catch (err) {
    console.error("❌ Error removing 'profileCompleted' field:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

removeProfileCompletedField();
