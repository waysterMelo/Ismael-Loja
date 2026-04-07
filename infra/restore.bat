@echo off
REM Restore script for PostgreSQL database - Windows version
REM Usage: restore.bat [backup_file.sql.gz]

setlocal enabledelayedexpansion

set "BACKUP_FILE=%~1"
set "DB_CONTAINER=iwr-db"
set "DB_NAME=iwr_moda"
set "DB_USER=postgres"

echo === IWR Moda - Database Restore (Windows) ===

if "%BACKUP_FILE%"=="" (
    echo Usage: restore.bat ^<backup_file.sql.gz^>
    echo.
    echo Available backups:
    dir /b .\backups\*.sql.gz 2>nul || echo No backups found in .\backups
    pause
    exit /b 1
)

if not exist "%BACKUP_FILE%" (
    echo ERROR: Backup file not found: %BACKUP_FILE%
    pause
    exit /b 1
)

echo Backup file: %BACKUP_FILE%

REM Check if container is running
docker ps --format "{{.Names}}" | findstr "^%DB_CONTAINER%$" >nul
if errorlevel 1 (
    echo ERROR: Database container '%DB_CONTAINER%' is not running
    echo Start it with: docker compose up -d db
    pause
    exit /b 1
)

echo.
echo WARNING: This will REPLACE the current database content!
set /p "confirm=Are you sure you want to continue? (yes/no): "
if not "%confirm%"=="yes" (
    echo Restore cancelled
    pause
    exit /b 0
)

echo Dropping existing database...
docker exec %DB_CONTAINER% psql -U %DB_USER% -c "DROP DATABASE IF EXISTS %DB_NAME%;"

echo Creating fresh database...
docker exec %DB_CONTAINER% psql -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;"

echo Restoring data...
gunzip -c "%BACKUP_FILE%" | docker exec -i %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME%

echo Running migrations...
docker exec iwr-backend npx prisma migrate deploy

echo === Restore completed ===
echo You may need to restart the backend container:
echo   docker compose restart backend
pause
