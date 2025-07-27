// 说说轮播组件脚本
import { fmtDate } from '@/utils';
import { $GET } from '@/utils';
import SITE_INFO from "@/config";
import { createErrorMessage, showMessage } from '@/utils/message';

interface TalkingItem {
    date: string;
    tags: string[];
    content: string;
}

// 数据源处理
const DATA_SOURCE = {
    // API 数据处理
    async api(url: string): Promise<TalkingItem[] | null> {
        try {
            const response = await $GET(url);
            // 处理包装在 data 字段中的数据
            const data = response.data || response;
            if (!Array.isArray(data)) return null;
            
            // 转换数据格式并解析 Markdown
            return data.map(item => ({
                date: new Date(item.date).toISOString(),
                tags: item.tags || [],
                content: this.parseMarkdown(item.content || '')
            }));
        } catch {
            return null;
        }
    },

    // 简单的 Markdown 解析函数
    parseMarkdown(content: string): string {
        return content
            // 处理换行符
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            // 处理图片 ![alt](url) - 轮播中显示为小图标+文件名
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
                const filename = alt || url.split('/').pop() || '图片';
                return `<span class="image-indicator">🖼️ ${filename}</span>`;
            })
            // 处理链接 [text](url)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener nofollow">$1</a>')
            // 处理粗体 **text**
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // 处理斜体 *text*
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            // 处理代码 `code`
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // 处理换行
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>')
    },

    // RSS 数据处理
    async rss(url: string): Promise<TalkingItem[] | null> {
        try {
            const response = await fetch(url);
            const xml = await response.text();
            const doc = new DOMParser().parseFromString(xml, 'text/xml');

            return Array.from(doc.querySelectorAll('item')).map(item => {
                const pubDate = item.querySelector('pubDate')?.textContent || '';
                const description = item.querySelector('description')?.textContent || '';

                // 提取标签
                const div = document.createElement('div');
                div.innerHTML = description;
                const tags = Array.from(div.querySelectorAll('span'))
                    .filter(span => span.textContent?.startsWith('#'))
                    .map(span => {
                        const tag = span.textContent?.slice(1).trim();
                        span.remove();
                        return tag;
                    })
                    .filter(Boolean) as string[];

                // 移除图片和其他元素，只保留文本内容
                div.querySelectorAll('img, .vh-img-flex').forEach(el => el.remove());

                return {
                    date: new Date(pubDate).toISOString(),
                    tags,
                    content: div.innerHTML.replace(/<\/?span[^>]*>/g, '').trim()
                };
            }).filter(item => item.content); // 过滤空内容
        } catch {
            return null;
        }
    },

    // 静态数据
    static(data: TalkingItem[]): TalkingItem[] {
        return data;
    }
};

class TalkingCarousel {
    private container: HTMLElement | null = null;
    private contentElement: HTMLElement | null = null;
    private prevBtn: HTMLButtonElement | null = null;
    private nextBtn: HTMLButtonElement | null = null;
    private indicators: HTMLElement | null = null;
    private data: TalkingItem[] = [];
    private currentIndex = 0;
    private autoPlayInterval: number | null = null;
    private readonly autoPlayDelay = 5000; // 5秒自动切换

    constructor() {
        this.init();
    }

    private async init() {
        this.container = document.querySelector('.talking-carousel-container');
        if (!this.container) return;

        this.contentElement = this.container.querySelector('.talking-carousel-content');
        this.prevBtn = this.container.querySelector('.carousel-prev');
        this.nextBtn = this.container.querySelector('.carousel-next');
        this.indicators = this.container.querySelector('.carousel-indicators');

        // 绑定事件
        this.bindEvents();

        // 加载数据
        await this.loadData();
    }

    private bindEvents() {
        this.prevBtn?.addEventListener('click', () => this.goToPrev());
        this.nextBtn?.addEventListener('click', () => this.goToNext());

        // 鼠标悬停暂停自动播放
        this.container?.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container?.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    private async loadData() {
        if (!this.contentElement) return;

        try {
            const config = SITE_INFO.Talking_conf;
            let finalData: TalkingItem[] | null = null;

            switch (config.api_source) {
                case 'api':
                    finalData = await DATA_SOURCE.api(config.api);
                    break;
                case 'memos_rss':
                    finalData = await DATA_SOURCE.rss(config.cors_url + "?remoteUrl=" + config.memos_rss_url);
                    break;
                case 'static':
                    finalData = DATA_SOURCE.static(config.data);
                    break;
                default:
                    throw new Error('未知数据源类型');
            }

            if (!finalData || !finalData.length) {
                throw new Error('数据加载失败');
            }

            // 过滤和排序数据
            this.data = finalData
                .filter(item => !item.tags?.includes('Link') && !item.tags?.includes('link'))
                .sort((a, b) => {
                    const aPinned = a.tags?.includes('置顶') ? 1 : 0;
                    const bPinned = b.tags?.includes('置顶') ? 1 : 0;
                    return bPinned - aPinned;
                })
                .slice(0, 5); // 只取前5条

            this.render();
            this.startAutoPlay();
        } catch (error) {
            console.error('说说轮播数据加载失败:', error);
            this.renderError();
        }
    }

    private render() {
        if (!this.contentElement || !this.indicators) return;

        // 渲染说说内容
        this.contentElement.innerHTML = this.data.map((item, index) => `
      <div class="talking-item ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="talking-content">${this.cleanContent(item.content)}</div>
        <div class="talking-meta">
          <span class="talking-date">${fmtDate(item.date)}前</span>
          <div class="talking-tags">
            ${item.tags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
        <div class="talking-action">
          <a href="/talking" class="view-more">查看更多 →</a>
        </div>
      </div>
    `).join('');

        // 渲染指示器
        this.indicators.innerHTML = this.data.map((_, index) =>
            `<div class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
        ).join('');

        // 绑定指示器事件
        this.indicators.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        this.updateControls();
    }

    private cleanContent(content: string): string {
        // 移除 Markdown 标题语法
        content = content
            // 移除标题语法 # ## ### 等
            .replace(/^#{1,6}\s+/gm, '')
            // 移除代码块
            .replace(/```[\s\S]*?```/g, '')
            // 移除行内代码
            .replace(/`([^`]+)`/g, '$1')
            // 移除图片语法，替换为简单图标
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, '🖼️')
            // 移除图片指示器HTML标签，替换为简单图标
            .replace(/<span class="image-indicator">🖼️\s*([^<]*)<\/span>/g, '🖼️')
            // 移除链接，保留文本
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // 移除粗体语法
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            // 移除斜体语法
            .replace(/\*([^*]+)\*/g, '$1')
            // 移除删除线语法
            .replace(/~~([^~]+)~~/g, '$1')
            // 移除分割线
            .replace(/^---+$/gm, '')
            // 移除引用语法
            .replace(/^>\s*/gm, '')
            // 移除列表语法
            .replace(/^[-*+]\s+/gm, '')
            .replace(/^\d+\.\s+/gm, '')
            // 移除任务列表语法
            .replace(/^-\s+\[([ x])\]\s+/gm, '')
            // 移除表格分隔符
            .replace(/\|/g, ' ')
            // 移除数学公式
            .replace(/\$\$[\s\S]*?\$\$/g, '')
            .replace(/\$([^$]+)\$/g, '$1')
            // 移除HTML标签
            .replace(/<[^>]*>/g, '')
            // 标准化换行符并转换为空格
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n+/g, ' ')
            // 移除多余空格
            .replace(/\s+/g, ' ')
            .trim();

        // 限制长度
        return content.length > 80 ? content.substring(0, 80) + '...' : content;
    }

    private renderError() {
        if (!this.contentElement) return;

        this.contentElement.innerHTML = `
      <div class="talking-item active">
        <div class="talking-content" style="text-align: center; color: var(--vh-font-56);">
          暂时无法加载动态内容
        </div>
        <div class="talking-action">
          <a href="/talking" class="view-more">访问动态页面 →</a>
        </div>
      </div>
    `;

        // 隐藏控制按钮
        if (this.indicators) this.indicators.style.display = 'none';
        if (this.prevBtn) this.prevBtn.style.display = 'none';
        if (this.nextBtn) this.nextBtn.style.display = 'none';
    }

    private goToPrev() {
        if (this.data.length <= 1) return;
        this.currentIndex = this.currentIndex === 0 ? this.data.length - 1 : this.currentIndex - 1;
        this.updateSlide();
    }

    private goToNext() {
        if (this.data.length <= 1) return;
        this.currentIndex = this.currentIndex === this.data.length - 1 ? 0 : this.currentIndex + 1;
        this.updateSlide();
    }

    private goToSlide(index: number) {
        if (index >= 0 && index < this.data.length) {
            this.currentIndex = index;
            this.updateSlide();
        }
    }

    private updateSlide() {
        if (!this.contentElement) return;

        // 更新说说项显示
        this.contentElement.querySelectorAll('.talking-item').forEach((item, index) => {
            item.classList.toggle('active', index === this.currentIndex);
        });

        // 更新指示器
        this.indicators?.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });

        this.updateControls();
    }

    private updateControls() {
        if (!this.prevBtn || !this.nextBtn) return;

        const hasMultiple = this.data.length > 1;
        this.prevBtn.disabled = !hasMultiple;
        this.nextBtn.disabled = !hasMultiple;
    }

    private startAutoPlay() {
        if (this.data.length <= 1) return;

        this.stopAutoPlay();
        this.autoPlayInterval = window.setInterval(() => {
            this.goToNext();
        }, this.autoPlayDelay);
    }

    private stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    public destroy() {
        this.stopAutoPlay();
    }
}

// 初始化函数
export const initTalkingCarousel = () => {
    // 检查是否存在说说轮播容器
    const carouselContainer = document.querySelector('.talking-carousel-container');
    if (carouselContainer) {
        new TalkingCarousel();
    }
};

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    const carousel = (window as any).talkingCarouselInstance;
    if (carousel && typeof carousel.destroy === 'function') {
        carousel.destroy();
    }
});

export default initTalkingCarousel;
