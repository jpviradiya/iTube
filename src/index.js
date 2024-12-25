import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// mordern syntax to work with dotenv package
dotenv.config({
  path: "./.env",
});

// connecting to the database
connectDB()
  // if db connects successfully then .then is call otherwise .catch is called
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`App is listing on port ${process.env.PORT}`);
    });
  })
  .catch(() => {
    console.log("Error connecting to database");
  });
