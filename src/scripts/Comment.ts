import SITE_INFO from "@/config";
import { LoadScript } from "@/utils/index";
declare const twikoo: any;
import 'artalk/Artalk.css'
import Artalk from 'artalk'

// Twikoo 评论
const TwikooFn = async (commentDOM: string) => {
  document.querySelector(commentDOM)!.innerHTML = '<section class="vh-space-loading"><span></span><span></span><span></span></section>'
  await LoadScript("https://registry.npmmirror.com/twikoo/1.6.41/files/dist/twikoo.all.min.js");
  twikoo.init({ envId: SITE_INFO.Comment.Twikoo.envId, el: commentDOM, onCommentLoaded: () => setTimeout(() => document.querySelectorAll('.vh-comment a[href="#"]').forEach(link => link.removeAttribute('href'))) })
}

// Waline 评论
const WalineFn = async (commentDOM: string, walineInit: any) => {
  import('@waline/client/waline.css');
  import('@waline/client/waline-meta.css');
  const { init } = await import('@waline/client');
  walineInit = init({
    el: commentDOM, path: window.location.pathname.replace(/\/$/, ''), serverURL: SITE_INFO.Comment.Waline.serverURL,
    emoji: ['https://registry.npmmirror.com/@waline/emojis/1.3.0/files/alus', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/bilibili', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/bmoji', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/qq', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/weibo', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/soul-emoji'],
    reaction: [
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_agree.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_look_down.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_sunglasses.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_pick_nose.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_awkward.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_sleep.png",
    ],
    requiredMeta: ['nick', 'mail'],
    imageUploader: async (file: any) => {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch("https://wp-cdn.4ce.cn/upload", { method: "POST", body });
      const resJson = await res.json();
      return resJson.data.link.replace('i.imgur.com', 'wp-cdn.4ce.cn/v2');
    }
  });
}

// Artalk 评论
const ArtalkFn = async (commentDOM: string, _walineInit?: any) => {
  document.querySelector(commentDOM)!.innerHTML = '<section class="vh-space-loading"><span></span><span></span><span></span></section>'
  
  // 获取当前主题
  const getCurrentTheme = () => {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    return theme === 'dark';
  };

  const artalk = Artalk.init({
    el: commentDOM,
    pageKey: window.location.pathname,
    pageTitle: document.title,
    server: SITE_INFO.Comment.Artalk.server,
    site: SITE_INFO.Comment.Artalk.site,
    darkMode: getCurrentTheme(),
    locale: 'zh-CN',
    placeholder: '来都来了，不妨评论一下',
    noComment: '暂无评论',
    sendBtn: '发送评论',
    editorTravel: true,
    flatMode: 'auto',
    nestMax: 2,
    nestSort: 'DATE_ASC',
    gravatar: {
      mirror: 'https://cravatar.cn/avatar/',
      params: 'd=mp'
    },
    pagination: {
      pageSize: 20,
      readMore: false,
      autoLoad: true
    },
    heightLimit: {
      content: 300,
      children: 400,
      scrollable: false
    },
    imgUpload: true,
    imgLazyLoad: 'native',
    listSort: true,
    pvAdd: true,
    countEl: '#ArtalkCount',
    statPageKeyAttr: 'data-path'
  });

  // 监听主题变化并更新Artalk主题
  const updateArtalkTheme = () => {
    const isDark = getCurrentTheme();
    if (artalk && typeof artalk.setDarkMode === 'function') {
      artalk.setDarkMode(isDark);
    }
  };

  // 创建主题变化观察器
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        updateArtalkTheme();
      }
    });
  });

  // 开始观察主题变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // 存储观察器实例以便后续清理
  (window as any).artalkThemeObserver = observer;

  // 将Artalk实例存储到全局变量中，方便主题切换时访问
  if (!(window as any).artalkInstances) {
    (window as any).artalkInstances = [];
  }
  (window as any).artalkInstances.push(artalk);
}


// 检查是否开启评论
const checkComment = () => {
  const CommentARR: any = Object.keys(SITE_INFO.Comment);
  const CommentItem = CommentARR.find((i: keyof typeof SITE_INFO.Comment) => SITE_INFO.Comment[i].enable);
  return CommentItem;
}

// 初始化评论插件
const commentInit = async (key: string, walineInit?: any) => {
  // 评论 DOM 
  const commentDOM = '.vh-comment>section'
  if (!document.querySelector(commentDOM)) return;
  // 评论列表
  const CommentList: any = { TwikooFn, WalineFn, ArtalkFn };
  // 初始化评论
  CommentList[`${key}Fn`](commentDOM, walineInit);
}

export { checkComment, commentInit }