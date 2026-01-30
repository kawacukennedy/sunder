#!/bin/bash

# Deploy Script for CodeEngage

echo "Deploying CodeEngage..."

# 1. Pull latest changes
# git pull origin main

# 2. Install dependencies (if composer.lock changed)
# composer install --no-dev --optimize-autoloader

# 3. Run Migrations
echo "Running migrations..."
php codeengage-backend/migrations/MigrationRunner.php

# 4. Clear Cache
echo "Clearing cache..."
rm -rf codeengage-backend/storage/cache/*

echo "Deployment complete!"
