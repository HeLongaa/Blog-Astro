export default {
  // 数据源类型：api | memos_rss | static
  api_source: "memos_rss",

  // 当api_source=api时生效
  // api: "https://ygjpjcpycxqy.ap-northeast-1.clawcloudrun.com/api/talks",
  api: "",

  // 当api_source=rss时生效，使用Memos的RSS订阅
  memos_rss_url: "https://s.helong.online/u/HeLong/rss.xml",
  cors_url: "https://cors.helong.online",
  // 当api_source=static时生效
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