import Joi from 'joi';

export const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string().min(6).max(100).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const orderSchema = Joi.object({
  userId: Joi.string().required(),
  outletId: Joi.string().required(),
  items: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    price: Joi.number().min(0).required()
  })).required(),
  totalAmount: Joi.number().min(0).required(),
  deliveryAddress: Joi.string().required()
});

export const ratingSchema = Joi.object({
  outletId: Joi.string().required(),
  userId: Joi.string().required(),
  orderId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500).allow('')
});

export const validateInput = (data, schema) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const messages = error.details.map(d => d.message);
    return { valid: false, errors: messages };
  }
  return { valid: true, value };
};
