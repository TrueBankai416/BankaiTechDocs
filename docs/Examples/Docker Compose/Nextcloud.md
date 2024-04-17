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
