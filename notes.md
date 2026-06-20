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

------------------------------------------------
src/app/app.routes.js
------------------------------------------------

import { createBrowserRouter } from "react-router";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <h1>Hello World</h1>
    }
])

//=============================================================

now, i'll update the App.js file to use the routes

------------------------------------------------
src/app/App.jsx
------------------------------------------------

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

