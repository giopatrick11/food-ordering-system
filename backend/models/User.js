const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, default: 'password123' }, // Simplified for this prototype
  address: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'restaurant'], default: 'user' },
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' } // Only for restaurant role
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
