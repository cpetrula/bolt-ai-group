import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import mediaRoutes from './routes/media.js';
import contactRoutes from './routes/contact.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bolt AI Group API',
    status: 'running',
    version: '1.0.0'
  });
});

app.use('/api/media', mediaRoutes);
app.use('/api/contact', contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
