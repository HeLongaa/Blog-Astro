import GithubProvider from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// 扩展Session类型，增加accessToken
interface CustomSession extends Session {
    accessToken?: string;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export const authOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
            // 添加必要的权限
            authorization: {
                params: {
                    scope: "read:user user:email repo",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }: { token: JWT; account: any }) {
            // 将 access token 添加到 token 对象，以便后续使用
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }: { session: CustomSession; token: JWT & { accessToken?: string } }) {
            // 将 access token 添加到 session 对象，以便在客户端使用
            session.accessToken = token.accessToken;
            return session;
        },
    },
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET,
};
