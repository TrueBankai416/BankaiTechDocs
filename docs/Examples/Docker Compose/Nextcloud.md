---
last_update:
  date: 2024/04/17
  author: BankaiTech
---
## docker-compose.yaml
```
  mariadb:
    image: mariadb:10.6
    container_name: mariadb
    restart: always
    command: --transaction-isolation=READ-COMMITTED --log-bin=binlog --binlog-format=ROW
    volumes:
      - ./mariadb:/var/lib/mysql
    env_file:
      - .mariadb.env

  nextcloud:
    image: nextcloud
    container_name: nextcloud
    restart: always
    ports:
      - 8080:80
    links:
      - mariadb
      - redis
    volumes:
      - ./nextcloud:/var/www/html
    env_file:
      - .nextcloud.env

  redis:
    container_name: redis
    image: redis:latest
    expose:
      - 6379
    command: redis-server --save 60 1 --loglevel warning
    restart: always
```
## config.php
```
<?php
$CONFIG = array (
  'htaccess.RewriteBase' => '/',
  'memcache.local' => '\\OC\\Memcache\\APCu',
  'apps_paths' => 
  array (
    0 => 
    array (
      'path' => '/var/www/html/apps',
      'url' => '/apps',
      'writable' => false,
    ),
    1 => 
    array (
      'path' => '/var/www/html/custom_apps',
      'url' => '/custom_apps',
      'writable' => true,
    ),
  ),
  'memcache.distributed' => '\\OC\\Memcache\\Redis',
  'memcache.locking' => '\\OC\\Memcache\\Redis',
  'redis' => 
  array (
    'host' => 'redis',
    'password' => '',
    'port' => 6379,
  ),
  'trusted_proxies' => 
  array (
    0 => '192.168.4.204',
  ),
  'upgrade.disable-web' => true,
  'instanceid' => '*****REMOVED_SENSITIVE_VALUE*****',
  'passwordsalt' => '*****REMOVED_SENSITIVE_VALUE*****',
  'secret' => '*****REMOVED_SENSITIVE_VALUE*****',
  'trusted_domains' => 
  array (
    0 => 'cloud.bankai-tech.com',
  ),
  'datadirectory' => '/var/www/html/data',
  'dbtype' => 'mysql',
  'version' => '28.0.4.1',
  'overwrite.cli.url' => 'https://cloud.bankai-tech.com',
  'overwriteprotocol' => 'https',
  'dbname' => 'nextcloud',
  'dbhost' => 'mariadb',
  'dbport' => '',
  'dbtableprefix' => 'oc_',
  'mysql.utf8mb4' => true,
  'dbuser' => 'nextcloud',
  'dbpassword' => 'CHANGEME',
  'installed' => true,
  'maintenance_window_start' => 1,
  'default_phone_region' => 'US',
);
```
