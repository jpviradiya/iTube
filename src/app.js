import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// defining cors configrations
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  Credentials: true,
};

//! use method is call when middleware or configration is needed

// migrate frontend with backend to access the backend from frontend
app.use(cors(corsOptions));

// accepting json data with limit of 16kb
app.use(express.json({ limit: "16kb" }));

// encode url data
app.use(express.urlencoded({ limit: "16kb" }));

// store static file with folder name public
app.use(express.static("public"));

// CRUD user cookie from server
app.use(cookieParser());

//! importing routes
import { userRouter } from "./routes/index.js";

//! declaring routes
app.use("/api/v1/users", userRouter); // call user routes

export { app };
