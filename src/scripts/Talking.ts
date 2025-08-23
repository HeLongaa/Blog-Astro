// 页面组件
import vh from 'vh-plugin'
import { fmtDate, formatDateTime } from '@/utils'
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

// 获取说说数据
const getTalkingData = async (config: typeof SITE_INFO.Talking_conf) => {
  try {
    // 优先使用API
    if (config.api) {
      const response = await $GET(config.api)
      const data = Array.isArray(response) ? response : (response?.data || [])
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('API返回数据格式错误')
      }
      
      // 处理数据
      return data.map(item => ({
        date: new Date(item.date).toISOString(),
        tags: item.tags || [],
        content: parseMarkdown(item.content || ''),
        img: item.img || null,
        is_top: item.is_top || item.tags?.includes('置顶') || false
      }))
    }
    
    // 回退到静态数据
    return config.data || []
  } catch (error) {
    console.error('获取说说数据失败:', error)
    // 返回静态数据作为备选
    return config.data || []
  }
}

const TalkingInit = async (config: typeof SITE_INFO.Talking_conf) => {
  const talkingDOM = document.querySelector('.main-inner-content>.vh-tools-main>main.talking-main')
  if (!talkingDOM) return

  try {
    // 获取数据
    const talkingData = await getTalkingData(config)
    
    if (!talkingData || talkingData.length === 0) {
      throw new Error('数据加载失败')
    }

    // 渲染内容
    talkingDOM.innerHTML = talkingData
      // 根据置顶状态排序
      .sort((a: any, b: any) => {
        return (b.is_top ? 1 : 0) - (a.is_top ? 1 : 0)
      })
      .map((item: any) => {
        // 构建图片HTML
        const imgHTML = item.img ? 
          `<div class="vh-img-grid single"><div class="vh-img-item"><img data-vh-lz-src="${item.img}" alt="说说配图" loading="lazy" /></div></div>` : '';
        
        // 构建标签HTML - 置顶标签显示红色
        const tagsHTML = (item.tags || []).map((tag: string) => 
          `<span class="${tag === '置顶' ? 'tag-top' : ''}">${tag}</span>`
        ).join('');
        
        return `
          <article>
            <header>
              <img data-vh-lz-src="https://avatars.githubusercontent.com/u/71657914?v=4" />
              <p class="info">
                <span>HeLong</span>
                <time>${formatDateTime(item.date)}</time>
              </p>
            </header>
            <section class="main">
              ${item.content}
              ${imgHTML}
            </section>
            <footer>${tagsHTML}</footer>
          </article>
        `;
      }).join('')
      
    // 添加置顶标签的样式
    const style = document.createElement('style')
    style.textContent = `
      .talking-main article footer span.tag-top {
        color: #fff !important;
        background-color: var(--vh-main-color) !important;
      }
    `
    document.head.appendChild(style)

    // 初始化图片懒加载
    vhLzImgInit()
  } catch (error) {
    console.error('数据加载异常:', error)
    const talkingDOM = document.querySelector('.talking-main') as HTMLElement
    if (talkingDOM) {
      showMessage(talkingDOM, createErrorMessage(
        '无法获取说说数据，请检查网络连接或稍后重试',
        '数据加载失败'
      ));
    }
  }
}

// 配置注入
export default () => TalkingInit(SITE_INFO.Talking_conf)
