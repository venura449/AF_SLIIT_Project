const mongoose = require("mongoose");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = async function setupDatabase() {
  const maxRetries = 10;
  const retryDelay = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });

      // Ensure the collection exists
      const db = mongoose.connection;
      await db.createCollection("users").catch(() => {});
      await mongoose.disconnect();
      console.log("Database setup complete");
      return;
    } catch (error) {
      console.log(
        `MongoDB connection attempt ${attempt}/${maxRetries} failed: ${error.message}`,
      );
      if (attempt === maxRetries) {
        throw error;
      }
      await sleep(retryDelay);
    }
  }
};
