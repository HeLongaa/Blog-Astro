// 针对朋友图标的懒加载增强功能
import LazyLoad from "vanilla-lazyload";

// 专门用于朋友页面的图标懒加载
let friendsIconLazyLoader: any = null;

// 初始化朋友图标的懒加载
export const initFriendsIconLazyLoad = () => {
  // 销毁已有的实例（如果存在）
  if (friendsIconLazyLoader) {
    friendsIconLazyLoader.destroy();
  }
  
  // 创建新的懒加载实例，专门用于朋友图标
  friendsIconLazyLoader = new LazyLoad({
    elements_selector: ".friend-icon[data-vh-lz-src]", // 只针对朋友图标
    threshold: 100, // 提前100px触发加载
    data_src: "vh-lz-src", // 与主懒加载系统保持一致
    callback_error: (elt: HTMLElement) => {
      // 当图标加载失败时，使用网站默认图标
      console.log('图标加载失败，使用默认图标');
      if (elt instanceof HTMLImageElement) {
        // 保留SVG占位图而不是使用favicon
        if (!elt.src.endsWith('/assets/images/website-icon-placeholder.svg')) {
          elt.src = '/assets/images/website-icon-placeholder.svg';
        }
      }
      // 移除失败的data属性，防止反复重试
      elt.removeAttribute('data-vh-lz-src');
    },
    callback_loaded: (elt: HTMLElement) => {
      // 图标加载成功时
      console.log('图标加载成功');
      // 可以在这里添加一些效果，例如淡入显示
    }
  });
  
  // 返回实例以便可能的进一步控制
  return friendsIconLazyLoader;
};
