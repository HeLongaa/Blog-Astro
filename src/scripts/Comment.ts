import SITE_INFO from "@/config";

// Giscus 评论
const GiscusFn = async (commentDOM: string) => {
  const container = document.querySelector(commentDOM)!;
  container.innerHTML = '<section class="vh-space-loading"><span></span><span></span><span></span></section>';

  // 创建 giscus 容器
  const giscusContainer = document.createElement('div');
  giscusContainer.className = 'giscus';

  // 创建 giscus 脚本
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.setAttribute('data-repo', SITE_INFO.Comment.Giscus.repo);
  script.setAttribute('data-repo-id', SITE_INFO.Comment.Giscus.repoId);
  script.setAttribute('data-category', SITE_INFO.Comment.Giscus.category);
  script.setAttribute('data-category-id', SITE_INFO.Comment.Giscus.categoryId);
  script.setAttribute('data-mapping', SITE_INFO.Comment.Giscus.mapping);
  script.setAttribute('data-strict', SITE_INFO.Comment.Giscus.strict);
  script.setAttribute('data-reactions-enabled', SITE_INFO.Comment.Giscus.reactionsEnabled);
  script.setAttribute('data-emit-metadata', SITE_INFO.Comment.Giscus.emitMetadata);
  script.setAttribute('data-input-position', SITE_INFO.Comment.Giscus.inputPosition);

  // 根据当前主题设置 Giscus 主题
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  script.setAttribute('data-theme', currentTheme === 'dark' ? 'dark' : 'light');

  script.setAttribute('data-lang', SITE_INFO.Comment.Giscus.lang);
  script.setAttribute('data-loading', SITE_INFO.Comment.Giscus.loading);
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;

  // 清空容器并添加 giscus
  container.innerHTML = '';
  container.appendChild(giscusContainer);
  giscusContainer.appendChild(script);

  // 存储giscus实例信息以便主题切换
  if (!(window as any).vhGiscusInstances) {
    (window as any).vhGiscusInstances = [];
  }
  (window as any).vhGiscusInstances.push({
    container: giscusContainer,
    updateTheme: (theme: string) => {
      const iframe = giscusContainer.querySelector('iframe.giscus-frame') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          giscus: {
            setConfig: {
              theme: theme === 'dark' ? 'dark' : 'light'
            }
          }
        }, 'https://giscus.app');
      }
    }
  });
}

// 检查是否开启评论
const checkComment = () => {
  const CommentARR: any = Object.keys(SITE_INFO.Comment);
  const CommentItem = CommentARR.find((i: keyof typeof SITE_INFO.Comment) => SITE_INFO.Comment[i].enable);
  return CommentItem;
}

// 初始化评论插件
const commentInit = async (key: string) => {
  // 评论 DOM 
  const commentDOM = '.vh-comment>section'
  if (!document.querySelector(commentDOM)) return;

  // 只保留 Giscus 评论系统
  if (key === 'Giscus') {
    GiscusFn(commentDOM);
  }
}

export { checkComment, commentInit }
