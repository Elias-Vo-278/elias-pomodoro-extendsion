import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './configs';
import routes from './routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// ----------------------------------------------------
// Middleware
// ----------------------------------------------------

// Allow all origins (essential for Chrome Extension access)
app.use(cors());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------
// Routes
// ----------------------------------------------------

app.use('/', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ----------------------------------------------------
// Server Start
// ----------------------------------------------------

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`\n🎉 Music API Server running on http://localhost:${PORT}`);
      console.log(`\nTesting Example: http://localhost:${PORT}/api/music`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  const { disconnectDatabase } = await import('./configs');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  const { disconnectDatabase } = await import('./configs');
  await disconnectDatabase();
  process.exit(0);
});
