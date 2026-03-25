const mongoose = require('mongoose');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Order = require('./models/Order');

mongoose.connect("mongodb://127.0.0.1:27017/food-ordering-db")
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => console.log(err));

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Order.deleteMany({});

    // Create Restaurants
    const restaurants = await Restaurant.insertMany([
      {
        name: 'Burger Palace',
        cuisine: 'American',
        menu: [
          { name: 'Classic Burger', price: 10, description: 'Beef patty, lettuce, tomato' },
          { name: 'Cheese Burger', price: 12, description: 'Beef patty, extra cheese' },
          { name: 'Fries', price: 5, description: 'Crispy golden fries' }
        ]
      },
      {
        name: 'Sushi Zen',
        cuisine: 'Japanese',
        menu: [
          { name: 'California Roll', price: 8, description: 'Crab, avocado, cucumber' },
          { name: 'Salmon Nigiri', price: 12, description: 'Fresh salmon on rice' },
          { name: 'Miso Soup', price: 4, description: 'Traditional soy broth' }
        ]
      },
      {
        name: 'Pasta House',
        cuisine: 'Italian',
        menu: [
          { name: 'Spaghetti Carbonara', price: 15, description: 'Egg, cheese, pancetta' },
          { name: 'Lasagna', price: 18, description: 'Meaty layered pasta' },
          { name: 'Garlic Bread', price: 6, description: 'Buttery garlic goodness' }
        ]
      }
    ]);

    // Create Users with roles
    const users = await User.insertMany([
      { 
        name: 'John User', 
        email: 'user@campus.com', 
        address: 'Dorm 101', 
        phone: '555-0101', 
        role: 'user',
        password: 'password'
      },
      { 
        name: 'Admin Boss', 
        email: 'admin@campus.com', 
        address: 'Main Office', 
        phone: '555-0102', 
        role: 'admin',
        password: 'admin'
      },
      { 
        name: 'Burger Owner', 
        email: 'burger@campus.com', 
        address: 'Kitchen A', 
        phone: '555-0103', 
        role: 'restaurant', 
        restaurant_id: restaurants[0]._id,
        password: 'burger'
      },
      { 
        name: 'Sushi Owner', 
        email: 'sushi@campus.com', 
        address: 'Kitchen B', 
        phone: '555-0104', 
        role: 'restaurant', 
        restaurant_id: restaurants[1]._id,
        password: 'sushi'
      }
    ]);

    // Create some orders for analytics
    const orders = [
      {
        user_id: users[0]._id,
        restaurant_id: restaurants[0]._id,
        items: [{ name: 'Classic Burger', quantity: 2, price: 10 }],
        total_price: 20,
        status: 'delivered'
      },
      {
        user_id: users[0]._id,
        restaurant_id: restaurants[1]._id,
        items: [{ name: 'Salmon Nigiri', quantity: 1, price: 12 }],
        total_price: 12,
        status: 'pending'
      }
    ];

    await Order.insertMany(orders);

    console.log("Database seeded successfully with roles!");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
