/**
 * 统一消息组件工具函数
 * 用于在JavaScript中生成统一样式的消息提示
 */

export interface MessageOptions {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    content: string;
    compact?: boolean;
    center?: boolean;
    closable?: boolean;
    icon?: boolean;
}

/**
 * 生成消息HTML
 * @param options 消息配置选项
 * @returns HTML字符串
 */
export function createMessage(options: MessageOptions): string {
    const {
        type = 'info',
        title,
        content,
        compact = false,
        center = false,
        closable = false,
        icon = true
    } = options;

    // 图标映射
    const icons = {
        info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
        success: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
        warning: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>',
        error: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
    };

    // 关闭按钮
    const closeButton = closable ? `
    <button class="vh-message-close" onclick="this.parentElement.remove()">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
  ` : '';

    // 图标部分
    const iconPart = icon ? `
    <div class="vh-message-icon">
      ${icons[type]}
    </div>
  ` : '';

    // 内容部分
    const contentPart = `
    <div class="vh-message-content">
      ${title ? `<div class="vh-message-title">${title}</div>` : ''}
      <p>${content}</p>
    </div>
  `;

    // 组装CSS类名
    const classes = [
        'vh-message',
        `vh-message-${type}`,
        compact ? 'vh-message-compact' : '',
        center ? 'vh-message-center' : '',
        !icon ? 'vh-message-no-icon' : ''
    ].filter(Boolean).join(' ');

    return `
    <div class="${classes}">
      ${iconPart}
      ${contentPart}
      ${closeButton}
    </div>
  `;
}

/**
 * 生成错误消息
 * @param content 错误内容
 * @param title 可选标题
 * @returns HTML字符串
 */
export function createErrorMessage(content: string, title?: string): string {
    return createMessage({
        type: 'error',
        title: title || '错误',
        content,
        center: true
    });
}

/**
 * 生成成功消息
 * @param content 成功内容
 * @param title 可选标题
 * @returns HTML字符串
 */
export function createSuccessMessage(content: string, title?: string): string {
    return createMessage({
        type: 'success',
        title: title || '成功',
        content,
        center: true
    });
}

/**
 * 生成警告消息
 * @param content 警告内容
 * @param title 可选标题
 * @returns HTML字符串
 */
export function createWarningMessage(content: string, title?: string): string {
    return createMessage({
        type: 'warning',
        title: title || '警告',
        content,
        center: true
    });
}

/**
 * 生成信息消息
 * @param content 信息内容
 * @param title 可选标题
 * @returns HTML字符串
 */
export function createInfoMessage(content: string, title?: string): string {
    return createMessage({
        type: 'info',
        title: title || '提示',
        content,
        center: true
    });
}

/**
 * 生成空状态消息
 * @param content 空状态描述
 * @param title 可选标题
 * @returns HTML字符串
 */
export function createEmptyMessage(content: string, title?: string): string {
    return createMessage({
        type: 'info',
        title: title || '暂无数据',
        content,
        center: true,
        compact: true
    });
}

/**
 * 在指定容器中显示消息
 * @param container 容器选择器或DOM元素
 * @param messageHtml 消息HTML
 * @param replace 是否替换容器内容（默认true）
 */
export function showMessage(
    container: string | HTMLElement,
    messageHtml: string,
    replace: boolean = true
): void {
    const element = typeof container === 'string'
        ? document.querySelector(container) as HTMLElement
        : container;

    if (!element) return;

    if (replace) {
        element.innerHTML = messageHtml;
    } else {
        element.insertAdjacentHTML('beforeend', messageHtml);
    }
}

// 默认导出常用函数
export default {
    createMessage,
    createErrorMessage,
    createSuccessMessage,
    createWarningMessage,
    createInfoMessage,
    createEmptyMessage,
    showMessage
};
