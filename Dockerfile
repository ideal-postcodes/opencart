FROM php:7.3-apache

RUN a2enmod rewrite headers

RUN apt-get update && \
    apt-get install -y --no-install-recommends git zip libzip-dev

RUN set -xe \
    && apt-get update \
    && apt-get install -y libpng-dev libjpeg-dev libwebp-dev unzip \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-configure gd --with-png-dir=/usr --with-jpeg-dir=/usr --with-webp-dir=/usr \
    && docker-php-ext-install gd mysqli pdo_mysql zip

WORKDIR /var/www/html

ENV OPENCART_VER 3.0.3.6
ENV OPENCART_MD5 FF9034C333C2F818E0727918C1132F2A
ENV OPENCART_URL https://github.com/opencart/opencart/releases/download/${OPENCART_VER}/opencart-${OPENCART_VER}.zip
ENV OPENCART_FILE opencart.zip

RUN apt-get update && apt-get install -y wget

ENV DOCKERIZE_VERSION v0.6.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN set -xe \
    && curl -sSL ${OPENCART_URL} -o ${OPENCART_FILE} \
    && echo "${OPENCART_MD5}  ${OPENCART_FILE}" | md5sum -c \
    && unzip ${OPENCART_FILE} 'upload/*' -d /var/www/html/ \
    && mv /var/www/html/upload/* /var/www/html/ \
    && rm -r /var/www/html/upload/ \
    && mv config-dist.php config.php \
    && mv admin/config-dist.php admin/config.php \
    && rm ${OPENCART_FILE} \
	&& sed -i 's/MYSQL40//g' install/model/install/install.php \
    && chown -R www-data:www-data /var/www

COPY ./docker/install.sh /var/www/html/install.sh
RUN chmod u+x /var/www/html/install.sh

VOLUME ["/var/www/html/"]
