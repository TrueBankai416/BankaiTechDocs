---
last_update:
  author: BankaiTech
---
## Helpful `occ` commands for Nextcloud
### Generating a redacted list of your config.php
```
docker exec -it -u www-data nextcloud php occ config:list system
```
### Reset Password
```
sudo docker exec -it -u 33 nextcloud php occ user:resetpassword admin
```
:::tip
For Nextcloud AIO, use.
```
sudo cat /var/lib/docker/volumes/nextcloud_aio_mastercontainer/_data/data/configuration.json | grep password
```
:::
### Repair Nextcloud
```
sudo docker exec -it -u 33 nextcloud php occ maintenance:repair
```
### Generate Geometry Table for Memories
```
sudo docker exec -it -u 33 nextcloud php occ memories:places-setup
```
### Adding Missing DB Indices
```
sudo docker exec -it -u 33 nextcloud php occ db:add-missing-indices
```

## Resources
[Reset Nextcloud Password](https://docs.nextcloud.com/server/latest/admin_manual/configuration_user/reset_admin_password.html)
