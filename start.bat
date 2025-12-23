@echo off
REM Script tự động chạy API server và mở Chrome với extension (Windows)
REM Sử dụng: start.bat

echo 🎵 Elias Music Background Extension - Auto Start
echo.

REM Kiểm tra Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js chưa được cài đặt. Vui lòng cài Node.js trước.
    pause
    exit /b 1
)

REM Lấy đường dẫn của script
set SCRIPT_DIR=%~dp0
set API_DIR=%SCRIPT_DIR%api
set EXTENSION_DIR=%SCRIPT_DIR%chrome-extension

echo 📦 Đang kiểm tra dependencies...

REM Kiểm tra và cài đặt dependencies cho API
if not exist "%API_DIR%\node_modules" (
    echo 📥 Đang cài đặt dependencies cho API server...
    cd /d "%API_DIR%"
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Lỗi khi cài đặt dependencies.
        pause
        exit /b 1
    )
    cd /d "%SCRIPT_DIR%"
)

echo ✅ Dependencies đã sẵn sàng
echo.

REM Kiểm tra port 3000
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Port 3000 đang được sử dụng. Có thể API server đã chạy.
    set /p CONTINUE="Bạn có muốn tiếp tục? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

REM Chạy API server
echo 🚀 Đang khởi động API server...
cd /d "%API_DIR%"
start "Elias Music API Server" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo ✅ API server đã chạy tại http://localhost:3000
echo.

REM Mở Chrome với extension
echo 🌐 Đang mở Chrome...

REM Tìm Chrome
set CHROME_PATH=
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe
)

if "%CHROME_PATH%"=="" (
    echo ⚠️  Không tìm thấy Chrome. Vui lòng mở Chrome thủ công.
    echo.
    echo 📝 Hướng dẫn load extension:
    echo    1. Mở chrome://extensions/
    echo    2. Bật Developer mode
    echo    3. Click 'Load unpacked'
    echo    4. Chọn thư mục: %EXTENSION_DIR%
) else (
    start "" "%CHROME_PATH%" --load-extension="%EXTENSION_DIR%" chrome://extensions/
    echo ✅ Chrome đã được mở
    echo.
    echo 📝 Nếu extension chưa xuất hiện:
    echo    1. Vào chrome://extensions/
    echo    2. Bật Developer mode
    echo    3. Click 'Load unpacked' và chọn: %EXTENSION_DIR%
)

echo.
echo ✨ Hoàn tất!
echo.
echo 📊 Thông tin:
echo    - API Server: http://localhost:3000
echo    - Extension: %EXTENSION_DIR%
echo.
echo 💡 Để dừng server, đóng cửa sổ "Elias Music API Server"
echo.
pause
