import { NextResponse } from "next/server";
import { Octokit } from "octokit";

const repoOwner = process.env.REPO_OWNER || "HeLongaa";
const repoName = process.env.REPO_NAME || "Blog-Astro";

export async function GET() {
    try {
        // 创建 Octokit 实例
        const octokit = new Octokit();

        // 尝试从仓库获取 Links.json 文件
        const response = await octokit.rest.repos.getContent({
            owner: repoOwner,
            repo: repoName,
            path: "Links.json",
        });

        // 检查响应
        if (!("content" in response.data)) {
            return NextResponse.json({ error: "Links.json not found" }, { status: 404 });
        }

        // 解码文件内容（Base64 格式）
        const content = Buffer.from(response.data.content, "base64").toString();
        const links = JSON.parse(content);

        // 返回 JSON 数据
        return NextResponse.json(links);
    } catch (error) {
        console.error("Error fetching Links.json:", error);
        return NextResponse.json({ error: "Failed to fetch links data" }, { status: 500 });
    }
}
