// cleanup.js - Run this script to clean up null IDs in your database
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/startup', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB for cleanup');
  cleanupDatabase();
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function cleanupDatabase() {
  try {
    // Remove documents with null or undefined id field
    const result = await mongoose.connection.db.collection('ideas').deleteMany({
      $or: [
        { id: null },
        { id: { $exists: false } },
        { id: undefined }
      ]
    });
    
    console.log(`🧹 Cleaned up ${result.deletedCount} documents with null IDs`);
    
    // Optional: Drop the problematic index if it exists
    try {
      await mongoose.connection.db.collection('ideas').dropIndex('id_1');
      console.log('🗑️ Dropped problematic id_1 index');
    } catch (indexErr) {
      console.log('ℹ️ No id_1 index to drop (this is normal)');
    }
    
    console.log('✅ Database cleanup completed');
  } catch (err) {
    console.error('❌ Cleanup error:', err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

// Run with: node cleanup.js