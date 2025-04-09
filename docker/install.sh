#!/usr/bin/env bash

php install/cli_install.php install \
--db_hostname $MYSQL_HOST \
--db_username $MYSQL_USER \
--db_password $MYSQL_PASSWORD \
--db_database $MYSQL_DATABASE \
--db_driver mysqli \
--db_port 3306 \
--username $OPENCART_USERNAME \
--password $OPENCART_PASSWORD \
--email $OPENCART_EMAIL \
--http_server $OPENCART_HOST

# Remove the installation directory for security
if [ -d "install" ]; then
  echo "Removing installation directory for security..."
  rm -rf install
  echo "Installation directory removed successfully."
fi

# Move storage directory outside of web root for security
echo "Moving storage directory outside of web root for security..."
mkdir -p /var/storage
cp -r /var/www/html/system/storage /var/storage/

# Update configuration files to point to the new storage location
sed -i "s#define('DIR_STORAGE', DIR_SYSTEM . 'storage/');#define('DIR_STORAGE', '/var/storage/storage/');#g" /var/www/html/config.php
sed -i "s#define('DIR_STORAGE', DIR_SYSTEM . 'storage/');#define('DIR_STORAGE', '/var/storage/storage/');#g" /var/www/html/admin/config.php

# Set proper permissions for the storage directory
chown -R www-data:www-data /var/storage
chmod -R 755 /var/storage

echo "Storage directory moved successfully with proper permissions."
