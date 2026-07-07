#!/bin/bash
# s3-backup.sh
# Zips the app directory and uploads to S3

# Variables
APP_DIR="/home/ubuntu/cab-ride-app"
BACKUP_DIR="/tmp/bharatgo_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="bharatgo_backup_$TIMESTAMP.tar.gz"
S3_BUCKET="s3://your-bharatgo-backup-bucket" # UPDATE THIS TO YOUR BUCKET NAME!

# Ensure backup dir exists
mkdir -p $BACKUP_DIR

echo "📦 Creating compressed archive of $APP_DIR..."
# Tar the directory, excluding heavy node_modules and .git folders
tar -czf $BACKUP_DIR/$BACKUP_FILE \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.expo' \
  -C $APP_DIR .

echo "☁️ Uploading to S3..."
# Requires aws-cli to be installed and configured or EC2 IAM Role to have S3 write access
aws s3 cp $BACKUP_DIR/$BACKUP_FILE $S3_BUCKET/

# Clean up local backup to save disk space
echo "🧹 Cleaning up local files..."
rm -f $BACKUP_DIR/$BACKUP_FILE

echo "✅ Backup completed successfully!"
