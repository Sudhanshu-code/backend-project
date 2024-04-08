import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );

    console.log(
      `\n MonogoDB connected !! DB HOST: ${connectInstance.connection.host}`
    );
  } catch (error) {
    console.log("DB connection error: ", error);
    process.exit(1);
  }
};

export default connectDB;
