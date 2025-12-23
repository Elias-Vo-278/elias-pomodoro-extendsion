import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../configs';
import { MusicService } from '../services/musicService';

// Load environment variables
dotenv.config();

interface MusicData {
  id: number;
  title: string;
  url: string;
}

const migrateData = async () => {
  try {
    console.log('🔄 Starting data migration...');

    // Connect to MongoDB
    await connectDatabase();

    // Read JSON file
    const dataPath = path.join(__dirname, '../../data.json');
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    const musicArray: MusicData[] = JSON.parse(jsonData);

    console.log(`📦 Found ${musicArray.length} songs in data.json`);

    // Initialize service
    const musicService = new MusicService();

    // Check if data already exists
    const existingMusic = await musicService.getAllMusic();
    if (existingMusic.length > 0) {
      console.log(`⚠️  Database already contains ${existingMusic.length} songs. Skipping migration.`);
      console.log('💡 To re-migrate, please clear the database first.');
      await disconnectDatabase();
      return;
    }

    // Insert data
    await musicService.createManyMusic(musicArray);
    console.log(`✅ Successfully migrated ${musicArray.length} songs to MongoDB`);

    // Disconnect
    await disconnectDatabase();
    console.log('✨ Migration completed!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    await disconnectDatabase();
    process.exit(1);
  }
};

migrateData();
