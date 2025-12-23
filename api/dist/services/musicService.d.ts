import { IMusic } from '../models/Music';
export declare class MusicService {
    /**
     * Lấy một bài hát ngẫu nhiên
     */
    getRandomMusic(): Promise<IMusic | null>;
    /**
     * Lấy tất cả bài hát
     */
    getAllMusic(): Promise<IMusic[]>;
    /**
     * Lấy bài hát theo ID
     */
    getMusicById(id: number): Promise<IMusic | null>;
    /**
     * Tạo bài hát mới
     */
    createMusic(musicData: {
        id: number;
        title: string;
        url: string;
    }): Promise<IMusic>;
    /**
     * Tạo nhiều bài hát từ mảng
     */
    createManyMusic(musicArray: {
        id: number;
        title: string;
        url: string;
    }[]): Promise<IMusic[]>;
    /**
     * Xóa bài hát theo ID
     */
    deleteMusic(id: number): Promise<boolean>;
}
//# sourceMappingURL=musicService.d.ts.map