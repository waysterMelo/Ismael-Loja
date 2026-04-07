# Backup script for PostgreSQL database - PowerShell version
# Usage: .\backup.ps1 [backup_directory]

param(
    [string]$BackupDir = ".\backups"
)

$ErrorActionPreference = "Stop"

# Generate timestamp
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "iwr_moda_backup_$Timestamp.sql.gz"

$DbContainer = "iwr-db"
$DbName = "iwr_moda"
$DbUser = "postgres"

Write-Host "=== IWR Moda - Database Backup (PowerShell) ===" -ForegroundColor Cyan
Write-Host "Timestamp: $Timestamp"
Write-Host "Backup directory: $BackupDir"

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Check if container is running
$containers = docker ps --format "{{.Names}}"
if ($containers -notmatch "^$DbContainer$") {
    Write-Host "ERROR: Database container '$DbContainer' is not running" -ForegroundColor Red
    Write-Host "Start it with: docker compose up -d db"
    exit 1
}

Write-Host "Starting backup..." -ForegroundColor Yellow
docker exec $DbContainer pg_dump -U $DbUser -d $DbName | gzip > $BackupFile

if ((Test-Path $BackupFile) -and (Get-Item $BackupFile).Length -gt 0) {
    $Size = (Get-Item $BackupFile).Length
    Write-Host "SUCCESS: Backup completed" -ForegroundColor Green
    Write-Host "File: $BackupFile"
    Write-Host "Size: $([math]::Round($Size / 1MB, 2)) MB"
} else {
    Write-Host "ERROR: Backup failed or file is empty" -ForegroundColor Red
    exit 1
}

# Keep only last 10 backups
Write-Host "Cleaning old backups (keeping last 10)..." -ForegroundColor Yellow
$OldBackups = Get-ChildItem (Join-Path $BackupDir "iwr_moda_backup_*.sql.gz") | Sort-Object LastWriteTime -Descending | Select-Object -Skip 10
$OldBackups | Remove-Item -Force

Write-Host "=== Backup completed ===" -ForegroundColor Green
