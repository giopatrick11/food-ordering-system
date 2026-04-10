const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
});

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  menu: [MenuItemSchema],
  available_modes: { 
    type: [String], 
    enum: ['pickup', 'delivery'], 
    default: ['pickup', 'delivery'] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', RestaurantSchema);
