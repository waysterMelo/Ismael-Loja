#!/bin/bash
# Restore script for PostgreSQL database
# Usage: ./restore.sh <backup_file.sql.gz>

set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/*.sql.gz 2>/dev/null || echo "No backups found in ./backups"
    exit 1
fi

BACKUP_FILE="$1"
DB_CONTAINER="iwr-db"
DB_NAME="iwr_moda"
DB_USER="postgres"

echo "=== IWR Moda - Database Restore ==="
echo "Backup file: ${BACKUP_FILE}"

# Check if file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Check if database container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    echo "ERROR: Database container '${DB_CONTAINER}' is not running"
    echo "Start it with: docker compose up -d db"
    exit 1
fi

# Confirm restore
echo ""
echo "WARNING: This will REPLACE the current database content!"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "${confirm}" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo "Dropping existing database..."
docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -c "DROP DATABASE IF EXISTS ${DB_NAME};"

echo "Creating fresh database..."
docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -c "CREATE DATABASE ${DB_NAME};"

echo "Restoring data..."
gunzip -c "${BACKUP_FILE}" | docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"

echo "Running migrations..."
docker exec iwr-backend npx prisma migrate deploy

echo "=== Restore completed ==="
echo "You may need to restart the backend container:"
echo "  docker compose restart backend"
