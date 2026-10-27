const express = require("express");
const cors = require("cors");
const path = require('node:path');
const app = express();
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use("/api/products", require("./routes/products"));
app.use("/api/users", require("./routes/users"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
