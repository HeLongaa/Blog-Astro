import { inRouter, outRouter } from "@/utils/updateRouter";
// Banner 打字效果
import TypeWriteInit from "@/scripts/TypeWrite";
// 泡泡🫧效果
import PaoPaoInit from "@/scripts/PaoPao";
// 初始化文章代码块
import codeInit from "@/scripts/Code";
// 初始化视频播放器
import videoInit from "@/scripts/Video";
// 初始化音乐播放器
import musicInit from "@/scripts/Music";
// 初始化 LivePhoto
import livePhotoInit from '@/scripts/LivePhoto'
// 初始化统一的浮动按钮组件
import FloatingButtonsInit from "@/scripts/FloatingButtons";
// 搜索
import { searchFn, vhSearchInit } from "@/scripts/Search";
// 图片懒加载
import vhLzImgInit from "@/scripts/vhLazyImg";
// 图片灯箱
import ViewImage from "@/scripts/ViewImage";
// 底部网站运行时间
import initWebSiteTime from "@/scripts/Footer";
// 友情链接初始化
import initLinks from "@/scripts/Links";
// 朋友圈 RSS 初始化
import initFriends from "@/scripts/Friends";
// 动态说说初始化
import initTalking from "@/scripts/Talking";
// 文章评论初始化
import { checkComment, commentInit } from "@/scripts/Comment";
// 移动端侧边栏初始化
import initMobileSidebar from "@/scripts/MobileSidebar";
import Umami from "@/scripts/Umami";
//  谷歌 SEO 推送
import SeoPushInit from "@/scripts/SeoPush";
// SmoothScroll 滚动优化
import SmoothScroll, { cleanupSmoothScroll } from "@/scripts/Smoothscroll";
// 主题切换
import initTheme from "@/scripts/Theme";

// ============================================================

// 页面初始化 Only
const videoList: any[] = [];
const MusicList: any[] = [];

const UmamiInit = () => {
  // Umami 统计 
  Umami();
};

const indexInit = async (only: boolean = true) => {
  // 初始化网站运行时间
  only && initWebSiteTime();
  // 初始化统一的浮动按钮组件
  only && FloatingButtonsInit();
  // SmoothScroll 滚动优化
  await SmoothScroll();
  // 图片灯箱
  only && ViewImage();
  // 初始化文章代码块
  codeInit();
  // 图片懒加载初始化
  vhLzImgInit();
  // 初始化 LivePhoto
  livePhotoInit();
  // 文章视频播放器初始化
  videoInit(videoList);
  // 文章音乐播放器初始化
  musicInit(MusicList);
  // 友情链接初始化
  initLinks();  // 朋友圈 RSS 初始化
  initFriends();  // 动态说说初始化
  initTalking();  // 谷歌 SEO 推送
  SeoPushInit();
  // 文章评论初始化
  checkComment() && commentInit(checkComment());
  // 打字效果
  only && TypeWriteInit();
  // 泡泡🫧效果
  PaoPaoInit();
  // 预加载搜索数据
  only && searchFn("");
  // 初始化搜索功能
  vhSearchInit();
  // 移动端侧边栏初始化
  initMobileSidebar();
  // 初始化主题 - 始终执行主题初始化，确保主题一致性
  initTheme();
};


export default () => {
  // 首次初始化
  indexInit();
  UmamiInit();
  // 进入页面时触发
  inRouter(() => indexInit(false));
  // 离开当前页面时触发  outRouter(() => {
  // 清理 SmoothScroll
  cleanupSmoothScroll();  // 销毁评论
  // 评论已改为 Giscus，无需特殊清理
  // 清理 Artalk 实例
  const vhArtalkInstances = (window as any).vhArtalkInstances;
  if (vhArtalkInstances && Array.isArray(vhArtalkInstances)) {
    vhArtalkInstances.forEach((instance: any) => {
      if (instance && typeof instance.destroy === 'function') {
        try {
          instance.destroy();
        } catch (e) {
          console.error('Error destroying Artalk instance:', e);
        }
      }
    });
    vhArtalkInstances.length = 0;
  }

  // 清理 Giscus 实例
  const vhGiscusInstances = (window as any).vhGiscusInstances;
  if (vhGiscusInstances && Array.isArray(vhGiscusInstances)) {
    vhGiscusInstances.forEach((instance: any) => {
      if (instance && instance.container) {
        try {
          // 移除 Giscus 容器
          instance.container.remove();
        } catch (e) {
          console.error('Error destroying Giscus instance:', e);
        }
      }
    });
    vhGiscusInstances.length = 0;
  }

  // 销毁播放器
  videoList.forEach((i: any) => i.destroy());
  videoList.length = 0;
  // 销毁音乐
  MusicList.forEach((i: any) => i.destroy());
  MusicList.length = 0;
}