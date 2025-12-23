"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicService = void 0;
const Music_1 = require("../models/Music");
class MusicService {
    /**
     * Lấy một bài hát ngẫu nhiên
     */
    async getRandomMusic() {
        try {
            const count = await Music_1.Music.countDocuments();
            if (count === 0) {
                return null;
            }
            const random = Math.floor(Math.random() * count);
            const music = await Music_1.Music.findOne().skip(random);
            return music;
        }
        catch (error) {
            console.error('Error getting random music:', error);
            throw error;
        }
    }
    /**
     * Lấy tất cả bài hát
     */
    async getAllMusic() {
        try {
            return await Music_1.Music.find();
        }
        catch (error) {
            console.error('Error getting all music:', error);
            throw error;
        }
    }
    /**
     * Lấy bài hát theo ID
     */
    async getMusicById(id) {
        try {
            return await Music_1.Music.findOne({ id });
        }
        catch (error) {
            console.error('Error getting music by id:', error);
            throw error;
        }
    }
    /**
     * Tạo bài hát mới
     */
    async createMusic(musicData) {
        try {
            const music = new Music_1.Music(musicData);
            return await music.save();
        }
        catch (error) {
            console.error('Error creating music:', error);
            throw error;
        }
    }
    /**
     * Tạo nhiều bài hát từ mảng
     */
    async createManyMusic(musicArray) {
        try {
            return await Music_1.Music.insertMany(musicArray);
        }
        catch (error) {
            console.error('Error creating many music:', error);
            throw error;
        }
    }
    /**
     * Xóa bài hát theo ID
     */
    async deleteMusic(id) {
        try {
            const result = await Music_1.Music.deleteOne({ id });
            return result.deletedCount > 0;
        }
        catch (error) {
            console.error('Error deleting music:', error);
            throw error;
        }
    }
}
exports.MusicService = MusicService;
//# sourceMappingURL=musicService.js.map