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
        "htaccess.RewriteBase": "\/",
        "memcache.local": "\\OC\\Memcache\\APCu",
        "apps_paths": [
            {
                "path": "\/var\/www\/html\/apps",
                "url": "\/apps",
                "writable": false
            },
            {
                "path": "\/var\/www\/html\/custom_apps",
                "url": "\/custom_apps",
                "writable": true
            }
        ],
        "memcache.distributed": "\\OC\\Memcache\\Redis",
        "memcache.locking": "\\OC\\Memcache\\Redis",
        "redis": {
            "host": "***REMOVED SENSITIVE VALUE***",
            "password": "***REMOVED SENSITIVE VALUE***",
            "port": 6379
        },
        "trusted_proxies": "***REMOVED SENSITIVE VALUE***",
        "upgrade.disable-web": true,
        "instanceid": "***REMOVED SENSITIVE VALUE***",
        "passwordsalt": "***REMOVED SENSITIVE VALUE***",
        "secret": "***REMOVED SENSITIVE VALUE***",
        "trusted_domains": [
            "cloud.bankai-tech.com"
        ],
        "datadirectory": "***REMOVED SENSITIVE VALUE***",
        "dbtype": "mysql",
        "version": "28.0.4.1",
        "overwrite.cli.url": "https:\/\/cloud.bankai-tech.com",
        "overwriteprotocol": "https",
        "dbname": "***REMOVED SENSITIVE VALUE***",
        "dbhost": "***REMOVED SENSITIVE VALUE***",
        "dbport": "",
        "dbtableprefix": "oc_",
        "mysql.utf8mb4": true,
        "dbuser": "***REMOVED SENSITIVE VALUE***",
        "dbpassword": "***REMOVED SENSITIVE VALUE***",
        "installed": true,
        "maintenance_window_start": 1,
        "default_phone_region": "US"
    }
}
```
:::note
The `config.php` file is not indented correctly so only use this file as a reference, Do not attempt to copy/paste.
:::
