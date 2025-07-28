---
title: "自建Docker镜像加速服务"
categories: 项目
tags: ['Docker','Oracle']
id: "7989b7ac17b44892"
date: 2025-05-09 04:57:35
cover: "https://oss.helong.online/4c1b3e87ac6b15d4803f65cc25d8b81ab1bd1389e3c82d6590d979cbe6a71696.png"
---

:::note
由于某些原因，Docker Hub官方仓库在国内无法拉取，国内网络环境，需要配置镜像使用，从而解决Docker镜像拉取失败或缓慢问题。通过自建Docker镜像加速服务，提高Docker使用体验。
:::

**使用开源项目[Docker-Proxy](https://github.com/dqzboy/Docker-Proxy/)**

### 📝 你需要

- 一台国外服务器，并且未被墙。

- 域名，无需进行国内备案。

🚀 如果你没有以上条件，那么你也可以试试使用第三方免费容器部署服务 [ClawCloud](https://claw.cloud/) 

⚠️ Clawcloud免费账户流量为 10GB/Mo ，酌情使用

### 📦 部署

```
# CentOS && RHEL && Rocky
yum -y install curl

# ubuntu && debian
apt -y install curl

bash -c "$(curl -fsSL https://raw.githubusercontent.com/dqzboy/Docker-Proxy/main/install/DockerProxy_Install.sh)"
```
    
![picture 0](https://oss.helong.online/822c518f7333ad5abfd0727e5b35aa841797da2a07ac90aebec85abaa0c0294f.png)  


### 💊 使用

参考网站[Docker 代理](https://docker.helong.online/)

域名替换配置如下：

![picture 1](https://oss.helong.online/14df6d3bffa860ce929f6bb2bc646b631f723b38d710f88f19e9fe412290fbdb.png)  


*.040720.xyz 为我自己部署的加速服务，使用Oracle🇺🇸服务器