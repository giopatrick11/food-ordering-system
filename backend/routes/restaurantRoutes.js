const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');

// Add a new restaurant
router.post('/', async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.status(201).send(restaurant);
  } catch (error) {
    res.status(400).send(error);
  }
});

// List all restaurants (with filters and food search)
router.get('/', async (req, res) => {
  const { cuisine, foodSearch } = req.query;
  let query = {};
  if (cuisine) query.cuisine = cuisine;
  
  if (foodSearch) {
    query['menu.name'] = { $regex: foodSearch, $options: 'i' };
  }

  try {
    const restaurants = await Restaurant.find(query);
    res.send(restaurants);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get restaurant details
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).send();
    res.send(restaurant);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Add menu item
router.put('/:id/menu', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $push: { menu: req.body } },
      { new: true }
    );
    if (!restaurant) return res.status(404).send();
    res.send(restaurant);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Remove menu item
router.delete('/:id/menu/:itemId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $pull: { menu: { _id: req.params.itemId } } },
      { new: true }
    );
    if (!restaurant) return res.status(404).send();
    res.send(restaurant);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
