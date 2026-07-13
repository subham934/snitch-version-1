import cartModel from '../models/cart.model.js';

export const addToCart = async (req, res) => {
  const { productId, variantId } = req.params;

  const product = await productModel.findOne({
    _id: productId,
    'variants._id': variantId,
  });

  if (!product) {
    return res.status(404).json({
      message: 'Product or variant not found.',
      success: false,
    });
  }

  let cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({
      message: 'Cart not found.',
      success: false,
    });
  }
};
