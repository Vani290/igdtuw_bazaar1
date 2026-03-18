// igdtuw-bazaar-backend/server.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// MongoDB Connection
const uri = 'mongodb+srv://new123:bazaar123@cluster0.nob7p22.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB connection successful'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================
// SCHEMAS & MODELS
// ============================================

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  productName:   { type: String, required: true },
  price:         { type: Number, required: true },
  description:   { type: String, required: true },
  image:         { type: String, required: true },
  category:      { type: String, required: true },
  sellerContact: { type: String, required: true },
  createdAt:     { type: Date, default: Date.now }
});

const sharedItemSchema = new mongoose.Schema({
  itemName:      { type: String, required: true },
  description:   { type: String, required: true },
  image:         { type: String, required: true },
  category:      { type: String, required: true },
  contact:       { type: String, required: true },
  availableFrom: { type: Date, required: true },
  availableTo:   { type: Date, required: true },
  createdAt:     { type: Date, default: Date.now }
});

const User       = mongoose.model('User', userSchema);
const Product    = mongoose.model('Product', productSchema);
const SharedItem = mongoose.model('SharedItem', sharedItemSchema);

// ============================================
// PRODUCT ROUTES
// ============================================

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    console.log('📡 Fetching all products');
    const products = await Product.find({}).sort({ createdAt: -1 });
    console.log(`✅ Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST new product
app.post('/api/products', async (req, res) => {
  try {
    console.log('📝 Creating new product:', req.body);
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    console.log('✅ Product saved:', savedProduct.productName);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// AUTH ROUTES
// ============================================

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = new User({ name, email, password });
    await newUser.save();
    console.log('✅ New user created:', email);
    res.status(201).json({ message: 'User created successfully', userId: newUser._id });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials: User not found.' });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials: Incorrect password.' });
    }
    console.log('✅ User logged in:', email);
    res.json({ message: 'Login successful!', userId: user._id, userName: user.name });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ============================================
// SHARED ITEMS ROUTES
// ============================================

// GET all shared items
app.get('/api/shared-items', async (req, res) => {
  try {
    console.log('📡 Fetching all shared items');
    const items = await SharedItem.find({}).sort({ createdAt: -1 });
    console.log(`✅ Found ${items.length} shared items`);
    res.json(items);
  } catch (error) {
    console.error('❌ Error fetching shared items:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST new shared item
app.post('/api/shared-items', async (req, res) => {
  try {
    console.log('📝 Creating new shared item:', req.body);
    const newItem = new SharedItem(req.body);
    const savedItem = await newItem.save();
    console.log('✅ Shared item saved:', savedItem.itemName);
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('❌ Error creating shared item:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE shared item
app.delete('/api/shared-items/:id', async (req, res) => {
  try {
    const deleted = await SharedItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Shared item not found' });
    }
    res.json({ message: 'Shared item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for: http://localhost:5173`);
});