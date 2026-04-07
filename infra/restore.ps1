# Restore script for PostgreSQL database - PowerShell version
# Usage: .\restore.ps1 [backup_file.sql.gz]

param(
    [string]$BackupFile = ""
)

$ErrorActionPreference = "Stop"

$DbContainer = "iwr-db"
$DbName = "iwr_moda"
$DbUser = "postgres"

Write-Host "=== IWR Moda - Database Restore (PowerShell) ===" -ForegroundColor Cyan

if ([string]::IsNullOrEmpty($BackupFile)) {
    Write-Host "Usage: .\restore.ps1 -BackupFile <backup_file.sql.gz>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Available backups:" -ForegroundColor Yellow
    if (Test-Path ".\backups") {
        Get-ChildItem ".\backups\*.sql.gz" | Select-Object Name, Length, LastWriteTime | Format-Table
    } else {
        Write-Host "No backups directory found." -ForegroundColor Red
    }
    exit 1
}

if (-not (Test-Path $BackupFile)) {
    Write-Host "ERROR: Backup file not found: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "Backup file: $BackupFile" -ForegroundColor Yellow

# Check if container is running
$containers = docker ps --format "{{.Names}}"
if ($containers -notmatch "^$DbContainer$") {
    Write-Host "ERROR: Database container '$DbContainer' is not running" -ForegroundColor Red
    Write-Host "Start it with: docker compose up -d db"
    exit 1
}

Write-Host ""
Write-Host "WARNING: This will REPLACE the current database content!" -ForegroundColor Red
$confirm = Read-Host "Are you sure you want to continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Restore cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host "Dropping existing database..." -ForegroundColor Yellow
docker exec $DbContainer psql -U $DbUser -c "DROP DATABASE IF EXISTS $DbName;" | Out-Null

Write-Host "Creating fresh database..." -ForegroundColor Yellow
docker exec $DbContainer psql -U $DbUser -c "CREATE DATABASE $DbName;" | Out-Null

Write-Host "Restoring data..." -ForegroundColor Yellow
gunzip -c $BackupFile | docker exec -i $DbContainer psql -U $DbUser -d $DbName

Write-Host "Running migrations..." -ForegroundColor Yellow
docker exec iwr-backend npx prisma migrate deploy | Out-Null

Write-Host "=== Restore completed ===" -ForegroundColor Green
Write-Host "You may need to restart the backend container:"
Write-Host "  docker compose restart backend" -ForegroundColor Gray
