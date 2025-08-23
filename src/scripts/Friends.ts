
import vh from 'vh-plugin';
import { fmtDate, formatDate } from '@/utils'
import { $GET } from '@/utils'
// 图片懒加载
import vhLzImgInit from "@/scripts/vhLazyImg";
import { createErrorMessage, showMessage } from '@/utils/message'
// 导入网站图标工具
import { getWebsiteIconUrl, getActualIconUrl, extractDomain } from '@/utils/websiteIcon'
// 导入增强的图标懒加载
import { initFriendsIconLazyLoad } from '@/utils/friendsIconLazyLoad'

// 分页加载配置
const ITEMS_PER_PAGE = 10; // 每页显示的项目数
let currentPage = 1; // 当前页码
let allData: any[] = []; // 存储所有数据
let loading = false; // 是否正在加载中
let hasMoreData = true; // 是否还有更多数据

// 创建单个朋友项目的HTML
const createFriendItemHtml = (item: any) => {
    // 从链接提取域名（如果有domain属性则使用，否则从link中提取）
    const domain = item.domain || extractDomain(item.link);
    // 默认占位图标路径 - 使用新的SVG占位图
    const defaultIcon = '/assets/images/website-icon-placeholder.svg';
    // 实际图标URL（将通过懒加载机制加载）
    const actualIconUrl = getActualIconUrl(domain, 64);
    
    // 使用与现有懒加载系统兼容的data-vh-lz-src属性
    // 添加onerror处理以确保图标加载失败时使用SVG占位图
    return `<article><a href="${item.link}" target="_blank" rel="noopener nofollow"><header><h2>${item.title}</h2></header><p class="vh-ellipsis line-2">${item.content}</p><footer><span><img src="${defaultIcon}" data-vh-lz-src="${actualIconUrl}" class="friend-icon" onerror="this.src='/assets/images/website-icon-placeholder.svg';" /><em class="vh-ellipsis">${item.author}</em></span><time>${formatDate(item.date)}</time></footer></a></article>`;
};

// 创建加载提示元素
const createLoadingElement = () => {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'friends-loading';
    loadingElement.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    loadingElement.style.cssText = 'text-align:center;padding:20px;font-size:16px;color:#666;';
    return loadingElement;
};

// 加载更多数据的函数
const loadMoreItems = () => {
    if (loading || !hasMoreData) return;
    
    loading = true;
    
    // 计算本页要显示的数据范围
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, allData.length);
    
    if (startIndex >= allData.length) {
        hasMoreData = false;
        loading = false;
        return;
    }
    
    // 获取本页数据
    const pageData = allData.slice(startIndex, endIndex);
    
    // 创建本页的HTML内容
    const html = pageData.map(createFriendItemHtml).join('');
    
    // 获取主容器
    const friendsDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.friends-main') as HTMLElement;
    if (!friendsDOM) return;
    
    // 删除之前的加载提示（如果有）
    const oldLoading = document.querySelector('.friends-loading');
    if (oldLoading) {
        oldLoading.remove();
    }
    
    // 追加内容并设置动态效果
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html;
    
    // 当不是第一页时，为每个新卡片单独设置延迟，让它们有序出现
    if (currentPage > 1) {
        const baseDelay = 0.05; // 基础延迟时间
        let index = 0;
        
        while (tempContainer.firstChild) {
            const element = tempContainer.firstChild as HTMLElement;
            // 计算延迟，每个卡片增加一点延迟，但最大不超过0.5秒
            const delay = Math.min(baseDelay * index, 0.5);
            element.style.animationDelay = `${delay}s`;
            friendsDOM.appendChild(element);
            index++;
        }
    } else {
        // 第一页的卡片使用CSS中默认的阶梯式延迟
        while (tempContainer.firstChild) {
            friendsDOM.appendChild(tempContainer.firstChild);
        }
    }
    
    // 判断是否还有更多数据
    hasMoreData = endIndex < allData.length;
    
    // 如果还有更多数据，添加加载提示
    if (hasMoreData) {
        friendsDOM.appendChild(createLoadingElement());
    }
    
    // 增加页码
    currentPage++;
    
    // 初始化懒加载
    vhLzImgInit();
    initFriendsIconLazyLoad();
    
    loading = false;
};

// 监听滚动，触底加载更多
const setupScrollListener = () => {
    const checkScrollPosition = () => {
        // 触发加载的阈值（距离底部150px时就开始加载下一页）
        const threshold = 300;
        
        // 获取滚动容器
        const container = document.documentElement;
        
        // 计算距离底部的距离
        const distanceToBottom = container.scrollHeight - (container.scrollTop + window.innerHeight);
        
        // 如果接近底部，并且不在加载中，并且还有更多数据
        if (distanceToBottom < threshold && !loading && hasMoreData) {
            loadMoreItems();
        }
    };
    
    // 添加滚动事件监听
    window.addEventListener('scroll', checkScrollPosition);
    
    // 初始检查，确保页面不够长时也能触发加载
    setTimeout(checkScrollPosition, 100);
};

const FriendsInit = async (data: any) => {
    const friendsDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.friends-main');
    if (!friendsDOM) return;
    
    try {
        // 重置状态
        currentPage = 1;
        allData = [];
        loading = false;
        hasMoreData = true;
        
        // 清空容器
        friendsDOM.innerHTML = '';
        
        // 添加初始加载提示
        friendsDOM.appendChild(createLoadingElement());
        
        // 获取数据
        let res = data;
        if (typeof data === 'string') {
            res = await $GET(api);
        }
        
        // 存储所有数据
        allData = res;
        
        // 清空容器
        friendsDOM.innerHTML = '';
        
        // 加载第一页
        loadMoreItems();
        
        // 设置滚动监听
        setupScrollListener();
        
    } catch (error) {
        console.error('朋友动态加载失败:', error);
        const friendsDOM = document.querySelector('.friends-main') as HTMLElement;
        if (friendsDOM) {
            showMessage(friendsDOM, createErrorMessage(
                '无法获取最新动态，请确保https://blog-api.helong.online/n8n-file-data/可以正常访问',
                '朋友动态加载失败'
            ), true);
        }
    }
}

// 朋友圈 RSS 初始化
import SITE_INFO from "@/config";
const { api, data } = SITE_INFO.Friends_conf;
export default () => FriendsInit(api || data);