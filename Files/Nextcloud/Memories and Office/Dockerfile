FROM php:8.2-apache-bookworm

USER root
# entrypoint.sh and cron.sh dependencies
RUN set -ex; \
    \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        busybox-static \
        bzip2 \
        libldap-common \
        libmagickcore-6.q16-6-extra \
        rsync \
        nano \
        cmake \
        ffmpeg \
        ghostscript \
        git \
        inotify-tools \
        libbz2-dev \
        liblapack-dev \
        libopenblas-dev \
        libx11-dev \
        wget \
        unzip \
        gnupg2 \
    ; \
    rm -rf /var/lib/apt/lists/*; \
    \
    mkdir -p /var/spool/cron/crontabs;

# install the PHP extensions we need
# see https://docs.nextcloud.com/server/stable/admin_manual/installation/source_installation.html
ENV PHP_MEMORY_LIMIT 512M
ENV PHP_UPLOAD_LIMIT 512M
RUN set -ex; \
    \
    savedAptMark="$(apt-mark showmanual)"; \
    \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        libcurl4-openssl-dev \
        libevent-dev \
        libfreetype6-dev \
        libgmp-dev \
        libicu-dev \
        libjpeg-dev \
        libldap2-dev \
        libmagickwand-dev \
        libmcrypt-dev \
        libmemcached-dev \
        libpng-dev \
        libpq-dev \
        libwebp-dev \
        libxml2-dev \
        libzip-dev \
    ; \
    \
    debMultiarch="$(dpkg-architecture --query DEB_BUILD_MULTIARCH)"; \
    docker-php-ext-configure ftp --with-openssl-dir=/usr; \
    docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp; \
    docker-php-ext-configure ldap --with-libdir="lib/$debMultiarch"; \
    docker-php-ext-install -j "$(nproc)" \
        bcmath \
        exif \
        ftp \
        gd \
        gmp \
        intl \
        ldap \
        opcache \
        pcntl \
        pdo_mysql \
        pdo_pgsql \
        sysvsem \
        zip \
    ; \
    \
# pecl will claim success even if one install fails, so we need to perform each install separately
    pecl install APCu-5.1.23; \
    pecl install imagick-3.7.0; \
    pecl install memcached-3.2.0; \
    pecl install redis-6.0.2; \
    \
    docker-php-ext-enable \
        apcu \
        imagick \
        memcached \
        redis \
    ; \
    rm -r /tmp/pear; \
    \
# reset apt-mark's "manual" list so that "purge --auto-remove" will remove all build dependencies
    apt-mark auto '.*' > /dev/null; \
    apt-mark manual $savedAptMark; \
    ldd "$(php -r 'echo ini_get("extension_dir");')"/*.so \
        | awk '/=>/ { so = $(NF-1); if (index(so, "/usr/local/") == 1) { next }; gsub("^/(usr/)?", "", so); print so }' \
        | sort -u \
        | xargs -r dpkg-query --search \
        | cut -d: -f1 \
        | sort -u \
        | xargs -rt apt-mark manual; \
    \
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
    rm -rf /var/lib/apt/lists/*

# Clone, build, and install Dlib as a shared library
RUN git clone https://github.com/davisking/dlib.git \
    && mkdir dlib/dlib/build \
    && cd dlib/dlib/build \
    && cmake -DBUILD_SHARED_LIBS=ON .. \
    && make \
    && make install

# Clone, build, and install pdlib
RUN git clone https://github.com/goodspb/pdlib.git \
    && cd pdlib \
    && phpize \
    && ./configure --enable-debug \
    # If the above command doesn't find dlib, uncomment the line below:
    # && PKG_CONFIG_PATH=/usr/local/lib/pkgconfig ./configure --enable-debug \
    && make \
    && make install

# Append the necessary extension configuration to php.ini (for Docker that means add file to php/conf.d/)
RUN echo "[pdlib]" >> /usr/local/etc/php/conf.d/docker-php-ext-pblib.ini \
    && echo "extension=\"pdlib.so\"" >> /usr/local/etc/php/conf.d/docker-php-ext-pblib.ini

# Install the bz2 PHP extension
RUN docker-php-ext-install bz2

# set recommended PHP.ini settings
# see https://docs.nextcloud.com/server/latest/admin_manual/installation/server_tuning.html#enable-php-opcache
RUN { \
        echo 'opcache.enable=1'; \
        echo 'opcache.interned_strings_buffer=32'; \
        echo 'opcache.max_accelerated_files=10000'; \
        echo 'opcache.memory_consumption=128'; \
        echo 'opcache.save_comments=1'; \
        echo 'opcache.revalidate_freq=60'; \
        echo 'opcache.jit=1255'; \
        echo 'opcache.jit_buffer_size=128M'; \
    } > "${PHP_INI_DIR}/conf.d/opcache-recommended.ini"; \
    \
    echo 'apc.enable_cli=1' >> "${PHP_INI_DIR}/conf.d/docker-php-ext-apcu.ini"; \
    \
    { \
        echo 'memory_limit=${PHP_MEMORY_LIMIT}'; \
        echo 'upload_max_filesize=${PHP_UPLOAD_LIMIT}'; \
        echo 'post_max_size=${PHP_UPLOAD_LIMIT}'; \
    } > "${PHP_INI_DIR}/conf.d/nextcloud.ini"; \
    \
    mkdir /var/www/data; \
    mkdir -p /docker-entrypoint-hooks.d/pre-installation \
             /docker-entrypoint-hooks.d/post-installation \
             /docker-entrypoint-hooks.d/pre-upgrade \
             /docker-entrypoint-hooks.d/post-upgrade \
             /docker-entrypoint-hooks.d/before-starting; \
    chown -R www-data:root /var/www; \
    chmod -R g=u /var/www

VOLUME /var/www/html

RUN a2enmod headers rewrite remoteip ; \
    { \
     echo 'RemoteIPHeader X-Real-IP'; \
     echo 'RemoteIPInternalProxy 10.0.0.0/8'; \
     echo 'RemoteIPInternalProxy 172.16.0.0/12'; \
     echo 'RemoteIPInternalProxy 192.168.0.0/16'; \
    } > /etc/apache2/conf-available/remoteip.conf; \
    a2enconf remoteip

# set apache config LimitRequestBody
ENV APACHE_BODY_LIMIT 1073741824
RUN { \
     echo 'LimitRequestBody ${APACHE_BODY_LIMIT}'; \
    } > /etc/apache2/conf-available/apache-limits.conf; \
    a2enconf apache-limits

ENV NEXTCLOUD_VERSION 28.0.5

RUN set -ex; \
    fetchDeps=" \
        gnupg \
        dirmngr \
    "; \
    apt-get update; \
    apt-get install -y --no-install-recommends $fetchDeps; \
    \
    curl -fsSL -o nextcloud.tar.bz2 "https://download.nextcloud.com/server/releases/nextcloud-28.0.5.tar.bz2"; \
    curl -fsSL -o nextcloud.tar.bz2.asc "https://download.nextcloud.com/server/releases/nextcloud-28.0.5.tar.bz2.asc"; \
    export GNUPGHOME="$(mktemp -d)"; \
# gpg key from https://nextcloud.com/nextcloud.asc
    gpg --batch --keyserver keyserver.ubuntu.com --recv-keys 28806A878AE423A28372792ED75899B9A724937A; \
    gpg --batch --verify nextcloud.tar.bz2.asc nextcloud.tar.bz2; \
    tar -xjf nextcloud.tar.bz2 -C /usr/src/; \
    gpgconf --kill all; \
    rm nextcloud.tar.bz2.asc nextcloud.tar.bz2; \
    rm -rf "$GNUPGHOME" /usr/src/nextcloud/updater; \
    mkdir -p /usr/src/nextcloud/data; \
    mkdir -p /usr/src/nextcloud/custom_apps; \
    chmod +x /usr/src/nextcloud/occ; \
    \
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false $fetchDeps; \
    rm -rf /var/lib/apt/lists/*

# Add cron jobs for Nextcloud's background tasks
RUN echo '*/5 * * * * php -f /var/www/html/cron.php' >> /var/spool/cron/crontabs/www-data
RUN echo '12 * * * * php /var/www/html/occ face:background_job' >> /var/spool/cron/crontabs/www-data
RUN echo '37 * * * * php /var/www/html/occ preview:pre-generate' >> /var/spool/cron/crontabs/www-data

COPY *.sh upgrade.exclude /
COPY config/* /usr/src/nextcloud/config/
COPY post_install.sh /docker-entrypoint-hooks.d/post-installation
COPY supervisord.conf /

RUN apt-get update && apt-get install -y \
    supervisor \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir /var/log/supervisord /var/run/supervisord
#     && touch /var/log/supervisord/supervisord.log && \
#     chmod -R 777 /var/log/supervisord /var/run/supervisord && \
#     chown -R www-data:www-data /var/log/supervisord /var/run/supervisord

CMD ["/usr/bin/supervisord", "-c", "/supervisord.conf"]

RUN chmod +x /entrypoint.sh /docker-entrypoint-hooks.d/post-installation/post_install.sh /cron.sh
ENTRYPOINT ["/entrypoint.sh"]

# Set the command to run supervisord on container start
# Health check to ensure Nextcloud is running and accessible
# The health check pings the Nextcloud status.php page and expects an HTTP 200 response
# Adjust the interval, timeout, start period, and retries as necessary for your environment
HEALTHCHECK --interval=1m --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost/status.php || exit 1
