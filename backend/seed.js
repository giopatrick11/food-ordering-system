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
        available_modes: ['pickup', 'delivery'],
        menu: [
          { name: 'Classic Burger', price: 10, description: 'Beef patty, lettuce, tomato' },
          { name: 'Cheese Burger', price: 12, description: 'Beef patty, extra cheese' },
          { name: 'Fries', price: 5, description: 'Crispy golden fries' }
        ]
      },
      {
        name: 'Sushi Zen',
        cuisine: 'Japanese',
        available_modes: ['pickup', 'delivery'],
        menu: [
          { name: 'California Roll', price: 8, description: 'Crab, avocado, cucumber' },
          { name: 'Salmon Nigiri', price: 12, description: 'Fresh salmon on rice' },
          { name: 'Miso Soup', price: 4, description: 'Traditional soy broth' }
        ]
      },
      {
        name: 'Pasta House',
        cuisine: 'Italian',
        available_modes: ['pickup', 'delivery'],
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

    // Create some orders for analytics (90 days of data for Daily/Weekly/Monthly charts)
    const days = 90;
    const orders = [];
    const now = new Date();
    
    for (let i = 0; i < 100; i++) {
      const randomDay = Math.floor(Math.random() * days);
      const date = new Date(now);
      date.setDate(date.getDate() - randomDay);
      
      // Randomly pick a restaurant
      const rest = restaurants[Math.floor(Math.random() * restaurants.length)];
      const item = rest.menu[Math.floor(Math.random() * rest.menu.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      orders.push({
        user_id: users[Math.floor(Math.random() * 2)]._id, // Randomly pick John or Admin
        restaurant_id: rest._id,
        items: [{ name: item.name, quantity: quantity, price: item.price }],
        total_price: item.price * quantity,
        delivery_mode: Math.random() > 0.5 ? 'pickup' : 'delivery',
        status: 'delivered',
        order_date: date
      });
    }

    await Order.insertMany(orders);

    console.log("Database seeded successfully with all fields!");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();