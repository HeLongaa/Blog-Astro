// 统一的浮动按钮管理系统
import { inRouter, outRouter } from "@/utils/updateRouter";

// 按钮配置接口
interface ButtonConfig {
    id: string;
    element: HTMLElement | null;
    isVisible: boolean;
    activeClass: string;
    checkVisibility: () => boolean;
    onClick: () => void;
    cleanup?: () => void;
}

// 全局变量
let scrollHandler: (() => void) | null = null;
let cleanupFunctions: (() => void)[] = [];

// 节流函数
function throttle(func: Function, delay: number) {
    let ticking = false;
    return function (...args: any[]) {
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
        activeClass: 'active',
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
        activeClass: 'visible',
        checkVisibility: () => {
            const commentSection = document.querySelector(".vh-comment") ||
                document.getElementById("comment-section");
            if (!commentSection) return false;

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

// 移动端目录按钮配置
function createMobileTocConfig(): ButtonConfig {
    return {
        id: 'vh-mobile-toc-button',
        element: null,
        isVisible: false,
        activeClass: 'visible',
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

    constructor() {
        this.buttons = [
            createBackTopConfig(),
            createCommentJumpConfig(),
            createMobileTocConfig()
        ];
    }

    // 初始化所有按钮
    init() {
        this.buttons.forEach(button => {
            button.element = document.getElementById(button.id);
            if (button.element) {
                // 确保按钮可以显示
                button.element.style.display = "flex";

                // 绑定点击事件
                button.element.addEventListener('click', button.onClick);

                // 初始检查可见性
                this.updateButtonVisibility(button);
            }
        });

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
    }

    // 更新单个按钮的可见性
    private updateButtonVisibility(button: ButtonConfig) {
        if (!button.element) return;

        const shouldShow = button.checkVisibility();

        if (shouldShow !== button.isVisible) {
            button.isVisible = shouldShow;
            button.element.classList.toggle(button.activeClass, shouldShow);
        }
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
        });

        // 执行其他清理函数
        cleanupFunctions.forEach(cleanup => cleanup());
        cleanupFunctions = [];
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
        setTimeout(() => buttonManager?.init(), 100);
    });

    outRouter(() => {
        buttonManager?.cleanup();
    });
};

// 导出管理器以供其他模块使用
export { buttonManager };
