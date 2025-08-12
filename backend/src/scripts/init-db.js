import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/formcraft';

async function initDatabase() {
  try {
    console.log('🔧 Initializing database...');
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Database connected successfully');
    
    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Database collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    if (collections.length === 0) {
      console.log('💡 Database is empty - ready for first use');
    }
    
    console.log('✅ Database initialization complete');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

initDatabase();
