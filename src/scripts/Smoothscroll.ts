/**
 * 不再使用平滑滚动，改为原生滚动行为
 */
export const cleanupSmoothScroll = (): void => {
  // 无需清理，因为不再使用平滑滚动
};

export default async (): Promise<void> => {
  // 使用原生滚动
  document.documentElement.style.scrollBehavior = 'auto';
};