<#
Demo script for local setup (Windows PowerShell)
Usage:
  1. Clone the repo and checkout the branch `feature/pdf-extraction`.
  2. Place a valid `.env.local` in the project root (copy from `.env.local.example`).
  3. Run this script from the repo root in PowerShell:
       Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
       .\demo.ps1
#>

Write-Host "Demo: install deps and start dev server" -ForegroundColor Cyan

Push-Location $PSScriptRoot

if (-not (Test-Path ".env.local")) {
  Write-Host "Warning: .env.local not present. Copy .env.local.example to .env.local and edit it before running." -ForegroundColor Yellow
} else {
  Write-Host ".env.local found." -ForegroundColor Green
}

Write-Host "Installing npm packages..." -ForegroundColor Cyan
npm install

Write-Host "Starting dev server (npm run dev)..." -ForegroundColor Cyan
npm run dev

Pop-Location
