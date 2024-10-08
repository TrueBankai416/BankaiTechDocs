# Use the Nextcloud production image as the base
FROM nextcloud:production

# Install gosu (Debian/Ubuntu)
RUN apt-get update && apt-get install -y gosu && rm -rf /var/lib/apt/lists/*

# Update the package lists and install various dependencies
# These dependencies include tools and libraries required for Nextcloud and its features
RUN apt-get update \
 && apt-get install -y \
    cmake \
    ffmpeg \
    ghostscript \
    ghostwriter \
    git \
    imagemagick \
    inotify-tools \
    libbz2-dev \
    liblapack-dev \
    libopenblas-dev \
    libx11-dev \
    sudo \
    nano \
    libmagickcore-6.q16-6-extra \
 && apt-get clean

RUN pecl install inotify && \
    echo "extension=inotify.so" | tee /usr/local/etc/php/conf.d/docker-php-ext-inotify.ini

# Clone and build dlib, a toolkit for making real world machine learning and data analysis applications
RUN git clone https://github.com/davisking/dlib.git \
 && cd dlib/dlib \
 && mkdir build \
 && cd build \
 && cmake -DBUILD_SHARED_LIBS=ON .. \
 && make \
 && make install

# Clone and install pdlib, a PHP extension for dlib
RUN git clone https://github.com/goodspb/pdlib.git /usr/src/php/ext/pdlib

# Install the pdlib PHP extension
RUN docker-php-ext-install pdlib

# Install the bz2 PHP extension
RUN docker-php-ext-install bz2

# Add cron jobs for Nextcloud's background tasks
RUN echo '12 * * * * php /var/www/html/occ face:background_job' >> /var/spool/cron/crontabs/www-data
RUN echo '37 * * * * php /var/www/html/occ preview:pre-generate' >> /var/spool/cron/crontabs/www-data

# Install additional utilities
RUN apt update \
  && apt install -y wget gnupg2 unzip

# Enable the repository for pdlib and install dlib
RUN mkdir -m 0755 -p /etc/apt/keyrings/ \
  && wget -qO - https://repo.delellis.com.ar/repo.gpg.key | sudo apt-key add - \
  && wget -O- https://repo.delellis.com.ar/repo.gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/php-pdlib.gpg > /dev/null \
  && echo "deb [signed-by=/etc/apt/keyrings/php-pdlib.gpg arch=amd64] https://repo.delellis.com.ar bullseye bullseye" | sudo tee /etc/apt/sources.list.d/php-pdlib.list \
RUN apt update \
  && apt install -y libdlib-dev

# Install pdlib extension from a downloaded archive
RUN wget https://github.com/goodspb/pdlib/archive/master.zip \
  && mkdir -p /usr/src/php/ext/ \
  && unzip -d /usr/src/php/ext/ master.zip \
  && rm master.zip
RUN docker-php-ext-install pdlib-master

# Increase PHP memory limit for Nextcloud
RUN echo memory_limit=1024M > /usr/local/etc/php/conf.d/memory-limit.ini

RUN echo 'apc.enable_cli=1' >> "${PHP_INI_DIR}/conf.d/docker-php-ext-apcu.ini"

# Increase opcache memory
RUN sed -i 's/opcache.memory_consumption=128/opcache.memory_consumption=512/g' /usr/local/etc/php/conf.d/opcache-recommended.ini

# Download and test the pdlib extension
RUN wget https://github.com/matiasdelellis/pdlib-min-test-suite/archive/master.zip \
  && unzip -d /tmp/ master.zip \
  && rm master.zip
RUN cd /tmp/pdlib-min-test-suite-master \
    && make

# Install PHP extensions and configure them
RUN set -ex; \
    \
    savedAptMark="$(apt-mark showmanual)"; \
    \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        libbz2-dev \
        libc-client-dev \
        libkrb5-dev \
        libsmbclient-dev \
    ; \
    \
    docker-php-ext-configure imap --with-kerberos --with-imap-ssl; \
    docker-php-ext-install \
        bz2 \
        imap \
    ; \
    pecl install smbclient; \
    docker-php-ext-enable smbclient; \
    \
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

# Copy and adjust permissions for cron
COPY cron.sh /
RUN chmod +x /cron.sh

# Set an environment variable to indicate that Nextcloud should be updated
ENV NEXTCLOUD_UPDATE=1

# Set the command to run supervisord on container start
# Health check to ensure Nextcloud is running and accessible
# The health check pings the Nextcloud status.php page and expects an HTTP 200 response
# Adjust the interval, timeout, start period, and retries as necessary for your environment
HEALTHCHECK --interval=1m --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost/status.php || exit 1

# Notify_push

FROM clux/muslrust:stable AS build

COPY Cargo.toml Cargo.lock ./

# Build with a dummy main to pre-build dependencies
RUN mkdir src && \
 sed -i '/test_client/d' Cargo.toml && \
 echo "fn main(){}" > src/main.rs && \
 cargo build --release && \
 rm -r src

COPY build.rs ./
COPY appinfo/info.xml ./appinfo/
COPY src/ ./src/
COPY notify_push.service /etc/systemd/system/notify_push.service
RUN touch src/main.rs

RUN cargo build --release

FROM scratch

COPY --from=build /volume/target/x86_64-unknown-linux-musl/release/notify_push /
EXPOSE 7867

CMD ["/notify_push"]
