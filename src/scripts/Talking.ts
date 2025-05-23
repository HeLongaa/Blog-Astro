// 页面组件
import vh from 'vh-plugin'
import { fmtDate } from '@/utils/index'
import { $GET } from '@/utils/index'
import vhLzImgInit from "@/scripts/vhLazyImg"
import TALKING_DATA from "@/page_data/Talking"

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

      // 图片提取逻辑
      const imageUrls = new Set<string>([
        // 处理enclosure图片
        ...Array.from(item.querySelectorAll('enclosure'))
          .filter(enc => enc.getAttribute('type')?.startsWith('image/'))
          .map(enc => enc.getAttribute('url') || ''),
        
        // 处理description中的图片
        ...Array.from(div.querySelectorAll('img'))
          .map(img => img.src || '')
      ].filter(Boolean))

      // 移除描述中已处理的图片
      div.querySelectorAll('img').forEach(img => img.remove())

      return {
        date: new Date(pubDate).toISOString(),
        tags,
        content: `${div.innerHTML.replace(/<\/?span[^>]*>/g, '')}
          ${imageUrls.size > 0 ? `<p class="vh-img-flex">${
            Array.from(imageUrls).map(img => `
              <img 
                data-vh-lz-src="${img}" 
                alt="动态图片" 
                loading="lazy"
              >`
            ).join('')
          }</p>` : ''}`
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

const TalkingInit = async (config: typeof TALKING_DATA) => {
  const talkingDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.talking-main')
  if (!talkingDOM) return

  try {
    // 获取数据源
    let finalData = null
    switch(config.api_source) {
      case 'api':
        finalData = await DATA_SOURCE.api(config.api)
        break
      case 'rss':
        finalData = await DATA_SOURCE.rss(config.rss_url)
        break
      case 'static':
        finalData = DATA_SOURCE.static(config.data)
        break
      default:
        throw new Error('未知数据源类型')
    }

    // 降级处理
    if (!finalData || !finalData.length) {
      throw new Error('数据源加载失败')
    }

    // 渲染内容
    talkingDOM.innerHTML = finalData.map((i: any) => `
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
    // vh.Toast('使用备用数据渲染')
    // talkingDOM.innerHTML = config.data.map((i: any) => /* 同上备用模板 */).join('')
  }
}

// 配置注入
export default () => TalkingInit(TALKING_DATA)