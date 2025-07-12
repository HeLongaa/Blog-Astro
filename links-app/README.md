# 友链申请系统

这是一个基于GitHub Actions的友链系统，允许用户通过GitHub登录并提交友链信息到指定仓库的Issues中。同时提供一个API端点用于获取所有友链数据，以及一个可复用的友链提交组件供其他项目使用。

## 功能

1. **GitHub 登录**：用户可以使用 GitHub 账户登录
2. **友链提交**：登录后可以提交友链信息（名称、链接、头像、描述）
3. **友链数据 API**：通过 `/json` 端点可以获取 Links.json 文件内容
4. **可复用组件**：提供独立的友链提交组件，支持在其他项目中使用
5. **主题适配**：友链组件支持亮色/暗色模式自适应
6. **GitHub Actions 集成**：自动将带有 "Links" 标签的 Issues 整合到 Links.json 文件中

## 部署步骤

### 1. 创建 GitHub OAuth 应用

1. 访问 GitHub 设置页面：https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写应用信息：
   - Application name: 友链申请
   - Homepage URL: 你的 Vercel 部署 URL (例如 https://links.yourdomain.com)
   - Authorization callback URL: 你的 Vercel 部署 URL + /api/auth/callback/github (例如 https://links.yourdomain.com/api/auth/callback/github)
4. 点击 "Register application"
5. 记下 Client ID 和 Client Secret

### 2. 部署到 Vercel

1. 将这个文件夹提交到 GitHub 仓库
2. 在 Vercel 中导入这个仓库
3. 设置环境变量：
   - `GITHUB_ID`: GitHub OAuth 应用的 Client ID
   - `GITHUB_SECRET`: GitHub OAuth 应用的 Client Secret
   - `NEXTAUTH_SECRET`: 一个随机字符串，用于加密会话 (可以使用 `openssl rand -base64 32` 生成)
   - `NEXTAUTH_URL`: 你的 Vercel 部署 URL (例如 https://links.yourdomain.com)
   - `GITHUB_PAT`: GitHub Personal Access Token (需要具有repo权限，用作备选授权方式)
   - `REPO_OWNER`: 仓库所有者用户名 (默认为 "HeLongaa")
   - `REPO_NAME`: 仓库名称 (默认为 "Blog-Astro")
4. 部署应用，确保在 Vercel 项目设置中：
   - 构建命令设置为：`cd links-app && npm run build`
   - 输出目录设置为：`links-app/.next`
   - 安装命令设置为：`cd links-app && npm install`

## 使用方法

1. **提交友链**：访问主页，登录 GitHub 后填写友链信息并提交
2. **获取友链数据**：通过 `/json` 或 `/api/json` 端点获取 Links.json 文件内容
3. **在其他项目中使用友链组件**：
   - 复制 `src/components/FriendLinkSubmitter.jsx` 和 `src/components/friend-link-form.js` 到你的项目
   - 参考 `src/examples/` 目录中的示例和集成指南

## 在其他项目中使用友链组件

我们提供了一个独立的友链提交组件，您可以轻松地集成到任何网站或应用中。

### HTML网站集成

```html
<!-- 1. 引入React和ReactDOM -->
<script crossorigin src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>

<!-- 2. 引入友链表单组件脚本 -->
<script src="path/to/friend-link-form.js"></script>

<!-- 3. 添加容器元素 -->
<div id="friend-link-form"></div>

<!-- 4. 初始化组件 -->
<script>
  document.addEventListener('DOMContentLoaded', function() {
    FriendLinkForm.autoMount({
      selector: '#friend-link-form',
      apiEndpoint: 'https://your-app-url.com/api/submit',
      repoOwner: 'YourGithubUsername',
      repoName: 'YourRepoName',
      theme: 'auto'
    });
  });
</script>
```

### React项目集成

```jsx
import React from 'react';
import FriendLinkSubmitter from './path/to/FriendLinkSubmitter';

function MyComponent() {
  return (
    <FriendLinkSubmitter 
      apiEndpoint="/api/submit"
      repoOwner="YourGithubUsername"
      repoName="YourRepoName"
      theme="light"
    />
  );
}
```

### Astro项目集成

请参考 `src/examples/astro-integration/FriendLinkForm.astro` 文件，了解如何在Astro项目中集成友链表单组件。

详细集成指南请参考 `src/examples/integration-guide.md` 文档。

## 本地开发

1. 克隆仓库
2. 安装依赖：`npm install`
3. 创建 `.env.local` 文件并填写环境变量
4. 启动开发服务器：`npm run dev`

## 注意事项

- 用户需要有 GitHub 账户才能提交友链
- 提交的友链信息会创建一个带有 "Links" 标签的 GitHub Issue
- GitHub Actions 会定期将带有 "Links" 标签的 Issues 整合到 Links.json 文件中
