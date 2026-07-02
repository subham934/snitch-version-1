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


//=========================================================================================================

- Yesterday, we had a plan to create a feature called variants, the buyer can see those variants too.
- yesterday, we have created the schema of this variant inside backend/src/models/product.model.js
- today, we will create an API which will create a variant for any product



we have a new page called SellerProductDetails which have details of a particular product of any particular seller.


-----------------------------------------------------------------
frontend/src/app/features/products/pages/SellerProductDetails.jsx
-----------------------------------------------------------------


import React, { useState, useEffect } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useParams } from 'react-router';

const SellerProductDetails = () => {
  const { handleGetProductById } = useProduct();
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  async function fetchProductDetails() {
    try {
      const data = await handleGetProductById(productId);
      setProduct(data?.product || data);
    } catch (error) {
      console.error('Failed to fetch product details', error);
    }
  }
  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  console.log(product)
  return <div>SellerProductDetails</div>;
};

export default SellerProductDetails;


// this above is just a sample to see that when we click on any product on dashboard, we navigate to that page of that particular product and the entire details of that produtt is shown in console. now, i'll write code to display the product on the page

// we can see that the variants array is empty, but why?? because we haven't created a single variant for any of the products yet. now, we will create an API which will create a variant for any product.

// but before that we will create an UI.

for that i've given the following instruction  to AI which helped me create my SellerProductDetails.jsx page.

-----------------------------------------------------

create the SellerProductDetails.jsx page(only UI), on this page seller can create the product variants and see the product variants and can manage the stock of each product variant. create the UI design Google stitch, we already have a project named snitch on stitch

the data of the product look like 

{
    "price": {
        "amount": 132332,
        "currency": "INR"
    },
    "_id": "6a3d733f147e00c2ab82c7f5",
    "title": "iphone",
    "description": "new iphone18",
    "seller": "6a3c0ecde12a7b5b94e58c9a",
    "images": [
        {
            "url": "https://ik.imagekit.io/lq7qd2rhd/snitch/Screenshot_2026-04-18_231036_h3Gm34FRq.png",
            "_id": "6a3d733f147e00c2ab82c7f6"
        },
        {
            "url": "https://ik.imagekit.io/lq7qd2rhd/snitch/Screenshot_2026-04-18_231003_pPM-_hqKq.png",
            "_id": "6a3d733f147e00c2ab82c7f7"
        },
        {
            "url": "https://ik.imagekit.io/lq7qd2rhd/snitch/2024-Mercedes-AMG-CLE53-007-2160_nAxfIXCHY.jpg",
            "_id": "6a3d733f147e00c2ab82c7f8"
        }
    ],
    "createdAt": "2026-06-25T18:28:15.736Z",
    "updatedAt": "2026-06-25T18:28:15.736Z",
    "__v": 0,
    "variants": []
}

and product variant schema look like this::

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


you can take the reference from my friends code which is as below but be sure that you use my kindof UI design format:


import React, { useEffect, useState } from 'react'
import { useProduct } from '../hooks/useProduct';
import { useParams } from 'react-router';

// Helper icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const SellerProductDetails = () => {
  const [ product, setProduct ] = useState(null);
  const [ localVariants, setLocalVariants ] = useState([]);
  const [ isAddingVariant, setIsAddingVariant ] = useState(false);
  const [ loading, setLoading ] = useState(true);

  // UI state for inputs to maintain focus
  const [ attributeInputs, setAttributeInputs ] = useState([ { key: '', value: '' } ]);

  // New variant state
  const [ newVariant, setNewVariant ] = useState({
    images: [],
    stock: 0,
    attributes: {}, // Strictly an object
    price: { amount: '', currency: 'INR' }
  });

  const { productId } = useParams();
  const { handleGetProductById, handleAddProductVariant } = useProduct();

  async function fetchProductDetails() {
    setLoading(true);
    try {
      const data = await handleGetProductById(productId);
      const prod = data?.product || data;
      setProduct(prod);
      // Initialize variants locally
      if (prod?.variants) {
        setLocalVariants(prod.variants);
      }
    } catch (error) {
      console.error("Failed to fetch product details", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProductDetails();
  }, [ productId ]);

  // Handlers for modifying existing variant stock natively
  const handleStockChange = (index, newStock) => {
    const updatedVariants = [ ...localVariants ];
    updatedVariants[ index ] = { ...updatedVariants[ index ], stock: Number(newStock) };
    setLocalVariants(updatedVariants);
  };

  // Handlers for New Variant Form
  const handleAddNewVariant = async () => {
    // Validate required at least one attribute to be filled
    const hasValidAttribute = attributeInputs.some(attr => attr.key.trim() && attr.value.trim());
    if (!hasValidAttribute) {
      alert("At least one valid attribute is required.");
      return;
    }

    // Maps preview URL so the variant list can display the image locally
    const cleanImages = newVariant.images.map(img => ({ url: img.previewUrl, file: img.file }));

    // Attributes is already an object in newVariant, just use it safely
    const cleanAttributes = { ...newVariant.attributes };

    const variantToSave = {
      images: cleanImages,
      stock: Number(newVariant.stock),
      attributes: cleanAttributes,
      price: newVariant.price.amount
        ? Number(newVariant.price.amount)
        : undefined // price is optional
    };

    setLocalVariants([ ...localVariants, variantToSave ]);
    setIsAddingVariant(false);

    await handleAddProductVariant(productId, variantToSave)

    // Reset form
    // Note: should ideally revoke old object URLs as well to prevent memory leaks if it were a long-lived SPA
    setAttributeInputs([ { key: '', value: '' } ]);
    setNewVariant({
      images: [],
      stock: 0,
      attributes: {},
      price: { amount: '', currency: 'INR' }
    });
  };

  const handleAddAttribute = () => {
    setAttributeInputs(prev => [ ...prev, { key: '', value: '' } ]);
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedInputs = [ ...attributeInputs ];
    updatedInputs[ index ][ field ] = value;
    setAttributeInputs(updatedInputs);

    // Synchronize to object format
    const newAttrsObj = {};
    updatedInputs.forEach(attr => {
      if (attr.key.trim() !== '') {
        newAttrsObj[ attr.key.trim() ] = attr.value;
      }
    });
    setNewVariant(prev => ({ ...prev, attributes: newAttrsObj }));
  };

  const handleRemoveAttribute = (index) => {
    const updatedInputs = attributeInputs.filter((_, i) => i !== index);
    setAttributeInputs(updatedInputs);

    // Synchronize to object format
    const newAttrsObj = {};
    updatedInputs.forEach(attr => {
      if (attr.key.trim() !== '') {
        newAttrsObj[ attr.key.trim() ] = attr.value;
      }
    });
    setNewVariant(prev => ({ ...prev, attributes: newAttrsObj }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const availableSlots = 7 - newVariant.images.length;
    const filesToAdd = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      alert(`You can only upload up to 7 images. ${filesToAdd.length} added.`);
    }

    const newImageObjects = filesToAdd.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setNewVariant(prev => ({
      ...prev,
      images: [ ...prev.images, ...newImageObjects ]
    }));

    // Clear the input so identical files can be selected again if needed
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = newVariant.images[ index ];
    if (imageToRemove?.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    const updatedImages = newVariant.images.filter((_, i) => i !== index);
    setNewVariant(prev => ({ ...prev, images: updatedImages }));
  };

  if (loading) {
    return <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center text-[#1b1c1a] font-serif">Loading gallery...</div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center text-[#1b1c1a] font-serif">Product Not Found</div>;
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] font-sans pb-24">
      {/* Top Banner / Header */}
      <header className="sticky top-0 z-10 bg-[#fbf9f6]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <h1 className="font-serif text-xl tracking-wide uppercase">{product.title?.substring(0, 20)}{product.title?.length > 20 ? '...' : ''}</h1>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 mt-8">

        {/* Base Product Info */}
        <section className="flex flex-col md:flex-row gap-8 mb-16">
          <div className="w-full md:w-1/2">
            {/* Gallery placeholder */}
            <div className="w-full aspect-[4/5] bg-[#f5f3f0] overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[ 0 ].url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#7f7668]">No Image</div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {product.images.slice(1).map((img, i) => (
                  <img key={i} src={img.url} alt={`Thumb ${i}`} className="w-16 h-20 object-cover bg-[#f5f3f0] shrink-0" />
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-4 uppercase">{product.title}</h2>
            <p className="text-[#6e6258] text-lg mb-6 leading-relaxed max-w-md">{product.description}</p>
            <div className="text-2xl tracking-wide font-light mb-8">
              {product.price?.amount} {product.price?.currency}
            </div>
          </div>
        </section>

        {/* Variants & Inventory */}
        <section className="bg-[#f5f3f0] p-6 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h3 className="font-serif text-3xl uppercase">Variants & Inventory</h3>
            {!isAddingVariant && (
              <button
                onClick={() => setIsAddingVariant(true)}
                className="bg-[#745a27] text-[#ffffff] px-6 py-3 uppercase tracking-wider text-sm hover:bg-[#5a4312] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <PlusIcon /> Add New Variant
              </button>
            )}
          </div>

          {/* Add New Variant Form */}
          {isAddingVariant && (
            <div className="bg-[#ffffff] p-6 md:p-8 mb-12 shadow-[0_20px_40px_rgba(27,28,26,0.04)]">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-serif text-xl uppercase">Create Variant</h4>
                <button
                  onClick={() => setIsAddingVariant(false)}
                  className="text-[#7f7668] hover:text-[#1b1c1a] text-sm uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Left Col: Attributes & Basics */}
                <div className="space-y-6">

                  {/* Dynamic Attributes */}
                  <div>
                    <label className="block text-sm uppercase tracking-wider text-[#6e6258] mb-3">Attributes (e.g. Size, Color) *</label>
                    <div className="space-y-3">
                      {attributeInputs.map((attr, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Key (e.g., Size)"
                            value={attr.key}
                            onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                            className="w-1/2 bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27] placeholder:text-[#d0c5b5]"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g., M)"
                            value={attr.value}
                            onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                            className="w-1/2 bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27] placeholder:text-[#d0c5b5]"
                          />
                          {attributeInputs.length > 1 && (
                            <button onClick={() => handleRemoveAttribute(index)} className="text-[#ba1a1a] p-2 hover:bg-[#ffdad6] transition-colors cursor-pointer">
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleAddAttribute}
                      className="mt-3 text-[#745a27] text-sm uppercase tracking-wider flex items-center gap-1 hover:text-[#5a4312] cursor-pointer"
                    >
                      <PlusIcon /> Add Attribute
                    </button>
                  </div>

                  {/* Stock & Price */}
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-sm uppercase tracking-wider text-[#6e6258] mb-2">Initial Stock</label>
                      <input
                        type="number"
                        value={newVariant.stock}
                        onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                        className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27]"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-sm uppercase tracking-wider text-[#6e6258] mb-2">Price Amount (Optional)</label>
                      <input
                        type="number"
                        value={newVariant.price.amount}
                        onChange={(e) => setNewVariant({ ...newVariant, price: { ...newVariant.price, amount: e.target.value } })}
                        placeholder="Default if empty"
                        className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27] placeholder:text-[#d0c5b5]"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Right Col: Images */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-sm uppercase tracking-wider text-[#6e6258]">Image Upload (Max 7, Optional)</label>
                    <span className="text-xs text-[#7f7668]">{newVariant.images.length}/7</span>
                  </div>

                  {newVariant.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {newVariant.images.map((img, index) => (
                        <div key={index} className="relative aspect-[4/5] bg-[#f5f3f0]">
                          <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-white/80 p-1 text-[#ba1a1a] hover:bg-white transition-colors cursor-pointer"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {newVariant.images.length < 7 && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-[#6e6258]
                          file:mr-4 file:py-2 file:px-4
                          file:border-0 file:bg-[#f5f3f0] file:text-[#1b1c1a]
                          hover:file:bg-[#e4e2df] file:cursor-pointer file:uppercase file:text-xs file:tracking-wider file:font-serif
                          cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={handleAddNewVariant}
                  className="bg-gradient-to-r from-[#745a27] to-[#c9a96e] text-[#ffffff] px-8 py-3 uppercase tracking-wider text-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Save Variant
                </button>
              </div>
            </div>
          )}

          {/* Variants List */}
          {localVariants.length === 0 ? (
            <div className="py-12 text-center text-[#6e6258]">
              <p>No variants have been created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {localVariants.map((variant, idx) => (
                <div key={idx} className="bg-[#ffffff] flex flex-col pt-4 shadow-[0_20px_40px_rgba(27,28,26,0.02)]">
                  <div className="px-6 flex gap-4 h-24 mb-4">
                    {/* Variant Thumb */}
                    <div className="w-16 h-20 bg-[#f5f3f0] shrink-0">
                      {variant.images && variant.images.length > 0 ? (
                        <img src={variant.images[ 0 ].url} alt="Variant" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#7f7668]">N/A</div>
                      )}
                    </div>
                    {/* Attributes */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Object.entries(variant.attributes || {}).map(([ key, val ]) => (
                          <span key={key} className="bg-[#f5f3f0] px-2 py-1 text-xs uppercase tracking-wider text-[#4d463a]">
                            <span className="text-[#a8a094]">{key}:</span> {val}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm font-light">
                        {variant.price?.amount ? `${variant.price.amount} ${variant.price.currency}` : 'Base Price'}
                      </div>
                    </div>
                  </div>

                  {/* Stock Management Row */}
                  <div className="mt-auto border-t border-[#f5f3f0] bg-[#fbf9f6] flex items-center px-6 py-3 justify-between">
                    <label className="text-sm text-[#6e6258] uppercase tracking-wider">Current Stock</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={variant.stock || 0}
                        onChange={(e) => handleStockChange(idx, e.target.value)}
                        className="w-20 bg-transparent border-b border-[#d0c5b5] py-1 text-right focus:outline-none focus:border-[#745a27] font-serif text-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>

      </main>
    </div>
  )
}

export default SellerProductDetails







//==========================


now, to create a variant of a product in frontend, we need to create an API in backend

in the variant given in product.model.js, the images is optional, stock is not optional, we can give any attribute, price is also optional. if we dont fill the images and price then we take default value. 

//==========================

now, in the backend, we will create an API which will create products

let's create the controller as addProductVariant


---------------------------------------------
backend/src/controllers/product.controller.js
---------------------------------------------

import productModel from '../models/product.model.js';
import { uploadFile } from '../services/storage.service.js';

export async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency } = req.body;
    const seller = req.user;

    const images = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadFile({
          buffer: file.buffer,
          fileName: file.originalname,
        });
        return { url: result.url };
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

    return res.status(201).json({
      message: 'Product created successfully',
      success: true,
      product,
    });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      success: false,
    });
  }
}

export async function getSellerProducts(req, res) {
  const seller = req.user;

  const products = await productModel.find({ seller: seller._id });

  res.status(200).json({
    message: 'Products fetched successfully',
    success: true,
    products,
  });
}

export async function getAllProducts(req, res) {
  const products = await productModel.find();

  return res.status(200).json({
    message: 'Products fetched successfully',
    success: true,
    products,
  });
}

export async function getProductDetails(req, res) {
  const { id } = req.params;

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({
      message: 'Product not found',
      success: false,
    });
  }

  return res.status(200).json({
    message: 'Product fetched successfully',
    success: true,
    product,
  });
}




export async function addProductVariant(req, res) {
  const productId = req.params.productId;

  const product = await productModel.findOne({
    _id: productId,
    seller: req.user._id,
  });

  if (!product) {
    return res.status(404).json({
      message: 'Product not found',
      success: false,
    });
  }

  const files = req.files;
  const images = [];
  if (files || files.length !== 0) {
    (
      await Promise.all(
        files.map(async (file) => {
          const image = await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname,
          });
          return image;
        })
      )
    ).map((image) => images.push(image));
  }

  const price = req.body.priceAmount;
  const stock = req.body.stock;
  const attributes = JSON.parse(req.body.attributes || '{}');

  console.log(price);

  product.variants.push({
    images,
    price: {
      amount: Number(price) || product.price.amount,
      currency: req.body.priceCurrency || product.price.currency,
    },
    stock,
    attributes,
  });

  await product.save();

  return res.status(200).json({
    message: 'Product variant added successfully',
    success: true,
    product,
  });
}




//==========================

for the above controller, we also need to create a route

------------------------------------
backend/src/routes/product.routes.js
------------------------------------

import express from 'express';
import { authenticateSeller } from '../middlewares/auth.middleware.js';
import {
  createProduct,
  getAllProducts,
  getSellerProducts,
  getProductDetails,
  addProductVariant,
} from '../controllers/product.controller.js';
import multer from 'multer';
import { createProductValidator } from '../validator/product.validator.js';
import { uploadFile } from '../services/storage.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const router = express.Router();

/**
 * @route POST api/products
 * @desc create a product
 * @access private
 * @role seller
 */
router.post(
  '/',
  authenticateSeller,
  upload.array('images', 7),
  createProductValidator,
  createProduct
);

/**
 * @route GET api/products
 * @desc get all products created by the authenticated seller
 * @access private
 * @role seller
 */
router.get('/seller', authenticateSeller, getSellerProducts);

/**
 * @route GET api/products
 * @desc get all products
 * @access public
 */
router.get('/', getAllProducts);

/**
 * @route GET api/products/detail/:id
 * @desc get a single product by ID
 * @access public
 */
router.get('/detail/:id', getProductDetails);

/**
 * @route POST api/products/:productId/variants
 * @desc create a variant for a product
 * @access private
 * @role seller
 */
router.post(
  '/:productId/variants',
  authenticateSeller,
  upload.array('images', 7),
  addProductVariant
);

export default router;


//==========================

now, we need to call this api from frontend to add the variants of a product

let's make changes in product.api.js

----------------------------------------------------------
frontend/src/app/features/products/services/product.api.js
----------------------------------------------------------

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

export async function getProductById(productId) {
  const response = await productApiInstance.get(`/detail/${productId}`);
  return response.data;
}


export async function addProductVariant(productId, newProductVariant) {

    console.log(newProductVariant)

    const formData = new FormData()

    newProductVariant.images.forEach((image) => {
        formData.append(`images`, image.file)
    })

    formData.append("stock", newProductVariant.stock)
    formData.append("priceAmount", newProductVariant.price)
    formData.append("attributes", JSON.stringify(newProductVariant.attributes))

    const response = await productApiInstance.post(`/${productId}/variants`, formData)

    return response.data

}




//==========================

now, let's create the hook layer::

------------------------------------------------------
frontend/src/app/features/products/hooks/useProduct.js
------------------------------------------------------

import {
  createProduct,
  getSellerProducts,
  getAllProducts,
  getProductById,
  addProductVariant,
} from '../services/product.api.js';
import { useDispatch } from 'react-redux';
import { setSellerProducts, setProducts } from '../state/product.slice.js';

export const useProduct = () => {
  const dispatch = useDispatch();

  async function handleCreateProduct(formData) {
    const data = await createProduct(formData);

    return data.product;
  }

  async function handleGetSellerProduct() {
    const data = await getSellerProducts();
    dispatch(setSellerProducts(data.products));
    return data.products;
  }
  // this handleGetSellerProduct calls the API and share the data with the slice.

  async function handleGetAllProducts() {
    const data = await getAllProducts();
    dispatch(setProducts(data.products));
    return data.products;
  }
  // this handleGetAllProducts calls the API and share the data with the slice.

  async function handleGetProductById(productId) {
    const data = await getProductById(productId);
    return data.product;
  }

  async function handleAddProductVariant(productId, newProductVariant) {
    const data = await addProductVariant(productId, newProductVariant);
    return data;
  }
  // this handleAddProductVariant calls the API and share the data with the slice.

  return {
    handleCreateProduct,
    handleGetSellerProduct,
    handleGetAllProducts,
    handleGetProductById,
    handleAddProductVariant,
  };
};

//==========================






//==========================
//==========================
//==========================
//==========================
//==========================