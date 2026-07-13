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
