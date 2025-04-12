#!/bin/bash

# This script syncs your local MongoDB data to MongoDB Atlas

# Replace with your MongoDB Atlas connection string
ATLAS_URI="mongodb+srv://sreeni:sreeni@ecommerce-cluster.4dg0z.mongodb.net/?retryWrites=true&w=majority&appName=ecommerce-cluster"

# Check if the connection string has been set
if [ "$ATLAS_URI" = "YOUR_MONGODB_ATLAS_CONNECTION_STRING" ]; then
  echo "Error: Please edit this script and replace YOUR_MONGODB_ATLAS_CONNECTION_STRING with your actual MongoDB Atlas connection string."
  exit 1
fi

# Backup local database
echo "Creating backup of local database..."
mongodump --uri="mongodb://admin:password123@localhost:27017/ecommerce?authSource=admin" --out=./db_backup

# Restore to MongoDB Atlas
echo "Restoring to MongoDB Atlas..."
mongorestore --uri="$ATLAS_URI" --drop ./db_backup

echo "Sync completed!" 