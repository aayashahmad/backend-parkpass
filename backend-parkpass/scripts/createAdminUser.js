const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parkpass', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Create admin user function
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'admin@parkpass.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create super-admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@parkpass.com',
      password: 'admin123',
      role: 'super-admin'
    });
    
    console.log('Admin user created successfully:', adminUser.name);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Run the function
createAdminUser();