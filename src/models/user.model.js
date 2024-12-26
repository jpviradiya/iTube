import mongoose, { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Create an index on the field
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImg: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// pre is middleware hook, on save this will work, this hook encrypt the password field
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if password is not modified then do nothing
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

//! userSchema.methods.   (this will add method to userSchema, this methods use when User object is called specific method)

// decrypt password, methods is object in js
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcryptjs.compare(password, this.password); // this.password is ref to object
};

//* generate access token
userSchema.methods.generateAccessToken = function () {
  // jwt.sign({payload},secretKey,{options})
  return jwt.sign(
    {
      //payload (RHS is fetch from database)
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET, // secret key
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // expiry time
    }
  );
};

//* generate refresh token
userSchema.methods.generateRefreshToken = function () {
  // jwt.sign({payload},secretKey,{options})
  return jwt.sign(
    {
      //payload (RHS is fetch from database)
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, // secret key
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // expiry time
    }
  );
};

export const User = mongoose.model("User", userSchema);
