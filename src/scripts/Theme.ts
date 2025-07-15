// 主题切换功能
import { inRouter, outRouter } from "@/utils/updateRouter";

// 储存事件监听器引用，方便后续移除
let themeToggleHandler: ((e: Event) => void) | null = null;
let systemThemeHandler: ((e: MediaQueryListEvent) => void) | null = null;

// 清理事件监听器
const cleanup = () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    if (themeToggleHandler && themeToggle) {
        themeToggle.removeEventListener('click', themeToggleHandler);
        themeToggleHandler = null;
    }

    if (systemThemeHandler) {
        prefersDark.removeEventListener('change', systemThemeHandler);
        systemThemeHandler = null;
    }
};

const initTheme = () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // 从本地存储获取主题设置，如果没有则使用系统主题
    const getTheme = () => {
        const savedTheme = localStorage.getItem('vh-theme');
        if (!savedTheme) {
            // 首次访问，使用系统主题
            return prefersDark.matches ? 'dark' : 'light';
        }
        return savedTheme;
    };

    // 设置主题
    const setTheme = (theme: string) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('vh-theme', theme);

        // 更新 Giscus 评论的主题
        updateGiscusTheme(theme);

        // 更新按钮图标
        updateActiveState(theme);
    };

    // 更新 Giscus 评论的主题
    const updateGiscusTheme = (theme: string) => {
        try {
            const vhGiscusInstances = (window as any).vhGiscusInstances;
            if (vhGiscusInstances && Array.isArray(vhGiscusInstances)) {
                vhGiscusInstances.forEach((instance: any) => {
                    if (instance && typeof instance.updateTheme === 'function') {
                        instance.updateTheme(theme);
                    }
                });
            }
        } catch (error) {
            console.error('Error updating Giscus theme:', error);
        }
    };

    // 更新按钮图标状态
    const updateActiveState = (theme: string) => {
        // 隐藏所有图标
        document.querySelectorAll('.theme-icon').forEach(icon => {
            icon.classList.remove('active');
        });

        // 显示当前主题对应的图标
        const activeIcon = document.querySelector(`.${theme}-icon`);
        if (activeIcon) {
            activeIcon.classList.add('active');
        }
    };

    // 切换主题
    const toggleTheme = () => {
        const currentTheme = getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    // 初始化主题
    const currentTheme = getTheme();
    setTheme(currentTheme);

    // 先清理旧的事件监听器
    cleanup();

    // 监听系统主题变化（只在用户未手动设置时生效）
    systemThemeHandler = (e: MediaQueryListEvent) => {
        const savedTheme = localStorage.getItem('vh-theme');
        if (!savedTheme) {
            // 只有在用户未手动设置过主题时才跟随系统
            const systemTheme = e.matches ? 'dark' : 'light';
            setTheme(systemTheme);
        }
    };
    prefersDark.addEventListener('change', systemThemeHandler);

    // 监听按钮点击切换主题
    if (themeToggle) {
        themeToggleHandler = (e: Event) => {
            e.stopPropagation();
            toggleTheme();
        };
        themeToggle.addEventListener('click', themeToggleHandler);
    }
};

// 监听路由变化，重新初始化主题
outRouter(cleanup);
inRouter(initTheme);

// 确保在文档加载完成时也执行一次初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initTheme();
} else {
    document.addEventListener('DOMContentLoaded', initTheme);
}

export default initTheme;
