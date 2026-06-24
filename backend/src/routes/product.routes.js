import express from "express";
import { authenticateSeller } from "../middlewares/auth.middleware.js";
import { createProduct } from "../controllers/product.controller.js";
import multer from "multer";
import { createProductValidator } from "../validator/product.validator.js";

const upload = multer({
  storage: multer.memoryStorage(), limits: {
    fileSize: 1024*1024*5,
  }
})


const router = express.Router();

router.post('/', authenticateSeller,createProductValidator ,upload.array('images', 7), createProduct)


export default router;
