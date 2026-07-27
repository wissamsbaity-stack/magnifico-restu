# Start ngrok tunnel for Bob's Burger dev server (port 3000)
# Prerequisites:
#   1. npm run dev   (in another terminal)
#   2. ngrok config add-authtoken <YOUR_TOKEN>   (one-time setup)
# Get token: https://dashboard.ngrok.com/get-started/your-authtoken

$ErrorActionPreference = "Stop"
$port = 3000

# Refresh PATH after winget install
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
  [System.Environment]::GetEnvironmentVariable("Path", "User")

if (-not (Get-Command ngrok -ErrorAction SilentlyContinue)) {
  Write-Host "ngrok not found. Install with: winget install Ngrok.Ngrok" -ForegroundColor Red
  exit 1
}

# Check dev server is listening
try {
  $null = Invoke-WebRequest -Uri "http://127.0.0.1:$port" -UseBasicParsing -TimeoutSec 3
} catch {
  Write-Host "Dev server not running on port $port." -ForegroundColor Yellow
  Write-Host "Start it first: npm run dev" -ForegroundColor Yellow
  exit 1
}

Write-Host "Starting ngrok tunnel to http://127.0.0.1:$port ..." -ForegroundColor Cyan
Write-Host "Dashboard: http://127.0.0.1:4040" -ForegroundColor DarkGray

# Start ngrok in background
$ngrok = Start-Process -FilePath "ngrok" -ArgumentList "http", $port, "--log=stdout" -PassThru -NoNewWindow -RedirectStandardOutput "$PSScriptRoot\..\.ngrok.log"

Start-Sleep -Seconds 4

try {
  $tunnels = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 5
  $publicUrl = ($tunnels.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1).public_url

  if ($publicUrl) {
    Write-Host ""
    Write-Host "Public URL (open on your phone):" -ForegroundColor Green
    Write-Host "  $publicUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Ctrl+C to stop ngrok when done." -ForegroundColor DarkGray
  } else {
    Write-Host "Tunnel started but no public URL yet. Check http://127.0.0.1:4040" -ForegroundColor Yellow
  }
} catch {
  Write-Host ""
  Write-Host "ngrok failed to start. Common fix:" -ForegroundColor Red
  Write-Host "  ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor Yellow
  Write-Host "  https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor DarkGray
  if (Test-Path "$PSScriptRoot\..\.ngrok.log") {
    Get-Content "$PSScriptRoot\..\.ngrok.log" -Tail 5
  }
  Stop-Process -Id $ngrok.Id -Force -ErrorAction SilentlyContinue
  exit 1
}

Wait-Process -Id $ngrok.Id
