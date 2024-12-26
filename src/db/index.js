import mongoose from "mongoose";
import { DB_NAME } from "./../constants.js";

//use async funtion to connect to db
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
  } catch (err) {
    console.error("MONGODB:", err);
    process.exit(1); // Code: 0 or 1. 0 complete without fail, 1 terminates with failure.
  }
};
export default connectDB;
