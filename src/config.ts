export default {
  // 网站标题
  Title: 'HeLong’s Blog',
  // 网站地址
  Site: 'https://blog.helong.online',
  // 网站副标题
  Subtitle: 'Face life with hope.',
  // 网站描述
  Description: 'No matter how far I have gone, it should be learned by heart why I set off.',
  // 网站作者
  Author: 'HeLong',
  // 作者头像
  Avatar: 'https://img.helong.online/pictures/2025/05/20/682b7e5c110ae.png',
  // 网站座右铭
  Motto: 'Face life with hope.',
  // Cover 网站缩略图
  Cover: '/assets/images/banner/072c12ec85d2d3b5.webp',
  // 网站侧边栏公告 (不填写即不开启)
  Tips: '<p>I wish every visitor inspired if confused, and enlightened if frustrated.</p><p>If you have any questions, please feel free to contact me. I am happy to be your friend.</p>',
  // 首页打字机文案列表
  TypeWriteList: [
  ],
  // 网站创建时间
  CreateTime: '2025-05-01',
  // 顶部 Banner 配置
  HomeBanner: {
    enable: false,
    // 首页高度
    HomeHeight: '38.88rem',
    // 其他页面高度
    PageHeight: '28.88rem',
    // 背景
    background: "url('/assets/images/home-banner.webp') no-repeat center 60%/cover",
  },
  // 博客主题配置
  Theme: {
    // 颜色请用 16 进制颜色码
    // 主题颜色
    "--vh-main-color": "#01C4B6",
    // 字体颜色
    "--vh-font-color": "#34495e",
    // 侧边栏宽度
    "--vh-aside-width": "318px",
    // 全局圆角
    "--vh-main-radius": "0.88rem",
    // 主体内容宽度
    "--vh-main-max-width": "1400px",
  },
  // 导航栏 (新窗口打开 newWindow: true)
  Navs: [
    // 仅支持 SVG 且 SVG 需放在 public/assets/images/svg/ 目录下，填入文件名即可 <不需要文件后缀名>（封装了 SVG 组件 为了极致压缩 SVG）
    // 建议使用 https://tabler.io/icons 直接下载 SVG
    { text: 'HomePage', link: 'https://helong.online', icon: 'Nav_user' },
    { text: 'Archive', link: '/archives', icon: 'Nav_archives' },
    { text: 'Dynamic', link: '/talking', icon: 'Nav_talking' },
    { text: 'Links', link: '/links', icon: 'Nav_friends' },
    { text: 'Message', link: '/message', icon: 'Nav_message' },
    { text: 'About', link: '/about', icon: 'Nav_about' },
  ],
  // 侧边栏个人网站
  WebSites: [
    // 仅支持 SVG 且 SVG 需放在 public/assets/images/svg/ 目录下，填入文件名即可 <不需要文件后缀名>（封装了 SVG 组件 为了极致压缩 SVG）
    // 建议使用 https://tabler.io/icons 直接下载 SVG
    { text: 'Github', link: 'https://github.com/HeLongaa', icon: 'WebSite_github' },
    { text: 'BiliBili', link: 'https://space.bilibili.com/491035693', icon: 'WebSite_bili' },
    { text: 'ZhiHu', link: 'https://www.zhihu.com/people/yu-luo-wu-sheng-73-99', icon: 'WebSite_zhi' },
  ],
  // 侧边栏展示
  AsideShow: {
    // 是否展示个人网站
    WebSitesShow: true,
    // 是否展示分类
    CategoriesShow: true,
    // 是否展示标签
    TagsShow: true,
    // 是否展示推荐文章
    recommendArticleShow: true
  },
  // DNS预解析地址
  DNSOptimization: [
    'https://i0.wp.com',
    'https://cn.cravatar.com',
    'https://analytics.vvhan.com',
    'https://vh-api.4ce.cn',
    'https://registry.npmmirror.com',
    'https://pagead2.googlesyndication.com'
  ],
  // 博客音乐组件解析接口
  vhMusicApi: 'https://vh-api.4ce.cn/blog/meting',
  // 评论组件（只允许同时开启一个）
  Comment: {
    // Twikoo 评论
    Twikoo: {
      enable: false,
      envId: ''
    },
    // Waline 评论
    Waline: {
      enable: false,
      serverURL: 'https://waline.helong.online',
      //Waline 评论配置参数，参考https://waline.js.org/reference/client/props.html
      login_Model: 'enable',
      // turnstileKey: '0x4AAAAAABceQREHurDjC26L'

    },
    Artalk:{
      enable: true,
      serverURL: 'https://artalk.helong.online/',
      // Artalk 评论配置参数，参考https://artalk.js.org/zh/guide/deploy.html
      siteName: 'Blog',
    }
  },
  // Umami统计
  // Umami: { enable: true, server: 'https://umami.helong.online', siteId: 'b9e08990-db20-4d25-b7c9-94ff0473c500' },
  Umami: { enable: true, server: 'https://umami.helong.online', siteId: '50e99b76-4bfd-4f44-9378-4ca270e1ca9c' },

  // Han Analytics 统计（https://github.com/uxiaohan/HanAnalytics）
  HanAnalytics: { enable: false, server: 'https://analytics.vvhan.com', siteId: 'Hello-HanHexoBlog' },
  // Google 广告
  GoogleAds: {
    ad_Client: '', //ca-pub-xxxxxx
    // 侧边栏广告(不填不开启)
    asideAD_Slot: ``,
    // 文章页广告(不填不开启)
    articleAD_Slot: ``
  },
  // 文章内赞赏码
  Reward: {
    // 支付宝收款码
    AliPay: '/assets/images/alipay.webp',
    // 微信收款码
    WeChat: '/assets/images/wechat.webp'
  },
  // 访问网页 自动推送到搜索引擎
  SeoPush: {
    enable: false,
    serverApi: '',
    paramsName: 'url'
  },
  // 页面阻尼滚动速度
  ScrollSpeed: 550
}