# 友链申请嵌入功能 - 完整使用指南

## 🎯 功能概述

此功能允许您在任何网站页面中嵌入友链申请按钮，用户点击后会在页面上方弹出友链申请表单，无需跳转到其他页面。

## 📋 部署步骤

### 1. 部署 Links App 到 Vercel

#### 方法一：使用提供的脚本
```powershell
# 在 Blog-Astro 根目录下运行
.\deploy-links-app.ps1
```

#### 方法二：手动部署
```powershell
# 进入 links-app 目录
cd links-app

# 安装依赖
npm install

# 构建项目
npm run build

# 部署到 Vercel (需要先安装 vercel cli: npm i -g vercel)
vercel --prod
```

### 2. 配置环境变量

在 Vercel 仪表板中设置以下环境变量：
- `GITHUB_ID`: GitHub OAuth App ID
- `GITHUB_SECRET`: GitHub OAuth App Secret  
- `NEXTAUTH_SECRET`: NextAuth 密钥
- `NEXTAUTH_URL`: 您的部署 URL
- `REPO_OWNER`: GitHub 仓库所有者
- `REPO_NAME`: GitHub 仓库名称

### 3. 更新组件 URL

将组件中的 URL 替换为您的实际 Vercel 部署地址：

```astro
<EmbedLinksWidget 
  linksAppUrl="https://your-actual-app.vercel.app/embed"
  buttonText="申请友链"
/>
```

## 🛠️ 使用方法

### 在 Astro 页面中使用

```astro
---
import EmbedLinksWidget from "@/components/EmbedLinks/EmbedLinksWidget.astro";
---

<!-- 基础使用 -->
<EmbedLinksWidget 
  linksAppUrl="https://your-app.vercel.app/embed"
  buttonText="申请友链"
/>

<!-- 高级配置 -->
<EmbedLinksWidget 
  linksAppUrl="https://your-app.vercel.app/embed"
  buttonText="友链申请"
  position="fixed-bottom"
  theme="rounded"
  size="large"
/>
```

### 在 Markdown 文件中使用

```markdown
---
title: "友链页面"
layout: "@/layouts/Layout/Layout.astro"
---

import EmbedLinksWidget from "@/components/EmbedLinks/EmbedLinksWidget.astro";

<EmbedLinksWidget 
  linksAppUrl="https://your-app.vercel.app/embed"
  buttonText="申请友链"
/>
```

### 在普通 HTML 页面中使用

可以使用提供的 `test-embed.html` 作为参考，将相关代码复制到您的 HTML 页面中。

## 🎨 配置选项

| 属性 | 类型 | 可选值 | 默认值 | 说明 |
|------|------|--------|--------|------|
| `linksAppUrl` | string | - | - | 友链应用的嵌入页面 URL |
| `buttonText` | string | - | "申请友链" | 按钮显示文本 |
| `position` | string | inline, fixed-bottom, fixed-top | inline | 按钮位置 |
| `theme` | string | default, minimal, rounded | default | 按钮主题 |
| `size` | string | small, medium, large | medium | 按钮尺寸 |

## 🎯 使用场景

### 1. 友链页面
在友链列表页面添加申请按钮：
```astro
<EmbedLinksWidget 
  position="inline"
  theme="default"
  size="large"
/>
```

### 2. 博客侧边栏
在侧边栏添加小按钮：
```astro
<EmbedLinksWidget 
  position="inline"
  theme="minimal"
  size="small"
/>
```

### 3. 全站浮动按钮
在网站右下角添加固定按钮：
```astro
<EmbedLinksWidget 
  position="fixed-bottom"
  theme="rounded"
  size="medium"
  buttonText="友链"
/>
```

### 4. 文章内嵌入
在文章内容中嵌入：
```markdown
如需申请友链，请点击 <EmbedLinksWidget position="inline" theme="minimal" size="small" buttonText="这里" /> 填写信息。
```

## 🔧 测试步骤

### 1. 本地测试
```powershell
# 启动 links-app 开发服务器
cd links-app
npm run dev

# 在浏览器中打开 test-embed.html 测试本地功能
```

### 2. 生产环境测试
1. 部署 links-app 到 Vercel
2. 更新组件中的 URL
3. 在您的博客中测试实际功能

### 3. 兼容性测试
- [ ] 桌面端浏览器 (Chrome, Firefox, Safari, Edge)
- [ ] 移动端浏览器 (iOS Safari, Android Chrome)
- [ ] 不同屏幕尺寸 (手机、平板、桌面)

## 🐛 故障排除

### 问题：按钮点击无反应
**解决方案：**
1. 检查浏览器控制台错误
2. 确认 `linksAppUrl` 配置正确
3. 检查网络连接

### 问题：iframe 无法加载
**解决方案：**
1. 确认目标 URL 可访问
2. 检查 `vercel.json` 中的 X-Frame-Options 设置
3. 确认 HTTPS/HTTP 协议匹配

### 问题：样式显示异常
**解决方案：**
1. 检查 CSS 冲突
2. 确认组件样式正确加载
3. 调整 z-index 值

### 问题：移动端显示问题
**解决方案：**
1. 检查响应式断点
2. 调整按钮尺寸设置
3. 测试触摸事件

## 📱 响应式特性

- **桌面端**: 完整按钮文本和图标
- **平板端**: 自适应按钮大小
- **手机端**: 
  - 小尺寸按钮只显示图标
  - 模态框自动调整尺寸
  - 触摸优化

## 🔒 安全考虑

1. **CORS 配置**: 确保正确设置跨域访问
2. **Frame 安全**: embed 页面允许 iframe 嵌入
3. **认证安全**: GitHub OAuth 配置正确
4. **数据验证**: 表单数据验证和清理

## 📈 性能优化

1. **懒加载**: iframe 使用 lazy loading
2. **按需加载**: 只在用户点击时加载 iframe
3. **缓存优化**: 合理设置缓存头
4. **代码分割**: 组件代码独立打包

## 🎉 完成检查清单

- [ ] Links App 成功部署到 Vercel
- [ ] 环境变量配置完成
- [ ] 组件 URL 已更新
- [ ] 本地测试通过
- [ ] 生产环境测试通过
- [ ] 移动端适配正常
- [ ] 样式显示正确
- [ ] 功能逻辑完整

现在您的友链申请嵌入功能已经完全配置完成！用户可以在任何包含该按钮的页面上方便地申请友链，无需离开当前页面。
