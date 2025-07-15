
import { getCollection } from "astro:content";

// 格式化文章列表
const fmtArticleList = (articleList: any) => {
  // 按年份分类
  const groupedByYear = articleList.reduce((acc: any, item: any) => {
    const year = item.data.date.getFullYear();
    // 初始化
    !acc[year] && (acc[year] = []);
    acc[year].push(item.data);
    return acc;
  }, {});
  // 转换为目标格式
  return Object.keys(groupedByYear).map(year => ({ name: parseInt(year), data: groupedByYear[year] })).reverse();
}

// 获取分类下的文章列表
const getCategoriesList = async (categories: string) => {
  const posts = await getCollection("blog");
  const articleList = posts.filter((i: any) => i.data.categories == categories).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());;
  return fmtArticleList(articleList);
}

// 获取标签下的文章列表
const getTagsList = async (tags: string) => {
  const posts = await getCollection("blog");
  const articleList = posts.filter((i: any) => (i.data.tags || []).map((_i: any) => (String(_i))).includes(tags)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return fmtArticleList(articleList);
}

// 获取归档列表
const getArchiveList = async () => {
  const posts = await getCollection("blog");
  const articleList = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());;
  return fmtArticleList(articleList);
}

// 获取所有分类及其文章数量
const getAllCategories = async () => {
  const posts = await getCollection("blog");
  const categoriesMap = new Map();

  posts.forEach((post: any) => {
    const category = post.data.categories;
    if (category) {
      if (categoriesMap.has(category)) {
        categoriesMap.set(category, categoriesMap.get(category) + 1);
      } else {
        categoriesMap.set(category, 1);
      }
    }
  });

  return Array.from(categoriesMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export { getCategoriesList, getTagsList, getArchiveList, getAllCategories };