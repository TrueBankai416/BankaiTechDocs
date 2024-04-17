:::note

If you already installed the [Docker Engine](./Docker%20Engine.md) from my other tutorial then you should already have `Docker Compose`.

:::
## Pre Install
Lets see if `Docker Compose is already installed.
```
docker compose version
```
If it is not already installed then continue following this tutorial below.

Lets make sure the system is updated by running,
```
sudo apt-get update
```
### Installing Docker Compose Plugin
:::info
`Docker Compose V2` uses `docker compose` to run.\
`Docker Compose V1` uses `docker-compoe` to run.
:::

Now lets install the `Docker Compose` plugin.
```
sudo apt-get install docker-compose-plugin
```

## Updating Docker Compose
```
sudo apt-get update
sudo apt-get install docker-compose-plugin
```
