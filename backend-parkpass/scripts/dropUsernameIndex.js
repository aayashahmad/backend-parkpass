const mongoose = require('mongoose');
require('dotenv').config(); // Loads MONGODB_URI from .env

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await mongoose.connection.db.collection('users').dropIndex('username_1');
    console.log('🗑️  Dropped index:', result);

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to drop index:', err.message);
    process.exit(1);
  }
};

run();
