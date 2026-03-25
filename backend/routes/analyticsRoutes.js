const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');

// Total sales per restaurant
// Note: Orders don't store restaurant_id directly in the root, but items are from restaurants.
// For simplicity, let's assume an order is for ONE restaurant (adding restaurant_id to Order would be better).
// Let's modify Order schema to include restaurant_id.
router.get('/sales-per-restaurant', async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: "$restaurant_id",
          totalSales: { $sum: "$total_price" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "restaurants",
          localField: "_id",
          foreignField: "_id",
          as: "restaurant"
        }
      },
      { $unwind: "$restaurant" },
      {
        $project: {
          restaurantName: "$restaurant.name",
          totalSales: 1,
          orderCount: 1
        }
      }
    ]);
    res.send(sales);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Most ordered food items
router.get('/most-ordered-items', async (req, res) => {
  try {
    const items = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);
    res.send(items);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Average order value
router.get('/average-order-value', async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          avgOrderValue: { $avg: "$total_price" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);
    res.send(stats[0] || { avgOrderValue: 0, totalOrders: 0 });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Sales per restaurant (Single Restaurant)
router.get('/sales/:restaurantId', async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $match: { 
          restaurant_id: new mongoose.Types.ObjectId(req.params.restaurantId), 
          status: { $ne: 'cancelled' } 
      } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$total_price" },
          orderCount: { $sum: 1 }
        }
      }
    ]);
    res.send(sales[0] || { totalSales: 0, orderCount: 0 });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Most ordered items (Single Restaurant)
router.get('/most-ordered-items/:restaurantId', async (req, res) => {
  try {
    const items = await Order.aggregate([
      { $match: { 
          restaurant_id: new mongoose.Types.ObjectId(req.params.restaurantId),
          status: { $ne: 'cancelled' }
      } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);
    res.send(items);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
