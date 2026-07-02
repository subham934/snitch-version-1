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
