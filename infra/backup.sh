#!/bin/bash
# Backup script for PostgreSQL database
# Usage: ./backup.sh [backup_directory]

set -e

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/iwr_moda_backup_${TIMESTAMP}.sql.gz"

# Database connection from docker-compose
DB_CONTAINER="iwr-db"
DB_NAME="iwr_moda"
DB_USER="postgres"

echo "=== IWR Moda - Database Backup ==="
echo "Timestamp: ${TIMESTAMP}"
echo "Backup directory: ${BACKUP_DIR}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Check if database container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    echo "ERROR: Database container '${DB_CONTAINER}' is not running"
    echo "Start it with: docker compose up -d db"
    exit 1
fi

echo "Starting backup..."
docker exec "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"

if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "SUCCESS: Backup completed"
    echo "File: ${BACKUP_FILE}"
    echo "Size: ${BACKUP_SIZE}"
else
    echo "ERROR: Backup failed or file is empty"
    exit 1
fi

# Keep only last 10 backups
echo "Cleaning old backups (keeping last 10)..."
ls -t "${BACKUP_DIR}"/iwr_moda_backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f

echo "=== Backup completed ==="
