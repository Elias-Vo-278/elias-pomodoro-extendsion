import { Music, IMusic } from '../models/Music';

export class MusicService {
  /**
   * Lấy một bài hát ngẫu nhiên
   */
  async getRandomMusic(): Promise<IMusic | null> {
    try {
      const count = await Music.countDocuments();
      if (count === 0) {
        return null;
      }
      
      const random = Math.floor(Math.random() * count);
      const music = await Music.findOne().skip(random);
      return music;
    } catch (error) {
      console.error('Error getting random music:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả bài hát
   */
  async getAllMusic(): Promise<IMusic[]> {
    try {
      return await Music.find();
    } catch (error) {
      console.error('Error getting all music:', error);
      throw error;
    }
  }

  /**
   * Lấy bài hát theo ID
   */
  async getMusicById(id: number): Promise<IMusic | null> {
    try {
      return await Music.findOne({ id });
    } catch (error) {
      console.error('Error getting music by id:', error);
      throw error;
    }
  }

  /**
   * Tạo bài hát mới
   */
  async createMusic(musicData: { id: number; title: string; url: string }): Promise<IMusic> {
    try {
      const music = new Music(musicData);
      return await music.save();
    } catch (error) {
      console.error('Error creating music:', error);
      throw error;
    }
  }

  /**
   * Tạo nhiều bài hát từ mảng
   */
  async createManyMusic(musicArray: { id: number; title: string; url: string }[]): Promise<IMusic[]> {
    try {
      return await Music.insertMany(musicArray);
    } catch (error) {
      console.error('Error creating many music:', error);
      throw error;
    }
  }

  /**
   * Xóa bài hát theo ID
   */
  async deleteMusic(id: number): Promise<boolean> {
    try {
      const result = await Music.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting music:', error);
      throw error;
    }
  }
}
