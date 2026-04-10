const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const mongoose = require("mongoose");

// Full System Backup (JSON Download)
router.get("/backup", async (req, res) => {
  console.log("Backup route called");
  try {
    const [users, restaurants, orders] = await Promise.all([
      User.find().lean(),
      Restaurant.find().lean(),
      Order.find().lean(),
    ]);

    const backup = {
      export_date: new Date().toISOString(),
      version: "1.1",
      data: {
        users,
        restaurants,
        orders,
      },
    };

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=cafeteria_backup_${new Date().toISOString().split("T")[0]}.json`,
    );
    res.status(200).json(backup);
  } catch (error) {
    console.error("CRITICAL BACKUP FAILURE:", error);
    res.status(500).json({
      success: false,
      message: "Backup creation failed on server",
      error: error.message,
    });
  }
});

// Total sales per restaurant
// Note: Orders don't store restaurant_id directly in the root, but items are from restaurants.
// For simplicity, let's assume an order is for ONE restaurant (adding restaurant_id to Order would be better).
// Let's modify Order schema to include restaurant_id.
router.get("/sales-per-restaurant", async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$restaurant_id",
          totalSales: { $sum: "$total_price" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "restaurants",
          localField: "_id",
          foreignField: "_id",
          as: "restaurant",
        },
      },
      { $unwind: "$restaurant" },
      {
        $project: {
          restaurantName: "$restaurant.name",
          totalSales: 1,
          orderCount: 1,
        },
      },
    ]);
    res.send(sales);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Most ordered food items
router.get("/most-ordered-items", async (req, res) => {
  try {
    const items = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);
    res.send(items);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Average order value
router.get("/average-order-value", async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          avgOrderValue: { $avg: "$total_price" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    res.send(stats[0] || { avgOrderValue: 0, totalOrders: 0 });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Sales per restaurant (Single Restaurant)
router.get("/sales/:restaurantId", async (req, res) => {
  try {
    const sales = await Order.aggregate([
      {
        $match: {
          restaurant_id: new mongoose.Types.ObjectId(req.params.restaurantId),
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$total_price" },
          orderCount: { $sum: 1 },
        },
      },
    ]);
    res.send(sales[0] || { totalSales: 0, orderCount: 0 });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Most ordered items (Single Restaurant)
router.get("/most-ordered-items/:restaurantId", async (req, res) => {
  try {
    const items = await Order.aggregate([
      {
        $match: {
          restaurant_id: new mongoose.Types.ObjectId(req.params.restaurantId),
          status: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);
    res.send(items);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Sales Trend (last 7 days)
router.get("/sales-trend", async (req, res) => {
  try {
    const trend = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          order_date: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$order_date" } },
          totalSales: { $sum: "$total_price" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.send(trend);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Sales Trend for a specific restaurant (Daily, Weekly, Monthly)
router.get("/sales-trend/:restaurantId", async (req, res) => {
  const { period } = req.query; // daily, weekly, monthly
  const restaurantId = new mongoose.Types.ObjectId(req.params.restaurantId);

  let groupFormat = "%Y-%m-%d";
  if (period === "weekly") groupFormat = "%Y-W%U";
  if (period === "monthly") groupFormat = "%Y-%m";

  try {
    const trend = await Order.aggregate([
      {
        $match: {
          restaurant_id: restaurantId,
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$order_date" } },
          totalSales: { $sum: "$total_price" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.send(trend);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
