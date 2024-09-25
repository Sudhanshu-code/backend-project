import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR: ", error);
    });
    app.listen(process.env.PORT, () => {
      console.log("Mongo DB Connection successfull");
    });
  })
  .catch((error) => {
    console.log("Mongo db connection failed", error);
  });
