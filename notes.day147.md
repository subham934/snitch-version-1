Today, we will transform the UI to a light background.

=> today, we will see the products created by seller.


Today, the seller will see the products he have created. but before that , let's make the entire website a little more professional by adding a light background color to it. So , we'll change the UI and make it more appealing, and for that , we will be using Antigravity.  

-> it will be displayed in Dashboard.jsx (which will also be created with antigravity), which you can see in frontend/src/app/features/products/pages/Dashboard.jsx


1. create product page
    a. folder Pages ✅
    b. /pages/CreateProduct.jsx ✅
    c. UI of the page✅
2. view products
    a. folder Pages ✅
    b. /pages/Dashboard.jsx ✅
3. make page protected 
    a. create protected component
    b. wrap  , create product page and seller dashboard. ✅
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


also, create a new Route for both Dashboard.jsx and CreateProduct.jsx.  


-------------------------------
frontend/src/app/app.routes.jsx
-------------------------------


import {createBrowserRouter} from "react-router";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";
import CreateProduct from "./features/products/pages/CreateProduct";
import { TransitionLayout } from "./components/TransitionLayout";
import Dashboard from "./features/products/pages/Dashboard";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <TransitionLayout />,
        children: [
            {
                path: "/",
                element: <h1>Hello World</h1>
            },{
                path: '/register',
                element: <Register/>
            },{
                path: '/login',
                element: <Login/>
            }, {
                path: "/seller",
                children:[
                    {
                        path: "/seller/dashboard",
                        element: <Dashboard/>
                    },{
                        path: "/seller/create-product",
                        element: <CreateProduct/>
                    }
                ]
            }
        ]
    }
])





//===================================

but , at first , when we go to App.jsx and type as below, 

import { useSelector } from 'react-redux';
  
const App = () => {
  
  const user = useSelector(state => state.auth.user);

  console.log(user)
  
  return (

    <div>
      <RouterProvider router={routes} />
    </div>
  )
}

export default App
  
=> now, when we login , the user details is shown in console but once we reload the page, the details get vanished. so, let's fix it.

// in frontend, i can see that once the page reloads, the data is removed. for that in Backend , we create a getMe api, for that in back end we needto create an API which will authenticate the user , for which we need a middleware, and with the help of this middleware, we will make the API protected so that I can return my loggedIn data



------------------------------------------------
backend > src > middlewares > auth.middleware.js
------------------------------------------------


export const authenticateUser = async(req,res,next)=>{
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message: "Unauthorized"});
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({message: "Unauthorized"});
    }
}


//===================================

// now that middleware is done, we'll create a controller


------------------------------------------------
backend > src > controllers > auth.controller.js
------------------------------------------------


export const getMe = async (req, res) => {
    const user = req.user;

    return res.status(200).json({ 
        success: true, 
        message: "User fetched successfully", 
        user:{
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role,
        } 
    });
}

//===================================


// now, we will utilize this controller inside the routes folder. 

---------------------------------
backend/src/routes/auth.routes.js
---------------------------------

import { Router } from 'express';
import { validateRegisterUser, validateLoginUser } from '../validator/auth.validator.js';
import { register, login, googleCallback, getMe } from '../controllers/auth.controller.js';
import { config } from '../config/config.js';
import passport from 'passport';
import { authenticateUser } from '../middlewares/auth.middleware.js';


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


/**
 * @route GET api/auth/me
 * @description get the authenticated user's profile
 * @access Private
 */

router.get("/me", authenticateUser, getMe )

export default router;



//====================================

now, we will integrate this api with frontend

--------------------------------------------------
frontend/src/app/features/auth/service/auth.api.js
--------------------------------------------------

export async function getMe() {
  const response = await authApiInstance.get('/me')
  return response.data;
}

//====================================
now, to use the getMe function we write as below inside useAuth.js


--------------------------------------------------
frontend/src/app/features/auth/hook/useAuth.js
--------------------------------------------------


import { useDispatch } from "react-redux";
import { setError, setLoading, setUser } from "../state/auth.slice.js";
import { login, register } from "../service/auth.api.js";

export function useAuth() {
    const dispatch = useDispatch();

    async function handleRegister({ email, contact, password, fullname, isSeller=false }) {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await register({ email, contact, password, fullname, isSeller });
            dispatch(setUser(data.user));
            return data;
        } catch (error) {
            dispatch(setError(error.response?.data?.message || 'Registration failed'));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogin({email, password}){
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await login({ email, password });
            dispatch(setUser(data.user));
            return data;
        } catch (error) {
            dispatch(setError(error.response?.data?.message || 'Login failed'));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMe() {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const data = await getMe();
        dispatch(setUser(data.user));
        return data;
      } catch (error) {
        dispatch(setError(error.response?.data?.message || 'Failed to fetch user'));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    }
    

    return {
        handleRegister,
        handleLogin,
        handleGetMe
    };

//====================================

also, make change is auth.slice.js , where you set loading:true


  initialState: {
    user: null,
    loading: true,
    error: null,
  },


//====================================

--------------------
frontend/src/App.jsx
--------------------

import './App.css';
import { RouterProvider } from 'react-router';
import { routes } from './app.routes.jsx';
import { useSelector } from 'react-redux';
import { useAuth } from './features/auth/hook/useAuth.js';
import { useEffect } from 'react';
const App = () => {
  const { handleGetMe } = useAuth();
  const user = useSelector((state) => state.auth.user);
  console.log(user);
  useEffect(() => {
    handleGetMe();
  }, []);

  return (
    <div>
      <RouterProvider router={routes} />
    </div>
  );
};

export default App;


//====================================
=> now, i need to make sure that the buyer can't see the Dashboard and CreateProduct page. for that we need to make the pages protected

=> even if we delete token from Application , still the user can see the content inside the route http://localhost:5173/seller/dashboard, which is a big problem

=> for this we will create a protected component, which will wrap around the pages that are required to be protected

------------------------------------------
frontend/src/app/features/auth/components/Protected.jsx
------------------------------------------


import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

const Protected = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default Protected;


//====================================
=> now, i need to wrap the seller pages with Protected component in app.routes.jsx

--------------------------------
frontend/src/app/app.routes.jsx
--------------------------------

import { createBrowserRouter } from 'react-router';
import Register from './features/auth/pages/Register';
import Login from './features/auth/pages/Login';
import CreateProduct from './features/products/pages/CreateProduct';
import { TransitionLayout } from './components/TransitionLayout';
import Protected from './features/auth/components/Protected';
import Dashboard from './features/products/pages/Dashboard';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <TransitionLayout />,
    children: [
      {
        path: '/',
        element: <h1>Hello World</h1>,
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
        path: '/seller',
        children: [
          {
            path: '/seller/dashboard',
            element: <Dashboard />,
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

now, without login, if i try to visit the  /seller/create-product, it should redirect me to the login page


//====================================

now, we could see that if i'm not loggedIn I sould not visit /seller/create-product, but , what if i'm loggged In, but as a buyer, then i can visit /seller/create-product, which is not correct, for that we will add another condition in Protected component, as role="buyer"

------------------------------------------
frontend/src/app/features/auth/components/Protected.jsx
------------------------------------------


import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

const Protected = ({ children, role = 'buyer' }) => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default Protected;

//====================================

now, similarly, we will do the same for Dashboard.jsx page::



--------------------------------
frontend/src/app/app.routes.jsx
--------------------------------


import { createBrowserRouter } from 'react-router';
import Register from './features/auth/pages/Register';
import Login from './features/auth/pages/Login';
import CreateProduct from './features/products/pages/CreateProduct';
import { TransitionLayout } from './components/TransitionLayout';
import Protected from './features/auth/components/Protected';
import Dashboard from './features/products/pages/Dashboard';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <TransitionLayout />,
    children: [
      {
        path: '/',
        element: <h1>Hello World</h1>,
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

//====================================
now, we want that , when a seller is logged in, it directly redirect him to the dashboard, for that , at first let's make changes in useAuth.js where in handleRegister and handleLogin, we return data.user

----------------------------------------------
frontend/src/app/features/auth/hook/useAuth.js
----------------------------------------------

import { useDispatch } from "react-redux";
import { setError, setLoading, setUser } from "../state/auth.slice.js";
import { getMe, login, register } from "../service/auth.api.js";

export function useAuth() {
    const dispatch = useDispatch();

    async function handleRegister({ email, contact, password, fullname, isSeller=false }) {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await register({ email, contact, password, fullname, isSeller });
            dispatch(setUser(data.user));
            return data.user;
        } catch (error) {
            dispatch(setError(error.response?.data?.message || 'Registration failed'));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogin({email, password}){
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await login({ email, password });
            dispatch(setUser(data.user));
            return data.user;
        } catch (error) {
            dispatch(setError(error.response?.data?.message || 'Login failed'));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMe() {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const data = await getMe();
        dispatch(setUser(data.user));
        return data;
      } catch (error) {
        // If no token / session expired, it's expected — don't show error to user
        dispatch(setUser(null));
      } finally {
        dispatch(setLoading(false));
      }
    }
    

    return {
        handleRegister,
        handleLogin,
        handleGetMe
    };
}


now, inside the Login.jsx, we will make small change in handle submit button

----------------------------------------
frontend/src/app/features/auth/pages/Login.jsx
----------------------------------------


 const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    // Local validation
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    try {
      const user = await handleLogin({
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccessMsg('Login successful!');

      // Slow transformation exit to other page based on user role
      setTimeout(() => {
        if (user.role === 'seller') {
          transitionNavigate('/seller/dashboard');
        } else {
          transitionNavigate('/');
        }
      }, 500);
    } catch (err) {
      // Error is handled by Redux state
    }
  };

//====================================



now, we will see how user can see all the products and can see detial about a single product on different page.

1. user can see all the products.
    a. create api for fetching all the products for user.
        
    b. create page for the all products.
2. user can see details about any product on a different page.


at first , let's create a controller for fetching all the products for user.

---------------------------------------------
backend/src/controllers/product.controller.js
---------------------------------------------


export async function getAllProducts(req, res){
  const products = await productModel.find();

  return res.status(200).json({
    message: 'Products fetched successfully',
    success: true,
    products
  })
}


now, we will implement this product on routes

------------------------------------
backend/src/routes/product.routes.js
------------------------------------

/**
 * @route GET api/products
 * @desc get all products
 * @access public
 */
router.get('/', getAllProducts)

export default router;

=> Now, API is done.


//=========================================

now, let's create a page in frontend to show all the products.

we have to do the following work in frontend::

1. service func. - this function will interact with API
2. state for products - for storing products data.
3. hook - this hook will interact with service func. and will update the state.
4. UI page - this page will display the products.




//===================================
lets start with creating service func. for fetching all the products for user. it is API layer where we will create a function called getAllProducts().

----------------------------------
frontend/src/app/features/products/services/product.api.js
----------------------------------

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

//===================================

now, we will create state for products in redux slice.

---------------------------------------------
frontend/src/app/features/products/state/product.slice.js
---------------------------------------------

import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'product',
  initialState: {
    sellerProducts: [],
    products: [],
  },
  reducers: {
    setSellerProducts(state, action) {
      state.sellerProducts = action.payload;
    },
    setProducts(state, action) {
      state.products = action.payload;
    },
  },
});

export const { setSellerProducts, setProducts } = productSlice.actions;
export default productSlice.reducer;

//=========================================

now, we will create the hook layer. this hook will interact with service func. and will update the state.

-------------------------------------------
frontend/src/app/features/products/hooks/useProduct.js
-------------------------------------------

import {createProduct, getSellerProducts, getAllProducts} from "../services/product.api.js";
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
    

    return {
        handleCreateProduct,
        handleGetSellerProduct,
        handleGetAllProducts
    }
} 

//=========================================
now finally we need to create the UI page to display all the products. we'll do it using AI.


-------------------------------------------------
frontend/src/app/features/products/pages/Home.jsx
-------------------------------------------------


finally, we will change the routes in app.routes.jsx

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


here, i've also created the frontend and backend for logout. please check the code
