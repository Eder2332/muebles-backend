const express = require('express');

const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const allowedOrigins = [
  ...defaultAllowedOrigins,
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin Origin (Postman/curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS_NOT_ALLOWED'));
  }
};

// Middlewares base (antes de las rutas)

app.use(cors(corsOptions));
app.use(express.json());

// Static (Render también puede servir el frontend)
app.use(express.static('src/public'));


// Rutas API
app.use('/api/users', userRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Errores (incluye CORS)
app.use((err, req, res, next) => {
  if (err && err.message === 'CORS_NOT_ALLOWED') {
    return res.status(403).json({
      error: 'CORS: origen no permitido'
    });
  }
  return next(err);
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
});




module.exports = app;
