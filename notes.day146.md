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
    1. API
      a. routes
        i. create GET /api/products/seller ✅
        ii. create controller ✅

    2. make API protected ✅
      
    


Let's create the controller first:::


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

export async function getSellerProducts(req, res) {
  const seller = req.user;
  
  const products = await productModel.find({seller: seller._id})

   res.status(200).json({
    message: 'Products fetched successfully',
    success: true,
    products
  })
}


//=================================================

now , that the controller is done , i'll create the route for it::


------------------------------------
backend/src/routes/product.routes.js
------------------------------------
import express from "express";
import { authenticateSeller } from "../middlewares/auth.middleware.js";
import { createProduct, getSellerProducts } from "../controllers/product.controller.js";
import multer from "multer";
import { createProductValidator } from "../validator/product.validator.js";

const upload = multer({
  storage: multer.memoryStorage(), limits: {
    fileSize: 1024*1024*5,
  }
})


const router = express.Router();


/**
 * @route POST api/products
 * @desc create a product
 * @access private
 * @role seller

 */
// one changes has been made here also where i've changed the position of validators , image kit middleware should be before the validator 

router.post('/', authenticateSeller,upload.array('images', 7),createProductValidator , createProduct)

/**
 * @route GET api/products
 * @desc get all products created by the authenticated seller
 * @access private
 * @role seller
 */
router.get('/seller', authenticateSeller, getSellerProducts)


export default router;


//====================================================

now, that the backend for seller's product is done, we'll create a frontend.

problem: we have to create two pages , only accessible by seller, first is create product page, and second is view all created products.



1. create product page
    a. folder Pages ✅
    b. /pages/CreateProduct.jsx ✅
    c. UI of the page
2. view products
    a. folder Pages ✅
3. make page protected 
4. create product hook ✅
    a. import all the service functions ✅
    b. create functions: handleCreateProduct, handleGetSellerProducts ✅

5. manage product state ✅
    a. create product slice✅
        i. features/products/product.slice.js ✅
        
    b. use productg slice in store.✅

6. integrate Backend APIs.✅
    a. /features/products/services/product.api.js ✅
    b. Create function to interact with API ✅
        i. function for creating product ✅ 
        ii. function for getting seller products ✅
        
     
//====================================================

so, let's start with creating API layer:::



-------------------------------------------------------
frontend/src//features/products/services/product.api.js
-------------------------------------------------------

import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true
})

export async function createProduct(formData){
    const response = await productApiInstance.post("/", formData)

    return response.data;
}

export async function getSellerProducts(){
    const response = await productApiInstance.get("/seller")

    return response.data;
}




//====================================================

// STATE LAYER


// MANAGE PRODUCT STATE

---------------------------------------------------------
frontend/src/app/features/products/state/product.slice.js
---------------------------------------------------------


import {createSlice} from "@reduxjs/toolkit";


const productSlice = createSlice({
    name: "product",
    initialState:{
        sellerProducts: []
    },
    reducers:{
        setSellerProducts(state, action){
            state.sellerProducts = action.payload
        }
    }
})

export const {setSellerProducts} = productSlice.actions
export default productSlice.reducer





// we'll update the app.store.js

----------------------------------------------------
frontend/src/app/app.store.js
----------------------------------------------------

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/state/auth.slice.js";
import productReducer from "./features/products/state/product.slice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer
  }
})


//====================================================


// HOOK LAYER::

------------------------------------------------------
frontend/src/app/features/products/hooks/useProduct.js
------------------------------------------------------


import {createProduct, getSellerProducts} from "../services/product.api.js";
import { useDispatch } from "react-redux";
import { setSellerProducts } from "../state/product.slice.js";



export const useProduct = ()=>{
    const dispatch = useDispatch();

    async function handleCreateProduct(formData){
        const data = await createProduct(formData);

        return data.product;
    }

    async function handleGetSellerProduct(){
        const data = await getSellerProducts()
        dispatch(setSellerProducts(data.products))
        return data.products;
    }


    return {
        handleCreateProduct,
        handleGetSellerProduct
    }
} 


//====================================================

Let's start with creating pages::

1. create product page
---------------------------------------------------------
frontend/src/app/features/products/pages/CreateProduct.jsx
---------------------------------------------------------




//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
//====================================================
