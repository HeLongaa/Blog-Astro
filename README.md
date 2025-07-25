# 🌟 HeLong's Blog - Astro Theme

![Astro](https://img.shields.io/badge/Astro-5.7+-orange.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![Less](https://img.shields.io/badge/Less-4.0+-purple.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![PNPM](https://img.shields.io/badge/PNPM-8.0+-yellow.svg)
![License](https://img.shields.io/badge/License-MIT-red.svg)

> 🚀 一个基于 Astro 构建的现代化个人博客主题，具有优雅的设计和丰富的功能

[**🌐 在线预览**](https://blog.helong.online/) | [**📚 文档**](#功能特性) | [**🛠️ 部署指南**](#快速开始) | [**🔗 友链申请功能**](https://github.com/HeLongaa/links-app-workers) | [**<img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%23FFA500' viewBox='0 0 24 24'><path d='M6.18 17.82a2.18 2.18 0 1 1 0-4.36 2.18 2.18 0 0 1 0 4.36zm-3.18.18v-3a1 1 0 0 1 1-1c8.28 0 15 6.72 15 15a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1c0-6.08-4.92-11-11-11a1 1 0 0 1-1-1zm0-6v-3a1 1 0 0 1 1-1c12.15 0 22 9.85 22 22a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1c0-10.49-8.51-19-19-19a1 1 0 0 1-1-1z'/></svg>" alt="RSS" style="vertical-align:middle;" /> RSS订阅功能**](https://github.com/HeLongaa/RSS-Subscription)

## 📋 项目介绍

本项目基于 [vhAstro-Theme](https://github.com/uxiaohan/vhAstro-Theme) 进行了深度定制和功能增强。这是一个使用 Astro 静态站点生成器构建的现代化博客主题，专为个人博客和技术分享而设计。

### 🔄 基于原项目的改进

感谢 [@uxiaohan](https://github.com/uxiaohan) 提供的优秀基础框架。

### ✨ 核心特色

- 🌙 **暗色/亮色主题切换** - 支持自动、手动主题切换
- 📱 **完全响应式设计** - 适配所有设备屏幕
- ⚡ **极速性能** - 基于 Astro 的静态生成，加载速度极快
- 🔍 **全文搜索** - 内置搜索功能，快速查找文章
- 📊 **数据统计** - 文章数量、分类、标签统计
- 💬 **评论系统** - 集成评论功能
- 🏷️ **标签分类** - 完善的文章分类和标签系统

## 🚀 功能特性

### 🎨 界面设计
- ✅ 现代化 UI 设计，简洁优雅
- ✅ 暗色/亮色主题自由切换
- ✅ 响应式布局，完美适配移动端
- ✅ 流畅的页面切换动画
- ✅ 自定义字体和图标支持

### 📝 内容管理
- ✅ Markdown 文档写作
- ✅ MDX 组件支持
- ✅ 代码高亮显示
- ✅ 数学公式渲染 (KaTeX)
- ✅ 文章字数统计和阅读时间
- ✅ 文章置顶功能

### 🔧 功能模块
- ✅ 全文搜索功能
- ✅ 文章目录导航
- ✅ 评论系统集成
- ✅ RSS 订阅生成
- ✅ 站点地图自动生成
- ✅ SEO 优化配置
- ✅ 图片懒加载
- ✅ 基于 CloudFlare 的友链管理
- ✅ 基于 CloudFlare 的RSS订阅

### 📊 数据分析
- ✅ 文章统计信息
- ✅ 分类和标签管理
- ✅ 访问统计集成
- ✅ 网站运行状态监控

## 🛠️ 技术栈

- **框架**: [Astro](https://astro.build/) - 现代静态站点生成器
- **语言**: TypeScript - 类型安全的 JavaScript
- **样式**: Less - CSS 预处理器
- **包管理**: PNPM - 快速的包管理器
- **部署**: 支持 Vercel、Netlify、GitHub Pages
- **工具**: ESLint、Prettier 代码格式化

## 🚀 快速开始

### 环境要求

- Node.js 18.0+
- PNPM 8.0+

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/Blog-Astro.git
cd Blog-Astro
```

2. **安装依赖**
```bash
pnpm install
```

3. **启动开发服务器**
```bash
pnpm dev
```

4. **构建生产版本**
```bash
pnpm build
```

### 配置说明

修改 `src/config.ts` 文件来自定义你的博客设置：

```typescript
export default {
  Site: "https://your-domain.com",
  Title: "你的博客标题",
  Author: "你的名字",
  Description: "博客描述",
  // ... 更多配置选项
}
```

## 📁 项目结构

```
Blog-Astro/
├── src/
│   ├── components/     # 组件目录
│   ├── content/        # 博客内容
│   ├── layouts/        # 页面布局
│   ├── pages/          # 页面路由
│   ├── scripts/        # 脚本文件
│   └── styles/         # 样式文件
├── public/             # 静态资源
└── astro.config.mjs    # Astro 配置
```

## 📝 写作指南

1. 在 `src/content/blog/` 目录下创建 `.md` 或 `.mdx` 文件
2. 使用以下 frontmatter 格式：

```yaml
---
title: "文章标题"
date: 2025-01-01
categories: "分类"
tags: ["标签1", "标签2"]
cover: "封面图片路径"
---

你的文章内容...
```

## 🎯 关于作者

👋 你好，我是 **HeLong**

🎓 目前在 [云南大学](https://www.ynu.edu.cn/) 攻读计算机科学学士学位  
💭 人生格言：*无论走得多远，都要记住当初为什么出发*  
📝 这个博客用来记录我的学习和生活，希望能给每一位访客带来启发

### 📫 联系方式

- 📧 **邮箱**: helong_001@qq.com
- 🐙 **GitHub**: [HeLong](https://github.com/Helongaa)
- 📚 **知乎**: [想再见一面](https://www.zhihu.com/people/yu-luo-wu-sheng-73-99)
- 📺 **哔哩哔哩**: [风吹枫悠落](https://space.bilibili.com/491035693)

## 🙏 致谢

特别感谢以下项目和开发者：

- **[vhAstro-Theme](https://github.com/uxiaohan/vhAstro-Theme)** - 本项目的基础，由 [@uxiaohan](https://github.com/uxiaohan) 开发
- **[Astro](https://astro.build/)** - 强大的静态站点生成器
- 所有为开源社区贡献力量的开发者们

## 📜 开源协议

本项目采用 [MIT](LICENSE) 开源协议

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

如果你觉得这个项目对你有帮助，请给它一个 ⭐️

---

<p align="center">
  <strong>如果你有任何问题，欢迎随时联系我。我很乐意成为你的朋友！</strong>
</p>
