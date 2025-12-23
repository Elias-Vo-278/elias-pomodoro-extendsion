# 🎵 Elias Music Background Extension

Chrome Extension để phát nhạc nền theo báo thức đã đặt.

## 📋 Yêu Cầu

- Node.js (phiên bản 14 trở lên)
- Google Chrome hoặc Chromium-based browser
- npm hoặc yarn

## 🚀 Cách Chạy

### ⚡ Cách Nhanh (Tự Động) - Khuyến Nghị

Sử dụng script tự động để chạy API server và mở Chrome:

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```batch
start.bat
```

Script sẽ tự động:
- ✅ Kiểm tra và cài đặt dependencies
- ✅ Khởi động API server
- ✅ Mở Chrome với extension
- ✅ Hiển thị log real-time

**Để dừng server (macOS/Linux):**
```bash
./stop.sh
```

Hoặc nhấn `Ctrl+C` trong terminal đang chạy script.

---

### 📝 Cách Thủ Công

#### Bước 1: Cài Đặt Dependencies cho API Server

```bash
cd api
npm install
```

#### Bước 2: Chạy API Server

```bash
npm start
```

Server sẽ chạy tại `http://localhost:3000`

**Lưu ý:** Giữ terminal này mở trong khi sử dụng extension.

#### Bước 3: Load Extension vào Chrome

1. Mở Google Chrome
2. Truy cập `chrome://extensions/` (hoặc `edge://extensions/` cho Edge)
3. Bật **Developer mode** (góc trên bên phải)
4. Click **Load unpacked**
5. Chọn thư mục `chrome-extension` trong project này
6. Extension sẽ xuất hiện trong danh sách

#### Bước 4: Sử Dụng Extension

1. Click vào icon extension trên thanh công cụ Chrome
2. Nhập giờ và phút cho báo thức (ví dụ: 08:00)
3. Click **Thêm** để tạo báo thức
4. Nhạc sẽ tự động phát khi đến giờ đã đặt

## 🎯 Tính Năng

- ✅ Đặt nhiều báo thức với thời gian cụ thể
- ✅ Bật/tắt từng báo thức
- ✅ Xóa báo thức
- ✅ UI hiện đại, đẹp mắt
- ✅ Phát nhạc ngẫu nhiên từ danh sách
- ✅ Quản lý trạng thái báo thức

## 📁 Cấu Trúc Project

```
elias-music-background-ext/
├── api/                    # Backend API server
│   ├── server.js          # Express server
│   ├── data.json          # Danh sách nhạc
│   └── package.json
├── chrome-extension/      # Chrome Extension
│   ├── popup/             # UI của extension
│   │   ├── index.html
│   │   └── popup.js
│   ├── service-worker.js  # Background service
│   ├── offscreen.html     # Offscreen document cho audio
│   ├── offscreen.js
│   └── manifest.json
└── README.md
```

## 🔧 Cấu Hình

### Thêm Nhạc Mới

Chỉnh sửa file `api/data.json` và thêm entry mới:

```json
{
  "id": 109,
  "title": "Tên bài hát",
  "url": "https://example.com/music.mp3"
}
```

**Lưu ý:** URL phải là direct link đến file audio (.mp3, .wav, etc.) và cho phép CORS.

### Thay Đổi Port API

Nếu muốn đổi port, sửa trong:
- `api/server.js` - thay đổi `PORT`
- `chrome-extension/manifest.json` - cập nhật `host_permissions`
- `chrome-extension/service-worker.js` - cập nhật `BACKEND_API`

## 🐛 Xử Lý Lỗi

### Extension không phát nhạc?

1. Kiểm tra API server đang chạy tại `http://localhost:3000`
2. Mở Developer Tools (F12) và kiểm tra Console
3. Kiểm tra Network tab xem có lỗi CORS không
4. Đảm bảo URL nhạc trong `data.json` là valid và accessible

### Báo thức không hoạt động?

1. Kiểm tra service worker đang chạy (chrome://extensions/ → Service worker)
2. Reload extension
3. Kiểm tra Console của service worker

## 📝 Ghi Chú

- Extension cần quyền `offscreen` để phát audio trong background
- API server phải chạy để extension hoạt động
- Nhạc sẽ phát ngẫu nhiên từ danh sách trong `data.json`

## 📄 License

ISC