// 说说轮播组件脚本
import { fmtDate, formatDateTime } from '@/utils';
import { $GET } from '@/utils';
import SITE_INFO from "@/config";
import { createErrorMessage, showMessage } from '@/utils/message';

interface TalkingItem {
    date: string;
    tags: string[];
    content: string;
    img?: string | null;
    is_top?: boolean;
}

// 简单的 Markdown 解析函数
const parseMarkdown = (content: string): string => {
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
};

// 获取说说数据
const getTalkingData = async (): Promise<TalkingItem[] | null> => {
    try {
        const config = SITE_INFO.Talking_conf;
        
        // 优先使用API
        if (config.api) {
            const response = await $GET(config.api);
            const data = Array.isArray(response) ? response : (response?.data || []);
            
            if (!Array.isArray(data) || data.length === 0) {
                return null;
            }
            
            // 转换数据格式并解析 Markdown
            return data.map(item => ({
                date: new Date(item.date).toISOString(),
                tags: item.tags || [],
                content: parseMarkdown(item.content || ''),
                img: item.img || null,
                is_top: item.is_top || item.tags?.includes('置顶') || false
            }));
        }
        
        // 回退到静态数据
        return config.data.map(item => ({
            date: new Date(item.date).toISOString(),
            tags: item.tags || [],
            content: parseMarkdown(item.content || ''),
            img: item.img || null,
            is_top: item.is_top || item.tags?.includes('置顶') || false
        }));
    } catch {
        return null;
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
    private readonly autoPlayDelay = 3000;

    constructor() {
        this.initialize();
    }

    private initialize = async () => {
        // 先获取容器元素
        this.container = document.querySelector('.talking-carousel');
        
        if (!this.container) {
            console.error('找不到说说轮播容器元素');
            return;
        }
        
        // 获取DOM元素
        this.contentElement = this.container.querySelector('.talking-carousel-content');
        this.prevBtn = this.container.querySelector('.carousel-prev');
        this.nextBtn = this.container.querySelector('.carousel-next');
        this.indicators = this.container.querySelector('.carousel-indicators');

        // 添加置顶标签样式
        const style = document.createElement('style');
        style.textContent = `
            .talking-carousel .talking-tags .tag.tag-top {
                color: #fff;
                background-color: #ff4d4f;
            }
            .talking-carousel .image-indicator {
                display: inline-block;
                margin-top: 5px;
                color: #666;
                font-size: 0.9em;
            }
        `;
        document.head.appendChild(style);

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
            // 使用新的数据获取函数
            const finalData = await getTalkingData();

            if (!finalData || !finalData.length) {
                throw new Error('数据加载失败');
            }

            // 过滤和排序数据
            this.data = finalData
                .filter(item => !item.tags?.includes('Link') && !item.tags?.includes('link'))
                .sort((a, b) => {
                    // 优先使用is_top字段，其次检查置顶标签
                    const aPinned = a.is_top || a.tags?.includes('置顶') ? 1 : 0;
                    const bPinned = b.is_top || b.tags?.includes('置顶') ? 1 : 0;
                    
                    if (bPinned !== aPinned) {
                        return bPinned - aPinned; // 置顶内容排前
                    }
                    
                    // 次优先按日期排序
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                })
                .slice(0, 10);

            this.render();
            
            // 启动自动播放
            if (this.data.length > 1) {
                // console.log('启动轮播自动播放，间隔:', this.autoPlayDelay, 'ms');
                this.startAutoPlay();
            }
        } catch (error) {
            console.error('说说轮播数据加载失败:', error);
            this.renderError();
        }
    }

    private render() {
        if (!this.contentElement || !this.indicators) return;

        // 渲染说说内容
        this.contentElement.innerHTML = this.data.map((item, index) => {
            // 添加图片指示器，如果有图片但不显示
            const hasImage = item.img ? '<span class="image-indicator">🖼️ 图片</span>' : '';
            
            // 构建标签HTML - 置顶标签特殊样式
            const tagsHtml = item.tags.slice(0, 2).map(tag => 
                `<span class="tag ${tag === '置顶' ? 'tag-top' : ''}">${tag}</span>`
            ).join('');
            
            return `
      <div class="talking-item ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="talking-content">
            ${this.cleanContent(item.content)}
            ${hasImage}
        </div>
        <div class="talking-meta">
          <span class="talking-date">${formatDateTime(item.date)}</span>
          <div class="talking-tags">
            ${tagsHtml}
          </div>
        </div>
        <div class="talking-action">
          <a href="/talking" class="view-more">查看更多 →</a>
        </div>
      </div>
    `;
        }).join('');

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
        const carousel = new TalkingCarousel();
        // 保存实例到全局，方便后续管理
        (window as any).talkingCarouselInstance = carousel;
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
