
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

// 我们不再需要单独的图标加载函数，将使用现有的懒加载机制

const FriendsInit = async (data: any) => {
	const friendsDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.friends-main')
	if (!friendsDOM) return;
	try {
		let res = data;
		if (typeof data === 'string') {
			res = await $GET(api);
		}
		friendsDOM.innerHTML = res.map((i: any) => {
			// 从链接提取域名（如果有domain属性则使用，否则从link中提取）
			const domain = i.domain || extractDomain(i.link);
			// 默认占位图标路径 - 使用新的SVG占位图
			const defaultIcon = '/assets/images/website-icon-placeholder.svg';
			// 实际图标URL（将通过懒加载机制加载）
			const actualIconUrl = getActualIconUrl(domain, 64);
			
			// 使用与现有懒加载系统兼容的data-vh-lz-src属性
			// 添加onerror处理以确保图标加载失败时使用SVG占位图
			return `<article><a href="${i.link}" target="_blank" rel="noopener nofollow"><header><h2>${i.title}</h2></header><p class="vh-ellipsis line-2">${i.content}</p><footer><span><img src="${defaultIcon}" data-vh-lz-src="${actualIconUrl}" class="friend-icon" onerror="this.src='/assets/images/website-icon-placeholder.svg';" /><em class="vh-ellipsis">${i.author}</em></span><time>${formatDate(i.date)}</time></footer></a></article>`;
		}).join('');
		
		// 使用现有的图片懒加载机制
		vhLzImgInit();
		
		// 初始化专门用于朋友图标的懒加载
		initFriendsIconLazyLoad();
	} catch (error) {
		console.error('朋友动态加载失败:', error)
		const friendsDOM = document.querySelector('.friends-main') as HTMLElement
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