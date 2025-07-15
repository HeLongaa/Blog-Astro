---
title: "友链"
desc: "这里记录了一些有趣或有用的链接。"
layout: "@/layouts/ToolLayout/ToolLayout.astro"
type: "links"
---

<script src='/assets/js/fas.js' crossorigin='anonymous'></script>

<link rel="stylesheet" type="text/css" href="https:////at.alicdn.com/t/c/font_4902778_qnbxgtmm4i9.css">

1. ### 服务提供商

    <i class="fa-brands fa-cloudflare"></i> [CloudFlare](https://www.cloudflare.com/zh-cn/) - 为所有项目提供全球DNS服务。
    
    <i class="fa-solid fa-cloud"></i> [IDC-You](https://idcyou.cn/) - 为项目提供高可用性云服务器（中国云南昆明）。
    
    <i class="iconfont icon-paw-claws"></i> [Claw.cloud](https://claw.cloud/) - 为项目提供云基础设施。
    
    <i class="fa-solid fa-server"></i> [Oracle](https://www.oracle.com/) - 提供综合集成云平台和云服务，专注于创新的软件即服务（SaaS）、平台即服务（PaaS）、基础设施即服务（IaaS）和数据即服务（DaaS）技术。
    
    <i class="fa-solid fa-square-caret-up"></i> [Vercel](https://vercel.com/) - 为项目提供云服务平台，支持静态和动态网站的应用部署、预览和发布。
    
    <i class="fa-brands fa-github"></i> [Github](https://github.com/) - 在线软件源代码托管服务平台，用于公开程序或软件代码，并使用Github Actions托管博客数据源；使用Github Pages作为本站热备。

    <i class="fa-solid fa-database"></i> [Supabase](https://supabase.com/) - Supabase是开源的Firebase替代方案。使用Postgres数据库、身份验证、即时API、边缘函数、实时订阅和存储启动项目。

    <i class="iconfont icon-tengxunyun"></i> [腾讯云](https://cloud.tencent.com/) - 使用腾讯云Edge One 国内版托管本站。

    <i class="iconfont icon-huawei"></i> [华为云](https://huaweicloud.com/) - Docker镜像托管。

    

    

2. ### 我的服务

    |  名称  | 链接  | 上线时间 |
    |  ----  |  ----  | ---- |
    |  主页  | [https://helong.online/](https://helong.online/) | 2025/04/25 |
    |  博客  | [https://blog.helong.online/](https://blog.helong.online/) | 2025/04/25 |
    |  AI服务器  | [https://ai.helong.online/](https://ai.helong.online/) | 2025/04/25 |
    |  我的API  | [https://api.helong.online/](https://api.helong.online/) | 2025/04/20 |
    |  Gemini反向代理  | [https://gemini.040720.xyz/](https://gemini.040720.xyz/) | 2025/04/19 |
    |  Docker反向代理  | [https://blog.helong.online/](https://blog.helong.online/post/6.html) | 2025/04/20 |


3. ### 友链申请

    友链申请要求：

    ✅ 网站可以正常访问

    ✅ 网站类型为个人博客

    ✅ 网站需要包含本站的友链

    ❌ 不接受商业网站或包含侵入性广告的网站

    ❌ 不接受违反中华人民共和国法律法规的网站

    如果您符合以上条件，可以使用本页面下方**申请按钮**自助申请（需要登录Github）或在本页面的**评论区**留下您的友链信息。  

:::note{type="info"}
我将会在一天内处理申请
:::

```yaml
name: HeLong's Blog
url: https://blog.helong.online/
avatar: https://avatars.githubusercontent.com/u/71657914?v=4?v=3&s=88
descr: Face life with hope.
```
申请前请记得先添加本站

<div style="text-align: center; margin: 10px 0;">
  <button id="backup-links-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-size: 14px;" data-links-url="https://blog-api.040720.xyz/embed">
    🔗 申请友链
  </button>
</div>

<script is:inline>
// 多重初始化策略，确保在 Astro 客户端导航中正常工作
function initFriendLinksButton() {
  const backupBtn = document.getElementById('backup-links-btn');
  if (backupBtn && !backupBtn.hasAttribute('data-initialized')) {
    backupBtn.setAttribute('data-initialized', 'true');
    backupBtn.addEventListener('click', function() {
      const url = this.getAttribute('data-links-url');
      window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    });
  }
}

// 立即执行
initFriendLinksButton();

// DOMContentLoaded 事件
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFriendLinksButton);
} else {
  initFriendLinksButton();
}

// Astro 页面加载事件
document.addEventListener('astro:page-load', initFriendLinksButton);

// 备用的延迟执行
setTimeout(initFriendLinksButton, 100);

// MutationObserver 作为最后的保险
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList') {
      initFriendLinksButton();
    }
  });
});

// 监听 body 的变化
if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener('DOMContentLoaded', function() {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}
</script>


4. ### 友链列表（随机刷新 ⚡️）