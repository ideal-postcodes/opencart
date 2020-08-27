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
