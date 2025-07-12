import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Octokit } from "octokit";
import { authOptions } from "@/lib/auth";

const repoOwner = process.env.REPO_OWNER || "HeLongaa";
const repoName = process.env.REPO_NAME || "Blog-Astro";

export async function POST(request: NextRequest) {
    try {
        // 获取会话信息
        const session = await getServerSession(authOptions);

        // 检查用户是否已认证
        if (!session) {
            console.log("Unauthorized: No session");
            return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
        }        // 打印session内容以调试
        console.log("Session data:", JSON.stringify({
            hasSession: !!session,
            hasAccessToken: !!(session as any).accessToken,
            sessionKeys: Object.keys(session),
        }, null, 2));

        // 解析请求体
        const body = await request.json();
        const { name, link, avatar, descr } = body;

        // 验证必填字段
        if (!name || !link) {
            return NextResponse.json({ error: "Name and link are required" }, { status: 400 });
        }

        // 获取授权令牌
        const accessToken = (session as any).accessToken || process.env.GITHUB_PAT;

        if (!accessToken) {
            console.error("Authentication error: No access token available");
            return NextResponse.json({ error: "Authentication failed - No access token" }, { status: 401 });
        }

        // 创建 Octokit 实例
        const octokit = new Octokit({
            auth: accessToken
        });

        // 创建友链 Issue
        const issueContent = JSON.stringify({ name, link, avatar, descr }, null, 2);

        const response = await octokit.rest.issues.create({
            owner: repoOwner,
            repo: repoName,
            title: `友链申请: ${name}`,
            body: issueContent,
            labels: ["Links"],
        }); return NextResponse.json({
            success: true,
            message: "Your link has been submitted!",
            issueUrl: response.data.html_url
        });
    } catch (error: any) {
        console.error("Error creating issue:", error);

        // 提供更详细的错误信息
        let errorMessage = "Failed to submit link";
        let statusCode = 500;

        if (error.status === 401) {
            errorMessage = "Authentication failed - Invalid or expired token";
            statusCode = 401;
        } else if (error.status === 403) {
            errorMessage = "Permission denied - Token doesn't have sufficient permissions";
            statusCode = 403;
        } else if (error.status === 404) {
            errorMessage = "Repository not found - Check REPO_OWNER and REPO_NAME";
            statusCode = 404;
        } else if (error.status === 422) {
            errorMessage = "Validation failed - Issue could not be created";
            statusCode = 422;
        }

        return NextResponse.json({
            error: errorMessage,
            details: error.message
        }, { status: statusCode });
    }
}
