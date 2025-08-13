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

// Function to create ticket checker
// Update with actual values: email, password, parkId (ObjectId of the park)
const createTicketChecker = async () => {
  try {
    const email = 'checker@example.com'; // Change to desired email
    const password = 'checker123'; // Change to desired password
    const parkId = 'your-park-id-here'; // Replace with actual Park ObjectId

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Ticket checker user already exists');
      return;
    }

    // Create ticket checker user
    const user = await User.create({
      name: 'Ticket Checker',
      email,
      password,
      role: 'ticket-checker',
      assignedParks: [parkId]
    });

    console.log('Ticket checker created successfully:', user.name);
  } catch (error) {
    console.error('Error creating ticket checker:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

createTicketChecker();