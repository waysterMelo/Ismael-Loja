@echo off
REM Backup script for PostgreSQL database - Windows version
REM Usage: backup.bat [backup_directory]

setlocal enabledelayedexpansion

set "BACKUP_DIR=%~1"
if "%BACKUP_DIR%"=="" set "BACKUP_DIR=.\backups"

REM Generate timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "MN=%dt:~10,2%"
set "TIMESTAMP=%YYYY%%MM%%DD%_%HH%%MN%"

set "BACKUP_FILE=%BACKUP_DIR%\iwr_moda_backup_%TIMESTAMP%.sql.gz"
set "DB_CONTAINER=iwr-db"
set "DB_NAME=iwr_moda"
set "DB_USER=postgres"

echo === IWR Moda - Database Backup (Windows) ===
echo Timestamp: %TIMESTAMP%
echo Backup directory: %BACKUP_DIR%

REM Create backup directory
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Check if container is running
docker ps --format "{{.Names}}" | findstr "^%DB_CONTAINER%$" >nul
if errorlevel 1 (
    echo ERROR: Database container '%DB_CONTAINER%' is not running
    echo Start it with: docker compose up -d db
    pause
    exit /b 1
)

echo Starting backup...
docker exec %DB_CONTAINER% pg_dump -U %DB_USER% -d %DB_NAME% | gzip > "%BACKUP_FILE%"

if exist "%BACKUP_FILE%" (
    for %%A in ("%BACKUP_FILE%") do set "SIZE=%%~zA"
    echo SUCCESS: Backup completed
    echo File: %BACKUP_FILE%
    echo Size: !SIZE! bytes
) else (
    echo ERROR: Backup failed or file is empty
    pause
    exit /b 1
)

REM Keep only last 10 backups
echo Cleaning old backups (keeping last 10)...
for /f "skip=10 delims=" %%F in ('dir /b /o-d "%BACKUP_DIR%\iwr_moda_backup_*.sql.gz" 2^>nul') do (
    del "%BACKUP_DIR%\%%F"
)

echo === Backup completed ===
pause
