import cartModel from '../models/cart.model.js';
import productModel from '../models/product.model.js';
import { stockOfVariant } from '../dao/product.dao.js';

export const addToCart = async (req, res) => {
  const { productId, variantId } = req.params;
  const { quantity = 1 } = req.body;

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

  // sabse pehle product ka stock check karenge
  const stock = await stockOfVariant(productId, variantId);

  // will check ki user ki koi cart exist karti hai ya nahi...
  // agar koi cart nahi hai, toh ak nayi cart bnayenge. verna usi cart k अंदर add krenge.
  let cart =
    (await cartModel.findOne({ user: req.user._id })) ||
    (await cartModel.create({ user: req.user._id }));

  // agar pehle se uss cart k andar same variant id present hai, toh quantity add kr denge,
  // warna add kr denge product ko uss cart k andar.

  const isProductAlreadyInCart = cart.items.some(
    (item) =>
      item.product.toString() === productId &&
      item.variant?.toString() === variantId
  );

  // agar product already cart mein present hai ,
  if (isProductAlreadyInCart) {
    // aab humko check karna padega ki stock present hai ya nahi

    // hum ak check lgayenge ki agar kisi cart ki item inventory se zyada ho, toh usse nhi add hone dena hai.
    const quantityInCart = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId
    ).quantity;

    if (quantityInCart + quantity > stock) {
      return res.status(400).json({
        message: `Only ${stock} items are available in stock, and you already have ${quantityInCart} items in your cart.`,
        success: false,
      });
    }

    // iska mtlb hai ki stock is present, toh hum uski quantity ko update kar denge.

    await cartModel.findOneAndUpdate(
      {
        user: req.user._id,
        'items.product': productId,
        'items.variant': variantId,
      },
      { $inc: { 'items.$.quantity': quantity } },
      { new: true }
    );

    return res.status(200).json({
      message: 'Cart updated successfully',
      success: true,
    });
  }

  // agar product cart mein present nahi hai , toh usse cart mein add krenge.

  if (quantity > stock) {
    return res.status(400).json({
      message: `Only ${stock} items left in stock`,
      success: false,
    });
  }

  cart.items.push({
    product: productId,
    variant: variantId,
    quantity,
    price: product.price,
  });

  await cart.save();

  return res.status(200).json({
    message: 'Product added to cart successfully',
    success: true,
  });
};


export const getCart = async (req, res) => {
    const user = req.user

    let cart = await cartModel.findOne({ user: user._id }).populate("items.product")

    if (!cart) {
        cart = await cartModel.create({ user: user._id })
    }

    return res.status(200).json({
        message: "Cart fetched successfully",
        success: true,
        cart
    })
}