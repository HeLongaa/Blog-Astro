import vh from 'vh-plugin'
import { $GET } from '@/utils/index'
import vhLzImgInit from "@/scripts/vhLazyImg"

const strictKeys = ['name', 'link', 'avatar', 'descr'] as const

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const decodeHTML = (html: string) => {
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

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
  const linksDOM = document.querySelector('.main-inner-content > .vh-tools-main > main.links-main')
  if (!linksDOM) return

  const newHTML = data.map(i => `
    <a href="${i.link}" target="_blank">
      <img class="avatar" src="${i.avatar}" />
      <section class="link-info">
        <span>${i.name}</span>
        <p class="vh-ellipsis line-2">${i.descr}</p>
      </section>
    </a>
  `).join('')

  // 只有内容变化时才更新DOM
  if (linksDOM.innerHTML !== newHTML) {
    linksDOM.innerHTML = newHTML
    vhLzImgInit()
  }
}

import LINKS_DATA from "@/page_data/Link";
export default async () => {
  const { api_source, api, memos_rss_url, cors_url, data } = LINKS_DATA

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