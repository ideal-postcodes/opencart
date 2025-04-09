#!/bin/bash
# Script to automatically register the Ideal Postcodes extension in OpenCart

# Wait a moment to ensure OpenCart is fully installed and configured
echo "Waiting for OpenCart to be fully initialized..."
sleep 5

echo "Running self-contained PHP setup script..."
php -r "require_once '/usr/local/bin/run-setup.php';"
echo "PHP setup script finished."

echo "Ideal Postcodes extension setup complete!"
