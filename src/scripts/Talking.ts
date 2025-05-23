
import vh from 'vh-plugin'
import { fmtDate } from '@/utils/index'
import { $GET } from '@/utils/index'
// 图片懒加载
import vhLzImgInit from "@/scripts/vhLazyImg";

const TalkingInit = async (data: any) => {
  const talkingDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.talking-main')
  if (!talkingDOM) return;
  try {
<<<<<<< Updated upstream
    let res = data;
    if (typeof data === 'string') {
      res = await $GET(data);
=======
    // 获取数据源
    let finalData = null
    switch(config.api_source) {
      case 'api':
        finalData = await DATA_SOURCE.api(config.api)
        break
      case 'rss':
        const rss = config.cors_url + config.rss_url
        finalData = await DATA_SOURCE.rss(rss)
        break
      case 'static':
        finalData = DATA_SOURCE.static(config.data)
        break
      default:
        throw new Error('未知数据源类型')
>>>>>>> Stashed changes
    }
    talkingDOM.innerHTML = res.map((i: any) => `<article><header><img data-vh-lz-src="https://img.helong.online/pictures/2025/05/20/682b7e5c110ae.png" /><p class="info"><span>HeLong</span><time>${fmtDate(i.date)}前</time></p></header><section class="main">${i.content}</section><footer>${i.tags.map((tag: any) => `<span>${tag}</span>`).join('')}</footer></article>`).join('');
    // 图片懒加载
    vhLzImgInit();
  } catch {
    vh.Toast('Failed to obtain data.')
  }
}


// 动态说说初始化
import TALKING_DATA from "@/page_data/Talking";
const { api, data } = TALKING_DATA;
export default () => TalkingInit(api || data);