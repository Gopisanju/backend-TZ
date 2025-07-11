const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

// ✅ Use cors with frontend origin and credentials if needed
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// ✅ All Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://gopisanju44:Gopi$anju44@cluster0.sm381hp.mongodb.net/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server running on http://localhost:${process.env.PORT || 8000}`);
  });
})
.catch((err) => console.error('DB connection error:', err));
