#!/bin/bash

echo "🗄️  Setting up PostgreSQL database for Kalash Heritage..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "On macOS: brew install postgresql"
    echo "On Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready &> /dev/null; then
    echo "⚠️  PostgreSQL service is not running. Starting it..."
    # macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql
    # Linux
    else
        sudo service postgresql start
    fi
    sleep 2
fi

# Create database if it doesn't exist
echo "Creating database 'kalash_heritage'..."
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'kalash_heritage'" | grep -q 1 || \
psql -U postgres -c "CREATE DATABASE kalash_heritage"

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your .env file is configured"
echo "2. Run: npm run seed"
