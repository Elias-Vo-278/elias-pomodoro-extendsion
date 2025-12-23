#!/bin/bash

# Script tự động chạy API server và mở Chrome với extension
# Sử dụng: ./start.sh

# Màu sắc cho output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎵 Elias Music Background Extension - Auto Start${NC}"
echo ""

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js chưa được cài đặt. Vui lòng cài Node.js trước.${NC}"
    exit 1
fi

# Lấy đường dẫn tuyệt đối của project
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
API_DIR="$SCRIPT_DIR/api"
EXTENSION_DIR="$SCRIPT_DIR/chrome-extension"

echo -e "${GREEN}📦 Đang kiểm tra dependencies...${NC}"

# Kiểm tra và cài đặt dependencies cho API
if [ ! -d "$API_DIR/node_modules" ]; then
    echo -e "${YELLOW}📥 Đang cài đặt dependencies cho API server...${NC}"
    cd "$API_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}❌ Lỗi khi cài đặt dependencies.${NC}"
        exit 1
    fi
    cd "$SCRIPT_DIR"
fi

echo -e "${GREEN}✅ Dependencies đã sẵn sàng${NC}"
echo ""

# Build API (đảm bảo dist/server.js tồn tại)
echo -e "${GREEN}🔨 Đang build API (tsc)...${NC}"
cd "$API_DIR"
npm run build > /tmp/elias-music-api-build.log 2>&1
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}❌ Build thất bại. Xem log: /tmp/elias-music-api-build.log${NC}"
    exit 1
fi
cd "$SCRIPT_DIR"

# Kiểm tra xem API server đã chạy chưa
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 3000 đang được sử dụng. Có thể API server đã chạy.${NC}"
    read -p "Bạn có muốn tiếp tục? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Chạy API server trong background
echo -e "${GREEN}🚀 Đang khởi động API server...${NC}"
cd "$API_DIR"
npm start > /tmp/elias-music-api.log 2>&1 &
API_PID=$!

# Đợi server khởi động
sleep 3

# Kiểm tra server có chạy không
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}❌ Không thể khởi động API server. Kiểm tra log: /tmp/elias-music-api.log${NC}"
    kill $API_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ API server đã chạy tại http://localhost:3000 (PID: $API_PID)${NC}"
echo ""

# Mở Chrome với extension
echo -e "${GREEN}🌐 Đang mở Chrome...${NC}"

# Tìm đường dẫn Chrome
CHROME_PATH=""
if [ -d "/Applications/Google Chrome.app" ]; then
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [ -d "/Applications/Chromium.app" ]; then
    CHROME_PATH="/Applications/Chromium.app/Contents/MacOS/Chromium"
elif command -v google-chrome &> /dev/null; then
    CHROME_PATH="google-chrome"
elif command -v chromium &> /dev/null; then
    CHROME_PATH="chromium"
fi

if [ -z "$CHROME_PATH" ]; then
    echo -e "${YELLOW}⚠️  Không tìm thấy Chrome. Vui lòng mở Chrome thủ công và load extension từ:${NC}"
    echo -e "${BLUE}   $EXTENSION_DIR${NC}"
    echo ""
    echo -e "${GREEN}📝 Hướng dẫn load extension:${NC}"
    echo "   1. Mở chrome://extensions/"
    echo "   2. Bật Developer mode"
    echo "   3. Click 'Load unpacked'"
    echo "   4. Chọn thư mục: $EXTENSION_DIR"
else
    # Mở Chrome với extension (nếu chưa load) và mở trang extensions
    "$CHROME_PATH" --load-extension="$EXTENSION_DIR" chrome://extensions/ > /dev/null 2>&1 &
    echo -e "${GREEN}✅ Chrome đã được mở${NC}"
    echo ""
    echo -e "${BLUE}📝 Nếu extension chưa xuất hiện:${NC}"
    echo "   1. Vào chrome://extensions/"
    echo "   2. Bật Developer mode"
    echo "   3. Click 'Load unpacked' và chọn: $EXTENSION_DIR"
fi

echo ""
echo -e "${GREEN}✨ Hoàn tất!${NC}"
echo ""
echo -e "${BLUE}📊 Thông tin:${NC}"
echo "   - API Server: http://localhost:3000"
echo "   - Log file: /tmp/elias-music-api.log"
echo "   - PID: $API_PID"
echo ""
echo -e "${YELLOW}💡 Để dừng server, chạy: kill $API_PID${NC}"
echo -e "${YELLOW}   Hoặc tìm process: lsof -ti:3000 | xargs kill${NC}"
echo ""

# Lưu PID để có thể kill sau
echo $API_PID > /tmp/elias-music-api.pid

# Giữ script chạy và hiển thị log
echo -e "${BLUE}📝 Đang theo dõi log (Ctrl+C để dừng)...${NC}"
echo ""

# Trap để cleanup khi exit
trap "echo ''; echo -e '${YELLOW}🛑 Đang dừng API server...${NC}'; kill $API_PID 2>/dev/null; rm -f /tmp/elias-music-api.pid; exit" INT TERM

# Hiển thị log real-time
tail -f /tmp/elias-music-api.log
