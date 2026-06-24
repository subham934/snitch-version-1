When a user clicks on **"Register with Google"**, a request is sent to the server at `http://localhost:3000/api/auth/google`. The server then redirects the user's browser to Google's login page.

The user signs in with their Google account, and Google asks whether the user wants to share their information with the application. The user can either grant or deny permission.

If the user grants permission, Google generates an **Authorization Code (Auth Code)** and redirects the user's browser back to the application's callback URL. The Auth Code is included as a query parameter in the redirect URL.

For example:

```txt
http://localhost:3000/api/auth/google/callback?code=ABC123
```

At this point, the **browser (client)** receives the Auth Code because it receives the redirect URL from Google. The browser then automatically makes a request to the callback URL, sending the Auth Code to the server as part of the request.

The server extracts the Auth Code from the request and sends it to Google's token endpoint along with its **Client ID** and **Client Secret**. Google verifies the Auth Code and, if valid, returns an **Access Token** to the server.

The server then uses the Access Token to request the user's profile information from Google. Google responds with the user's data, such as their name, email address, and profile picture. The server can then create a new account or log the user into an existing account.

Google uses an Authorization Code instead of directly sending user data because it provides an additional layer of security. The Auth Code is a short-lived, one-time-use credential that proves the user has granted permission. Before accessing any user data, the server must exchange the Auth Code for an Access Token using its Client ID and Client Secret. This allows Google to verify the identity of the application and ensures that sensitive credentials are never exposed to the browser.


Google → Browser (Auth Code)
Browser → Server (Auth Code)
Server → Google (Auth Code + Client Secret)
Google → Server (Access Token)
Server → Google (User Info Request)
Google → Server (User Data)


=> when the API /api/auth/google/callback get's hit, the first code that runs is passport.authenticate("google", {session: false,}), this code is responsible for taking the authcode from server to google , then google sends the user's data back to the server. the code is available in auth.routes.js. After hitting the code passport.authenticate, we are calling the googleCallback function. the function is in auth.controller.js. 

export const googleCallback = async (req, res) => {
  console.log(req.user);
  res.redirect('http://localhost:5173/');
};

=> it display's the user's data when calling the function , also it redirect us to http://localhost:5173/ 

//=====================================
=> if we go to any signup or login page, we can see that there is a "continue with google" button. if a user signup or login, the user get one button, and with that button , he can either login or signup. 

=> so , in the backend , we'll have to write the logic as such that, either he login or signup , only one controller handle the login and register. 


at first let's make changes in model

--------------------------------
backend/src/models/user.model.js
--------------------------------

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: [true, 'Email already exists'],
    required: true,
  },
  contact: {
    type: String,
    //  required: true
    required: false,
  },
  password: { type: String, 
    required: function(){
      return !this.googleId; // agar googleId hai toh password no-need ,else needed
    }
 },
  fullname: { type: String, required: true },
  role: {
    type: String,
    enum: ['buyer', 'seller'],
    default: 'buyer',
  },
  googleId: { type: String },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model('user', userSchema);

export default userModel;


//========================================

now, let's make changes in controller to save the data , if someone register's with google , then the user get's save in the database with the data they provide , along with the googleId 

------------------------------------------
backend/src/controllers/auth.controller.js
------------------------------------------

import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

async function sendTokenResponse(user, res, message) {
  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('jwt', token);

  res.status(200).json({
    message,
    token,
    success: true,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullname: user.fullname,
      role: user.role,
    },
  });
}

export const register = async (req, res) => {
  // this is the data that will be sent to the database, this data is coming from the client
  const { email, contact, password, fullname, isSeller } = req.body;

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
      role: isSeller ? 'seller' : 'buyer',
    });
    //  A new user is saved in MongoDB.
    // Because my model has a pre("save") middleware, the password is hashed before being stored.
    //The role is not supplied, so the schema’s default "buyer" role is used.

    await sendTokenResponse(user, res, 'User registered successfully');
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    await sendTokenResponse(user, res, 'User logged in successfully');
  } catch (error) {
    res.status(500).json({ message: 'Error logging in user', error });
  }
};

export const googleCallback = async (req, res) => {
  // console.log(req.user);

  const { id, displayName, emails, photos } = req.user;
  const email = emails[0].value;
  const profilePic = photos[0].value;

  let user = await userModel.findOne({ email });
  if (!user) {
    // Create a new user if not found
    user = await userModel.create({
      email,
      fullname: displayName,
      profilePic,
      googleId: id,
      // role: 'buyer', // Default role for Google users
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );

  res.cookie('token', token);

  res.redirect('http://localhost:5173/');
};

// here, after the register & login, the user is being redirected to the frontend, now the user's data is also being saved in the database, along with the googleId.


//========================================

Let's also make some changes in routes too.

------------------------------------
backend/src/routes/auth.routes.js
------------------------------------


import { Router } from 'express';
import { validateRegisterUser, validateLoginUser } from '../validator/auth.validator.js';
import { register, login, googleCallback } from '../controllers/auth.controller.js';
import { config } from '../config/config.js';
import passport from 'passport';


const router = Router();

router.post('/register', validateRegisterUser, register);
router.post("/login",validateLoginUser, login)

// /api/auth/google
router.get("/google",
    passport.authenticate("google", { scope: [ "profile", "email" ] }))

router.get("/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "http://localhost:5173/login" // this say's that if we're not able to login through google, then redirect us to the login page. 
    }),
    googleCallback,
)


export default router;


//=============================================

We use NODE_ENV to determine whether the application is running in development or production, and based on that environment we can use different URLs and configurations.

------------
backend>.env
------------
NODE_ENV=development

then , we config.js and make changes::

----------------------------
backend>src>config>config.js
----------------------------

import dotenv from 'dotenv';
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI is not defined in environment variables');
}

if(!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

if(!process.env.GOOGLE_CLIENT_ID){
  throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables.")
}

if(!process.env.GOOGLE_CLIENT_SECRET){
  throw new Error("GOOGLE_CLIENT_SECRET is not defined in environment variables.")
}


export const config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development'
};



=> Then, in the routes file, we check the value of NODE_ENV. If it is "development", failed authentication requests are redirected to http://localhost:5173/login. Otherwise, if the application is running in production, users are redirected to /login.

=> We cannot hardcode frontend URLs because they are different in development and production environments. To identify the current environment, we use the NODE_ENV environment variable. When NODE_ENV is "development", failed Google authentication requests are redirected to http://localhost:5173/login. When NODE_ENV is "production", we redirect to /login. Using a relative path such as /login allows the browser to automatically resolve the URL against the current origin. For example, if the application is running on https://snitch.com, the browser will interpret /login as https://snitch.com/login. This makes the application more portable and avoids hardcoding production URLs inside the codebase.

---------------------------------
backend>src>routes>auth.routes.js
---------------------------------

import { Router } from 'express';
import { validateRegisterUser, validateLoginUser } from '../validator/auth.validator.js';
import { register, login, googleCallback } from '../controllers/auth.controller.js';
import { config } from '../config/config.js';
import passport from 'passport';


const router = Router();

router.post('/register', validateRegisterUser, register);
router.post("/login",validateLoginUser, login)

// /api/auth/google
router.get("/google",
    passport.authenticate("google", { scope: [ "profile", "email" ] }))

router.get("/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: config.NODE_ENV === 'development' ? "http://localhost:5173/login" : "/login",
    }),
    googleCallback,
)


export default router;


//=============================================


Now, i'll create a ContinueWithGoogle.jsx component. This component will be used in both login and register pages. 

----------------------------------------------------------------
frontend/src/app/features/auth/components/ContinueWithGoogle.jsx
----------------------------------------------------------------

import React from 'react';

const ContinueWithGoogle = ({ text = 'Continue with Google' }) => {
  return (
    <a
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#dadce0] bg-white px-4 py-3 font-sans text-sm font-medium text-[#3c4043] shadow-xs transition-all hover:bg-[#f8f9fa] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4285f4] focus:ring-offset-2 active:bg-[#f1f3f4] active:scale-[0.98]"
      href="/api/auth/google"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5 min-w-[20px] min-h-[20px]"
        viewBox="0 0 24 24"
      >
        <path
          fill="#4285F4"
          d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
        />
        <path
          fill="#FBBC05"
          d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
        />
      </svg>
      <span>{text}</span>
    </a>
  );
};

export default ContinueWithGoogle;


=> just make changes in Login.jsx and Register.jsx and you are good to go.