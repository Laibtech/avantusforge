@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo   AvantusForge - GitHub Deployment Script
echo   Target: https://github.com/Laibtech/avantusforge
echo =======================================================
echo.

cd /d "%~dp0"

where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed or not in PATH!
    echo Please install Git for Windows from https://git-scm.com/
    pause
    exit /b 1
)

echo [1/5] Checking Git repository...
if not exist ".git" (
    echo [*] Initializing new Git repository...
    git init
)
git branch -M main

echo.
echo [2/5] Staging all changes...
git add -A

echo.
echo [3/5] Committing changes...
git commit -m "AvantusForge: Real-Time Live Visitor Tracking, CMS Type Fixes, and CI Workflow" 2>nul || echo [*] Working tree clean or already committed.

echo.
echo [4/5] Configuring GitHub remote origin...
set "REPO_URL=https://github.com/Laibtech/avantusforge.git"

git remote get-url origin >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [*] Updating remote origin to !REPO_URL!...
    git remote set-url origin !REPO_URL!
) else (
    echo [*] Adding remote origin !REPO_URL!...
    git remote add origin !REPO_URL!
)

echo.
echo [5/5] Pushing to GitHub (main branch)...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo =======================================================
    echo   SUCCESS! Pushed to https://github.com/Laibtech/avantusforge
    echo =======================================================
) else (
    echo.
    echo [*] Standard push encountered a sync conflict. Pulling latest and pushing...
    git pull --rebase origin main
    git push -u origin main
)

echo.
pause
