#!/bin/bash

# Backup Script

BACKUP_DIR="backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_FILE="codeengage-backend/database.sqlite"

mkdir -p $BACKUP_DIR

echo "Backing up database..."

if [ -f "$DB_FILE" ]; then
    cp $DB_FILE "$BACKUP_DIR/db_backup_$DATE.sqlite"
    echo "Database backed up to $BACKUP_DIR/db_backup_$DATE.sqlite"
else
    echo "Database file not found: $DB_FILE"
fi

# Rotate backups (keep last 5)
cd $BACKUP_DIR
ls -t | tail -n +6 | xargs rm -f
