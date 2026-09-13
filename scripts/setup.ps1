# NEXUS setup — Windows (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  NEXUS — Open Source AI Workspace"
Write-Host "  Special Anniversary Edition · Sep 13, 2026"
Write-Host ""

Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Test-Path ".env")) {
  Write-Host "  ✔ Creating .env from .env.example"
  Copy-Item ".env.example" ".env"
} else {
  Write-Host "  • .env already exists, keeping it"
}

Write-Host "  ✔ Starting NEXUS..."
docker compose up -d --build

Write-Host ""
Write-Host "  NEXUS is running:"
Write-Host "    Web    -> http://localhost:3000"
Write-Host "    API    -> http://localhost:3001"
Write-Host "    Docs   -> http://localhost:3001/docs"
Write-Host ""
Write-Host "  First run? A welcome screen will guide you."
Write-Host ""