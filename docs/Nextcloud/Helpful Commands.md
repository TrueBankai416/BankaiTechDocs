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
### Repair Nextcloud
```
sudo docker exec -it -u 33 nextcloud php occ maintenance:repair
```
### Generate Geometry Table for Memories
```
sudo docker exec -it -u 33 nextcloud php occ memories:places-setup
```

## Resources
[Reset Nextcloud Password](https://docs.nextcloud.com/server/latest/admin_manual/configuration_user/reset_admin_password.html)\
