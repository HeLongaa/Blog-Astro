# 友链提交组件使用指南

这个指南将帮助你在不同类型的项目中集成友链提交表单组件。

## 目录

1. [简介](#简介)
2. [集成方式](#集成方式)
   - [在HTML网站中使用](#在html网站中使用)
   - [在React项目中使用](#在react项目中使用)
   - [在Vue项目中使用](#在vue项目中使用)
   - [在Astro项目中使用](#在astro项目中使用)
3. [API文档](#api文档)
4. [自定义主题](#自定义主题)
5. [故障排除](#故障排除)

## 简介

友链提交组件是一个独立的、可重用的UI组件，允许访问者提交友情链接申请。提交的数据会通过GitHub API创建一个Issue，然后可以通过GitHub Actions自动处理并更新到您的友链数据文件中。

主要特点：
- 支持亮色/暗色模式自适应
- 完全响应式设计
- 可自定义标签文本
- 可配置API端点
- 支持成功/失败回调函数

## 集成方式

### 在HTML网站中使用

1. 首先，引入React和ReactDOM库：

```html
<script crossorigin src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
```

2. 引入友链表单组件脚本：

```html
<script src="path/to/friend-link-form.js"></script>
```

3. 在HTML中添加一个容器元素：

```html
<div id="friend-link-form"></div>
```

4. 初始化组件：

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    FriendLinkForm.autoMount({
      selector: '#friend-link-form',
      apiEndpoint: 'https://your-website-url.com/api/submit', 
      repoOwner: 'YourGithubUsername', 
      repoName: 'YourRepoName',
      theme: 'auto'
    });
  });
</script>
```

完整示例可参考 `example.html` 文件。

### 在React项目中使用

1. 将 `FriendLinkSubmitter.jsx` 文件复制到您的项目中

2. 在您的组件中导入并使用：

```jsx
import React from 'react';
import FriendLinkSubmitter from './path/to/FriendLinkSubmitter';

function MyPage() {
  return (
    <div className="container">
      <h1>友情链接</h1>
      <FriendLinkSubmitter 
        apiEndpoint="/api/submit"
        repoOwner="YourGithubUsername"
        repoName="YourRepoName"
        theme="light"
        onSuccess={(data) => console.log('提交成功:', data)}
        onError={(error) => console.error('提交失败:', error)}
      />
    </div>
  );
}
```

### 在Vue项目中使用

在Vue项目中，您可以使用Vue的`<script setup>`语法与React组件集成：

1. 安装所需依赖：

```bash
npm install @headlessui/vue
```

2. 创建一个包装组件：

```vue
<template>
  <div ref="friendLinkContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createRoot } from 'react-dom/client';
import FriendLinkSubmitter from './path/to/FriendLinkSubmitter';

const friendLinkContainer = ref(null);
let root = null;

onMounted(() => {
  // 创建React根元素
  root = createRoot(friendLinkContainer.value);
  
  // 渲染React组件
  root.render(
    React.createElement(FriendLinkSubmitter, {
      apiEndpoint: '/api/submit',
      repoOwner: 'YourGithubUsername',
      repoName: 'YourRepoName',
      theme: 'auto'
    })
  );
});

onUnmounted(() => {
  // 清理React根元素
  if (root) {
    root.unmount();
  }
});
</script>
```

### 在Astro项目中使用

在Astro项目中集成友链表单组件：

1. 首先，将组件文件添加到您的Astro项目中

2. 创建一个Astro组件作为包装器：

```astro
---
// FriendLinkWrapper.astro
---

<div id="friend-link-container"></div>

<script>
  // 动态导入React和ReactDOM
  import React from 'react';
  import ReactDOM from 'react-dom';
  import { FriendLinkSubmitter } from '../components/FriendLinkSubmitter';
  
  // 当文档加载完成后挂载组件
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('friend-link-container');
    if (container) {
      ReactDOM.render(
        React.createElement(FriendLinkSubmitter, {
          apiEndpoint: '/api/submit',
          repoOwner: 'YourGithubUsername',
          repoName: 'YourRepoName',
          theme: 'auto'
        }),
        container
      );
    }
  });
</script>
```

3. 在您的Astro页面中使用这个包装器组件：

```astro
---
import Layout from '../layouts/Layout.astro';
import FriendLinkWrapper from '../components/FriendLinkWrapper.astro';
---

<Layout title="友情链接">
  <main>
    <h1>友情链接</h1>
    <FriendLinkWrapper />
  </main>
</Layout>
```

## API文档

### FriendLinkSubmitter 组件

| 属性 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| apiEndpoint | string | "/api/submit" | 提交友链的API端点 |
| repoOwner | string | 无 | GitHub仓库所有者用户名 |
| repoName | string | 无 | GitHub仓库名称 |
| theme | string | "light" | 主题模式，可选值: "light", "dark", "auto" |
| labels | object | 见下方 | 自定义表单标签文本 |
| onSuccess | function | 无 | 提交成功的回调函数 |
| onError | function | 无 | 提交失败的回调函数 |

### labels 对象

| 属性 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| title | string | "提交友链" | 表单标题 |
| name | string | "网站名称" | 网站名称标签 |
| link | string | "网站链接" | 网站链接标签 |
| avatar | string | "头像链接" | 头像链接标签 |
| description | string | "网站描述" | 网站描述标签 |
| submit | string | "提交友链" | 提交按钮文本 |
| submitting | string | "提交中..." | 提交中按钮文本 |
| required | string | "必填项" | 必填项提示文本 |

### autoMount 函数

`autoMount` 函数用于自动将组件挂载到DOM元素上。

```js
FriendLinkForm.autoMount({
  selector: '#friend-link-form',
  apiEndpoint: '/api/submit',
  repoOwner: 'YourGithubUsername',
  repoName: 'YourRepoName',
  theme: 'auto',
  onSuccess: function(data) { /* ... */ },
  onError: function(error) { /* ... */ }
});
```

## 自定义主题

组件支持亮色模式和暗色模式，通过以下方式控制:

1. 通过 `theme` 属性直接指定 ("light" 或 "dark")
2. 设置 `theme="auto"` 让组件自动检测:
   - 检测操作系统偏好 (通过 `prefers-color-scheme` 媒体查询)
   - 检测网站已有的暗色模式 (通过 `.dark` 类或 `data-theme="dark"` 属性)

## 故障排除

**问题: 组件未正确渲染**
- 确保已正确加载React和ReactDOM
- 检查控制台是否有JavaScript错误

**问题: 提交失败**
- 验证API端点是否正确
- 确保GitHub仓库配置正确
- 检查用户是否已登录（如果需要登录）

**问题: 主题不匹配**
- 在自动模式下，组件会检测网站的暗色模式类或属性
- 您可以通过显式设置`theme`属性覆盖自动检测
