@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo   AvantusForge - GitHub One-Click Deployment Script
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

echo [1/5] Checking Git repository initialization...
if not exist ".git" (
    echo [*] Initializing new Git repository...
    git init
    git branch -M main
) else (
    echo [*] Existing Git repository detected.
)

echo.
echo [2/5] Staging all files...
git add -A

echo.
echo [3/5] Committing changes...
git commit -m "AvantusForge Enterprise Platform: Full CMS Redesign, Team Integration, and Real-Time Live Visitor Tracking"

echo.
echo [4/5] Configuring GitHub remote origin...
set "REPO_URL=https://github.com/Laibtech/avantusforge.git"

git remote get-url origin >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [*] Updating existing remote origin to !REPO_URL!...
    git remote set-url origin !REPO_URL!
) else (
    echo [*] Adding remote origin !REPO_URL!...
    git remote add origin !REPO_URL!
)

echo.
echo [5/5] Pushing to GitHub (main branch)...
echo If prompted, enter your GitHub credentials or Personal Access Token (PAT).
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo =======================================================
    echo   SUCCESS! Deployed to https://github.com/Laibtech/avantusforge
    echo =======================================================
) else (
    echo.
    echo [!] Note: If the repository doesn't exist yet on GitHub:
    echo 1. Go to https://github.com/new
    echo 2. Create a repository named: avantusforge
    echo 3. Run this script again!
)

echo.
pause

