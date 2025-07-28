---
title: "服务器挂载数据盘及Docker默认存储位置修改"
categories: 开发运维
tags: ['Server','Docker']
id: "ac77cbdb1ec1768e"
date: 2025-05-09 03:55:25
cover: "https://ipfs.helong.online/ipfs/QmPvAffENey5n72cXfVgAeCYtQ6osju41DDHh6Ew3RiF5t"
---

:::note
docker技术日益普遍，我的项目大多数都使用docker运行，这极大的方便了部署与维护。但是在docker的使用中产生的数据会让docker的数据目录越来越大，默认安装安装docker，将会占用根目录，对于大部分云服务器而言，所给的系统盘容量较小，通常可以加购数据盘，本帖记录数据盘挂载及docker数据迁移过程。
:::

### 挂载数据盘

1. `df -h`查看磁盘情况
![1](https://ipfs.helong.online/ipfs/QmVGV9TZ1pFiR8eVHgbiaDEkWc62tpQZZQia7SM5jATSKf)

若只有一个磁盘/dev/vda1，说明数据盘没有挂载。

2. `fdisk -l`

![2](https://ipfs.helong.online/ipfs/Qmazmn8mRKiGcMC2JYKUrSGXR83Q96cQUpzEUsn2UiVFqM)

如果发现上面输出结果中没有类似 Disk /dev/vdb:的部分，说明没有数据盘，下面的挂载操作没有意义，可以直接跳到下一部分。

3. 对磁盘分区`fdisk  /dev/vdb`

依次输入m 、p、1、回车，回车、wq 即可。

4. 格式化磁盘`mkfs.ext4  /dev/vdb1`

5. 将磁盘挂载到系统中

`mount  /dev/vdb1  /mnt/data`(需要提前创建需要挂载的位置/mnt/data)

6. 配置服务器重启自动挂载

`blkid`查询磁盘UUID

![3](https://ipfs.helong.online/ipfs/QmWojMF6C5TXU5nDx7FyUTjuXG9Voi7aZ6Qyicr2zVGawh)

修改/etc/fstab文件 `vim /etc/fstab`

![4](https://ipfs.helong.online/ipfs/QmYx8TQg9MNbGSsDahaTnqncbzGdvbH9dtHkohhQhKudQZ)

添加`UUID=2b2f2aea-4153-4f32-a0ba-8258c849929f /mnt/data ext4 defaults 0 2`

### Docker数据迁移

1. 停止docker服务

`sudo systemctl stop docker`

2. 创建新文件夹

`mkdir /mnt/data/docker`

3. 移动文件

`sudo rsync -avzh /var/lib/docker/ /mnt/data/docker/`

4. 更新Docker配置

`vim /etc/docker/daemon.json`

如果文件 /etc/docker/daemon.json 不存在，就创建它。添加或更新以下内容：

```
{
    "data-root": "/mnt/data/docker"
}
```

5. 重新启动 Docker 服务

`sudo systemctl start docker`

6. 验证 Docker 是否正常工作，并且新的数据存储位置是否正在使用。可以通过运行容器来测试。

一旦确认一切正常，删除旧的 Docker 数据目录：

`sudo rm -rf /var/lib/docker`

通过`docker info`查看Docker信息

![5](https://ipfs.helong.online/ipfs/QmQNY2yBZJtpzfqsvQFrfKngUQF1Hfjj6xQ8EfDPQymKPV)

` Docker Root Dir: /mnt/data/docker`

该行表示docker数据位置。
