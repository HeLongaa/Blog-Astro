---
title: "Links"
desc: "Some interesting or useful links are recorded here."
layout: "@/layouts/ToolLayout/ToolLayout.astro"
type: "links"
---

<script src='/assets/js/fas.js' crossorigin='anonymous'></script>

<link rel="stylesheet" type="text/css" href="https:////at.alicdn.com/t/c/font_4902778_qnbxgtmm4i9.css">

1. ### Service Providers

    <i class="fa-brands fa-cloudflare"></i> [CloudFlare](https://www.cloudflare.com/zh-cn/) - Provide global DNS services for all projects.
    
    <i class="fa-solid fa-cloud"></i> [IDC-You](https://idcyou.cn/) - Provide high availability cloud server for the project (Kunming, Yunnan, China).
    
    <i class="iconfont icon-paw-claws"></i> [Claw.cloud](https://claw.cloud/) - Providing cloud infrastructure for projects.
    
    <i class="fa-solid fa-server"></i> [Oracle](https://www.oracle.com/) - Provides comprehensive integrated cloud platform and cloud services, focusing on innovative software as a service (SaaS), platform as a service (PaaS), infrastructure as a service (IaaS) and data as a service (DaaS) technologies.
    
    <i class="fa-solid fa-square-caret-up"></i> [Vercel](https://vercel.com/) - Provide a cloud service platform for the project, supporting application deployment, preview and launch of static and dynamic websites.
    
    <i class="fa-brands fa-github"></i> [Github](https://github.com/) - An online software source code hosting service platform for publicizing the code of programs or software, and using Github Pages to host blog programs.

    <i class="fa-solid fa-database"></i> [Supabase](https://supabase.com/) - Supabase is an open source Firebase alternative. Start a project with a Postgres database, authentication, instant API, edge functions, realtime subscriptions, and storage.

    <i class="iconfont icon-tengxunyun"></i> [TencentCloud](https://cloud.tencent.com/) - Tencent Cloud (tencent cloud) main site development provides secure and stable cloud computing services, covering cloud servers, cloud databases, cloud storage, video and CDN, domain name registration and other comprehensive cloud services.

    <i class="iconfont icon-huawei"></i> [Huawei Cloud](https://huaweicloud.com/) - Docker image hosting.

    

    

2. ### My Services

    |  Name  | Link  | Online time |
    |  ----  |  ----  | ---- |
    |  Homepage  | [https://helong.online/](https://helong.online/) | 2025/04/25 |
    |  Blog  | [https://blog.helong.online/](https://blog.helong.online/) | 2025/04/25 |
    |  AI Server  | [https://ai.helong.online/](https://ai.helong.online/) | 2025/04/25 |
    |  My API  | [https://api.helong.online/](https://api.helong.online/) | 2025/04/20 |
    |  Gemini-Reverse Proxy  | [https://gemini.040720.xyz/](https://gemini.040720.xyz/) | 2025/04/19 |
    |  Docker-Reverse Proxy  | [https://blog.helong.online/](https://blog.helong.online/post/6.html) | 2025/04/20 |


3. ### Tips

    Friend link application requirements:

    ✅ The website can be accessed normally

    ✅ The website type is a personal blog

    ✅ The website needs to include this site's friend link

    ❌ Commercial sites or sites containing intrusive advertisements are not accepted

    ❌ Sites that violate the laws and regulations of the People's Republic of China are not accepted

    If you meet the above conditions, you can leave your friend link information in the comment area of ​​this page

```yaml
name: HeLong's Blog
url: https://blog.helong.online/
avatar: https://avatars.githubusercontent.com/u/71657914?v=4?v=3&s=88
descr: Face life with hope.
```
Remember to add this site before applying

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


4. ### Links List（Randomly refresh ⚡️）