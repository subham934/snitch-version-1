today, we will se authentication setup and error handling. 

at first , lets complete the controller::

----------------------------------
src/controllers/auth.controller.js
----------------------------------

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

    await sendTokenResponse(user, res, 'User registered successfully');
    
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

//=============================================================

Now let's create the frontEnd.


install tailwind and redux toolkit

lets create a slice::

// state layer::

------------------------------------------------
src/app/features/auth/state/auth.slice.js
------------------------------------------------

import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  }
});

export const {
  setUser,
  setLoading,
  setError,
} = authSlice.actions;

export default authSlice.reducer;


//=============================================================

=> for the above slice , we'll create a store::

--------------------
src/app/app.store.js
--------------------

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/state/auth.slice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  }
})

//=============================================================

// API Layer
now, to call the backendAPI we'll create a api service for auth:
for that we'll need axios

npm i axios

-----------------------------------------
src/app/features/auth/service/auth.api.js
-----------------------------------------

import axios from 'axios';

const authApiInstance = axios.create({
  baseURL: 'http://localhost:3000/api/auth',
  withCredentials: true,
});

export async function register({ email, contact, password, fullname, isSeller }) {
  const response = await authApiInstance.post('/register', {
    email,
    contact,
    password,
    fullname,
    isSeller
  });

  return response.data;
}


=> since, we have introduced a new field called isSeller, we need to add it in hook layer, 

//=============================================================
// HOOK Layer

----------------------------------------------
frontend/src/app/features/auth/hook/useAuth.js
----------------------------------------------

import { useDispatch } from "react-redux";
import { setError, setLoading, setUser } from "../state/auth.slice.js";
import { register } from "../service/auth.api.js";

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

    return {
        handleRegister,
    };
}


//=============================================================

// we'll also need to make changes in backend:::

---------------------------------------
backend/src/validator/auth.validator.js
---------------------------------------

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

    body('isSeller')
    .isBoolean()
    .withMessage('isSeller must be a boolean'),

  validateRequest,
];

//=============================================================


---------------------------------------
backend/src/controllers/auth.controller.js
---------------------------------------
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
      role: isSeller ? "seller" : "buyer",
    });
    //  A new user is saved in MongoDB.
    // Because my model has a pre("save") middleware, the password is hashed before being stored.
    //The role is not supplied, so the schema’s default "buyer" role is used.

    await sendTokenResponse(user, res, 'User registered successfully');
    
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};


//=============================================================

now , in frontend, we'll install react-router
npm i react-router

now, i'll create routes file

---------------------
src/app/app.routes.js
---------------------

import { createBrowserRouter } from "react-router";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <h1>Hello World</h1>
    }
])

//=============================================================

now, i'll update the App.js file to use the routes

---------------
src/app/App.jsx
---------------

import './App.css';
import { RouterProvider } from 'react-router';
import { routes } from './app.routes.jsx';

const App = () => {
  return (
    <div>
      <RouterProvider router={routes} />
    </div>
  )
}

export default App

//=============================================================
if i go to localhost:5173, i should see Hello World

now, let's create Routes pages in Frontend:::


-------------------------------
frontend/src/app/app.routes.jsx
-------------------------------

import {createBrowserRouter} from "react-router";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <h1>Hello World</h1>
    },{
        path: '/register',
        element: <Register/>
    },{
        path: '/login',
        element: <Login/>
    }
])

//=============================================================


now, with the help of AI, i'll create a Register Page::


-------------------------------------------------
frontend/src/app/features/auth/pages/Register.jsx
-------------------------------------------------

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hook/useAuth.js';

const Register = () => {
  const navigate = useNavigate();
  const { handleRegister } = useAuth();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    contact: '',
    password: '',
    isSeller: false,
  });

  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    // Local validation
    if (!formData.fullname.trim() || formData.fullname.length < 3) {
      setLocalError('Full name must be at least 3 characters long');
      return;
    }
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (!/^\d{10}$/.test(formData.contact)) {
      setLocalError('Contact must be a 10-digit number');
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    try {
      await handleRegister({
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        contact: formData.contact.trim(),
        password: formData.password,
        isSeller: formData.isSeller,
      });
      setSuccessMsg('Registration successful!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      // Error is handled by Redux state
    }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col md:flex-row selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      {/* Left Column: Visual Showcase (50% split on md+) */}
      <div className="w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex flex-col justify-between p-12 md:p-16 relative overflow-hidden bg-surface-container-lowest">
        {/* Background Image with Dark Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('/streetwear_showcase.png')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#131315]/60 via-[#131315]/30 to-[#131315]/90 pointer-events-none"></div>

        {/* Branding overlapping the image */}
        <div className="relative z-20 text-3xl md:text-4xl font-headline font-black text-primary-container tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          SNITCH
        </div>

        {/* Tagline & copy */}
        <div className="relative z-10 mt-auto pt-24">
          <span className="inline-block bg-primary-container/20 border border-primary-container/30 backdrop-blur-md text-primary-container px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4">
            New Season Drop
          </span>
          <h2 className="text-4xl md:text-5xl font-headline font-black text-on-surface leading-tight tracking-tight mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            Redefining <br />
            Modern Style.
          </h2>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Explore curated streetwear collections designed for those who
            express themselves through their wardrobe. Clean cuts, premium
            fabrics.
          </p>
        </div>
      </div>

      {/* Right Column: Registration Form (50% split on md+) */}
      <div className="w-full md:w-1/2 min-h-[60vh] md:min-h-screen flex items-center justify-center p-8 sm:p-16 lg:p-24 bg-background relative">
        {/* Subtle blur background bubbles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-container rounded-full mix-blend-screen filter blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary-container rounded-full mix-blend-screen filter blur-[128px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="mb-10">
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-2 tracking-tight">
              Create an Account
            </h1>
            <p className="font-label text-on-surface-variant text-sm">
              Join the ultimate fashion platform.
            </p>
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">
                error
              </span>
              <span>{localError || error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">
                check_circle
              </span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                className="block font-label text-xs font-medium text-on-surface mb-2"
                htmlFor="fullname"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">
                    person
                  </span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3.5 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all shadow-sm placeholder:text-on-surface-variant/40 font-body outline-none"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  type="text"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                className="block font-label text-xs font-medium text-on-surface mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">
                    mail
                  </span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3.5 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all shadow-sm placeholder:text-on-surface-variant/40 font-body outline-none"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  type="email"
                />
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label
                className="block font-label text-xs font-medium text-on-surface mb-2"
                htmlFor="contact"
              >
                Contact Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">
                    phone
                  </span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3.5 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all shadow-sm placeholder:text-on-surface-variant/40 font-body outline-none"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="1234567890"
                  required
                  type="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block font-label text-xs font-medium text-on-surface mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">
                    lock
                  </span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3.5 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all shadow-sm placeholder:text-on-surface-variant/40 font-body outline-none"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  type="password"
                  minLength={6}
                />
              </div>
              <p className="mt-2 font-label text-[10px] text-on-surface-variant">
                Must be at least 6 characters.
              </p>
            </div>

            {/* Seller Checkbox */}
            <div className="flex items-center pt-1">
              <input
                className="h-4.5 w-4.5 rounded bg-surface-container border border-outline-variant/30 text-primary-container focus:ring-primary-container focus:ring-offset-surface-container-low transition-colors cursor-pointer"
                id="isSeller"
                name="isSeller"
                checked={formData.isSeller}
                onChange={handleChange}
                type="checkbox"
              />
              <label
                className="ml-3 block font-label text-xs text-on-surface cursor-pointer select-none"
                htmlFor="isSeller"
              >
                Are you a seller?
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-on-primary-container bg-primary-container hover:bg-surface-tint focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container focus:ring-offset-surface-container-low transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-on-primary-container"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center font-label text-xs text-on-surface-variant">
            Already have an account?{' '}
            <Link
              className="font-medium text-primary-container hover:text-primary transition-colors hover:underline underline-offset-4"
              to="/login"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;


//=============================================================

Now, let's create the Login.jsx

----------------------------------------------
frontend/src/app/features/auth/pages/Login.jsx
----------------------------------------------
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hook/useAuth.js';

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
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
      await handleLogin({
        email: formData.email.trim(),
        password: formData.password,
      });
      setSuccessMsg('Login successful!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      // Error is handled by Redux state
    }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col md:flex-row selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      
      {/* Left Column: Visual Showcase (50% split on md+) */}
      <div className="w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex flex-col justify-between p-12 md:p-16 relative overflow-hidden bg-surface-container-lowest">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105" style={{ backgroundImage: "url('/streetwear_showcase.png')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#131315]/60 via-[#131315]/30 to-[#131315]/90 pointer-events-none"></div>

        {/* Branding overlapping the image */}
        <div className="relative z-20 text-3xl md:text-4xl font-headline font-black text-primary-container tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          SNITCH
        </div>

        {/* Tagline & copy */}
        <div className="relative z-10 mt-auto pt-24">
          <span className="inline-block bg-primary-container/20 border border-primary-container/30 backdrop-blur-md text-primary-container px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4">
            Welcome Back
          </span>
          <h2 className="text-4xl md:text-5xl font-headline font-black text-on-surface leading-tight tracking-tight mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            Elevate Your <br/>
            Daily Style.
          </h2>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Explore premium streetwear collections and enjoy customized shopping recommendations tailored to your fashion sense.
          </p>
        </div>
      </div>

      {/* Right Column: Login Form (50% split on md+) */}
      <div className="w-full md:w-1/2 min-h-[60vh] md:min-h-screen flex items-center justify-center p-8 sm:p-16 lg:p-24 bg-background relative">
        {/* Subtle blur background bubbles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-container rounded-full mix-blend-screen filter blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary-container rounded-full mix-blend-screen filter blur-[128px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="mb-10">
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-2 tracking-tight">
              Sign In
            </h1>
            <p className="font-label text-on-surface-variant text-sm">
              Log in to access your personal vault.
            </p>
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">error</span>
              <span>{localError || error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block font-label text-xs font-medium text-on-surface mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3.5 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all shadow-sm placeholder:text-on-surface-variant/40 font-body outline-none"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  type="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-label text-xs font-medium text-on-surface mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3.5 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all shadow-sm placeholder:text-on-surface-variant/40 font-body outline-none"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  type="password"
                  minLength={6}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-on-primary-container bg-primary-container hover:bg-surface-tint focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container focus:ring-offset-surface-container-low transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-on-primary-container" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center font-label text-xs text-on-surface-variant">
            Don't have an account?{' '}
            <Link className="font-medium text-primary-container hover:text-primary transition-colors hover:underline underline-offset-4" to="/register">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


//=============================================================

now, we need to install cors

npm i cors

now, we will implement the cors::

------------------
backend/src/app.js
------------------

import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";



const app = express();


app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));


app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);

export default app;


//=============================================================

let's create a login validator


---------------------------------
backend/src/validator/auth.validator.js
---------------------------------

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

    body('isSeller')
    .isBoolean()
    .withMessage('isSeller must be a boolean'),

  validateRequest,
];


export const validateLoginUser = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
]

//=============================================================

now, let's create the login route


---------------------------------
backend/src/routes/auth.routes.js
---------------------------------

import { Router } from 'express';
import { validateRegisterUser, validateLoginUser } from '../validator/auth.validator.js';
import { register, login } from '../controllers/auth.controller.js';
const router = Router();

router.post('/register', validateRegisterUser, register);
router.post("/login",validateLoginUser, login)

export default router;

//=============================================================

now, let's create the login controller


---------------------------------
backend/src/controllers/auth.controller.js
---------------------------------

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
      role: isSeller ? "seller" : "buyer",
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


//=============================================================

let's make changes in the API layer::


----------------------------------------------
frontend/src/app/features/auth/service/auth.api.js
----------------------------------------------
import axios from 'axios';

const authApiInstance = axios.create({
  baseURL: 'http://localhost:3000/api/auth',
  withCredentials: true,
});

export async function register({ email, contact, password, fullname, isSeller }) {
  const response = await authApiInstance.post('/register', {
    email,
    contact,
    password,
    fullname,
    isSeller
  });

  return response.data;
}

export async function login({ email, password }) {
    const response = await authApiInstance.post('/login', {
        email,
        password
    });

    return response.data;
}

//=============================================================

We'll also need to make changes in hook layer::


----------------------------------------------
frontend/src/app/features/auth/hook/useAuth.js
----------------------------------------------

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

    return {
        handleRegister,
        handleLogin
    };
}


//=============================================================
//=============================================================
//=============================================================
//=============================================================