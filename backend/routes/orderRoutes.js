const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Place order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

// List all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('user_id');
    res.send(orders);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get user orders
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.params.userId }).populate('restaurant_id');
    res.send(orders);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get restaurant orders
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const orders = await Order.find({ restaurant_id: req.params.restaurantId }).populate('user_id');
    res.send(orders);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).send();
    res.send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Cancel order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!order) return res.status(404).send();
    res.send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
