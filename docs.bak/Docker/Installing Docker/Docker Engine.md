---
title: Docker Engine
tags:
   - Docker
   - Docker Engine
   - Tutorial
keywords: [Docker, Docker Engine, Tutorial]
last_update:
  author: BankaiTech
---
Official Documentation can be found here. [Official Docs](https://docs.docker.com/engine/install/ubuntu/)

## Installation
First you should always update your system. You can do so by running the following command inside a Terminal.
```
sudo apt update && apt upgrade -y
```
Now lets check for conflicting packages.
```
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
```
### Adding the Repository
The following command will setup Dockers `apt` repository.
```
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```
### Installing Docker Engine
Time to install Docker.
```
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
### Test the Installation
You can test that Docker is running using this command.
```
sudo docker run hello-world
```
:::tip[My Tip]
I prefer using Docker-Compose(installed with Docker Engine with this tutorial). If you do not have `Docker Compose`, Install here [Docker-Compose](./Docker-Compose.md).

:::info

You still need to install the Docker Engine if you wish to use Docker-Compose

:::

