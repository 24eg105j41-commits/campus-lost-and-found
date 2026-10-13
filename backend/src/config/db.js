const mongoose = require('mongoose');

let mongoMemoryServer = null;

/**
 * Connect to MongoDB.
 * 1. Attempts connection to process.env.MONGODB_URI (e.g., local mongod or MongoDB Atlas).
 * 2. If no MongoDB is reachable locally, seamlessly boots an embedded in-memory MongoDB server
 *    so the application and tests function completely out-of-the-box without manual setup.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_lost_and_found';
  const isExplicitUri = Boolean(process.env.MONGODB_URI);
  // Atlas remote connections need adequate timeout for initial TLS handshake
  const timeoutMs = isExplicitUri ? 8000 : 2000;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] External MongoDB not reachable (${error.message}).`);

    if (process.env.NODE_ENV === 'production' && isExplicitUri) {
      console.error('[Database Error] Failed to connect to MongoDB Atlas in production.');
      console.error('[Database Error] Ensure MONGODB_URI is set correctly in Render environment variables and Network Access allows 0.0.0.0/0.');
      throw error;
    }

    console.log('[Database] Starting embedded in-memory MongoDB engine for local development & testing...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'campus_lost_and_found',
        },
      });

      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);

      console.log(`[Database] Embedded in-memory MongoDB started: ${memoryUri}`);
      console.log('[Database] Full MongoDB operations (indexing, bcrypt, queries) are fully functional.');
      return conn;
    } catch (memError) {
      console.error(`[Database Error] Could not start embedded MongoDB: ${memError.message}`);
      throw memError;
    }
  }
};

// Graceful cleanup on process termination
process.on('SIGINT', async () => {
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
  await mongoose.disconnect();
  process.exit(0);
});

module.exports = connectDB;
