@echo off
setlocal
chcp 65001 >nul
title 日語學習 - 開發伺服器
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo [錯誤] 找不到 npm，請先安裝 Node.js：https://nodejs.org/
  pause
  exit /b 1
)

if not exist "package.json" (
  echo [錯誤] 找不到 package.json，請確認此檔案放在專案根目錄。
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [資訊] 第一次啟動，正在安裝相依套件...
  call npm install
  if errorlevel 1 (
    echo [錯誤] 相依套件安裝失敗。
    pause
    exit /b 1
  )
)

if not exist ".env" (
  echo [提示] 尚未偵測到 .env，自動翻譯功能需要 Gemini API Key。
  echo         可將 .env.example 複製為 .env 並填入金鑰。
  echo.
)

echo [資訊] 正在啟動開發伺服器並開啟瀏覽器（關閉此視窗即可停止）...
call npm run dev -- --open

pause
