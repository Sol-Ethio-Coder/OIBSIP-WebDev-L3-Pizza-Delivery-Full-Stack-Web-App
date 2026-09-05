require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Inventory = require('../models/Inventory');
const Admin = require('../models/Admin');

const bases = [
  { name: 'Classic Hand-Tossed', price: 150 },
  { name: 'Thin Crust', price: 140 },
  { name: 'Cheese Burst', price: 200 },
  { name: 'Whole Wheat', price: 160 },
  { name: 'Gluten-Free', price: 220 }
];

const sauces = [
  { name: 'Classic Tomato', price: 20 },
  { name: 'Spicy Arrabbiata', price: 25 },
  { name: 'Pesto', price: 40 },
  { name: 'BBQ', price: 30 },
  { name: 'Garlic White Sauce', price: 35 }
];

const cheeses = [
  { name: 'Mozzarella', price: 50 },
  { name: 'Cheddar Blend', price: 55 },
  { name: 'Vegan Cheese', price: 65 },
  { name: 'Extra Mozzarella', price: 80 }
];

const vegetables = [
  { name: 'Onion', price: 10 },
  { name: 'Bell Pepper', price: 10 },
  { name: 'Mushroom', price: 15 },
  { name: 'Sweet Corn', price: 10 },
  { name: 'Black Olives', price: 15 },
  { name: 'Jalapeno', price: 12 },
  { name: 'Baby Spinach', price: 14 }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await Inventory.deleteMany({});

  const toDocs = (list, type) =>
    list.map(item => ({
      ...item,
      type,
      stockCount: 100,
      lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD) || 20
    }));

  await Inventory.insertMany([
    ...toDocs(bases, 'base'),
    ...toDocs(sauces, 'sauce'),
    ...toDocs(cheeses, 'cheese'),
    ...toDocs(vegetables, 'vegetable')
  ]);
  console.log('Inventory seeded.');

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@pizzaapp.com').toLowerCase();
  const existingAdmin = await Admin.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(
      process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123',
      10
    );
    await Admin.create({ name: 'Admin', email: adminEmail, password: hashedPassword });
    console.log(`Admin account created: ${adminEmail}`);
  } else {
    console.log('Admin account already exists, skipping.');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
