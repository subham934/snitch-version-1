import {body, validationResult} from "express-validator";

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const createProductValidator =[
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priceAmount').isNumeric().withMessage('Price must be a number'),
  body('priceCurrency').notEmpty().withMessage('Currency is required'),
  validateRequest,
]