import { redirect } from "next/navigation";

export function GET() {
    // 重定向到 /api/json 端点
    redirect("/api/json");
}
