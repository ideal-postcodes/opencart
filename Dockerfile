FROM php:8.1-apache

RUN a2enmod rewrite headers

RUN apt-get update && \
    apt-get install -y --no-install-recommends git zip libzip-dev

RUN set -xe \
    && apt-get update \
    && apt-get install -y libpng-dev libjpeg62-turbo-dev libwebp-dev libfreetype6-dev unzip \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-configure gd --with-jpeg --with-webp --with-freetype \
    && docker-php-ext-install -j$(nproc) gd mysqli pdo_mysql zip

WORKDIR /var/www/html

ENV OPENCART_VER 4.0.2.3
ENV OPENCART_URL https://github.com/opencart/opencart/releases/download/${OPENCART_VER}/opencart-${OPENCART_VER}.zip
ENV OPENCART_FILE opencart.zip

RUN apt-get update && apt-get install -y wget

ENV DOCKERIZE_VERSION v0.6.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN set -xe \
    && curl -sSL ${OPENCART_URL} -o ${OPENCART_FILE} \
    && unzip ${OPENCART_FILE} \
    && mv opencart-${OPENCART_VER}/upload/* /var/www/html/ \
    && rm -rf opencart-${OPENCART_VER} \
    && rm -rf /var/www/html/upload \
    && mv config-dist.php config.php \
    && mv admin/config-dist.php admin/config.php \
    && rm ${OPENCART_FILE} \
    && sed -i 's/MYSQL40//g' install/model/install/install.php \
    && chown -R www-data:www-data /var/www

COPY ./docker/install.sh /var/www/html/install.sh
COPY ./docker/setup-extension.sh /usr/local/bin/setup-extension.sh
COPY ./docker/run-setup.php /usr/local/bin/run-setup.php
RUN chmod u+x /var/www/html/install.sh
RUN chmod u+x /usr/local/bin/setup-extension.sh

VOLUME ["/var/www/html/"]
