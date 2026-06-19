import { DB_NAME } from "../constant.js";
import mongoose from "mongoose";
import dns from "dns";

//for some reason atlas don't run on my network without this
dns.setServers(["8.8.8.8"]);

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.DB_CONNECTION_STRING}/${DB_NAME}`,
    );
    console.log(`\nMongoDB connected: ${connection.connection.host}`);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

export default connectDB;
