#!/bin/bash

# CodeEngage 2.0 Rollback Script
# Usage: ./rollback.sh [backup_id]

BACKUP_ID=$1
BACKUP_DIR="./backups"

if [ -z "$BACKUP_ID" ]; then
    echo "Usage: ./rollback.sh [backup_id]"
    exit 1
fi

if [ ! -d "$BACKUP_DIR/$BACKUP_ID" ]; then
    echo "Error: Backup $BACKUP_ID not found in $BACKUP_DIR"
    exit 1
fi

echo "Rolling back to backup: $BACKUP_ID..."

# 1. Restore Backend
echo "Restoring backend..."
cp -r $BACKUP_DIR/$BACKUP_ID/backend/* ./codeengage-backend/

# 2. Restore Frontend
echo "Restoring frontend..."
cp -r $BACKUP_DIR/$BACKUP_ID/frontend/* ./codeengage-frontend/

# 3. Restore Database (if SQLite)
if [ -f "$BACKUP_DIR/$BACKUP_ID/database.sqlite" ]; then
    echo "Restoring SQLite database..."
    cp "$BACKUP_DIR/$BACKUP_ID/database.sqlite" "./codeengage-backend/storage/database.sqlite"
fi

echo "Rollback complete. Please restart services if necessary."
