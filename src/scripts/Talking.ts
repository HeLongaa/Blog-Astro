// 页面组件
import vh from 'vh-plugin'
import { fmtDate } from '@/utils'
import { $GET } from '@/utils'
import vhLzImgInit from "@/scripts/vhLazyImg"
import SITE_INFO from "@/config"

const DATA_SOURCE = {
  // API 数据处理
  async api(url: string) {
    try {
      const data = await $GET(url)
      return Array.isArray(data) ? data : null
    } catch {
      return null
    }
  },
  // RSS 数据处理
  async rss(url: string) {
    try {
      const response = await fetch(url)
      const xml = await response.text()
      const doc = new DOMParser().parseFromString(xml, 'text/xml')
      return Array.from(doc.querySelectorAll('item')).map(item => {
        const pubDate = item.querySelector('pubDate')?.textContent || ''
        const description = item.querySelector('description')?.textContent || ''
        // 提取标签
        const div = document.createElement('div')
        div.innerHTML = description
        const tags = Array.from(div.querySelectorAll('span'))
          .filter(span => span.textContent?.startsWith('#'))
          .map(span => {
            const tag = span.textContent?.slice(1).trim()
            span.remove()
            return tag
          })
          .filter(Boolean)
        // 优化后的图片提取逻辑
        const imageUrls = new Set<string>([
          ...Array.from(item.querySelectorAll('enclosure'))
            .filter(enc => enc.getAttribute('type')?.startsWith('image/'))
            .map(enc => enc.getAttribute('url') || ''),
          ...Array.from(div.querySelectorAll('img'))
            .map(img => img.src || '')
        ].filter(Boolean))
        div.querySelectorAll('img').forEach(img => img.remove())
        return {
          date: new Date(pubDate).toISOString(),
          tags,
          content: `${div.innerHTML.replace(/<\/?span[^>]*>/g, '')}${
            imageUrls.size > 0 
              ? `<p class="vh-img-flex">${
                Array.from(imageUrls).map(img => `
                  <img 
                    data-vh-lz-src="${img}" 
                    alt="动态图片" 
                    loading="lazy"
                  >`).join('')
                }</p>` 
              : ''
          }`
        }
      })
    } catch {
      return null
    }
  },
  // 静态数据
  static(data: any) {
    return data
  }
}

const TalkingInit = async (config: typeof SITE_INFO.Talking_conf) => {
  const talkingDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.talking-main')
  if (!talkingDOM) return
  
  try {
    // 获取数据源
    let finalData = null
    switch (config.api_source) {
      case 'api':
        finalData = await DATA_SOURCE.api(config.api)
        break
      case 'memos_rss':
        finalData = await DATA_SOURCE.rss(config.cors_url +"?remoteUrl="+ config.memos_rss_url)
        break
      case 'static':
        finalData = DATA_SOURCE.static(config.data)
        break
      default:
        throw new Error('未知数据源类型')
    }

    if (!finalData || !finalData.length) {
      throw new Error('数据加载失败')
    }

    // 渲染内容
    talkingDOM.innerHTML = finalData
      // 过滤 Link 
      .filter((i: any) => !i.tags?.includes('Link'))
      // 新增置顶排序逻辑
      .sort((a: any, b: any) => {
        const aPinned = a.tags?.includes('置顶') ? 1 : 0
        const bPinned = b.tags?.includes('置顶') ? 1 : 0
        return bPinned - aPinned // 置顶内容排前
      })
      .map((i: any) => `
        <article>
          <header>
            <img data-vh-lz-src="https://img.helong.online/pictures/2025/05/20/682b7e5c110ae.png" />
            <p class="info">
              <span>HeLong</span>
              <time>${fmtDate(i.date)}前</time>
            </p>
          </header>
          <section class="main">${i.content}</section>
          <footer>${i.tags.map((tag: any) => `<span>${tag}</span>`).join('')}</footer>
        </article>
      `).join('')

    vhLzImgInit()
  } catch (error) {
    console.error('数据加载异常:', error)
    const talkingDOM = document.querySelector('.talking-main')
    if (talkingDOM) {
      talkingDOM.innerHTML = `
        <div class="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="#dc3545" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <p>数据加载失败，请稍后重试</p>
        </div>
      `
    }
    vh.Toast('数据加载失败')
  }
}

// 配置注入
export default () => TalkingInit(SITE_INFO.Talking_conf)