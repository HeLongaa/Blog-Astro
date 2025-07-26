---
title: "变更历史"
h1: "📝 网站变更历史"
desc: "记录网站的重要更新和改进历程"
layout: "@/layouts/PageLayout/PageLayout.astro"
type: "changelog"
comment: false
---

<div class="changelog-timeline">
  <div class="timeline-item">
    <div class="timeline-date">2025-07-25</div>
    <div class="timeline-content">
      <h3>🎨 页面样式优化</h3>
      <ul>
        <li>优化页脚布局</li>
        <li>改进样式设计</li>
        <li>调整响应式布局适配</li>
        <li>新增说明页面</li>
      </ul>
    </div>
  </div>

  <div class="timeline-item">
    <div class="timeline-date">2025-07-10</div>
    <div class="timeline-content">
      <h3>✨ 功能增强</h3>
      <ul>
        <li>新增友情链接申请功能</li>
        <li>优化文章目录导航></li>
        <li>改进代码高亮显示</li>
        <li>适配暗色模式</li>
      </ul>
    </div>
  </div>

  <div class="timeline-item">
    <div class="timeline-date">2025-07-05</div>
    <div class="timeline-content">
      <h3>🚀 性能优化</h3>
      <ul>
        <li>使用 Edge One 托管 <a href="https://edgeone.ai/" class="changelog-btn changelog-btn-primary">Edge One</a></li>
        <li>压缩静态资源</li>
        <li>优化页面加载速度</li>
      </ul>
    </div>
  </div>

  <div class="timeline-item">
    <div class="timeline-date">2025-06-11</div>
    <div class="timeline-content">
      <h3>🎉 网站上线</h3>
      <ul>
        <li>基于 Astro 框架构建 <a href="https://github.com/HeLongaa/Blog-Astro" class="changelog-btn changelog-btn-primary">Github 仓库</a></li>
        <li>集成评论系统</li>
      </ul>
    </div>
  </div>
</div>

<style>
.changelog-timeline {
  position: relative;
  max-width: 800px;
  margin: 2rem auto;
  padding-left: 2rem;
}

.changelog-timeline::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--vh-main-color), var(--vh-main-color-66));
}

.timeline-item {
  position: relative;
  margin-bottom: 3rem;
  padding-left: 2rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -0.5rem;
  top: 0.5rem;
  width: 1rem;
  height: 1rem;
  background-color: var(--vh-main-color);
  border: 3px solid var(--vh-white-color);
  border-radius: 50%;
  box-shadow: 0 0 0 3px var(--vh-main-color-33);
}

.timeline-date {
  display: inline-block;
  background-color: var(--vh-main-color);
  color: var(--vh-white-color);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.timeline-content {
  background-color: var(--vh-white-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: var(--vh-box-shadow);
  border-left: 4px solid var(--vh-main-color);
}

.timeline-content h3 {
  margin: 0 0 1rem 0;
  color: var(--vh-font-color);
  font-size: 1.25rem;
}

.timeline-content ul {
  margin: 0;
  padding-left: 1.5rem;
}

.timeline-content li {
  margin-bottom: 0.75rem;
  color: var(--vh-font-66);
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timeline-content li:last-child {
  margin-bottom: 0;
}
/* 自定义按钮样式 */
.changelog-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  margin-left: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  vertical-align: middle;
  color: white !important;
}

.changelog-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.changelog-btn:active {
  transform: translateY(0);
}

/* 主要按钮 - 蓝色 */
.changelog-btn-primary {
  background-color: var(--vh-main-color);
  color: white;
}

.changelog-btn-primary:hover {
  background-color: var(--vh-main-color-88);
}

/* 成功按钮 - 绿色 */
.changelog-btn-success {
  background-color: var(--vh-success);
  color: white;
}

.changelog-btn-success:hover {
  background-color: var(--vh-success);
  filter: brightness(1.1);
}

/* 信息按钮 - 青色 */
.changelog-btn-info {
  background-color: var(--vh-info);
  color: white;
}

.changelog-btn-info:hover {
  background-color: var(--vh-info);
  filter: brightness(1.1);
}

@media (max-width: 768px) {
  .changelog-btn {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
    margin-left: 0.25rem;
  }
}
</style>


