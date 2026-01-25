@echo off
echo ===============================
echo  PUSH BM-PLATFORM TO GITHUB
echo ===============================

cd /d "%~dp0"

git add .
git commit -m "update sites %DATE% %TIME%"
git push

echo.
echo === DONE ===
pause
