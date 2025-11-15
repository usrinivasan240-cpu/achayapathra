const mongoose = require('mongoose');

const connectDB = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGODB_URI);
    const { host, port, name } = mongoose.connection;
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${host}:${port}/${name}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error', error);
    process.exit(1);
  }
};

module.exports = connectDB;
