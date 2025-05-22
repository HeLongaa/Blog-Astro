
// Umami 统计
import SITE_INFO from "@/config";

export default async () => {
  const { Umami } = SITE_INFO;
  if (Umami.enable) {
    await LoadUmami(
      `${Umami.server}/script.js`,
      [
        // 🔥 关键点：将 defer 放在 attrs 数组的首位
        { k: "defer", v: true },
        { k: "data-website-id", v: Umami.siteId }
      ]
    );
  }
};

const LoadUmami = (
  src: string,
  attrs?: Array<{ k: string; v: string | boolean }>
): Promise<HTMLScriptElement> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    
    // 先处理自定义属性（确保顺序）
    if (attrs?.length) {
      attrs.forEach(({ k, v }) => {
        const value = typeof v === "boolean"
          ? (v ? "" : null)
          : String(v);
        if (value !== null) script.setAttribute(k, value);
      });
    }
    
    // 再设置 src（确保 src 是最后添加的属性）
    script.src = src;
    
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

