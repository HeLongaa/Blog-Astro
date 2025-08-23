
import vh from 'vh-plugin';
import { fmtDate, formatDate } from '@/utils'
import { $GET } from '@/utils'
// 图片懒加载
import vhLzImgInit from "@/scripts/vhLazyImg";
import { createErrorMessage, showMessage } from '@/utils/message'

const FriendsInit = async (data: any) => {
	const friendsDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.friends-main')
	if (!friendsDOM) return;
	try {
		let res = data;
		if (typeof data === 'string') {
			res = await $GET(api);
		}
		friendsDOM.innerHTML = res.map((i: any) => `<article><a href="${i.link}" target="_blank" rel="noopener nofollow"><header><h2>${i.title}</h2></header><p class="vh-ellipsis line-2">${i.content}</p><footer><span><img src="${get_auth_avatar}?url=${i.domain}&size=64" /><em class="vh-ellipsis">${i.author}</em></span><time>${formatDate(i.date)}</time></footer></a></article>`).join('');
		// 图片懒加载
		vhLzImgInit();
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
const { api, get_auth_avatar, data } = SITE_INFO.Friends_conf;
export default () => FriendsInit(api || data);