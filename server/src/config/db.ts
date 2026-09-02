import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME;
  if (!mongoUrl || !dbName) {
    throw new Error('MONGO_URL and DB_NAME must be set in the environment');
  }
  await mongoose.connect(mongoUrl, { dbName });
  console.log(`[db] connected to MongoDB database "${dbName}"`);
}
