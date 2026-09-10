@echo off
rem 未来のユミ子から今日の1通を出して、出力フォルダを開く。
rem 事前に一度だけ：npm install（このフォルダで）。APIキーは環境変数 ANTHROPIC_API_KEY に入れておく。
cd /d "%~dp0"
node make_letter.js %*
if errorlevel 1 (
  echo.
  echo 届かなかった。上のメッセージを見て、もう一度このバッチを実行。
  pause
  exit /b 1
)
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set TODAY=%%a-%%b-%%c
if exist "out\%TODAY%" start "" "out\%TODAY%"
