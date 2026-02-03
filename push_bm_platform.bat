@echo off
cd /d %~dp0

echo ==========================================
echo   PUSH BM-PLATFORM TO GITHUB (AUTO SAFE)
echo ==========================================
echo.

echo [1/3] Check git repo...
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo ❌ Thu muc nay khong phai git repo
  pause
  exit /b
)

echo.
echo [2/3] Add + Commit...
git add .

git commit -m "auto update sites batch"
echo.

echo [3/3] Push FORCE to origin/main...
git push origin main --force

echo.
echo ==========================================
echo ✅ DONE PUSH
echo Repo tren GitHub da duoc cap nhat theo local
echo ==========================================
echo.
pause
