"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const musicService_1 = require("../services/musicService");
const router = (0, express_1.Router)();
const musicService = new musicService_1.MusicService();
/**
 * GET /api/music
 * Lấy một bài hát ngẫu nhiên
 */
router.get('/music', async (req, res) => {
    try {
        const randomMusic = await musicService.getRandomMusic();
        if (!randomMusic) {
            return res.status(404).json({
                error: 'No music found in database'
            });
        }
        res.json(randomMusic);
    }
    catch (error) {
        console.error('Error in GET /api/music:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
/**
 * GET /api/music/all
 * Lấy tất cả bài hát
 */
router.get('/music/all', async (req, res) => {
    try {
        const allMusic = await musicService.getAllMusic();
        res.json(allMusic);
    }
    catch (error) {
        console.error('Error in GET /api/music/all:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
/**
 * GET /api/music/:id
 * Lấy bài hát theo ID
 */
router.get('/music/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: 'Invalid ID format'
            });
        }
        const music = await musicService.getMusicById(id);
        if (!music) {
            return res.status(404).json({
                error: 'Music not found'
            });
        }
        res.json(music);
    }
    catch (error) {
        console.error('Error in GET /api/music/:id:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
/**
 * POST /api/music
 * Tạo bài hát mới
 */
router.post('/music', async (req, res) => {
    try {
        const { id, title, url } = req.body;
        if (!id || !title || !url) {
            return res.status(400).json({
                error: 'Missing required fields: id, title, url'
            });
        }
        const newMusic = await musicService.createMusic({ id, title, url });
        res.status(201).json(newMusic);
    }
    catch (error) {
        console.error('Error in POST /api/music:', error);
        if (error.code === 11000) {
            return res.status(409).json({
                error: 'Music with this ID already exists'
            });
        }
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
/**
 * DELETE /api/music/:id
 * Xóa bài hát theo ID
 */
router.delete('/music/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: 'Invalid ID format'
            });
        }
        const deleted = await musicService.deleteMusic(id);
        if (!deleted) {
            return res.status(404).json({
                error: 'Music not found'
            });
        }
        res.json({
            message: 'Music deleted successfully'
        });
    }
    catch (error) {
        console.error('Error in DELETE /api/music/:id:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=musicRoutes.js.map