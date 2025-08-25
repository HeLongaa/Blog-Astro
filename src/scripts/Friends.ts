
import vh from 'vh-plugin';
import { formatDate } from '@/utils'
import { $GET } from '@/utils'
import vhLzImgInit from "@/scripts/vhLazyImg";
import { createErrorMessage, showMessage } from '@/utils/message'
import { getActualIconUrl, extractDomain } from '@/utils/websiteIcon'
import { initFriendsIconLazyLoad } from '@/utils/friendsIconLazyLoad'

const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let allData: any[] = [];
let loading = false;
let hasMoreData = true;

const createFriendItemHtml = (item: any) => {
    const domain = item.domain || extractDomain(item.link);
    const defaultIcon = '/assets/images/website-icon-placeholder.svg';
    const actualIconUrl = getActualIconUrl(domain, 64);
    return `<article><a href="${item.link}" target="_blank" rel="noopener nofollow"><header><h2>${item.title}</h2></header><p class="vh-ellipsis line-2">${item.content}</p><footer><span><img src="${defaultIcon}" data-vh-lz-src="${actualIconUrl}" class="friend-icon" onerror="this.src='/assets/images/website-icon-placeholder.svg';" /><em class="vh-ellipsis">${item.author}</em></span><time>${formatDate(item.date)}</time></footer></a></article>`;
};

const createLoadingElement = () => {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'friends-loading';
    loadingElement.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    loadingElement.style.cssText = 'text-align:center;padding:20px;font-size:16px;color:#666;';
    return loadingElement;
};

const loadMoreItems = () => {
    if (loading || !hasMoreData) return;
    
    loading = true;
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, allData.length);
    
    if (startIndex >= allData.length) {
        hasMoreData = false;
        loading = false;
        return;
    }
    
    const pageData = allData.slice(startIndex, endIndex);
    const html = pageData.map(createFriendItemHtml).join('');
    
    const friendsDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.friends-main') as HTMLElement;
    if (!friendsDOM) return;
    
    const oldLoading = document.querySelector('.friends-loading');
    if (oldLoading) {
        oldLoading.remove();
    }
    
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html;
    
    if (currentPage > 1) {
        const baseDelay = 0.1;
        let index = 0;
        
        while (tempContainer.firstChild) {
            const element = tempContainer.firstChild as HTMLElement;
            const delay = Math.min(baseDelay * index, 0.5);
            element.style.animationDelay = `${delay}s`;
            friendsDOM.appendChild(element);
            index++;
        }
    } else {
        while (tempContainer.firstChild) {
            friendsDOM.appendChild(tempContainer.firstChild);
        }
    }
    
    hasMoreData = endIndex < allData.length;
    
    if (hasMoreData) {
        friendsDOM.appendChild(createLoadingElement());
    }
    
    currentPage++;
    
    vhLzImgInit();
    initFriendsIconLazyLoad();
    
    loading = false;
};

const setupScrollListener = () => {
    const checkScrollPosition = () => {
        const loadingElement = document.querySelector('.friends-loading');
        
        if (loadingElement && !loading && hasMoreData) {
            const rect = loadingElement.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                loadMoreItems();
            }
        }
    };
    
    window.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);
    setTimeout(checkScrollPosition, 100);
    
    const observer = new MutationObserver(() => {
        checkScrollPosition();
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
};

const FriendsInit = async (data: any) => {
    const friendsDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.friends-main');
    if (!friendsDOM) return;
    
    try {
        currentPage = 1;
        allData = [];
        loading = false;
        hasMoreData = true;
        
        friendsDOM.innerHTML = '';
        friendsDOM.appendChild(createLoadingElement());
        
        let res = data;
        if (typeof data === 'string') {
            res = await $GET(api);
        }
        
        allData = res;
        friendsDOM.innerHTML = '';
        loadMoreItems();
        
        setTimeout(() => {
            const friendsContainer = document.querySelector('.friends-main');
            if (friendsContainer && friendsContainer.scrollHeight <= window.innerHeight && hasMoreData) {
                loadMoreItems();
            }
        }, 300);
        
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

import SITE_INFO from "@/config";
const { api, data } = SITE_INFO.Friends_conf;
export default () => FriendsInit(api || data);