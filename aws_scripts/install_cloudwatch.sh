#!/bin/bash
# install_cloudwatch.sh
# This script installs and configures the Amazon CloudWatch Agent on Ubuntu EC2

echo "📥 Downloading CloudWatch Agent..."
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb

echo "📦 Installing CloudWatch Agent..."
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

echo "⚙️ Configuring CloudWatch Agent..."
# We assume cloudwatch-config.json is in the same directory
sudo cp cloudwatch-config.json /opt/aws/amazon-cloudwatch-agent/bin/config.json

echo "🚀 Starting CloudWatch Agent..."
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json

echo "✅ CloudWatch Agent installed and started successfully!"
echo "⚠️ Make sure your EC2 instance has an IAM Role attached with the 'CloudWatchAgentServerPolicy'!"
