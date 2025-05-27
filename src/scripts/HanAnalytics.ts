
// Han Analytics 统计
import SITE_INFO from "@/config";
import { LoadScript } from "@/utils";

export default async () => {
  const { statistics } = SITE_INFO;
  statistics.HanAnalytics.enable && LoadScript(`${statistics.HanAnalytics.server}/tracker.min.js`, [{ k: "data-website-id", v: statistics.HanAnalytics.siteId }]);
}