require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with this value already exists.' });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body contains invalid JSON.' });
  }

  console.error(error);
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exitCode = 1;
  });
}

module.exports = app;
