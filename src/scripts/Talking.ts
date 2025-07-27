// 页面组件
import vh from 'vh-plugin'
import { fmtDate } from '@/utils'
import { $GET } from '@/utils'
import vhLzImgInit from "@/scripts/vhLazyImg"
import SITE_INFO from "@/config"
import { createErrorMessage, showMessage } from '@/utils/message'

// 处理图片网格布局
const processImageGrid = (content: string): string => {
  // 匹配所有图片的正则表达式
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images: Array<{alt: string, url: string}> = [];
  let match;
  
  // 提取所有图片
  while ((match = imageRegex.exec(content)) !== null) {
    images.push({
      alt: match[1] || '',
      url: match[2]
    });
  }
  // 移除原始的图片 Markdown 语法
  let processedContent = content.replace(imageRegex, '');
  
  // 更彻底地清理图片移除后留下的多余空行
  processedContent = processedContent
    .replace(/\r\n/g, '\n')      // 统一换行符
    .replace(/\r/g, '\n')        // 统一换行符
    .replace(/\n{3,}/g, '\n\n')  // 将3个或更多连续换行符替换为2个
    .replace(/^\n+/, '')         // 移除开头的所有换行符
    .replace(/\n+$/, '')         // 移除结尾的所有换行符
    .trim();                     // 移除首尾空白字符
  
  // 如果有图片，在内容末尾添加图片网格
  if (images.length > 0) {
    if (images.length === 1) {
      // 单张图片
      processedContent += `<div class="vh-img-grid single"><div class="vh-img-item"><img data-vh-lz-src="${images[0].url}" alt="${images[0].alt}" loading="lazy" /></div></div>`;
    } else {
      // 多张图片
      const imageItems = images.map(img => 
        `<div class="vh-img-item"><img data-vh-lz-src="${img.url}" alt="${img.alt}" loading="lazy" /></div>`
      ).join('');
      processedContent += `<div class="vh-img-grid multiple">${imageItems}</div>`;
    }
  }
  return processedContent;
}

// 简单的 Markdown 解析函数
const parseMarkdown = (content: string): string => {
  // 先处理图片网格
  content = processImageGrid(content);
  
  // 标准化换行符
  content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // 按行处理
  const lines = content.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];
  let inMathBlock = false;
  let mathContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 处理数学公式块 $$
    if (line.trim() === '$$') {
      if (inMathBlock) {
        // 结束数学公式块
        result.push(`<div class="math-block">$$${mathContent.join('\n')}$$</div>`);
        inMathBlock = false;
        mathContent = [];
      } else {
        // 开始数学公式块
        inMathBlock = true;
      }
      continue;
    }
    
    if (inMathBlock) {
      mathContent.push(line);
      continue;
    }
    
    // 处理代码块
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // 结束代码块
        result.push(`<pre><code class="language-${codeBlockLang}">${codeBlockContent.join('\n')}</code></pre>`);
        inCodeBlock = false;
        codeBlockLang = '';
        codeBlockContent = [];
      } else {
        // 开始代码块
        inCodeBlock = true;
        codeBlockLang = line.substring(3).trim();
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }
    
    // 处理表格
    if (line.includes('|') && line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      
      // 跳过表格分隔行 |:---|:---:|---:|
      if (line.match(/^\|[\s:|-]+\|$/)) {
        continue;
      }
      
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      const isHeader = tableRows.length === 0;
      const tag = isHeader ? 'th' : 'td';
      const row = `<tr>${cells.map(cell => `<${tag}>${processInlineMarkdown(cell)}</${tag}>`).join('')}</tr>`;
      tableRows.push(row);
      continue;
    } else if (inTable) {
      // 结束表格
      result.push(`<table>${tableRows.join('')}</table>`);
      inTable = false;
      tableRows = [];
    }
    
    // 处理列表
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
    const taskMatch = line.match(/^(\s*)-\s+\[([ x])\]\s+(.+)$/);
    
    if (listMatch || taskMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      
      if (taskMatch) {
        const checked = taskMatch[2] === 'x';
        listItems.push(`<li class="${checked ? 'task-done' : 'task-todo'}">${checked ? '✅' : '☐'} ${processInlineMarkdown(taskMatch[3])}</li>`);
      } else if (listMatch) {
        listItems.push(`<li>${processInlineMarkdown(listMatch[3])}</li>`);
      }
      continue;
    } else if (inList) {
      // 结束列表
      result.push(`<ul>${listItems.join('')}</ul>`);
      inList = false;
      listItems = [];
    }
    
    // 处理其他元素
    let processedLine = line;
    
    // 标题
    if (processedLine.match(/^#{1,6}\s+/)) {
      const level = processedLine.match(/^#+/)?.[0].length || 1;
      const text = processedLine.replace(/^#+\s+/, '');
      processedLine = `<h${level}>${processInlineMarkdown(text)}</h${level}>`;
    }
    // 分割线
    else if (processedLine.match(/^---+$/)) {
      processedLine = '<hr>';
    }
    // 引用
    else if (processedLine.match(/^>\s*/)) {
      const text = processedLine.replace(/^>\s*/, '');
      processedLine = `<blockquote>${processInlineMarkdown(text)}</blockquote>`;
    }
    // 空行
    else if (processedLine.trim() === '') {
      processedLine = '<br>';
    }
    // 普通段落
    else {
      // 处理行内格式
      processedLine = processInlineMarkdown(processedLine);
      processedLine = `<p>${processedLine}</p>`;
    }
    
    result.push(processedLine);
  }
  
  // 结束未完成的块
  if (inList) {
    result.push(`<ul>${listItems.join('')}</ul>`);
  }
  if (inTable) {
    result.push(`<table>${tableRows.join('')}</table>`);
  }
  if (inMathBlock) {
    result.push(`<div class="math-block">$$${mathContent.join('\n')}$$</div>`);
  }
  
  return result.join('');
}

// 处理行内 Markdown 格式
const processInlineMarkdown = (text: string): string => {
  return text
    // 行内数学公式 $...$
    .replace(/\$([^$]+)\$/g, '<span class="math-inline">$$$1$$</span>')
    // 脚注
    .replace(/\[\^(\w+)\]/g, '<sup><a href="#fn$1">$1</a></sup>')
    // 链接 [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener nofollow">$1</a>')
    // 自动链接
    .replace(/<(https?:\/\/[^>]+)>/g, '<a href="$1" target="_blank" rel="noopener nofollow">$1</a>')
    // 加粗斜体 ***text***
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
    // 粗体 **text**
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // 斜体 *text*
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // 删除线 ~~text~~
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    // 行内代码 `code`
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

const DATA_SOURCE = {
  // API 数据处理
  async api(url: string) {
    try {
      const response = await $GET(url)
      // 处理包装在 data 字段中的数据
      const data = response.data || response;
      if (!Array.isArray(data)) return null;
      
      // 转换数据格式并解析 Markdown
      return data.map(item => ({
        date: new Date(item.date).toISOString(),
        tags: item.tags || [],
        content: parseMarkdown(item.content || '')
      }));
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
          content: `${div.innerHTML.replace(/<\/?span[^>]*>/g, '')}${imageUrls.size > 0
            ? `<p class="vh-img-flex">${Array.from(imageUrls).map(img => `
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
        finalData = await DATA_SOURCE.rss(config.cors_url + "?remoteUrl=" + config.memos_rss_url)
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
      .filter((i: any) => !i.tags?.includes('link'))
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
    const talkingDOM = document.querySelector('.talking-main') as HTMLElement
    if (talkingDOM) {
      showMessage(talkingDOM, createErrorMessage(
        '无法获取说说数据，请稍后重试或检查网络连接',
        '数据加载失败'
      ));
    }
  }
}

// 配置注入
export default () => TalkingInit(SITE_INFO.Talking_conf)
