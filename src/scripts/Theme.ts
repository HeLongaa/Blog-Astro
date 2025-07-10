// 主题切换功能
import { inRouter, outRouter } from "@/utils/updateRouter";

// 储存事件监听器引用，方便后续移除
let themeToggleHandler: ((e: Event) => void) | null = null;
let systemThemeHandler: ((e: MediaQueryListEvent) => void) | null = null;
let dropdownClickHandler: ((e: Event) => void) | null = null;
let documentClickHandler: ((e: Event) => void) | null = null;

// 清理事件监听器
const cleanup = () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeDropdown = document.querySelector('.theme-dropdown');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    if (themeToggleHandler && themeToggle) {
        themeToggle.removeEventListener('click', themeToggleHandler);
        themeToggleHandler = null;
    }

    if (dropdownClickHandler && themeDropdown) {
        themeDropdown.removeEventListener('click', dropdownClickHandler);
        dropdownClickHandler = null;
    }

    if (documentClickHandler) {
        document.removeEventListener('click', documentClickHandler);
        documentClickHandler = null;
    }

    if (systemThemeHandler) {
        prefersDark.removeEventListener('change', systemThemeHandler);
        systemThemeHandler = null;
    }
};

const initTheme = () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeDropdown = document.querySelector('.theme-dropdown');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // 从本地存储获取主题设置
    const getTheme = () => {
        const savedTheme = localStorage.getItem('vh-theme');
        if (!savedTheme || savedTheme === 'auto') {
            return prefersDark.matches ? 'dark' : 'light';
        }
        return savedTheme;
    };

    // 从本地存储获取主题模式
    const getThemeMode = () => {
        return localStorage.getItem('vh-theme') || 'auto';
    };

    // 设置主题
    const setTheme = (mode: string) => {
        // 实际应用的主题（light 或 dark）
        const effectiveTheme = mode === 'auto' ? (prefersDark.matches ? 'dark' : 'light') : mode;
        document.documentElement.setAttribute('data-theme', effectiveTheme);
        // 保存用户选择的模式（auto、light 或 dark）
        localStorage.setItem('vh-theme', mode);

        // 更新按钮和下拉菜单状态
        updateActiveState(mode);
    };



    // 更新激活状态
    const updateActiveState = (mode: string) => {
        // 更新下拉菜单选项状态
        document.querySelectorAll('.theme-option').forEach(option => {
            if (option instanceof HTMLElement) {
                const themeValue = option.dataset.theme;
                option.classList.toggle('active', themeValue === mode);
            }
        });

        // 更新主按钮图标
        document.querySelectorAll('.theme-icon').forEach(icon => {
            icon.classList.remove('active');
        });
        const activeIcon = document.querySelector(`.${mode}-icon`);
        if (activeIcon) {
            activeIcon.classList.add('active');
        }
    };

    // 切换下拉菜单显示状态
    const toggleDropdown = (show?: boolean) => {
        const dropdown = document.querySelector('.theme-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show', show !== undefined ? show : !dropdown.classList.contains('show'));
        }
    };

    // 初始化主题
    const currentMode = getThemeMode();
    setTheme(currentMode);

    // 先清理旧的事件监听器
    cleanup();

    // 监听系统主题变化
    systemThemeHandler = (e: MediaQueryListEvent) => {
        if (getThemeMode() === 'auto') {
            setTheme('auto');
        }
    };
    prefersDark.addEventListener('change', systemThemeHandler);

    // 监听按钮点击以显示下拉菜单
    if (themeToggle) {
        themeToggleHandler = (e: Event) => {
            e.stopPropagation();
            toggleDropdown();
        };
        themeToggle.addEventListener('click', themeToggleHandler);
    }

    // 监听下拉菜单选项点击
    if (themeDropdown) {
        dropdownClickHandler = (e: Event) => {
            const target = e.target as HTMLElement;
            const option = target.closest('.theme-option');
            if (option instanceof HTMLElement) {
                const mode = option.dataset.theme;
                if (mode) {
                    setTheme(mode);
                    toggleDropdown(false);
                }
            }
            e.stopPropagation();
        };
        themeDropdown.addEventListener('click', dropdownClickHandler);
    }

    // 点击其他地方关闭下拉菜单
    documentClickHandler = () => {
        toggleDropdown(false);
    };
    document.addEventListener('click', documentClickHandler);
};

// 监听路由变化，重新初始化主题
outRouter(cleanup);
inRouter(initTheme);

export default initTheme;
