#!/bin/bash

# ==============================================================================
# Sunder Development Setup Script
# ==============================================================================

set -e # Exit on error

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Sunder setup...${NC}"

# 1. Dependency Checks
echo -e "\n${BLUE}🔍 Checking dependencies...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v18+.${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker & Docker Compose.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies verified.${NC}"

# 2. Environment Configuration
echo -e "\n${BLUE}📂 Configuring environment...${NC}"

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Root .env created from .env.example${NC}"
else
    echo -e "⏭️  Root .env already exists, skipping."
fi

# Frontend .env
if [ ! -f frontend/.env ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:5001/api" > frontend/.env
    echo "NEXT_PUBLIC_WS_URL=ws://localhost:5001" >> frontend/.env
    echo -e "${GREEN}✅ Frontend .env created.${NC}"
fi

# Backend .env
if [ ! -f backend/.env ]; then
    cp .env.example backend/.env
    echo -e "${GREEN}✅ Backend .env created.${NC}"
fi

# 3. Docker Infrastructure
echo -e "\n${BLUE}🐳 Starting Docker infrastructure...${NC}"
docker-compose up -d

# Wait for Postgres
echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
until docker exec sunder-db pg_isready -U postgres &> /dev/null; do
  sleep 1
done
echo -e "${GREEN}✅ Database is ready.${NC}"

# 4. Database Seeding
# Note: Docker Compose handles basic schema via docker-entrypoint-initdb.d
# This is a fallback/refresh mechanism
echo -e "\n${BLUE}💾 Seeding database...${NC}"
docker exec -i sunder-db psql -U postgres -d sunder < scripts/db/schema.sql
docker exec -i sunder-db psql -U postgres -d sunder < scripts/db/seeds.sql
echo -e "${GREEN}✅ Database seeded.${NC}"

# 5. Application Launch
echo -e "\n${BLUE}📦 Installing application dependencies...${NC}"
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..

echo -e "\n${GREEN}✨ Setup complete!${NC}"
echo -e "${BLUE}To start the platform, run the following in separate terminals:${NC}"
echo -e "  1. Backend: ${GREEN}cd backend && npm run dev${NC}"
echo -e "  2. Frontend: ${GREEN}cd frontend && npm run dev${NC}"
echo -e "  3. Mock AI: ${GREEN}npm run dev:mock-ai${NC}"

echo -e "\n${BLUE}Happy coding!${NC}"
