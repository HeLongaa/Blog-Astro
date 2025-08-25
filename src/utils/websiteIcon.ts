/**
 * 网站图标获取服务
 * 
 * 基于AsukaCC/webisteIcon项目的简化版本
 * 不依赖API请求，直接生成图标URL
 */

// 定义一个内置的可靠默认图标（数据URI）
// 自定义SVG图标，确保在任何情况下都能立即加载
const DEFAULT_ICON_DATA_URI = 'data:image/svg+xml;utf8,<svg t="1755922061281" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6397" width="200" height="200"><path d="M499.890087 912.695652c-221.317565 0-400.695652-179.400348-400.695652-400.695652s179.378087-400.695652 400.695652-400.695652c221.273043 0 400.695652 179.400348 400.695652 400.695652s-179.422609 400.695652-400.695652 400.695652z m0-89.043478c172.121043 0 311.652174-139.53113 311.652174-311.652174s-139.53113-311.652174-311.652174-311.652174-311.652174 139.53113-311.652174 311.652174 139.53113 311.652174 311.652174 311.652174z" fill="%232B2B2B" p-id="6398"></path><path d="M366.32487 422.956522m-44.52174 0a44.521739 44.521739 0 1 0 89.043479 0 44.521739 44.521739 0 1 0-89.043479 0Z" fill="%23D5AC86" p-id="6399"></path><path d="M113.441391 678.199652c3.895652 3.31687 10.395826 6.856348 19.433739 10.150957 21.815652 7.969391 54.093913 12.911304 94.096696 13.957565 86.216348 2.270609 199.613217-13.378783 317.106087-44.855652 117.49287-31.47687 223.49913-74.640696 297.049044-119.718957 34.125913-20.925217 59.592348-41.316174 74.50713-59.124869 6.188522-7.346087 10.061913-13.690435 11.776-18.498783 0.801391-2.31513 0.868174-3.005217 0.890435-2.960696-0.356174-1.224348-4.474435-5.12-16.11687-10.084174-17.318957-7.41287-43.319652-12.688696-76.132174-15.026086l6.322087-88.82087c93.540174 6.633739 156.560696 33.569391 171.920696 90.86887 29.918609 111.682783-172.454957 235.742609-447.176348 309.381565-274.69913 73.594435-512 67.33913-541.94087-44.343652-15.760696-58.88 27.959652-115.2 110.146783-169.115827l48.840348 74.462609c-29.228522 19.166609-50.710261 37.62087-63.042783 53.470609-4.964174 6.41113-8.013913 11.842783-9.305043 15.894261-0.534261 1.736348-0.601043 2.270609-0.623305 2.248348 0.022261 0 0.467478 0.623304 2.226087 2.114782z" fill="%232B2B2B" p-id="6400"></path></svg>';

// 从URL中提取域名
export const extractDomain = (url: string): string => {
  if (!url) return '';
  try {
    // 去除协议部分
    let domain = url.replace(/^(https?:\/\/)?(www\.)?/, '');
    // 取第一个斜杠前的部分
    domain = domain.split('/')[0];
    return domain;
  } catch (error) {
    console.error('提取域名失败:', error);
    return '';
  }
};

/**
 * 获取网站图标URL
 * 优先返回数据URI作为默认图标，然后异步加载远程图标
 * 这样可以确保页面不会因为图标加载问题而阻塞
 */
export const getWebsiteIconUrl = (url: string, size: number = 64): string => {
  // 始终返回内置的默认图标数据URI，确保立即加载
  return DEFAULT_ICON_DATA_URI;
};

/**
 * 获取实际网站图标URL
 * 这个函数返回实际的远程图标URL
 * 可以在页面加载完成后异步替换默认图标
 */
export const getActualIconUrl = (url: string, size: number = 64): string => {
  if (!url) return '/favicon.ico';
  
  try {
    const domain = extractDomain(url);
    if (!domain) return '/favicon.ico';
    
    // 使用多种服务提供图标，优先级递减，懒加载机制会处理加载和错误
    const services = [
      // 方案1：自定义 favicon 服务
      `https://api.jiangcheng.site/api/favicon?url=${domain}`,

      `https://favicons.fuzqing.workers.dev/api/getFavicon?url=${domain}&size=${size}`,
    ];
    
    // 返回首选服务
    return services[0];
  } catch (error) {
    console.error('获取图标URL失败:', error);
    return '/favicon.ico';
  }
};

/**
 * 获取备用网站图标URL
 * 当主URL失败时使用这个备用方案
 */
export const getFallbackIconUrl = (url: string): string => {
  if (!url) return '/favicon.ico';
  
  try {
    const domain = extractDomain(url);
    if (!domain) return '/favicon.ico';
    
    // 直接使用网站根目录的favicon.ico
    return `https://${domain}/favicon.ico`;
  } catch (error) {
    console.error('获取备用图标URL失败:', error);
    return '/favicon.ico';
  }
};
