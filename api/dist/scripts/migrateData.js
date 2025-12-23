"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const configs_1 = require("../configs");
const musicService_1 = require("../services/musicService");
// Load environment variables
dotenv_1.default.config();
const migrateData = async () => {
    try {
        console.log('🔄 Starting data migration...');
        // Connect to MongoDB
        await (0, configs_1.connectDatabase)();
        // Read JSON file
        const dataPath = path.join(__dirname, '../../data.json');
        const jsonData = fs.readFileSync(dataPath, 'utf8');
        const musicArray = JSON.parse(jsonData);
        console.log(`📦 Found ${musicArray.length} songs in data.json`);
        // Initialize service
        const musicService = new musicService_1.MusicService();
        // Check if data already exists
        const existingMusic = await musicService.getAllMusic();
        if (existingMusic.length > 0) {
            console.log(`⚠️  Database already contains ${existingMusic.length} songs. Skipping migration.`);
            console.log('💡 To re-migrate, please clear the database first.');
            await (0, configs_1.disconnectDatabase)();
            return;
        }
        // Insert data
        await musicService.createManyMusic(musicArray);
        console.log(`✅ Successfully migrated ${musicArray.length} songs to MongoDB`);
        // Disconnect
        await (0, configs_1.disconnectDatabase)();
        console.log('✨ Migration completed!');
    }
    catch (error) {
        console.error('❌ Migration error:', error);
        await (0, configs_1.disconnectDatabase)();
        process.exit(1);
    }
};
migrateData();
//# sourceMappingURL=migrateData.js.map