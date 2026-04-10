const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [OrderItemSchema],
  total_price: { type: Number, required: true },
  delivery_mode: { 
    type: String, 
    enum: ['pickup', 'delivery'], 
    default: 'pickup' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  order_date: { type: Date, default: Date.now },
  special_instructions: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
