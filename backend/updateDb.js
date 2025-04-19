import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/user.model.js";

// Load .env from the root directory
dotenv.config({
  path: "C:/Users/Ripple/OneDrive/Desktop/College/FINAL YEAR PROJECT/Property Rental/.env",
});

console.log("MONGO variable from .env:", process.env.MONGO);

const runKycMigration = async () => {
  try {
    const mongoUri = process.env.MONGO;

    if (!mongoUri) {
      console.error("❌ MONGO URI is not defined in .env file!");
      return;
    }

    await mongoose.connect(mongoUri);
    console.log("🔌 Connected to MongoDB");

    // Find users missing the kyc field or with an invalid kyc structure
    const usersToUpdate = await User.find({
      $or: [
        { kyc: { $exists: false } }, // Missing kyc field
        {
          "kyc.status": {
            $nin: ["not_verified", "pending", "verified", "rejected"],
          },
        }, // Invalid status
      ],
    });

    console.log(`📊 Found ${usersToUpdate.length} users to update`);

    const defaultKyc = {
      documentUrl: null,
      documentType: null,
      status: "not_verified",
      submittedAt: null,
      verifiedAt: null,
      rejectedReason: null,
    };

    let updatedCount = 0;

    for (const user of usersToUpdate) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: { kyc: defaultKyc },
        }
      );

      updatedCount++;
      console.log(`🔄 Updated user ${user._id}`);
    }

    console.log(`✅ Successfully updated ${updatedCount} users with kyc field`);
  } catch (err) {
    console.error("❌ Error updating documents:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

runKycMigration();
