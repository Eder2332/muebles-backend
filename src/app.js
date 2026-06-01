const express = require('express');

const cors = require('cors');

const limiter = require('./middlewares/rateLimit');

const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Middlewares base (antes de las rutas)
app.use(cors());
app.use(express.json());
app.use(limiter);

// Static (útil en local; en producción el frontend irá por Vercel)
app.use(express.static('src/public'));

// Rutas API
app.use('/api/users', userRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
});




module.exports = app;
