
import vh from 'vh-plugin'
import { fmtDate } from '@/utils/index'
import { $GET } from '@/utils/index'
// 图片懒加载
import vhLzImgInit from "@/scripts/vhLazyImg";

const TalkingInit = async (data: any) => {
  const talkingDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.talking-main')
  if (!talkingDOM) return;
  try {
    let res = data;
    if (typeof data === 'string') {
      res = await $GET(data);
    }
    talkingDOM.innerHTML = res.map((i: any) => `<article><header><img data-vh-lz-src="https://img.helong.online/2025/05/1f5c8d504bba5794b4d3d6ce6129fc66.png" /><p class="info"><span>HeLong</span><time>${fmtDate(i.date)}前</time></p></header><section class="main">${i.content}</section><footer>${i.tags.map((tag: any) => `<span>${tag}</span>`).join('')}</footer></article>`).join('');
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