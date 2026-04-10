// src/tests/testUser.js
import mongoose from "mongoose";
import { User } from "../models/userSchema.js";
import { connectDB } from "../configs/db.js";

const runTest = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log("Creating a dummy user...");
    const plainPassword = "superSecretPassword123";

    // 1. Create the user object in memory (Middleware has NOT run yet)
    const testUser = new User({
      username: "testman",
      email: "testman@test.com",
      password: plainPassword,
    });

    // 2. Save the user (This triggers Mongoose to run the pre-save hook and provide 'next')
    const savedUser = await testUser.save();

    // 3. The Test Assertion
    if (savedUser.password !== plainPassword) {
      console.log("TEST PASSED: Password was successfully hashed!");
      console.log(`Original: ${plainPassword}`);
      console.log(`Hashed: ${savedUser.password}`);
    } else {
      console.error("TEST FAILED: Password was saved as plain text!");
    }

    // Cleanup: Delete the dummy user so we don't clog up the database
    await User.deleteOne({ email: "testman@test.com" });
    console.log("Test user cleaned up.");
  } catch (error) {
    console.error("TEST CRASHED:", error);
  } finally {
    // Close the database connection so the script actually stops
    mongoose.connection.close();
  }
};

runTest();
