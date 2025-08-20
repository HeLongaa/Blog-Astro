// 统一的浮动按钮管理系统
import { inRouter, outRouter } from "@/utils/updateRouter";
import SITE_INFO from "@/config";

interface ButtonConfig {
    id: string;
    element: HTMLElement | null;
    isVisible: boolean;
    buttonType: string;
    checkVisibility: () => boolean;
    onClick: () => void;
    isInitialized: boolean;
    cleanup?: () => void;
}

// 全局变量
let scrollHandler: (() => void) | null = null;
let cleanupFunctions: (() => void)[] = [];

// 工具函数
const throttle = (func: Function, delay: number) => {
    let ticking = false;
    return (...args: any[]) => {
        if (!ticking) {
            requestAnimationFrame(() => {
                func(...args);
                ticking = false;
            });
            ticking = true;
        }
    };
};

const getScrollPercentage = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    return (window.scrollY / (scrollHeight - clientHeight)) * 100;
};

// 按钮配置工厂
const createButtonConfigs = (): ButtonConfig[] => [
    // 返回顶部按钮
    {
        id: 'vh-back-top',
        element: null,
        isVisible: false,
        buttonType: 'back-top',
        isInitialized: false,
        checkVisibility: () => getScrollPercentage() > 5,
        onClick: () => {
            (window as any).vhlenis && (window as any).vhlenis.stop();
            window.scrollTo({ top: 0, behavior: "smooth" });
            (window as any).vhlenis && (window as any).vhlenis.start();
        }
    },
    
    // 评论跳转按钮
    {
        id: 'vh-comment-jump-button',
        element: null,
        isVisible: false,
        buttonType: 'comment',
        isInitialized: false,
        checkVisibility: () => {
            const CommentARR: any = Object.keys(SITE_INFO.Comment);
            const CommentItem = CommentARR.find((i: keyof typeof SITE_INFO.Comment) => SITE_INFO.Comment[i].enable);
            if (!CommentItem) return false;

            const commentSection = document.querySelector(".vh-comment") || document.getElementById("comment-section");
            if (!commentSection) return false;

            // 检查评论组件加载状态 - 对初始加载更宽松
            const hasGiscus = commentSection.querySelector('.giscus');
            const hasArtalk = commentSection.querySelector('.artalk');
            const hasLoadingOnly = commentSection.querySelector('.vh-space-loading') && !hasGiscus && !hasArtalk;
            
            // 如果只有加载动画且页面刚加载不久，暂时不显示按钮
            // 但如果用户已经滚动过（说明页面已经稳定），则可以显示
            if (hasLoadingOnly) {
                const hasUserScrolled = window.pageYOffset > 50; // 用户滚动超过50px
                const pageLoadTime = performance.now();
                const isPageStable = pageLoadTime > 2000; // 页面加载超过2秒
                
                // 如果用户没有滚动且页面刚加载，等待评论加载
                if (!hasUserScrolled && !isPageStable) return false;
            }

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const commentRect = commentSection.getBoundingClientRect();
            const commentTop = commentRect.top + scrollTop;
            const windowHeight = window.innerHeight;

            return scrollTop + windowHeight < commentTop - 100;
        },
        onClick: () => {
            const commentSection = document.querySelector(".vh-comment") || document.getElementById("comment-section");
            if (!commentSection) return;

            const headerHeight = 66;
            const extraOffset = 20;
            const totalOffset = headerHeight + extraOffset;

            const commentRect = commentSection.getBoundingClientRect();
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetPosition = commentRect.top + currentScrollTop - totalOffset;

            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: "smooth",
            });
        }
    },
    
    // 友链列表跳转按钮
    {
        id: 'vh-links-jump-button',
        element: null,
        isVisible: false,
        buttonType: 'links',
        isInitialized: false,
        checkVisibility: () => {
            const linksListTarget = document.getElementById('friend-links-list');
            if (!linksListTarget) return false;

            const linksMain = document.querySelector('.links-main');
            if (!linksMain) return false;

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetRect = linksListTarget.getBoundingClientRect();
            const targetTop = targetRect.top + scrollTop;
            const windowHeight = window.innerHeight;

            return scrollTop + windowHeight < targetTop - 100;
        },
        onClick: () => {
            const target = document.getElementById('friend-links-list');
            if (target) {
                const header = document.querySelector('.vh-main-header') as HTMLElement;
                const headerHeight = header ? header.offsetHeight : 66;
                const rect = target.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const top = rect.top + scrollTop - headerHeight - 10;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
    },
    
    // 移动端目录按钮
    {
        id: 'vh-mobile-toc-button',
        element: null,
        isVisible: false,
        buttonType: 'toc',
        isInitialized: false,
        checkVisibility: () => {
            const isArticlePage = document.querySelector(".vh-article-main");
            const hasHeadings = document.querySelector("#toc-navigation .toc-list");
            const isSidebarTocEasilyAccessible = (window as any).isSidebarTocEasilyAccessible;
            
            if (typeof isSidebarTocEasilyAccessible !== 'function') return false;
            return !!(isArticlePage && hasHeadings && !isSidebarTocEasilyAccessible());
        },
        onClick: () => {
            const event = new CustomEvent('openMobileToc');
            document.dispatchEvent(event);

            const floatingButtons = FloatingButtonManager.getInstance();
            if (floatingButtons) {
                floatingButtons.hideButtonsForToc();
            }
        }
    }
];

// 按钮管理器
class FloatingButtonManager {
    private static instance: FloatingButtonManager | null = null;
    private buttons: ButtonConfig[] = [];
    private isGlobalInitialized: boolean = false; // 标记全局监听器是否已初始化

    constructor() {
        this.buttons = createButtonConfigs();
    }

    // 获取单例实例
    static getInstance(): FloatingButtonManager | null {
        return FloatingButtonManager.instance;
    }

    // 设置实例
    static setInstance(instance: FloatingButtonManager) {
        FloatingButtonManager.instance = instance;
    }

    // 初始化按钮
    init() {
        this.buttons.forEach(button => {
            button.element = document.getElementById(button.id);
            if (button.element) {
                this.initializeButton(button);
            }
        });

        if (!this.isGlobalInitialized) {
            this.setupEventListeners();
            this.isGlobalInitialized = true;
        }
    }

    // 初始化单个按钮
    private initializeButton(button: ButtonConfig) {
        if (!button.element) return;

        if (!button.isInitialized) {
            button.element.addEventListener('click', button.onClick);
            button.isInitialized = true;
        }

        // 设置初始状态
        button.element.classList.add('vh-completely-hidden');
        button.element.style.removeProperty('min-width');
        button.element.style.removeProperty('width');
        button.element.classList.remove('vh-show', 'vh-hide', 'vh-toc-hide', 'vh-visible');
        button.isVisible = false;

        this.syncButtonState(button);
        this.updateButtonVisibility(button);
    }

    // 设置事件监听器
    private setupEventListeners() {
        // 滚动事件监听
        scrollHandler = throttle(() => {
            this.buttons.forEach(button => {
                if (button.element) {
                    this.updateButtonVisibility(button);
                }
            });
        }, 16);
        window.addEventListener('scroll', scrollHandler);

        // 窗口大小变化监听
        const resizeHandler = throttle(() => this.handleWindowResize(), 100);
        window.addEventListener('resize', resizeHandler);
        cleanupFunctions.push(() => window.removeEventListener('resize', resizeHandler));

        // 评论组件变化监听
        this.observeCommentLoading();

        // 目录关闭事件监听
        const tocCloseHandler = () => this.showButtonsAfterToc();
        document.addEventListener('closeMobileToc', tocCloseHandler);
        cleanupFunctions.push(() => document.removeEventListener('closeMobileToc', tocCloseHandler));
    }

    // 监听评论组件变化
    private observeCommentLoading() {
        const commentSection = document.querySelector('.vh-comment');
        if (!commentSection) return;

        const observer = new MutationObserver((mutations) => {
            const hasSignificantChange = mutations.some(mutation => {
                if (mutation.type === 'childList') {
                    const addedNodes = Array.from(mutation.addedNodes);
                    return addedNodes.some(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as Element;
                            return element.classList.contains('giscus') || 
                                   element.querySelector('.giscus') ||
                                   element.classList.contains('artalk');
                        }
                        return false;
                    });
                }
                return false;
            });

            if (hasSignificantChange) {
                setTimeout(() => {
                    const commentButton = this.buttons.find(b => b.id === 'vh-comment-jump-button');
                    if (commentButton && commentButton.element) {
                        this.updateButtonVisibility(commentButton);
                    }
                }, 500);
            }
        });

        observer.observe(commentSection, { childList: true, subtree: true });
        cleanupFunctions.push(() => observer.disconnect());
    }

    // 更新按钮可见性
    private updateButtonVisibility(button: ButtonConfig) {
        if (!button.element) return;

        this.syncButtonState(button);
        const shouldShow = button.checkVisibility();

        if (shouldShow !== button.isVisible) {
            button.isVisible = shouldShow;
            if (shouldShow) {
                this.showButtonWithAnimation(button);
            } else {
                this.hideButtonWithAnimation(button);
            }
        }
    }

    // 同步按钮状态
    private syncButtonState(button: ButtonConfig) {
        if (!button.element) return;

        const computedStyle = window.getComputedStyle(button.element);
        const isActuallyVisible = computedStyle.display !== 'none' && 
                                 computedStyle.visibility !== 'hidden' &&
                                 computedStyle.opacity !== '0' &&
                                 !button.element.classList.contains('vh-completely-hidden');

        if (button.isVisible !== isActuallyVisible) {
            button.isVisible = isActuallyVisible;
        }
    }

    // 显示按钮动画
    private showButtonWithAnimation(button: ButtonConfig) {
        if (!button.element) return;

        button.element.classList.remove('vh-hide', 'vh-toc-hide', 'vh-completely-hidden');
        button.element.style.display = 'flex';
        button.element.removeAttribute('disabled');
        button.element.setAttribute('aria-hidden', 'false');

        requestAnimationFrame(() => {
            if (button.element) {
                button.element.classList.add('vh-show');
                setTimeout(() => {
                    if (button.element && button.element.classList.contains('vh-show')) {
                        button.element.classList.remove('vh-show');
                        button.element.classList.add('vh-visible');
                        ['display', 'opacity', 'transform', 'pointer-events', 'min-width', 'width']
                            .forEach(prop => button.element!.style.removeProperty(prop));
                    }
                }, 500);
            }
        });
    }

    // 隐藏按钮动画
    private hideButtonWithAnimation(button: ButtonConfig, isTocHiding = false) {
        if (!button.element) return;

        button.element.classList.remove('vh-show', 'vh-visible');
        const hideClass = isTocHiding ? 'vh-toc-hide' : 'vh-hide';
        
        button.element.classList.add(hideClass);
        button.element.setAttribute('disabled', 'true');
        button.element.setAttribute('aria-hidden', 'true');

        const animationDuration = isTocHiding ? 250 : 300;
        setTimeout(() => {
            if (button.element && button.element.classList.contains(hideClass)) {
                button.element.classList.remove(hideClass);
                if (!button.element.classList.contains('vh-visible') && !button.element.classList.contains('vh-show')) {
                    button.element.classList.add('vh-completely-hidden');
                }
            }
        }, animationDuration);
    }

    // 窗口大小变化处理
    private handleWindowResize() {
        setTimeout(() => {
            const mobileTocButton = this.buttons.find(b => b.id === 'vh-mobile-toc-button');
            if (mobileTocButton && mobileTocButton.element) {
                const shouldShow = mobileTocButton.checkVisibility();

                if (mobileTocButton.isVisible && !shouldShow) {
                    mobileTocButton.isVisible = false;
                    this.hideButtonWithAnimation(mobileTocButton);
                } else if (!mobileTocButton.isVisible && shouldShow) {
                    mobileTocButton.isVisible = true;
                    this.showButtonWithAnimation(mobileTocButton);
                }
            }

            this.buttons.forEach(button => {
                if (button.element && button.id !== 'vh-mobile-toc-button') {
                    this.updateButtonVisibility(button);
                }
            });
        }, 50);
    }

    // 目录打开时隐藏按钮
    hideButtonsForToc() {
        this.buttons.forEach(button => {
            if (button.element) {
                const computedStyle = window.getComputedStyle(button.element);
                const isActuallyVisible = computedStyle.display !== 'none' && 
                                         computedStyle.visibility !== 'hidden' &&
                                         computedStyle.opacity !== '0' &&
                                         !button.element.classList.contains('vh-completely-hidden');
                
                if (isActuallyVisible) {
                    button.isVisible = false;
                    this.hideButtonWithAnimation(button, true);
                } else if (button.isVisible && !isActuallyVisible) {
                    button.isVisible = false;
                }
            }
        });
    }

    // 目录关闭后恢复按钮
    showButtonsAfterToc() {
        setTimeout(() => {
            this.buttons.forEach(button => {
                if (button.element) {
                    button.element.style.removeProperty('z-index');
                    button.element.classList.remove('toc-opening');
                    
                    if (button.id === 'vh-comment-jump-button') {
                        this.restoreCommentButton(button);
                    } else {
                        this.updateButtonVisibility(button);
                    }
                }
            });
        }, 100);
    }

    // 恢复评论按钮（避免闪烁）
    private restoreCommentButton(button: ButtonConfig) {
        if (!button.element) return;

        const CommentARR: any = Object.keys(SITE_INFO.Comment);
        const CommentItem = CommentARR.find((i: keyof typeof SITE_INFO.Comment) => SITE_INFO.Comment[i].enable);
        if (!CommentItem) {
            if (button.isVisible) {
                button.isVisible = false;
                this.hideButtonWithAnimation(button);
            }
            return;
        }

        const commentSection = document.querySelector(".vh-comment") || document.getElementById("comment-section");
        if (!commentSection) {
            if (button.isVisible) {
                button.isVisible = false;
                this.hideButtonWithAnimation(button);
            }
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const commentRect = commentSection.getBoundingClientRect();
        const commentTop = commentRect.top + scrollTop;
        const windowHeight = window.innerHeight;
        const shouldShow = scrollTop + windowHeight < commentTop - 100;

        if (shouldShow !== button.isVisible) {
            button.isVisible = shouldShow;
            if (shouldShow) {
                this.showButtonWithAnimation(button);
            } else {
                this.hideButtonWithAnimation(button);
            }
        }
    }

    // 公共方法
    updateAllButtonsVisibility() {
        this.buttons.forEach(button => {
            if (button.element) {
                this.updateButtonVisibility(button);
            }
        });
    }

    // 更新特定按钮的可见性
    updateSpecificButtonVisibility(buttonId: string) {
        const button = this.buttons.find(b => b.id === buttonId);
        if (button && button.element) {
            this.updateButtonVisibility(button);
        }
    }

    cleanup() {
        if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
            scrollHandler = null;
        }

        this.buttons.forEach(button => {
            if (button.element) {
                button.element.removeEventListener('click', button.onClick);
            }
            if (button.cleanup) {
                button.cleanup();
            }
            button.isInitialized = false;
        });

        cleanupFunctions.forEach(cleanup => cleanup());
        cleanupFunctions = [];
        this.isGlobalInitialized = false;
    }
}

// 全局管理器实例
let buttonManager: FloatingButtonManager | null = null;

// 主初始化函数
export default () => {
    if (buttonManager) {
        buttonManager.cleanup();
    }

    buttonManager = new FloatingButtonManager();
    FloatingButtonManager.setInstance(buttonManager);

    // 初始化
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            buttonManager?.init();
            // DOM加载完成后立即检查评论按钮
            setTimeout(() => buttonManager?.updateSpecificButtonVisibility('vh-comment-jump-button'), 100);
        });
    } else {
        buttonManager.init();
        // 如果DOM已经加载完成，立即检查评论按钮
        setTimeout(() => buttonManager?.updateSpecificButtonVisibility('vh-comment-jump-button'), 100);
    }

    // 路由变化处理
    inRouter(() => {
        setTimeout(() => buttonManager?.init(), 100);
        // 增加多个检查点，确保评论按钮能正确显示
        setTimeout(() => buttonManager?.updateAllButtonsVisibility(), 1000);
        setTimeout(() => {
            // 专门检查评论按钮，防止初始加载时不显示
            buttonManager?.updateSpecificButtonVisibility('vh-comment-jump-button');
        }, 2500); // 给评论组件充分的加载时间
    });

    outRouter(() => {
        buttonManager?.cleanup();
    });
};

// 导出管理器和控制函数
export { buttonManager };
export const hideButtonsForToc = () => buttonManager?.hideButtonsForToc();
export const showButtonsAfterToc = () => buttonManager?.showButtonsAfterToc();
