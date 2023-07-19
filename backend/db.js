const mongoose = require('mongoose')
const dotenv =require('dotenv')


dotenv.config();

const connectToMongo = async () => {
  try {
    // Replace 'mongodb://localhost:27017/db_name' with your actual MongoDB connection string
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};
module.exports = connectToMongo;