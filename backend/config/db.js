import mongoose from "mongoose";

const wait = (duration) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

const connectDB = async () => {
  const maxRetries = Number(process.env.DB_CONNECT_RETRIES || 5);
  const retryDelayMs = Number(process.env.DB_RETRY_DELAY_MS || 5000);

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log(`Successfully connected to mongoDB 👍`);
      return mongoose.connection;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt}/${maxRetries} failed: ${error.message}`
      );

      if (attempt === maxRetries) {
        throw error;
      }

      await wait(retryDelayMs);
    }
  }
};

export default connectDB;
