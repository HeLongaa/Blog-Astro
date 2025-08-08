---
title: "通过EdgeOne实现Oracle对象存储的全球加速"
categories: 开发运维
tags: ['EdgeOne']
id: "f61c9567097c4ff9"
date: 2025-07-29 06:05:35
cover: "https://oss.helong.online/bucket-IMG/15af6b437871afc52cb145fbbb647d197109fefa7a2a42e1b8c499f2670054cf.png"
---

:::note
Oracle Cloud 免费套餐提供了 20GB 的 S3 兼容对象存储额度，本着“物尽其用”的原则，我考虑将其作为博客图床，同时，为加速国内网络访问速度，我使用了EdgeOne进行加速。
:::

## 0. 说明

目前，我的博客托管在 EdgeOne，而图床则基于 Oracle 对象存储，并通过 Cloudflare Workers 实现 CDN 加速。相较于自建对象存储方案，云厂商的对象存储通常功能更丰富，管理也更便捷。

### OCI Object Storage 的优势：

- 预授权支持：即使存储桶设为私有，仍可通过授权码（Pre-Signed URL）安全访问，方便 Web 应用集成。

- 高可靠性：作为企业级云服务，提供持久性和可用性保障。

- S3 兼容：可无缝对接各类支持 S3 协议的工具和框架。

这样一来，既能享受免费额度，又能获得企业级存储服务的稳定性和功能优势。

### Cloudflare

Cloudflare作为全球领先的边缘网络平台，提供三大核心价值：极速内容分发、全方位安全防护和智能边缘计算。其300多个全球节点构成的CDN网络可显著降低访问延迟，内置的DDoS防护和WAF防火墙能有效抵御各类网络攻击。通过边缘Worker无服务器计算，开发者可以在靠近用户的位置运行业务逻辑，配合自动HTTPS加密和HTTP/3支持，在保障安全的同时优化传输效率。Cloudflare的免费套餐包含这些核心功能，使其成为提升网站性能和安全性最具性价比的选择。

### EdgeOne

EdgeOne 作为专为中国市场优化的全球加速服务，通过本土化节点布局和智能路由技术，为国内用户提供极速访问体验。其在国内部署的高质量边缘节点有效规避跨境网络延迟，配合智能缓存策略，使资源加载速度提升40%以上，实现"全球加速，本地体验"。

![Cloudflare 访问速度](https://oss.helong.online/bucket-IMG/79b970e7da137aa915090b96262674c4f1e97946f59823c1f0f8d209ed6e4fb4.png)  

![通过EdgeOne加速后的访问速度](https://oss.helong.online/bucket-IMG/133533bc2328918298e47ae25f1dfbf126118bc42ea677a75b93d6acd8539eb9.png)  

## 1. 创建储存桶

1. 登录 Oracle 控制台，选择 Object Storage（对象存储） 服务
2. 创建新的存储桶

![创建存储桶-1](https://oss.helong.online/bucket-IMG/b93979b844e5079cdf5b3431c42a826c6ec0fac1c292318c2fafe6638d44a9f5.png)

储存桶名称任意

![创建存储桶-2](https://oss.helong.online/bucket-IMG/2db69a0f590d2c9563973971178f27c454c9be86cb39b7fe9db7f4f4193cf67c.png)  

3. 设置访问权限为私有

此时该存储桶不能访问。注意可见性设置，如果设置为公共，那么将允许匿名用户和未通过身份验证的用户访问该存储桶中存储的数据，这样是不安全的。建议保持专用，通过 Cloudflare 免费 CDN 访问专用存储桶的资源。

4. 创建访问密钥（使用插件或软件上传图片）

通过控制面板-右上角用户头像-我的概要信息-安全-下滑创建客户密钥

![创建访问密钥](https://oss.helong.online/bucket-IMG/ace511c30c59142100626b3fa5330477cb41155fdbc924bf16598fb38ce50e40.png)  

记录 Secret key 和 Access key ID

```bash
region #是当前账户资源区域 region=us-ashburn-1。
bucket #存储桶详细信息中的名称空间:idd****edn。
endpoint #https://compat.objectstorage.<region>.oraclecloud.com/<name> 此处为设置的存储桶名称。
S3_URL #客户端得到的 URL 为 https://<名称空间>.compat.objectstorage.<region>.oraclecloud.com/<存储桶名称>/<key>。
```

此时已经可以通S3标准访问此存储桶，但是为了后续使用Cloudflare CDN，我们需要生成预授权URL

5. 生成预授权URL

预先验证的请求允许访问存储桶对象而不需要提供访问密钥。

进入创建的存储桶，选择预授权URL

![创建预授权URL](https://oss.helong.online/bucket-IMG/0cb7840a4a8819e63ee14f719962dd192493cfc9b599023450d6d136b9bca0d2.png)  
 
创建并设置过期时间。

至此，存储桶已经创建完成，可以进行下一步。

## 2. Cloudflare Workers 以及缓存设置(适用于域名无备案无法使用EdgeOne国内节点的情况)

:::note
此部分内容参考：[平凡的路-博客](https://ogr.xyz/p/oracle-object-storage/#cloudflare-workers) 相关内容，所有引用的文本都可以在原有博客查找相关信息，如有侵权请联系删除。
:::

:::note
此处的[domain] 代指你的域名
:::

首先，~~假设你有~~ 你一定有至少一个域名托管与 Cloudflare 以使用相关服务~

> 常规的 CDN 模式是：用户 -> Cloudflare 服务器 -> Source 服务器。这种方式只需要在 Cloudflare 托管域名，使用 CNAME 并开启代理（点亮小云朵）即可。然而对于 Oracle 对象存储，无论可见性是公共还是专用，都无法实现代理。这是因为 Oracle 对象存储的域名里面包含存储桶的 bucket 和 region 信息，Cloudflare 访问源服务器时并不会使用源服务器域名，而是使用 Cloudflare 托管的域名，这样一来 Oracle 服务器就不能正常处理请求了。（企业版订阅用户可以通过规则重写 Host HTTP Header。Cloudflare 解释说普通用户不允许是出于安全考虑。）

因此，我们需要使用 Workers 作为中间层，来转发请求到 Oracle 对象存储。

### 1. 创建 Workers 插入以下代码：

::btn[点击按钮获取代码]{link="https://oss.helong.online/bucket-IMG/index.js" type="message"}

替换`OOS_BUCKET_PREAUTH_URL` 为你为存储桶创建的预先验证的请求 URL

添加二级域名，类型 CNAME，名字为 oss，目标任意，开启代理（小黄云）。之后 oss.[domain] 的流量会接入到 Cloudflare。

添加 Workers 路由`oss.[domain]/*`，作用是：将 oss.[domain] 的所有流量转发到 Workers。

![创建Workers - 1](https://oss.helong.online/bucket-IMG/653aacf9e2915d1ad735765b77ef871ed56000e87610a8a3404c59d75f3d4dca.png)  

### 2. 缓存设置

主页进入域名

![缓存设置 - 1](https://oss.helong.online/bucket-IMG/3aa24c60a20e2c576a2cce770bd463c8ae800f63bb0ad8f15caa6facf914d108.png)  

点击创建规则

![缓存设置 - 2](https://oss.helong.online/bucket-IMG/b946cf2f3d72528b3077ffb3feff33eece3fb23287a0fd73ffff1768813a5fb6.png)  

创建缓存规则

![缓存设置 - 3](https://oss.helong.online/bucket-IMG/dcc24dd94e3d2fd5a0488edf5877e01e2b4b43ae991b5dfda72e1301980b5b30.png)  

创建“缓存 Everything”规则

![缓存设置 - 4](https://oss.helong.online/bucket-IMG/88bd51d446d0e6d8dc1b3331300331c7920b7bf178ed36406fb02e6debaec73f.png)  

匹配值填写`oss.[domain]/*`

至此，已经可以使用 oss.[domain] 访问 Oracle 对象存储了，但是为了国内加速，建议使用 EdgeOne 进行加速。

## 3. 使用 EdgeOne 加速访问（如果域名有备案，EdgeOne 可以开启全球可用区，国内首选）

1. 登录 EdgeOne 控制台，选择加速域名
2. 点击域名服务 --> 域名管理 --> 添加域名
3. 填写加速域名 oss.[主要域名]
4. 选择对象存储源站

![图 15](https://oss.helong.online/bucket-IMG/a13de5fe5165a5f6b08421eccdb5908f6c2b239610c5227d98365ddb67d7cd7a.png)  

5. 源站类型选择 s3 兼容，需要填写的内容如下：

![图 16](https://oss.helong.online/bucket-IMG/33e982516f2dd14501b7d2671361ed65d54fb9d097daf343b663bc643e023a5c.png)  

- 源站地址：`命名空间.compat.objectstorage.区域代码.oraclecloud.com`
- 鉴权版本**必须选择** AWS signature v4 
> 以下项目在 Oracle 对象存储不受支持：虚拟主机式访问以及 AWS 签名版本 2 (SigV2)
- 地域、Access Key ID 以及 Secret Access Key 为控制台获取的相关信息。

图片访问路径为：https://oss.[domain]/{Bucket-Name}/{img-key}

6. 保存设置
7. 配置SSL证书


Enjoy!

![picture 14](https://oss.helong.online/bucket-IMG/899dc16262bdcff1d0c4b347b0c7479f72d47fa4fa89094e01957c007d0c52b6.png)  
