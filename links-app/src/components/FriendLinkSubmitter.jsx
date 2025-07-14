// FriendLinkSubmitter.jsx
// 用于提交友链的独立组件，支持亮色/暗色模式
import React, { useState } from 'react';

/**
 * 友链提交组件
 * @param {Object} props - 组件属性
 * @param {string} props.apiEndpoint - 提交API端点，默认为"/api/submit"
 * @param {string} props.repoOwner - 仓库所有者，可选
 * @param {string} props.repoName - 仓库名称，可选
 * @param {string} props.theme - 主题模式，"light"或"dark"，默认为"light"
 * @param {Object} props.labels - 自定义标签文本
 * @param {Function} props.onSuccess - 提交成功回调
 * @param {Function} props.onError - 提交失败回调
 */
const FriendLinkSubmitter = ({
    apiEndpoint = "/api/submit",
    repoOwner,
    repoName,
    theme = "light",
    labels = {
        title: "提交友链",
        name: "网站名称",
        link: "网站链接",
        avatar: "头像链接",
        description: "网站描述",
        submit: "提交友链",
        submitting: "提交中...",
        required: "必填项",
    },
    onSuccess,
    onError,
}) => {
    const [formData, setFormData] = useState({
        name: "",
        link: "",
        avatar: "",
        descr: "",
    });
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isDarkMode = theme === "dark";

    const themeClasses = {
        bg: isDarkMode ? "bg-gray-900" : "bg-gray-50",
        cardBg: isDarkMode ? "bg-gray-800" : "bg-white",
        textPrimary: isDarkMode ? "text-white" : "text-gray-900",
        textSecondary: isDarkMode ? "text-gray-300" : "text-gray-700",
        textMuted: isDarkMode ? "text-gray-400" : "text-gray-500",
        border: isDarkMode ? "border-gray-700" : "border-gray-300",
        inputBg: isDarkMode ? "bg-gray-700" : "bg-white",
        primaryButton: isDarkMode
            ? "bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-400"
            : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
        userInfoBg: isDarkMode ? "bg-gray-700" : "bg-gray-50",
        focusRing: isDarkMode ? "focus:ring-indigo-400" : "focus:ring-indigo-500",
        focusBorder: isDarkMode ? "focus:border-indigo-400" : "focus:border-indigo-500",
        successBg: isDarkMode ? "bg-green-900" : "bg-green-100",
        successText: isDarkMode ? "text-green-200" : "text-green-700",
        errorBg: isDarkMode ? "bg-red-900" : "bg-red-100",
        errorText: isDarkMode ? "text-red-200" : "text-red-700",
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.link) {
            setMessage(`错误: ${labels.name}和${labels.link}${labels.required}`);
            return;
        }

        setIsSubmitting(true);
        setMessage("");

        try {
            // 构建提交数据
            const submitData = {
                ...formData,
            };

            // 添加可选的仓库信息
            if (repoOwner) submitData.repoOwner = repoOwner;
            if (repoName) submitData.repoName = repoName;

            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`提交成功！${data.issueUrl ? `查看您的Issue: ${data.issueUrl}` : ""}`);
                setFormData({
                    name: "",
                    link: "",
                    avatar: "",
                    descr: "",
                });
                if (onSuccess) onSuccess(data);
            } else {
                setMessage(`错误: ${data.error || "提交失败"}`);
                if (onError) onError(data);
            }
        } catch (err) {
            console.error("提交过程中出错:", err);
            setMessage("提交过程中发生错误，请稍后重试。");
            if (onError) onError({ error: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // 内联样式字符串 - 用于在没有Tailwind CSS的项目中使用
    const styles = `
    /* 基本样式重置 */
    .fl-box *, .fl-box *:before, .fl-box *:after {
      box-sizing: border-box;
    }
    
    /* 表单容器 */
    .fl-container {
      min-height: 100%;
      padding: 3rem 1rem;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    /* 卡片样式 */
    .fl-card {
      max-width: 36rem;
      margin: 0 auto;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    /* 卡片内容 */
    .fl-content {
      padding: 2.5rem;
    }
    
    /* 标题区域 */
    .fl-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .fl-title {
      font-weight: 700;
      font-size: 1.5rem;
      line-height: 2rem;
    }
    
    /* 表单组 */
    .fl-form-group {
      margin-bottom: 1.5rem;
    }
    
    .fl-label {
      display: block;
      font-weight: 500;
      font-size: 0.875rem;
      line-height: 1.25rem;
      margin-bottom: 0.5rem;
    }
    
    .fl-input, .fl-textarea {
      display: block;
      width: 100%;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      border-width: 1px;
      font-size: 1rem;
      line-height: 1.5rem;
      transition: all 150ms ease-in-out;
    }
    
    .fl-input:focus, .fl-textarea:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    
    .fl-textarea {
      resize: vertical;
      min-height: 100px;
    }
    
    /* 按钮 */
    .fl-button {
      display: inline-flex;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-weight: 500;
      font-size: 1rem;
      line-height: 1.5rem;
      border: none;
      color: white;
      cursor: pointer;
      transition: all 150ms ease-in-out;
    }
    
    .fl-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
      /* 消息提示 */
    .fl-message {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: 0.375rem;
    }
    
    /* 统一消息组件样式 */
    .vh-message {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      margin: 1rem 0;
      border-radius: 0.5rem;
      border-left: 4px solid;
      font-size: 0.9rem;
      line-height: 1.5;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background-color: #fff;
      transition: all 0.2s ease-in-out;
    }
    
    .vh-message-icon {
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      margin-top: 0.125rem;
    }
    
    .vh-message-icon svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
    
    .vh-message-content {
      flex: 1;
      word-break: break-word;
    }
    
    .vh-message-content p {
      margin: 0;
      padding: 0;
    }
    
    .vh-message-success {
      border-left-color: #01C4B6;
      color: #01C4B6;
      background-color: rgba(1, 196, 182, 0.1);
    }
    
    .vh-message-error {
      border-left-color: #DE3C3D;
      color: #DE3C3D;
      background-color: rgba(222, 60, 61, 0.1);
    }
    
    /* 暗色模式下的消息样式 */
    .dark .vh-message {
      background-color: #1f2937;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .dark .vh-message-success {
      background-color: rgba(1, 196, 182, 0.15);
    }
    
    .dark .vh-message-error {
      background-color: rgba(222, 60, 61, 0.15);
    }
      padding: 1rem;
      border-radius: 0.375rem;
    }
    
    /* 响应式调整 */
    @media (min-width: 640px) {
      .fl-container {
        padding: 3rem 1.5rem;
      }
    }
    
    @media (min-width: 768px) {
      .fl-container {
        padding: 3rem 2rem;
      }
    }
  `;

    return (
        <div className={`fl-box ${themeClasses.bg} py-12 px-4 sm:px-6 lg:px-8`}>
            <style>{styles}</style>
            <div className={`fl-card max-w-xl mx-auto ${themeClasses.cardBg} rounded-xl shadow-md overflow-hidden`}>
                <div className={`fl-content p-10 w-full`}>
                    <div className={`fl-header flex justify-between items-center mb-8`}>
                        <div className={`fl-title ${themeClasses.textPrimary} text-2xl font-bold`}>
                            {labels.title}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="py-4">
                        <div className="fl-form-group mb-6">
                            <label htmlFor="name" className={`fl-label block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                                {labels.name} *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`fl-input mt-2 py-2 px-3 block w-full rounded-md ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.textPrimary} shadow-sm ${themeClasses.focusBorder} ${themeClasses.focusRing} text-base`}
                                required
                            />
                        </div>

                        <div className="fl-form-group mb-6">
                            <label htmlFor="link" className={`fl-label block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                                {labels.link} *
                            </label>
                            <input
                                type="url"
                                id="link"
                                name="link"
                                value={formData.link}
                                onChange={handleChange}
                                className={`fl-input mt-2 py-2 px-3 block w-full rounded-md ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.textPrimary} shadow-sm ${themeClasses.focusBorder} ${themeClasses.focusRing} text-base`}
                                required
                            />
                        </div>

                        <div className="fl-form-group mb-6">
                            <label htmlFor="avatar" className={`fl-label block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                                {labels.avatar}
                            </label>
                            <input
                                type="url"
                                id="avatar"
                                name="avatar"
                                value={formData.avatar}
                                onChange={handleChange}
                                className={`fl-input mt-2 py-2 px-3 block w-full rounded-md ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.textPrimary} shadow-sm ${themeClasses.focusBorder} ${themeClasses.focusRing} text-base`}
                            />
                        </div>

                        <div className="fl-form-group mb-8">
                            <label htmlFor="descr" className={`fl-label block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                                {labels.description}
                            </label>
                            <textarea
                                id="descr"
                                name="descr"
                                value={formData.descr}
                                onChange={handleChange}
                                rows={4}
                                className={`fl-textarea mt-2 py-2 px-3 block w-full rounded-md ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.textPrimary} shadow-sm ${themeClasses.focusBorder} ${themeClasses.focusRing} text-base`}
                            ></textarea>
                        </div>

                        <div className="text-right">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`fl-button inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white ${themeClasses.primaryButton} focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.focusRing} disabled:opacity-50`}
                            >
                                {isSubmitting ? labels.submitting : labels.submit}
                            </button>
                        </div>
                    </form>                    {message && (
                        <div className={`vh-message ${message.includes("错误") ? "vh-message-error" : "vh-message-success"} mt-6`}>
                            <div className="vh-message-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                    {message.includes("错误") ? (
                                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                    ) : (
                                        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    )}
                                </svg>
                            </div>
                            <div className="vh-message-content">
                                <p>{message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendLinkSubmitter;
