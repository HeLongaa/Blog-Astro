// 统一的浮动按钮
import { inRouter, outRouter } from "@/utils/updateRouter";
import SITE_INFO from "@/config";

// 按钮配置接口
interface ButtonConfig {
    id: string;
    element: HTMLElement | null;
    isVisible: boolean;
    buttonType: string; // 按钮类型，用于data-button-type属性
    checkVisibility: () => boolean;
    onClick: () => void;
    isInitialized: boolean; // 标记是否已经初始化过
    cleanup?: () => void;
}

// 全局变量
let scrollHandler: (() => void) | null = null;
let cleanupFunctions: (() => void)[] = [];

// 节流函数
function throttle(func: Function, delay: number) {
    let ticking = false;
    return function (this: any, ...args: any[]) {
        if (!ticking) {
            requestAnimationFrame(() => {
                func.apply(this, args);
                ticking = false;
            });
            ticking = true;
        }
    };
}

// 计算滚动百分比
function getScrollPercentage(): number {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    return (window.scrollY / (scrollHeight - clientHeight)) * 100;
}

// 回到顶部按钮配置
function createBackTopConfig(): ButtonConfig {
    return {
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
    };
}

// 评论跳转按钮配置
function createCommentJumpConfig(): ButtonConfig {
    return {
        id: 'vh-comment-jump-button',
        element: null,
        isVisible: false,
        buttonType: 'comment',
        isInitialized: false,
        checkVisibility: () => {
            const CommentARR: any = Object.keys(SITE_INFO.Comment);
            const CommentItem = CommentARR.find((i: keyof typeof SITE_INFO.Comment) => SITE_INFO.Comment[i].enable);
            if (!CommentItem) return false;

            const commentSection = document.querySelector(".vh-comment") ||
                document.getElementById("comment-section");
            if (!commentSection) return false;

            // 检查评论区域是否已经加载完成（不只是加载动画）
            const hasGiscus = commentSection.querySelector('.giscus');
            const hasLoadingOnly = commentSection.querySelector('.vh-space-loading') && !hasGiscus;

            // 如果只有加载动画，说明评论还在加载中，暂时不显示按钮
            if (hasLoadingOnly) return false;

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const commentRect = commentSection.getBoundingClientRect();
            const commentTop = commentRect.top + scrollTop;
            const windowHeight = window.innerHeight;

            return scrollTop + windowHeight < commentTop - 100;
        },
        onClick: () => {
            const commentSection = document.querySelector(".vh-comment") ||
                document.getElementById("comment-section");
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
    };
}

// 友链列表按钮配置
function createLinksJumpConfig(): ButtonConfig {
    return {
        id: 'vh-links-jump-button',
        element: null,
        isVisible: false,
        buttonType: 'links',
        isInitialized: false,
        checkVisibility: () => {
            // 检查是否有友链列表目标元素（更可靠的Links页面检测）
            const linksListTarget = document.getElementById('friend-links-list');
            if (!linksListTarget) return false;

            // 检查是否有友链主要内容区域
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
    };
}

// 移动端目录按钮配置
function createMobileTocConfig(): ButtonConfig {
    return {
        id: 'vh-mobile-toc-button',
        element: null,
        isVisible: false,
        buttonType: 'toc',
        isInitialized: false,
        checkVisibility: () => {
            const isArticlePage = document.querySelector(".vh-article-main");
            const hasHeadings = document.querySelector("#toc-navigation .toc-list");

            // 使用全局暴露的函数检查侧边栏目录是否容易访问
            const isSidebarTocEasilyAccessible = (window as any).isSidebarTocEasilyAccessible;
            if (typeof isSidebarTocEasilyAccessible !== 'function') {
                return false; // 如果函数不存在，默认不显示
            }

            return !!(isArticlePage && hasHeadings && !isSidebarTocEasilyAccessible());
        },
        onClick: () => {
            // 这里会调用移动端目录的打开逻辑
            const event = new CustomEvent('openMobileToc');
            document.dispatchEvent(event);
        }
    };
}

// 按钮管理器
class FloatingButtonManager {
    private buttons: ButtonConfig[] = [];
    private isGlobalInitialized: boolean = false; // 标记全局监听器是否已初始化

    constructor() {
        this.buttons = [
            createBackTopConfig(),
            createCommentJumpConfig(),
            createLinksJumpConfig(),
            createMobileTocConfig()
        ];
    }

    // 初始化所有按钮
    init() {
        this.buttons.forEach(button => {
            button.element = document.getElementById(button.id);
            if (button.element) {
                // 只在第一次初始化时绑定点击事件
                if (!button.isInitialized) {
                    button.element.addEventListener('click', button.onClick);
                    button.isInitialized = true;
                }

                // 设置初始状态 - 所有按钮默认隐藏
                button.element.style.display = 'none';
                button.element.style.opacity = '0';
                button.element.style.transform = 'translateX(100px)';
                // 清除任何可能存在的宽度内联样式
                button.element.style.removeProperty('min-width');
                button.element.style.removeProperty('width');
                button.element.classList.remove('vh-show', 'vh-hide', 'vh-toc-hide', 'vh-visible');
                button.isVisible = false;

                // 初始检查可见性（这会设置正确的display状态）
                this.updateButtonVisibility(button);
            }
        });

        // 只在第一次初始化时创建全局监听器
        if (!this.isGlobalInitialized) {
            // 创建节流的滚动处理函数
            scrollHandler = throttle(() => {
                this.buttons.forEach(button => {
                    if (button.element) {
                        this.updateButtonVisibility(button);
                    }
                });
            }, 16); // 约60fps

            // 添加滚动监听
            window.addEventListener('scroll', scrollHandler);

            // 添加窗口大小变化监听，用于响应式按钮显示
            const resizeHandler = throttle(() => {
                this.handleWindowResize();
            }, 100); // 100ms节流，避免频繁触发

            window.addEventListener('resize', resizeHandler);

            // 存储resize处理函数以便清理
            cleanupFunctions.push(() => {
                window.removeEventListener('resize', resizeHandler);
            });

            // 监听评论组件加载完成
            this.observeCommentLoading();

            this.isGlobalInitialized = true;
        }
    }

    // 监听评论组件加载完成
    private observeCommentLoading() {
        const commentSection = document.querySelector('.vh-comment');
        if (!commentSection) return;

        // 使用 MutationObserver 监听评论区域的变化
        const observer = new MutationObserver(() => {
            // 当评论区域内容发生变化时，重新检查按钮可见性
            this.buttons.forEach(button => {
                if (button.element && button.id === 'vh-comment-jump-button') {
                    this.updateButtonVisibility(button);
                }
            });
        });

        observer.observe(commentSection, {
            childList: true,
            subtree: true
        });

        // 存储observer以便清理
        cleanupFunctions.push(() => observer.disconnect());
    }

    // 更新单个按钮的可见性
    private updateButtonVisibility(button: ButtonConfig) {
        if (!button.element) return;

        const shouldShow = button.checkVisibility();

        if (shouldShow !== button.isVisible) {
            button.isVisible = shouldShow;

            if (shouldShow) {
                // 显示按钮动画
                this.showButtonWithAnimation(button);
            } else {
                // 隐藏按钮动画
                this.hideButtonWithAnimation(button);
            }
        }
    }

    // 带动画显示按钮
    private showButtonWithAnimation(button: ButtonConfig) {
        if (!button.element) return;

        // 清除可能存在的隐藏动画类
        button.element.classList.remove('vh-hide', 'vh-toc-hide');

        // 设置初始状态
        button.element.style.display = 'flex';
        button.element.removeAttribute('disabled');
        button.element.setAttribute('aria-hidden', 'false');

        // 使用 requestAnimationFrame 确保 DOM 更新后再开始动画
        requestAnimationFrame(() => {
            if (button.element) {
                // 添加显示动画类
                button.element.classList.add('vh-show');

                // 动画完成后清理动画类，并设置最终状态
                setTimeout(() => {
                    if (button.element && button.element.classList.contains('vh-show')) {
                        button.element.classList.remove('vh-show');
                        // 添加可见状态类，移除所有内联样式让CSS控制
                        button.element.classList.add('vh-visible');
                        button.element.style.removeProperty('display');
                        button.element.style.removeProperty('opacity');
                        button.element.style.removeProperty('transform');
                        button.element.style.removeProperty('pointer-events');
                        button.element.style.removeProperty('min-width');
                        button.element.style.removeProperty('width');
                    }
                }, 400); // 与CSS显示动画时长一致(400ms)
            }
        });
    }

    // 带动画隐藏按钮
    private hideButtonWithAnimation(button: ButtonConfig, isTocHiding = false) {
        if (!button.element) return;

        // 清除可能存在的显示动画类和可见状态类
        button.element.classList.remove('vh-show', 'vh-visible');

        // 选择隐藏动画类型
        const hideClass = isTocHiding ? 'vh-toc-hide' : 'vh-hide';

        // 添加隐藏动画类
        button.element.classList.add(hideClass);
        button.element.setAttribute('disabled', 'true');
        button.element.setAttribute('aria-hidden', 'true');

        // 动画完成后完全隐藏
        const animationDuration = isTocHiding ? 250 : 300;
        setTimeout(() => {
            if (button.element && button.element.classList.contains(hideClass)) {
                button.element.classList.remove(hideClass);
                button.element.style.display = 'none';
            }
        }, animationDuration);
    }

    // 处理窗口大小变化
    private handleWindowResize() {
        // 延迟一点时间，确保CSS媒体查询生效后再检查
        setTimeout(() => {
            // 特别处理移动端目录按钮，确保在桌面端正确隐藏
            const mobileTocButton = this.buttons.find(b => b.id === 'vh-mobile-toc-button');
            if (mobileTocButton && mobileTocButton.element) {
                const shouldShow = mobileTocButton.checkVisibility();

                // 如果按钮当前可见但应该隐藏（比如窗口变大到桌面端）
                if (mobileTocButton.isVisible && !shouldShow) {
                    mobileTocButton.isVisible = false;
                    this.hideButtonWithAnimation(mobileTocButton);
                }
                // 如果按钮当前隐藏但应该显示（比如窗口变小到移动端）
                else if (!mobileTocButton.isVisible && shouldShow) {
                    mobileTocButton.isVisible = true;
                    this.showButtonWithAnimation(mobileTocButton);
                }
            }

            // 处理其他按钮
            this.buttons.forEach(button => {
                if (button.element && button.id !== 'vh-mobile-toc-button') {
                    this.updateButtonVisibility(button);
                }
            });
        }, 50); // 50ms延迟，确保CSS媒体查询生效
    }

    // 目录打开时隐藏其他按钮
    hideButtonsForToc() {
        this.buttons.forEach(button => {
            if (button.element && button.id !== 'vh-mobile-toc-button' && button.isVisible) {
                this.hideButtonWithAnimation(button, true); // 使用特殊的目录隐藏动画
            }
        });
    }

    // 目录关闭时恢复按钮显示
    showButtonsAfterToc() {
        this.buttons.forEach(button => {
            if (button.element && button.id !== 'vh-mobile-toc-button') {
                // 重新检查按钮是否应该显示
                this.updateButtonVisibility(button);
            }
        });
    }

    // 公共方法：更新所有按钮的可见性
    updateAllButtonsVisibility() {
        this.buttons.forEach(button => {
            if (button.element) {
                this.updateButtonVisibility(button);
            }
        });
    }

    // 清理所有按钮
    cleanup() {
        // 移除滚动监听
        if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
            scrollHandler = null;
        }

        // 清理按钮事件
        this.buttons.forEach(button => {
            if (button.element) {
                button.element.removeEventListener('click', button.onClick);
            }
            if (button.cleanup) {
                button.cleanup();
            }
            // 重置初始化标志
            button.isInitialized = false;
        });

        // 执行其他清理函数
        cleanupFunctions.forEach(cleanup => cleanup());
        cleanupFunctions = [];

        // 重置全局初始化标志
        this.isGlobalInitialized = false;
    }
}

// 全局管理器实例
let buttonManager: FloatingButtonManager | null = null;

// 导出的初始化函数
export default () => {
    // 清理之前的实例
    if (buttonManager) {
        buttonManager.cleanup();
    }

    // 创建新的管理器实例
    buttonManager = new FloatingButtonManager();

    // 页面加载完成后初始化
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => buttonManager?.init());
    } else {
        buttonManager.init();
    }

    // 路由变化时重新初始化
    inRouter(() => {
        // 初始化按钮
        setTimeout(() => buttonManager?.init(), 100);
        // 额外延迟检查，确保评论组件完全加载（只更新可见性，不重新初始化）
        setTimeout(() => {
            buttonManager?.updateAllButtonsVisibility();
        }, 1000);
    });

    outRouter(() => {
        buttonManager?.cleanup();
    });
};

// 导出管理器以供其他模块使用
export { buttonManager };

// 导出目录相关的控制函数，供目录组件使用
export const hideButtonsForToc = () => buttonManager?.hideButtonsForToc();
export const showButtonsAfterToc = () => buttonManager?.showButtonsAfterToc();
