import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  phone: String,
  password: String,
  image: String,
  authProvider: String,
  createdAt: { type: Date, default: Date.now }
});

const outletSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
  shopName: String,
  ownerName: String,
  contact: String,
  address: String,
  type: String,
  delivery: Boolean,
  openTime: String,
  closeTime: String,
  upiId: String,
  qrCode: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  customerName: String,
  userId: String,
  outletId: String,
  items: Array,
  total: Number,
  totalAmount: Number,
  mode: String,
  details: Object,
  paymentMethod: String,
  paymentStatus: { type: String, default: 'pending' },
  status: { type: String, default: 'Pending' },
  statusHistory: Array,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ratingSchema = new mongoose.Schema({
  outletId: String,
  userId: String,
  orderId: String,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const otpSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  otp: String,
  expiresAt: { type: Date, index: { expires: 0 } }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Outlet = mongoose.models.Outlet || mongoose.model('Outlet', outletSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const Rating = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);
export const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);
