const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const find = require('find-process');
const port = 3020;

async function startServer() {
  // Check if the port is already in use
  const portInUse = await find('port', port);

  if (portInUse.length > 0) {
    console.log(`Port ${port} is already in use by process ${portInUse[0].pid}. Killing the process...`);

    // Kill the process using the port
    process.kill(portInUse[0].pid);
  }

  const app = express();

  // Middleware to parse JSON
  app.use(express.json());

  // CORS configuration
  const corsOptions = {
    origin: 'https://inotebook-qlhs.onrender.com', // Update with your frontend domain on Render.com
    methods: 'GET,POST,PUT,DELETE', // Allowed methods
    allowedHeaders: 'Content-Type,Authorization,auth-token', // Allowed headers
  };
  app.use(cors(corsOptions));

  // Available routes
  app.use('/api/auth', require('./routes/auth')); 
  app.use('/api/notes', require('./routes/notes'));

  try {
    await connectToMongo();
    console.log('Connected to MongoDB successfully');

    app.listen(port, () => {
      console.log(`iNotebook backend listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Exit the process with failure
  }
}

startServer();
