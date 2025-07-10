import vh from 'vh-plugin'
import { $GET } from '@/utils'
import vhLzImgInit from "@/scripts/vhLazyImg"

const strictKeys = ['name', 'link', 'avatar', 'descr'] as const

// 虚拟化列表的配置
const BATCH_SIZE = 20;  // 每批渲染的数量
let renderTimer: number | null = null;

// 缓存已加载的头像
const avatarCache = new Map<string, string>();

// 优化的 shuffleArray 函数，只在必要时执行
const shuffleArray = <T>(array: T[]): T[] => {
  if (!array.length) return array;
  const cached = sessionStorage.getItem('links-shuffle-order');
  if (cached) {
    const order = JSON.parse(cached);
    if (order.length === array.length) {
      return order.map((i: number) => array[i]);
    }
  }
  const indices = array.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  sessionStorage.setItem('links-shuffle-order', JSON.stringify(indices));
  return indices.map(i => array[i]);
}

// 优化的 HTML 解码
const decodeHTML = (() => {
  const decoder = document.createElement('textarea');
  return (html: string) => {
    decoder.innerHTML = html;
    return decoder.value;
  };
})();

const parseMemosRSSItem = (description: string) => {
  try {
    const decodedDesc = decodeHTML(description)
    const doc = new DOMParser().parseFromString(decodedDesc, 'text/html')
    const tempDiv = doc.body

    const linkTag = Array.from(tempDiv.querySelectorAll('*')).find(el =>
      el.textContent?.trim().toLowerCase() === '#link'
    )
    if (!linkTag) return null

    const fieldMap: Record<string, string> = {}
    Array.from(tempDiv.querySelectorAll('p')).forEach((p) => {
      const text = p.textContent?.trim().replace(/\s+/g, ' ') || ''
      const keyValueMatch = text.match(/^([^:\uFF1A]+)[:\uFF1A]\s*(.+)$/)
      if (!keyValueMatch) return

      const rawKey = keyValueMatch[1].trim().toLowerCase()
      let rawValue = keyValueMatch[2].trim()

      if (!strictKeys.includes(rawKey as any)) return

      const linkEl = p.querySelector('a')
      if (linkEl?.href) {
        rawValue = linkEl.href
      } else {
        rawValue = rawValue.replace(/^["'`]|["'`]$/g, '').replace(/,$/g, '')
      }

      fieldMap[rawKey] = rawValue
    })

    if (!fieldMap.name || !fieldMap.link) return null

    return {
      name: fieldMap.name,
      link: fieldMap.link,
      avatar: fieldMap.avatar || `${new URL(fieldMap.link).origin}/favicon.ico`,
      descr: fieldMap.descr || '[无描述内容]'
    }
  } catch (error) {
    console.error('解析异常:', error)
    return null
  }
}

const fetchMemosData = async (rssUrl: string) => {
  try {
    const response = await fetch(rssUrl)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const xmlText = await response.text()
    const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml")

    return Array.from(xmlDoc.querySelectorAll('item'))
      .map(item => parseMemosRSSItem(item.querySelector('description')?.innerHTML || ''))
      .filter(Boolean) as Array<{ name: string; link: string; avatar: string; descr: string }>
  } catch (error) {
    console.error('[获取数据失败]', error)
    throw error
  }
}

const renderLinks = (data: any[]) => {
  const linksDOM = document.querySelector('.main-inner-content > .vh-tools-main > main.links-main');
  if (!linksDOM) return;

  // 如果数据没有变化，直接返回
  const dataHash = JSON.stringify(data);
  const cachedHash = linksDOM.getAttribute('data-hash');
  if (dataHash === cachedHash) return;

  // 清理之前的定时器
  if (renderTimer) {
    cancelAnimationFrame(renderTimer);
    renderTimer = null;
  }

  // 准备渲染数据
  const shuffledData = shuffleArray(data);
  const totalBatches = Math.ceil(shuffledData.length / BATCH_SIZE);
  let currentBatch = 0;

  // 创建文档片段，避免直接操作 DOM
  const fragment = document.createDocumentFragment();
  const templateContainer = document.createElement('div');

  // 分批渲染函数
  const renderBatch = () => {
    if (currentBatch >= totalBatches) {
      // 全部渲染完成
      linksDOM.innerHTML = '';
      linksDOM.appendChild(fragment);
      linksDOM.setAttribute('data-hash', dataHash);
      vhLzImgInit();
      return;
    }

    const start = currentBatch * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, shuffledData.length);

    for (let i = start; i < end; i++) {
      const item = shuffledData[i];

      // 使用模板字符串构建 HTML
      templateContainer.innerHTML = `
                <a href="${item.link}" target="_blank" class="link-card" loading="lazy">
                    <img class="avatar" src="/assets/images/lazy-loading.webp" data-vh-lz-src="${item.avatar}" alt="${item.name}" loading="lazy" />
                    <section class="link-info">
                        <span>${item.name}</span>
                        <p class="vh-ellipsis line-2">${item.descr}</p>
                    </section>
                </a>
            `;

      fragment.appendChild(templateContainer.firstElementChild!);
    }

    currentBatch++;
    renderTimer = requestAnimationFrame(renderBatch);
  };

  // 开始渲染
  renderBatch();
};

import SITE_INFO from "@/config";
export default async () => {
  const { api_source, api, memos_rss_url, cors_url, data } = SITE_INFO.Link_conf

  try {
    let result: any[] = []

    switch (api_source) {
      case 'static':
        result = data || []
        break

      case 'memos_rss':
        if (!memos_rss_url || !cors_url) throw new Error('Memos配置不完整')
        const rssUrl = `${cors_url}?remoteUrl=${encodeURIComponent(memos_rss_url)}`
        result = await fetchMemosData(rssUrl)
        break

      case 'api':
        if (!api) throw new Error('API地址未配置')
        result = await $GET(api)
        break

      default:
        throw new Error('未知数据源类型')
    }

    // 每次获取数据后重新随机排序
    result = shuffleArray([...result])

    // 优化空数据提示逻辑
    if (result.length === 0) {
      const emptyMsg = {
        static: '静态数据为空',
        memos_rss: '未发现有效友链数据',
        api: 'API未返回有效数据'
      }[api_source]
      vh.Toast(emptyMsg)
      return
    }

    renderLinks(result)
  } catch (err: any) {
    console.error('[初始化错误]', err)
    const errorMap = {
      'Failed to fetch': '网络请求失败',
      'fetch failed': '网络请求失败'
    }
    vh.Toast(`数据加载失败: ${err.message}`)
  }
}