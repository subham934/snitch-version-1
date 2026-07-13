today , we will implement the "Add to cart" feature in our  React e-commerce application.

- user can have only one cart.
- user can add the product in cart.
- user can manage the quantity of the cart item [cart item can't have quantity less than 1].

CART SCHEMA :
- userid
- items: [
    {
        product,
        variant,
        quantity,
        price
    }
]


let's create a model for cart

-------------------------------
backend>src>model>cart.model.js
-------------------------------


import mongoose from 'mongoose';

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
        ref: 'variant',
      },
      quantity: {
        type: Number,
        default: 1
      },
      price: {
        amount: {
          type: Number,
          required: true,
        },
        currency: {
          type: String,
          enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR'],
          default: 'INR',
        },
      },
    },
  ],
});



=> now, as we can see that the price schema is getting repeated multiple times, in product.model.js , we have used price schema twice and in cart.model.js also we have used price schema. this create redundancy.

=> To avoid this redundancy, we can create a schema for price and use it in both product.model.js and cart.model.js

----------------------------------
backend>src>models>price.schema.js
----------------------------------

import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR'],
      default: 'INR',
    },
  },
  { _id: false, _v: false }
);

export default priceSchema;



now that the schema is done, we'll make changes in cart.model.js and product.model.js

//===================================

--------------------------------
backend>src>models>cart.model.js
--------------------------------

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
        ref: 'variant',
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

//===================================

-----------------------------------
backend>src>models>product.model.js
-----------------------------------


import mongoose from 'mongoose';
import priceSchema from './price.schema.js';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    price: {
      type: priceSchema,
      required: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
    variants: [
      {
        images: [
          {
            url: {
              type: String,
              required: true,
            },
          },
        ],
        stock: {
          type: Number,
          default: 0,
        },
        attributes: {
          type: Map,
          of: String,
        },
        price: {
          type: priceSchema,
        },
      },
    ],
  },
  { timestamps: true }
);

const productModel = mongoose.model('product', productSchema);

export default productModel;



//===================================

now that we have created cart.model.js, in cartModel what will happen is , user kisi bhi variant ko add kar sakta hai apni cart k andar. for that we need to create an API


POST /api/cart/add/:productId/:variant

this API will manage the varient and quantity of the cart of any product.
