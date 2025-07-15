
// 滚动条高度变化事件======
const scrollChangeFn = () => {
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = window.innerHeight;
  const percentage = (window.scrollY / (scrollHeight - clientHeight)) * 100;
  // 显示隐藏
  backTop.classList[percentage <= 5 ? "remove" : "add"]("active"); // 滚动超过5%就显示
};

// 返回顶部事件
const backTopFn = () => {
  (window as any).vhlenis && (window as any).vhlenis.stop();
  window.scrollTo({ top: 0, behavior: "smooth" });
  (window as any).vhlenis && (window as any).vhlenis.start();
};

// 页面更新，初始化函数======
// 回顶部DOM
let backTop: any = document.querySelector(".vh-back-top");

//  初始化
export default () => {
  // 更新 回顶部DOM
  backTop = document.querySelector(".vh-back-top");

  if (!backTop) return;

  // 确保按钮在所有页面都可以显示
  backTop.style.display = "flex";

  // 移除并添加BackTop 事件======
  backTop.removeEventListener("click", backTopFn);
  backTop.addEventListener("click", backTopFn);
  // 移除并添加滚动事件======
  window.removeEventListener("scroll", scrollChangeFn);
  window.addEventListener("scroll", scrollChangeFn);
  // 初始检查滚动位置
  scrollChangeFn();
};
