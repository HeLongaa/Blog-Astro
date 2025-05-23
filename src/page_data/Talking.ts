export default {
<<<<<<< Updated upstream
  // API 接口请求优先，数据格式保持和 data 一致
  api: 'https://ygjpjcpycxqy.ap-northeast-1.clawcloudrun.com/api/talks',
  // api: 'http://localhost:3000/api/talks',
  // api 为空则使用 data 静态数据 
  // 注意：图片请用 vh-img-flex 类包裹
=======
  // 数据源类型：api | rss | static
  api_source: "rss", 
  
  // 当api_source=api时生效
  // api: "https://ygjpjcpycxqy.ap-northeast-1.clawcloudrun.com/api/talks",
  api: "",
  
  // 当api_source=rss时生效，使用Memos的RSS订阅
  rss_url: "https://s.helong.online/u/HeLong/rss.xml",
  cors_url: "https://corsproxy.io/",
  // 当api_source=static时生效
>>>>>>> Stashed changes
  data: [
    {
      "date": "2025-05-08 19:36:16",
      "tags": [
        "Todo"
      ],
      "content": "."
    }
  ]
}