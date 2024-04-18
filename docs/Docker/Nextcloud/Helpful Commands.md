---
last_update:
  date: 2024/04/17
  author: BankaiTech
---
## Helpful `occ` commands for Nextcloud
### Generating a redacted list of your config.php
```
docker exec -it -u www-data nextcloud php ./occ config:list system
```
