import mongoose from 'mongoose';

export async function connectToDatabase() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/formcraft';

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      dbName: uri.split('/').pop(),
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
    
  } catch (err) {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  }
}


