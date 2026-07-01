Today, we need to create the product detail page and inside that page, we need to show the product.


at first , let me change the routes of the frontend


-------------------------------
frontend/src/app/app.routes.jsx
-------------------------------

import { createBrowserRouter } from 'react-router';
import Register from './features/auth/pages/Register';
import Login from './features/auth/pages/Login';
import CreateProduct from './features/products/pages/CreateProduct';
import { TransitionLayout } from './components/TransitionLayout';
import Protected from './features/auth/components/Protected';
import Dashboard from './features/products/pages/Dashboard';
import Home from './features/products/pages/Home';
import ProductDetail from './features/products/pages/ProductDetail';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <TransitionLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: "/product/:productId",
        element: <ProductDetail/>
      },
      {
        path: '/seller',
        children: [
          {
            path: '/seller/dashboard',
            element: (
              <Protected role="seller">
                <Dashboard />
              </Protected>
            ),
          },
          {
            path: '/seller/create-product',
            element: (
              <Protected role="seller">
                <CreateProduct />
              </Protected>
            ),
          },
        ],
      },
    ],
  },
]);

//==========================

we know that inside the Home.jsx , we could see all the products, so i'll just put an onclick function inside a button, so that when we click on that button we will automatically navigate to that particular product.

-------------------------------------------------
frontend/src/app/features/products/pages/Home.jsx
-------------------------------------------------

<button
    onClick={()=> transitionNavigate(`/product/${product._id}`)}
    className="bg-[#1C1917] text-white hover:bg-[#ffbf00] cursor-pointer hover:text-[#1C1917] text-[10px] uppercase font-bold tracking-widest px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
>
    View Drop
</button>

//==========================

now,we will create an API request to fetch the particular product from the database.
let's create a controller

-------------------------------------------------
backend/src/controllers/product.controller.js
-------------------------------------------------

export async function getProductDetails(req, res){
  const {id} = req.params;

  const product = await productModel.findById(id);

  if(!product) {
    return res.status(404).json({
      message: 'Product not found',
      success: false
    })
  }

  return res.status(200).json({
    message: 'Product fetched successfully',
    success: true,
    product
  })
}

//==========================

for the above controller , we need to create a route

-------------------------------------------------
backend/src/routes/product.routes.js
-------------------------------------------------

/**
 * @route GET api/products/detail/:id
 * @desc get a single product by ID
 * @access public
 */
router.get('/detail/:id', getProductDetails)

//==========================

now, we will call this API in frontend

---------------------------------------------------
frontend/src/app/features/products/services/product.api.js
---------------------------------------------------

import axios from 'axios';

const productApiInstance = axios.create({
  baseURL: '/api/products',
  withCredentials: true,
});

export async function createProduct(formData) {
  const response = await productApiInstance.post('/', formData);
  return response.data;
}

export async function getSellerProducts() {
  const response = await productApiInstance.get('/seller');
  return response.data;
}

export async function getAllProducts() {
  const response = await productApiInstance.get('/');
  return response.data;
}

export async function getProductById(productId){
  const response = await productApiInstance.get(`/detail/${productId}`);
  return response.data;
}


//==========================

now, we will use it inside hooks layer::

---------------------------------------------------
frontend/src/app/features/products/hooks/useProduct.js
---------------------------------------------------

import {createProduct, getSellerProducts, getAllProducts, getProductById} from "../services/product.api.js";
import { useDispatch } from "react-redux";
import { setSellerProducts, setProducts } from "../state/product.slice.js";



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
    // this handleGetSellerProduct calls the API and share the data with the slice.


    async function handleGetAllProducts(){
        const data = await getAllProducts()
        dispatch(setProducts(data.products))
        return data.products;
    }
    // this handleGetAllProducts calls the API and share the data with the slice.
    

    async function handleGetProductById(productId){
        const data = await getProductById(productId);
        return data.product;
    }


    return {
        handleCreateProduct,
        handleGetSellerProduct,
        handleGetAllProducts,
        handleGetProductById
    }
} 

//==========================

now, with the help of AI, we will create the design of the single product:

this below is just a starter, for the full UI , visit ProductDetail.jsx page

----------------------------------------------------
frontend/src/app/features/products/pages/ProductDetail.jsx
----------------------------------------------------

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import { useProduct } from '../hooks/useProduct';
const ProductDetail = () => {

    const {productId} = useParams()
    console.log(productId)
    const [product, setProduct] = useState(null)
    const {handleGetProductById} = useProduct()

    async function fetchProductDetails(){
        const data = await handleGetProductById(productId)
        setProduct(data)
    }

    useEffect(()=>{
        fetchProductDetails();
    }, [productId])


    console.log(product)
  return (
    <div>ProductDetail</div>
  )
}

export default ProductDetail

//==========================

now , in the snitch app, i'll write code for varient, the color, the size, this color has xx amount of clothes, this size has xx amount of clothes. this cloth in blue is xx and in black is abc


at first, we will create a model for the product::

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
  },
  { timestamps: true }
);

const productModel = mongoose.model('product', productSchema);

export default productModel;


//==========================

now , to show this variants, we need to add it in product. now, we will create a SellerProductDetails.jsx page. but before coding this page, let's create routes for this page::

-------------------------------
frontend/src/app/app.routes.jsx
-------------------------------


import { createBrowserRouter } from 'react-router';
import Register from './features/auth/pages/Register';
import Login from './features/auth/pages/Login';
import CreateProduct from './features/products/pages/CreateProduct';
import { TransitionLayout } from './components/TransitionLayout';
import Protected from './features/auth/components/Protected';
import Dashboard from './features/products/pages/Dashboard';
import Home from './features/products/pages/Home';
import ProductDetail from './features/products/pages/ProductDetail';
import SellerProductDetails from './features/products/pages/SellerProductDetails';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <TransitionLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/product/:productId',
        element: <ProductDetail />,
      },
      {
        path: '/seller',
        children: [
          {
            path: '/seller/dashboard',
            element: (
              <Protected role="seller">
                <Dashboard />
              </Protected>
            ),
          },
          {
            path: '/seller/create-product',
            element: (
              <Protected role="seller">
                <CreateProduct />
              </Protected>
            ),
          },
          {
            path: '/seller/product/:productId',
            element: (
              <Protected role="seller">
                <SellerProductDetails />
              </Protected>
            ),
          },
        ],
      },
    ],
  },
]);

//==========================
---------------
V.V.I
---------------


In the Dashboard.jsx , we need to pass an onClick function which will navigate me to the SellerProductDetails

in SellerProductDetails, we need to fetch the details of the products, and then show their details


