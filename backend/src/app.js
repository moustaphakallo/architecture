const express = require("express");
const cors = require("cors");
const path = require('node:path');
const mongoose = require('mongoose');
const connectDatabase = require('./config/database');
const app = express();
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'not-connected' });
});

app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();

  try {
    await connectDatabase(process.env.MONGODB_URI);
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.use("/api/products", require("./routes/products"));
app.use("/api/users", require("./routes/users"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
