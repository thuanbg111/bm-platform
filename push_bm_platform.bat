@echo off
chcp 65001 >nul
setlocal

REM ===== CONFIG =====
set REPO_DIR=D:\code tao web hang loat\bm-platform
set BRANCH=main
REM ==================

cd /d "%REPO_DIR%"

echo =====================================
echo PUSH BM-PLATFORM TO GITHUB (AUTO)
echo =====================================
echo.

REM 1. Check git repo
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo ❌ KHONG PHAI GIT REPO!
    pause
    exit /b 1
)

REM 2. Pull trước (rebase cho sạch)
echo [1/4] Git pull (rebase)...
git pull --rebase origin %BRANCH%
if errorlevel 1 (
    echo.
    echo ❌ PULL BI LOI!
    echo 👉 Neu bi conflict, xu ly xong roi chay lai .bat
    pause
    exit /b 1
)

REM 3. Check có thay đổi không
git status --porcelain > temp_git_status.txt
set /p STATUS=<temp_git_status.txt
del temp_git_status.txt

if "%STATUS%"=="" (
    echo.
    echo [2/4] KHONG CO THAY DOI MOI -> BO QUA COMMIT
    goto PUSH
)

REM 4. Add + commit tự động
echo.
echo [2/4] Co thay doi -> Dang commit...
git add .
git commit -m "auto update web content"
if errorlevel 1 (
    echo.
    echo ❌ COMMIT BI LOI!
    pause
    exit /b 1
)

:PUSH
REM 5. Push
echo.
echo [3/4] Dang push len GitHub...
git push origin %BRANCH%
if errorlevel 1 (
    echo.
    echo ❌ PUSH BI LOI!
    pause
    exit /b 1
)

echo.
echo [4/4] ✅ PUSH THANH CONG!
echo.
pause
endlocal
