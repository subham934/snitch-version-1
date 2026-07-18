today , we will implement the "Add to cart" feature in our  React e-commerce application.

- user can have only one cart.
- user can add the product in cart.
- user can manage the quantity of the cart item [cart item can't have quantity less than 1].

CART SCHEMA :
- userid
- items: [
    {
        product,
        variant,
        quantity,
        price
    }
]


let's create a model for cart

-------------------------------
backend>src>model>cart.model.js
-------------------------------


import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
      },
      variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product.variants',
      },
      quantity: {
        type: Number,
        default: 1
      },
      price: {
        amount: {
          type: Number,
          required: true,
        },
        currency: {
          type: String,
          enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR'],
          default: 'INR',
        },
      },
    },
  ],
});



=> now, as we can see that the price schema is getting repeated multiple times, in product.model.js , we have used price schema twice and in cart.model.js also we have used price schema. this create redundancy.

=> To avoid this redundancy, we can create a schema for price and use it in both product.model.js and cart.model.js

----------------------------------
backend>src>models>price.schema.js
----------------------------------

import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR'],
      default: 'INR',
    },
  },
  { _id: false, _v: false }
);

export default priceSchema;



now that the schema is done, we'll make changes in cart.model.js and product.model.js

//===================================

--------------------------------
backend>src>models>cart.model.js
--------------------------------

import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            variant: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product.variants'
            },
            quantity: {
                type: Number,
                default: 1
            },
            price: {
                type: priceSchema,
                required: true
            }
        }
    ]
})

const cartModel = mongoose.model('cart', cartSchema);

export default cartModel;


//===================================

-----------------------------------
backend>src>models>product.model.js
-----------------------------------


import mongoose from 'mongoose';
import priceSchema from './price.schema.js';

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
      type: priceSchema,
      required: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
    variants: [
      {
        images: [
          {
            url: {
              type: String,
              required: true,
            },
          },
        ],
        stock: {
          type: Number,
          default: 0,
        },
        attributes: {
          type: Map,
          of: String,
        },
        price: {
          type: priceSchema,
        },
      },
    ],
  },
  { timestamps: true }
);

const productModel = mongoose.model('product', productSchema);

export default productModel;



//===================================

now that we have created cart.model.js, in cartModel what will happen is , user kisi bhi variant ko add kar sakta hai apni cart k andar. for that we need to create an API

POST /api/cart/add/:productId/:variant

this API will manage the varient and quantity of the cart of any product. bydefault , the quantity will be 1. we'll also set the price for that particular variant in the cart. 


---------------------------------
backend>src>routes>cart.routes.js
---------------------------------

import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validateAddToCart } from '../validator/cart.validator.js';
import { addToCart } from '../controllers/cart.controller.js';

const router = express.Router();

/**
 * @route POST /api/cart/add/:productId/:variantId
 * @desc Add item to cart
 * @access Private
 * @argument productId - ID of product to add
 * @argument variantId - ID of variant to add
 * @argument quantity - Quantity of product to add (optional, default:1)
 */

router.post(
  '/add/:productId/:variantId',
  authenticateUser,
  validateAddToCart,
  addToCart
);

export default router;

//===================================

=> we use authenticateUser to authenticate the user ,see which user is requesting, and add item to which user's cart. 

=> we'll use a validator called cart.validator.js , where we'll validate the incoming request. if the request is valid, it will call next() function. else it will return error.

---------------------------------------
backend>src>validator>cart.validator.js
---------------------------------------

import { param, body, validationResult } from 'express-validator';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateAddToCart = [
  param('productId').isMongoId().withMessage('Invalid product id'),
  param('variantId').isMongoId().withMessage('Invalid variant id'),

  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  validateRequest,
];


//===================================

=> now, finally, we'll create a controller . This controller will perform the logic of adding item to cart.

--------------------------------
backend>src>controllers>cart.controller.js
--------------------------------

import cartModel from '../models/cart.model.js';
import productModel from '../models/product.model.js';

export const addToCart = async (req, res) => {
  const { productId, variantId } = req.params;

  const product = await productModel.findOne({
    _id: productId,
    'variants._id': variantId,
  });

  if (!product) {
    return res.status(404).json({
      message: 'Product or variant not found.',
      success: false,
    });
  }

  // will check ki user ki koi cart exist karti hai ya nahi...
  // agar koi cart nahi hai, toh ak nayi cart bnayenge. verna usi cart k अंदर add krenge.
  let cart =
    (await cartModel.findOne({ user: req.user._id })) ||
    (await cartModel.create({ user: req.user._id }));

  // agar pehle se uss cart k andar same variant id present hai, toh quantity add kr denge,
  // warna add kr denge product ko uss cart k andar.

  const isProductAlreadyInCart = cart.items.some(item => item.product.toString() === productId && item.variant?.toString() === variantId)

  if(isProductAlreadyInCart){
    // aab humko check karna padega ki stock present hai ya nahi
  }
  
};


//===================================

=> maine cart toh create kar diya but ab isme product ki stock k basis pe quantity add karne ka logic likhna hai.

=> we'll use need to check if we have the required stock or not, this "stock checking" will be done multiple times, for that we'll use a dao file.

=> In a MERN stack application, a DAO (Data Access Object) file is a backend file that encapsulates all the direct database operations (like queries and aggregations) for a specific entity, isolating the database logic from the business logic

=> basically, server ko jitne bhi kaam database pe karna rahega , wo dao file k through karta hai.

=> controller directly database main operation perform nahi karte, instead , wo dao file k functions ko call karte hai. and dao file performs database operations.


---------------------------
backend>src>dao>cart.dao.js
---------------------------


import productModel from '../models/product.model.js';

export const stockOfVariant = async (productId, variantId) => {
  const product = await productModel.findOne({
    _id: productId,
    'variants._id': variantId,
  });

  const stock = product.variants.find(
    (variant) => variant._id.toString() === variantId
  ).stock;

  return stock;
};


//===================================


=> aab maine controller ko product add karne ka logic likha hai, and it is as below::

==========================================
backend>src>controllers>cart.controller.js
==========================================

import cartModel from '../models/cart.model.js';
import productModel from '../models/product.model.js';
import { stockOfVariant } from '../dao/product.dao.js';

export const addToCart = async (req, res) => {
  const { productId, variantId } = req.params;
  const { quantity = 1 } = req.body;

  const product = await productModel.findOne({
    _id: productId,
    'variants._id': variantId,
  });

  if (!product) {
    return res.status(404).json({
      message: 'Product or variant not found.',
      success: false,
    });
  }

  // sabse pehle product ka stock check karenge
  const stock = await stockOfVariant(productId, variantId);

  // will check ki user ki koi cart exist karti hai ya nahi...
  // agar koi cart nahi hai, toh ak nayi cart bnayenge. verna usi cart k अंदर add krenge.
  let cart =
    (await cartModel.findOne({ user: req.user._id })) ||
    (await cartModel.create({ user: req.user._id }));

  // agar pehle se uss cart k andar same variant id present hai, toh quantity add kr denge,
  // warna add kr denge product ko uss cart k andar.

  const isProductAlreadyInCart = cart.items.some(
    (item) =>
      item.product.toString() === productId &&
      item.variant?.toString() === variantId
  );

  // agar product already cart mein present hai ,
  if (isProductAlreadyInCart) {
    // aab humko check karna padega ki stock present hai ya nahi

    // hum ak check lgayenge ki agar kisi cart ki item inventory se zyada ho, toh usse nhi add hone dena hai.
    const quantityInCart = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId
    ).quantity;

    if (quantityInCart + quantity > stock) {
      return res.status(400).json({
        message: `Only ${stock} items are available in stock, and you already have ${quantityInCart} items in your cart.`,
        success: false,
      });
    }

    // iska mtlb hai ki stock is present, toh hum uski quantity ko update kar denge.

    await cartModel.findOneAndUpdate(
      {
        user: req.user._id,
        'items.product': productId,
        'items.variant': variantId,
      },
      { $inc: { 'items.$.quantity': quantity } },
      { new: true }
    );

    return res.status(200).json({
      message: 'Cart updated successfully',
      success: true,
    });
  }

  // agar product cart mein present nahi hai , toh usse cart mein add krenge.

  if (quantity > stock) {
    return res.status(400).json({
      message: `Only ${stock} items left in stock`,
      success: false,
    });
  }

  cart.items.push({
    product: productId,
    variant: variantId,
    quantity,
    price: product.price,
  });

  await cart.save();

  return res.status(200).json({
    message: 'Product added to cart successfully',
    success: true,
  });
};
//===================================

now we'll add the api to app.js

------------------
backend>src>app.js
------------------

import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config/config.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
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
app.use("/api/cart", cartRouter);
export default app;


//=====================================

-> now , we will get the cart data , for that we'll create another API

----------------------------
backend>src>routes>cart.routes.js
----------------------------

import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validateAddToCart } from '../validator/cart.validator.js';
import { addToCart, getCart } from '../controllers/cart.controller.js';

const router = express.Router();

/**
 * @route POST /api/cart/add/:productId/:variantId
 * @desc Add item to cart
 * @access Private
 * @argument productId - ID of product to add
 * @argument variantId - ID of variant to add
 * @argument quantity - Quantity of product to add (optional, default:1)
 */

router.post(
  '/add/:productId/:variantId',
  authenticateUser,
  validateAddToCart,
  addToCart
);


/**
 * @route GET /api/cart
 * @desc Get user's cart
 * @access Private
 */

router.get('/', authenticateUser, getCart);

export default router;

//=====================================

for the above route , we need to create a controller

==========================================
backend>src>controllers>cart.controller.js
==========================================

import cartModel from '../models/cart.model.js';
import productModel from '../models/product.model.js';
import { stockOfVariant } from '../dao/product.dao.js';

export const addToCart = async (req, res) => {
  const { productId, variantId } = req.params;
  const { quantity = 1 } = req.body;

  const product = await productModel.findOne({
    _id: productId,
    'variants._id': variantId,
  });

  if (!product) {
    return res.status(404).json({
      message: 'Product or variant not found.',
      success: false,
    });
  }

  // sabse pehle product ka stock check karenge
  const stock = await stockOfVariant(productId, variantId);

  // will check ki user ki koi cart exist karti hai ya nahi...
  // agar koi cart nahi hai, toh ak nayi cart bnayenge. verna usi cart k अंदर add krenge.
  let cart =
    (await cartModel.findOne({ user: req.user._id })) ||
    (await cartModel.create({ user: req.user._id }));

  // agar pehle se uss cart k andar same variant id present hai, toh quantity add kr denge,
  // warna add kr denge product ko uss cart k andar.

  const isProductAlreadyInCart = cart.items.some(
    (item) =>
      item.product.toString() === productId &&
      item.variant?.toString() === variantId
  );

  // agar product already cart mein present hai ,
  if (isProductAlreadyInCart) {
    // aab humko check karna padega ki stock present hai ya nahi

    // hum ak check lgayenge ki agar kisi cart ki item inventory se zyada ho, toh usse nhi add hone dena hai.
    const quantityInCart = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId
    ).quantity;

    if (quantityInCart + quantity > stock) {
      return res.status(400).json({
        message: `Only ${stock} items are available in stock, and you already have ${quantityInCart} items in your cart.`,
        success: false,
      });
    }

    // iska mtlb hai ki stock is present, toh hum uski quantity ko update kar denge.

    await cartModel.findOneAndUpdate(
      {
        user: req.user._id,
        'items.product': productId,
        'items.variant': variantId,
      },
      { $inc: { 'items.$.quantity': quantity } },
      { new: true }
    );

    return res.status(200).json({
      message: 'Cart updated successfully',
      success: true,
    });
  }

  // agar product cart mein present nahi hai , toh usse cart mein add krenge.

  if (quantity > stock) {
    return res.status(400).json({
      message: `Only ${stock} items left in stock`,
      success: false,
    });
  }

  cart.items.push({
    product: productId,
    variant: variantId,
    quantity,
    price: product.price,
  });

  await cart.save();

  return res.status(200).json({
    message: 'Product added to cart successfully',
    success: true,
  });
};


export const getCart = async (req, res) => {
    const user = req.user

    let cart = await cartModel.findOne({ user: user._id }).populate("items.product")

    if (!cart) {
        cart = await cartModel.create({ user: user._id })
    }

    return res.status(200).json({
        message: "Cart fetched successfully",
        success: true,
        cart
    })
}

//=====================================

now, in frontend, we'll see how to store the cart data, and how we'll manage it, for that we need to create a cart slice in our redux store.

---------------------------------------
frontend/src/app/features/cart/state/cart.slice.js
---------------------------------------
import { createSlice } from "@reduxjs/toolkit";


const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
    },
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload;
        },
        addItem: (state, action) => {
            state.items.push(action.payload)
        }
    }
})

export const { setItems, addItem } = cartSlice.actions
export default cartSlice.reducer

//=====================================

now, we need to add this cart slice to our app.store.js

==============================
frontend/src/app/app.store.js
==============================

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/state/auth.slice.js';
import productReducer from './features/products/state/product.slice.js';
import cartReducer from './features/cart/state/cart.slice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
  },
});

//=====================================

now, user will be able to add item to cart. for that we call an API. 

===================================================
frontend/src/app/features/cart/services/cart.api.js
===================================================


import axios from "axios"


const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
})


export const addItem = async ({ productId, variantId }) => {
    const response = await cartApiInstance.post(`/add/${productId}/${variantId}`, {
        quantity: 1
    })

    return response.data
}

//=====================================

now, we will create a hook layer which will manage our state and service layer.

===================================
frontend/src/app/features/cart/hooks/useCart.js
===================================

import { addItem } from "../service/cart.api.js";
import {useDispatch} from "react-redux";
import { addItem as addItemToCart } from "../state/cart.slice.js";



export const useCart = () => {

    const dispatch = useDispatch()

    async function handleAddItem({ productId, variantId }) {
        const data = await addItem({ productId, variantId })

        return data
    }

    return { handleAddItem }

}

//=====================================

we'll make small changes in ProductDetail.jsx, look at the video