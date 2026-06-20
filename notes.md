so, we are creating snitch.com

at first , install the following:

npm init -y
npm i express mongoose dotenv jsonwebtoken cookie-parser morgan express-validator



----------
src/app.js
----------

import express from "express";
import morgan from "morgan";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

export default app;


---------
server.js
---------

import dotenv from "dotenv";
import app from "./src/app.js";
import { connectDB } from "./src/config/database.js";


dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

----------------------
src/config/database.js
----------------------

import mongoose from 'mongoose';
import { config } from './config.js';
export async function connectDB() {
  const connection = await mongoose.connect(config.MONGO_URI);
  console.log(`MongoDB connected`);

  return connection;
}


--------------------
src/config/config.js
--------------------

import dotenv from 'dotenv';
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI is not defined in environment variables');
}

export const config = {
  MONGO_URI: process.env.MONGO_URI,
};


now we will create a user model


--------------------
src/models/user.model.js
--------------------
import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    email: {type: String, unique: [true, "Email already exists"], required: true},
    contact: {type: String, required: true},
    password: {type: String, required: true},
    fullname: {type: String, required: true},
    role:{
        type: String,
        enum: ["buyer", "admin"],
        default: "buyer"
    }
})

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("user", userSchema);

export default userModel;


//=====================================

now , i'll create a controller, but before that i'd need a validator::



-------------------------------
src/validator/auth.validator.js
-------------------------------

import { body, validationResult } from 'express-validator';

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
}

export const validateRegisterUser = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('contact')
    .notEmpty()
    .withMessage('Contact is required')
    .matches(/^\d{10}$/)
    .withMessage('Contact must be a 10-digit number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullname')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3 })
    .withMessage('Full name must be at least 3 characters long'),

  validateRequest,
];


=> auth.validator.js ka kaam hai controller tak request pahunchne se pehle data ko check karna. Agar user galat data bhejta hai, toh controller run hi nahi hoga.

-> auth.validator.js ek middleware collection hai jo registration request ko verify karta hai. Agar email, contact, password, ya fullname invalid ho, toh request ko controller tak pahunchne se pehle hi reject kar deta hai.


//=============================================
now let's create the controller::


=============================================
src/controllers/auth.controller.js
=============================================
import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

async function sendTokenResponse(user, res) {
  const token = jwt.sign({ id: user._id }, config.JWT_SECRET);
}

export const register = async (req, res) => {
  // this is the data that will be sent to the database, this data is coming from the client
  const { email, contact, password, fullname } = req.body;

  try {
    // Checking for an existing user
    const existingUser = await userModel.findOne({
      $or: [{ email }, { contact }],
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await userModel.create({
      email,
      contact,
      password,
      fullname,
    });

    //  A new user is saved in MongoDB.
    // Because my model has a pre("save") middleware, the password is hashed before being stored.
    //The role is not supplied, so the schema’s default "buyer" role is used.

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};



//=============================================

Let's create routes:::

-----------------------
src/routes/auth.routes.js
-----------------------
import { Router } from 'express';
import { validateRegisterUser } from '../validator/auth.validator.js';
import { register } from '../controllers/auth.controller.js';
const router = Router();

router.post('/register', validateRegisterUser, register);

export default router;




//=============================================
finally , i'll make changes in app.js

-------------------
src/app.js
-------------------

import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);

export default app;
