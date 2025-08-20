export default {
  // 网站标题
  Title: '硅基漫游指南',
  // 网站地址
  Site: 'https://blog.helong.online',
  // 网站副标题
  Subtitle: 'Face life with hope.',
  // 网站描述
  Description: 'No matter how far I have gone, it should be learned by heart why I set off.',
  // 网站作者
  Author: 'HeLong',
  // 作者头像
  Avatar: 'https://avatars.githubusercontent.com/u/71657914?v=4',
  // 网站座右铭
  Motto: 'Face life with hope.',
  // Cover 网站缩略图
  Cover: '/assets/images/banner/072c12ec85d2d3b5.webp',
  // 网站侧边栏公告 (不填写即不开启)
  Tips: '',
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
    "--vh-main-color": "#49B1F5",
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
    { text: '文章', link: '/archives', icon: 'Nav_archives',newWindow: false },
    { text: '说说', link: '/talking', icon: 'Nav_talking',newWindow: false },
    { text: '动态', link: '/friends', icon: 'Nav_rss',newWindow: false },
    { text: '友链', link: '/links', icon: 'Nav_friends',newWindow: false },
    { text: '关于', link: '/about', icon: 'Nav_about',newWindow: false },
  ],
  // 侧边栏个人网站
  WebSites: [
    // 仅支持 SVG 且 SVG 需放在 public/assets/images/svg/ 目录下，填入文件名即可 <不需要文件后缀名>（封装了 SVG 组件 为了极致压缩 SVG）
    // 建议使用 https://tabler.io/icons 直接下载 SVG
    { text: 'Github', link: 'https://github.com/HeLongaa', icon: 'WebSite_github' },
    { text: 'BiliBili', link: 'https://space.bilibili.com/491035693', icon: 'WebSite_bili' },
    { text: 'ZhiHu', link: 'https://www.zhihu.com/people/yu-luo-wu-sheng-73-99', icon: 'WebSite_zhi' },
  ],  // 侧边栏展示
  AsideShow: {
    // 是否展示个人网站
    WebSitesShow: true,
    // 是否展示说说轮播
    TalkingCarouselShow: true,
    // 是否展示分类
    CategoriesShow: false,
    // 是否展示标签
    TagsShow: false,
    // 是否展示推荐文章
    recommendArticleShow: true,
    // 是否展示文章目录
    TableOfContentsShow: true
  },// DNS预解析地址
  DNSOptimization: [
    'https://i0.wp.com',
    'https://cn.cravatar.com',
    'https://analytics.vvhan.com',
    'https://vh-api.4ce.cn',
    'https://registry.npmmirror.com'
  ],
  // 博客音乐组件解析接口
  vhMusicApi: 'https://vh-api.4ce.cn/blog/meting',  // 评论组件
  Comment: {
    // Twikoo 评论
    Twikoo: {
      enable: false,
      envId: ''
    },
    // Waline 评论
    Waline: {
      enable: true,
      serverURL: 'https://comment.helong.online'
    },
    // Artalk 评论
    Artalk: {
      enable: false,
      // server: 'https://artalk.helong.online',
      server:'https://pydwlhxr.eu-central-1.clawcloudrun.com',
      site: '硅基漫游指南'
    }
  },
  statistics: {
    Umami: {
      enable: false,
      server: 'https://umami.helong.online',
      siteId: '50e99b76-4bfd-4f44-9378-4ca270e1ca9c'
    },
  },
  // 友链配置
  Link_conf: {
    // 数据源类型：api | static
    api_source: "api",
    // 获取友链列表的 API
    api: 'https://friend-link.helong.online/links-list',
    // 友链申请页面 URL
    submit_url: 'https://n8n-trcqhocy.ap-northeast-1.clawcloudrun.com/form/9bb44bfc-db7f-43db-9ed7-4b0072bc2710',
    // api_source: "static",
    data: [
      {
        "name": "HeLong's Blog",
        "link": "https://blog.helong.online/",
        "avatar": "https://avatars.githubusercontent.com/u/71657914?v=4?v=3&s=88",
        "descr": "Face life with hope."
      }
    ]
  },
  // 说说配置
  Talking_conf: {
    // 数据源类型：api | memos_rss | static
    api_source: "api",

    // 当api_source=api时生效
    api: "https://talks.helong.online/api/posts",

    // 当api_source=rss时生效，使用Memos的RSS订阅
    memos_rss_url: "https://s.helong.online/u/HeLong/rss.xml",
    cors_url: "https://cors.helong.online",
    // 当api_source=static时生效
    data: [
      {
        "date": "2025-05-08 19:36:16",
        "tags": [
          "Todo"
        ],
        "content": "."
      }
    ]
  },
  // Friends 页面配置
  Friends_conf: {
    // API 接口请求优先，数据格式保持和 data 一致
    api: 'https://rss-api.040720.xyz/api/rss/public',
    get_auth_avatar: 'https://cn.cravatar.com/favicon/api/index.php',
    // api 为空则使用 data 静态数据
    data: [
      {
        "title": "Astro 中使用 Lenis 增加鼠标滚动阻尼感",
        "author": "韩小韩博客",
        "date": "2025-03-06",
        "link": "https://www.vvhan.com/article/Lenis-in-Astro",
        "content": "在移动端触控交互中，惯性滚动带来的丝滑体验已成为标配，但鼠标滚轮受限于机械结构，滚动时难免产生生硬的段落感。如何让传统滚轮操作也能获得如触控板般的阻尼反馈？Lenis库通过JavaScript模拟惯性算法，成功将”物理惯性”引入网页滚动，本文将解析其实现原理与实战应用。核心技术原理​滚轮事件拦截与目"
      }
    ]
  },

  // 访问网页 自动推送到搜索引擎
  SeoPush: {
    enable: false,
    serverApi: '',
    paramsName: 'url'
  },
  IPFS_POINT: 
  [
    'https://ipfs.040720.xyz',
    'https://ipfs.crossbell.io'
  ]
}