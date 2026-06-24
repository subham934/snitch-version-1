=> Understand the problem/ feature we have to implement.
=> Break the solution into multiple small task.
=> Implement the most easy part first.
=> Expand 



Today, we'll see product creation, where we will provide role based access , and also create some API.

problem: Only seller can create a product , and the seller can see the number of products he have created.
-> seller can create new products ✅
  1. Models ✅

  2. API Routes ✅
    a. Routes ✅
      i. product.routes.js ✅
      ii. validation 
    
    b. ImageKit setup ✅
      i. Multer ✅
      ii. Imagekit ✅
        - credentials ✅
        - code setup ✅
          - storage.service.js ✅

    c. controllers ✅
  
  3. Make API protected ✅
    a. middleware ✅
      i. auth.middleware.js ✅
      

-> seller can see products created by him



//========================================================
// lets start with creating models

-----------------------------------
backend/src/models/product.model.js
-----------------------------------

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        enum: ['INR', 'USD', 'GBP', 'JPY', 'EUR'],
        default: 'INR',
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      
      },
    ],
  },
  { timestamps: true }
);

const productModel = mongoose.model("product", productSchema)

export default productModel;


//========================================================
// now lets create routes


--------------------------------------------------------
backend/src/routes/product.routes.js
--------------------------------------------------------

import { Router } from "express";

const router = Router();


export default router;

-------------------------------------------------

// we'll need to make this API protected , for that we'll create a middleware
// this auth.middleware.js will make sure that the request in only coming from seller


------------------------------------------
backend/src/middlewares/auth.middleware.js
------------------------------------------

import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import userModel from '../models/user.model.js';

// THIS middleware ensure that request is coming from seller , or else do nothing.
export const authenticateSeller = async (req, res, next) => {
  // to identify who is the user, buyer or seller, we need token.

  // get token from req
  const token = req.cookies.token;

  // if no token => return error
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // verify token

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'seller') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // to access user everywhere
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// what does this middleware do, this middleware will find the id of the user with JWT token. on the basis of that id, it will put query on database, on the basis of that id it will find the user. and then it will check that the user is seller or not. if the user is seller, it will call next(), else it will return error.


//========================================================

now, let's setup Imagekit and multer

1. At first , we take the private key from imagekit and add it to the .env file.

IMAGEKIT_PRIVATE_KEY=***************************
//========================================================

2. Then we set it up in config.js file:::

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

if(!process.env.IMAGEKIT_PRIVATE_KEY){
  throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in environment variables.")
}

export const config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
};

//========================================================


3. now , we will do the code setup, for that we create a new file called storage.service.js

at first we'll have to install iamgekit

---------------------------------------
backend/src/services/storage.service.js
---------------------------------------

import ImageKit from '@imagekit/nodejs';
import { config } from '../config/config.js';
const client = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATE_KEY, // This is the default and can be omitted
});

export async function uploadFile({buffer, fileName, folder="snitch"}){
    const result = await client.files.upload({
      file: await ImageKit.toFile(buffer),
      fileName,
      folder,
        
    })

    return result
}

//========================================================
now , we need to setup multer, for that we need to install it.
npm i multer

now, let's setup multer inside product.routes.js

------------------------------------
backend/src/routes/product.routes.js
------------------------------------

import express from "express";
import { authenticateSeller } from "../middlewares/auth.middleware.js";
import { createProduct } from "../controllers/product.controller.js";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(), limits: {
    fileSize: 1024*1024*5,
  }
})


const router = express.Router();

router.post('/', authenticateSeller, upload.array('images', 7), createProduct)
// maximum ak product ki 7 image ho sakti hai

export default router;



//========================================================

Now, finally let's create the controller ::

---------------------------------------------
backend/src/controllers/product.controller.js
---------------------------------------------
import productModel from '../models/product.model.js';
import { uploadFile } from '../services/storage.service.js';

export async function createProduct(req, res) {
  const { title, description, priceAmount, priceCurrency } = req.body;
  const seller = req.user;

  const images = await Promise.all(
    req.files.map(async (file) => {
      return await uploadFile({
        buffer: file.buffer,
        fileName: file.originalname,
      });
    })
  );

  const product = await productModel.create({
    title,
    description,
    price: {
      amount: priceAmount,
      currency: priceCurrency || 'INR',
    },
    images,
    seller: seller._id,
  });

  return res
    .status(201)
    .json({ message: 'Product created successfully', success: true, product });
}


//========================================================


now, let's create a validator::

------------------------------------------
backend/src/validator/product.validator.js
------------------------------------------

import {body, validationResult} from "express-validator";

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const createProductValidator =[
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priceAmount').isNumeric().withMessage('Price must be a number'),
  body('priceCurrency').notEmpty().withMessage('Currency is required'),
  validateRequest,
]


//========================================================


now, we need to use this validator in routes::


------------------------------------
backend/src/routes/product.routes.js
------------------------------------

import express from "express";
import { authenticateSeller } from "../middlewares/auth.middleware.js";
import { createProduct } from "../controllers/product.controller.js";
import multer from "multer";
import { createProductValidator } from "../validator/product.validator.js";

const upload = multer({
  storage: multer.memoryStorage(), limits: {
    fileSize: 1024*1024*5,
  }
})


const router = express.Router();

router.post('/', authenticateSeller,createProductValidator ,upload.array('images', 7), createProduct)


export default router;


//========================================================


finally, we'll make changes in app.js

------------------------------------
backend>src>app.js
------------------------------------

import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config/config.js";
import productRouter from "./routes/product.routes.js";
const app = express();


app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter)
export default app;


//========================================================


