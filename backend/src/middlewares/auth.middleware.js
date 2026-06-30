import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import userModel from '../models/user.model.js';

// get user middleware.

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

// THIS middleware ensure that request is coming from seller , or else do nothing.
export const authenticateSeller = async (req, res, next) => {
  // to identify who is the user, buyer or seller, we need token.

  // get token from req
  const token = req.cookies.token;

  // if no token => return error
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

//   console.log('Cookies received:', req.cookies);
//   console.log('Token received:', token);

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
