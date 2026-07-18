import mongoose from 'mongoose';
import priceSchema from './price.schema.js';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
      },
      variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product.variants',
      },
      quantity: {
        type: Number,
        default: 1,
      },
      price: {
        type: priceSchema,
        required: true,
      },
    },
  ],
});

const cartModel = mongoose.model('cart', cartSchema);

export default cartModel;

