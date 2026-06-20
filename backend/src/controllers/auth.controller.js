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
