#!/bin/bash

# Script để dừng API server
# Sử dụng: ./stop.sh

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Đang dừng API server...${NC}"

# Tìm process đang chạy trên port 3000
PID=$(lsof -ti:3000)

if [ -z "$PID" ]; then
    echo -e "${YELLOW}⚠️  Không tìm thấy process nào chạy trên port 3000${NC}"
    
    # Kiểm tra file PID
    if [ -f "/tmp/elias-music-api.pid" ]; then
        PID=$(cat /tmp/elias-music-api.pid)
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}📌 Tìm thấy process từ file PID: $PID${NC}"
            kill $PID 2>/dev/null
            rm -f /tmp/elias-music-api.pid
            echo -e "${GREEN}✅ Đã dừng API server${NC}"
        else
            echo -e "${YELLOW}⚠️  Process không còn chạy${NC}"
            rm -f /tmp/elias-music-api.pid
        fi
    fi
else
    kill $PID 2>/dev/null
    rm -f /tmp/elias-music-api.pid
    echo -e "${GREEN}✅ Đã dừng API server (PID: $PID)${NC}"
fi
