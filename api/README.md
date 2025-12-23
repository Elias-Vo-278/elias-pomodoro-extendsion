# Elias Pomodoro API

API server được xây dựng với TypeScript, Express và MongoDB.

## Cấu trúc thư mục

```
api/
├── src/
│   ├── configs/          # Cấu hình (database connection)
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── scripts/          # Utility scripts (migration, etc.)
│   └── server.ts         # Entry point
├── dist/                 # Compiled JavaScript (generated)
├── data.json             # Dữ liệu mẫu (để migrate)
└── package.json
```

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` trong thư mục `api/`:
```
MONGODB_URI=mongodb://localhost:27017/elias-pomodoro
PORT=3000
```

3. Đảm bảo MongoDB đang chạy

4. Migrate dữ liệu từ `data.json` sang MongoDB:
```bash
npm run migrate
```

## Development

Chạy server ở chế độ development (với hot reload):
```bash
npm run dev
```

## Production

Build TypeScript:
```bash
npm run build
```

Chạy server:
```bash
npm start
```

## API Endpoints

### GET /api/music
Lấy một bài hát ngẫu nhiên

### GET /api/music/all
Lấy tất cả bài hát

### GET /api/music/:id
Lấy bài hát theo ID

### POST /api/music
Tạo bài hát mới
```json
{
  "id": 103,
  "title": "Tên bài hát",
  "url": "https://example.com/song.mp3"
}
```

### DELETE /api/music/:id
Xóa bài hát theo ID

## Technologies

- TypeScript
- Express.js
- MongoDB (Mongoose)
- dotenv
