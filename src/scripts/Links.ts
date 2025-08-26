import { $GET } from '@/utils'
import vhLzImgInit from "@/scripts/vhLazyImg"
import { createErrorMessage, createWarningMessage, showMessage } from '@/utils/message'
import SITE_INFO from "@/config";
import "../styles/Operate_Button.less"

// 友链申请按钮配置接口
interface LinkButtonConfig {
  linksUrl: string;
  buttonText: string;
  buttonClass: string;
  containerId: string;
}
// 虚拟化列表的配置
const BATCH_SIZE = 20;  // 每批渲染的数量
let renderTimer: number | null = null;

// 优化的 shuffleArray 函数，只在必要时执行
const shuffleArray = <T>(array: T[]): T[] => {
  if (!array.length) return array;
  const cached = sessionStorage.getItem('links-shuffle-order');
  if (cached) {
    const order = JSON.parse(cached);
    if (order.length === array.length) {
      return order.map((i: number) => array[i]);
    }
  }
  const indices = array.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  sessionStorage.setItem('links-shuffle-order', JSON.stringify(indices));
  return indices.map(i => array[i]);
}

const renderLinks = (data: any[]) => {
  const linksDOM = document.querySelector('.main-inner-content > .vh-tools-main > main.links-main');
  if (!linksDOM) return;

  // 如果数据没有变化，直接返回
  const dataHash = JSON.stringify(data);
  const cachedHash = linksDOM.getAttribute('data-hash');
  if (dataHash === cachedHash) return;

  // 清理之前的定时器
  if (renderTimer) {
    cancelAnimationFrame(renderTimer);
    renderTimer = null;
  }

  // 准备渲染数据
  const shuffledData = shuffleArray(data);
  const totalBatches = Math.ceil(shuffledData.length / BATCH_SIZE);
  let currentBatch = 0;

  // 创建文档片段，避免直接操作 DOM
  const fragment = document.createDocumentFragment();
  const templateContainer = document.createElement('div');

  // 分批渲染函数
  const renderBatch = () => {
    if (currentBatch >= totalBatches) {
      // 全部渲染完成
      linksDOM.innerHTML = '';
      linksDOM.appendChild(fragment);
      linksDOM.setAttribute('data-hash', dataHash);
      vhLzImgInit();
      return;
    }

    const start = currentBatch * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, shuffledData.length);

    for (let i = start; i < end; i++) {
      const item = shuffledData[i];

      // 使用模板字符串构建 HTML
      templateContainer.innerHTML = `
                <a href="${item.link}" target="_blank" class="link-card">
                    <img class="avatar" src="/assets/images/lazy-loading.webp" data-vh-lz-src="${item.avatar}" alt="${item.name}" loading="lazy" />
                    <section class="link-info">
                        <span>${item.name}</span>
                        <p class="vh-ellipsis line-2">${item.descr}</p>
                    </section>
                </a>
            `;

      fragment.appendChild(templateContainer.firstElementChild!);
    }

    currentBatch++;
    renderTimer = requestAnimationFrame(renderBatch);
  };

  // 开始渲染
  renderBatch();
};

// 操作按钮管理
class FriendLinksButtonManager {
  private config: LinkButtonConfig;
  private initialized: boolean = false;

  constructor(apiUrl?: string) {
    this.config = {
      linksUrl: apiUrl || 'https://your-worker.your-subdomain.workers.dev',
      buttonText: '申请友链',
      buttonClass: 'vh-node vh-btn btn-success',
      containerId: 'link-button-container'
    };
  }
  private createButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = 'backup-links-btn';
    button.className = this.config.buttonClass;
    button.setAttribute('data-links-url', this.config.linksUrl);
    button.setAttribute('data-initialized', 'true');

    button.innerHTML = `
      <span class="text">${this.config.buttonText.replace('', '')}</span>
    `;

    button.addEventListener('click', this.handleButtonClick.bind(this));
    return button;
  }

  // 处理按钮点击事件
  private handleButtonClick(event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    const url = button.getAttribute('data-links-url');

    if (!url) {
      console.error('友链申请 URL 未配置');
      this.showButtonMessage(button, '配置错误', 'error');
      return;
    }

    // 检查是否已经显示表单
    const existingForm = document.getElementById('friend-links-form-container');
    if (existingForm) {
      // 如果表单已存在，则隐藏/显示切换
      if (existingForm.style.display === 'none') {
        existingForm.style.display = 'block';
        this.updateButtonText(button, '收起表单');
      } else {
        existingForm.style.display = 'none';
        this.updateButtonText(button, '申请友链');
      }
      return;
    }

    // 添加加载状态
    button.classList.add('loading');
    button.disabled = true;
    this.updateButtonText(button, '加载中...');

    // 延迟创建表单，显示加载效果
    window.setTimeout(() => {
      try {
        this.createEmbeddedForm(button, url);
        this.showButtonMessage(button, '加载成功', 'success');
      } catch (error) {
        console.error('加载友链申请表单失败:', error);
        this.showButtonMessage(button, '加载失败', 'error');
      }
    }, 500);
  }

  // 创建嵌入式表单
  private createEmbeddedForm(button: HTMLButtonElement, url: string): void {
    // 创建表单容器
    const formContainer = document.createElement('div');
    formContainer.id = 'friend-links-form-container';
    formContainer.className = 'friend-links-form-container';
    
    // 创建iframe
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.className = 'friend-links-form-iframe';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'auto');
    
    formContainer.appendChild(iframe);
    
    // 将表单插入到按钮容器后面
    const buttonContainer = button.parentElement;
    if (buttonContainer && buttonContainer.parentElement) {
      buttonContainer.parentElement.insertBefore(formContainer, buttonContainer.nextSibling);
    }
    
    // 更新按钮文本
    this.updateButtonText(button, '收起表单');
    
    // 移除加载状态
    button.classList.remove('loading');
    button.disabled = false;
  }

  // 更新按钮文本
  private updateButtonText(button: HTMLButtonElement, text: string): void {
    const textElement = button.querySelector('.text');
    if (textElement) {
      textElement.textContent = text.replace('', '');
    }
  }

  // 显示按钮状态消息
  private showButtonMessage(button: HTMLButtonElement, message: string, type: 'success' | 'error'): void {
    button.classList.remove('loading');
    button.classList.add(type);

    const originalText = button.querySelector('.text')?.textContent;
    const textElement = button.querySelector('.text');

    if (textElement) {
      textElement.textContent = message;
    }

    // 2秒后恢复原状
    window.setTimeout(() => {
      button.classList.remove(type);
      button.disabled = false;

      if (textElement && originalText) {
        textElement.textContent = originalText;
      }
    }, 2000);
  }

  // 初始化按钮
  public init(): void {
    if (this.initialized) return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
      return;
    }

    const container = document.getElementById(this.config.containerId);
    if (!container) return;

    const existingButton = document.getElementById('backup-links-btn');
    if (existingButton) return;

    try {
      // 样式已通过 LESS 文件引入
      const button = this.createButton();
      container.appendChild(button);

      this.initialized = true;
    } catch (error) {
      console.error('友链申请按钮初始化失败:', error);
    }
  }
}

// 创建全局实例，传入友链申请 URL
const friendLinksButtonManager = new FriendLinksButtonManager(SITE_INFO.Link_conf.submit_url);

// 导出初始化函数
export function initFriendLinksButton(): void {
  friendLinksButtonManager.init();
}

export default async () => {
  const { api, data } = SITE_INFO.Link_conf

  try {
    // 使用和 Friends.ts 相同的逻辑
    let res = api || data;
    
    if (typeof res === 'string') {
      res = await $GET(res)
    }
    
    // 确保结果是数组
    let result = Array.isArray(res) ? res : []

    // 每次获取数据后重新随机排序
    result = shuffleArray([...result])
    
    // 优化空数据提示逻辑
    if (result.length === 0) {
      const emptyMsg = api ? 'API未返回有效数据' : '静态数据为空'

      // 在页面显示提示信息
      const linksDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.links-main') as HTMLElement
      if (linksDOM) {
        const messageHTML = createWarningMessage(emptyMsg, '暂无友链数据');
        showMessage(linksDOM, messageHTML, true);
      }

      return
    }

    renderLinks(result)
  } catch (err: any) {
    console.error('[初始化错误]', err)
    const errorMap: { [key: string]: string } = {
      'Failed to fetch': '网络请求失败',
      'fetch failed': '网络请求失败'
    }    // 在页面显示错误信息
    const linksDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.links-main') as HTMLElement
    if (linksDOM) {
      const errorMessage = errorMap[err.message] || err.message;
      showMessage(linksDOM, createErrorMessage(
        `${errorMessage}，请检查网络连接或稍后重试`,
        '友链数据加载失败'
      ), true);
    }
  }
}
// 在模块加载时自动初始化友链申请按钮
if (typeof window !== 'undefined') {
  // 立即尝试初始化
  initFriendLinksButton();

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFriendLinksButton);
  }

  // Astro 页面加载事件
  document.addEventListener('astro:page-load', initFriendLinksButton);

  // 延迟初始化（确保所有元素都已加载）
  window.setTimeout(initFriendLinksButton, 100);
}