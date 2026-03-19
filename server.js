import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================
// ✅ CORS FIX (important for deployment)
// ==============================
app.use(cors({
  origin: '*',   // allow all for now (later we can restrict)
}));
app.use(express.json());

// ==============================
// ✅ MongoDB Connection (ENV)
// ==============================
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB connection successful'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ==============================
// SCHEMAS & MODELS
// ==============================

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

// ==============================
// TEST ROUTE (VERY IMPORTANT)
// ==============================
app.get('/', (req, res) => {
  res.send('🚀 IGDTUW Bazaar Backend is Live!');
});

// ==============================
// PRODUCT ROUTES
// ==============================

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

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

// ==============================
// AUTH ROUTES
// ==============================

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User created', userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: 'Signup error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', userId: user._id, userName: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Login error' });
  }
});

// ==============================
// SHARED ITEMS ROUTES
// ==============================

app.get('/api/shared-items', async (req, res) => {
  try {
    const items = await SharedItem.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/shared-items', async (req, res) => {
  try {
    const newItem = new SharedItem(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/shared-items/:id', async (req, res) => {
  try {
    const deleted = await SharedItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});