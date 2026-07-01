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

    return res
      .status(201)
      .json({ message: 'Product created successfully', success: true, product });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error', success: false });
  }
}

export async function getSellerProducts(req, res) {
  const seller = req.user;
  
  const products = await productModel.find({seller: seller._id})

   res.status(200).json({
    message: 'Products fetched successfully',
    success: true,
    products
  })
}


export async function getAllProducts(req, res){
  const products = await productModel.find();

  return res.status(200).json({
    message: 'Products fetched successfully',
    success: true,
    products
  })
}

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