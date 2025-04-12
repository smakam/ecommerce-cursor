#!/bin/bash

# This script syncs data from MongoDB Atlas to your local MongoDB

# Replace with your MongoDB Atlas connection string
ATLAS_URI="mongodb+srv://sreeni:sreeni@ecommerce-cluster.4dg0z.mongodb.net/?retryWrites=true&w=majority&appName=ecommerce-cluster"

# Check if the connection string has been set
if [ "$ATLAS_URI" = "YOUR_MONGODB_ATLAS_CONNECTION_STRING" ]; then
  echo "Error: Please edit this script and replace YOUR_MONGODB_ATLAS_CONNECTION_STRING with your actual MongoDB Atlas connection string."
  exit 1
fi

# Create backup directory
echo "Creating backup directory..."
mkdir -p ./atlas_backup

# Dump from Atlas
echo "Dumping from MongoDB Atlas..."
mongodump --uri="$ATLAS_URI" --out=./atlas_backup

# Restore to local database
echo "Restoring to local database..."
mongorestore --uri="mongodb://admin:password123@localhost:27017/ecommerce?authSource=admin" --nsInclude="ecommerce.*" --drop ./atlas_backup

echo "Sync completed!" 