# AvantusForge One-Click GitHub Deployment
param(
    [string]$RepoName = "avantusforge"
)

$ErrorActionPreference = "Stop"

Write-Host "=======================================================" -ForegroundColor DarkRed
Write-Host "  AvantusForge - GitHub One-Click Deployment Script" -ForegroundColor White
Write-Host "  Target: https://github.com/Laibtech/$RepoName" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor DarkRed
Write-Host ""

Set-Location -Path $PSScriptRoot

try {
    Get-Command git -ErrorAction Stop | Out-Null
} catch {
    Write-Host "[ERROR] Git is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please download Git from: https://git-scm.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/5] Initializing Git repository..." -ForegroundColor Cyan
if (-not (Test-Path ".git")) {
    git init
    git branch -M main
} else {
    Write-Host "  Git already initialized." -ForegroundColor Green
}

Write-Host "[2/5] Staging files..." -ForegroundColor Cyan
git add -A

Write-Host "[3/5] Committing changes..." -ForegroundColor Cyan
try {
    git commit -m "Complete AvantusForge Enterprise CMS Redesign and Official Team LinkedIn Profiles"
} catch {
    Write-Host "  No new changes to commit or commit already up to date." -ForegroundColor Yellow
}

$repoUrl = "https://github.com/Laibtech/$RepoName.git"
Write-Host "[4/5] Setting remote origin ($repoUrl)..." -ForegroundColor Cyan

$remotes = git remote
if ($remotes -contains "origin") {
    git remote set-url origin $repoUrl
} else {
    git remote add origin $repoUrl
}

Write-Host "[5/5] Pushing to GitHub (main)..." -ForegroundColor Cyan
Write-Host "If prompted, authorize with GitHub browser login or personal access token." -ForegroundColor Yellow

try {
    git push -u origin main
    Write-Host ""
    Write-Host "=======================================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Project published to:" -ForegroundColor Green
    Write-Host "  https://github.com/Laibtech/$RepoName" -ForegroundColor Cyan
    Write-Host "=======================================================" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "[NOTE] If the remote repository does not exist yet:" -ForegroundColor Yellow
    Write-Host "1. Create it at: https://github.com/new (Name: $RepoName)" -ForegroundColor White
    Write-Host "2. Run this command again: git push -u origin main" -ForegroundColor Cyan
}

