"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

interface FormData {
    name: string;
    link: string;
    avatar: string;
    descr: string;
}

export default function LinkForm() {
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState<FormData>({
        name: "",
        link: "",
        avatar: "",
        descr: "",
    });
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }; const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.link) {
            setMessage("Name and link are required!");
            return;
        }

        setIsSubmitting(true);

        try {
            console.log("Submitting form data:", formData);
            const response = await fetch("/api/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log("Response from server:", data);

            if (response.ok) {
                setMessage(`Success! Your link has been submitted. ${data.issueUrl ? `Check your issue at: ${data.issueUrl}` : ""}`);
                setFormData({
                    name: "",
                    link: "",
                    avatar: "",
                    descr: "",
                });
            } else {
                setMessage(`Error: ${data.error || "Failed to submit link"}`);
            }
        } catch (err) {
            setMessage("An error occurred while submitting your link.");
        } finally {
            setIsSubmitting(false);
        }
    }; return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                    <div className="p-10 w-full">
                        <div className="flex justify-between items-center mb-8">
                            <div className="text-2xl font-bold text-gray-900">提交友链</div>
                            {status === "authenticated" ? (
                                <button
                                    onClick={() => signOut()}
                                    className="text-sm text-red-500 hover:text-red-700"
                                >
                                    退出登录
                                </button>
                            ) : null}
                        </div>

                        {status === "loading" ? (
                            <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                                <p className="mt-2 text-gray-600">加载中...</p>
                            </div>
                        ) : status === "authenticated" ? (
                            <>                                <div className="mb-8 flex items-center p-4 bg-gray-50 rounded-lg">
                                <img
                                    src={session.user?.image || ""}
                                    alt={session.user?.name || "User"}
                                    className="h-12 w-12 rounded-full mr-4"
                                />
                                <div>
                                    <p className="text-gray-800 font-medium text-base">{session.user?.name}</p>
                                    <p className="text-gray-500 text-sm">{session.user?.email}</p>
                                </div>
                            </div><form onSubmit={handleSubmit} className="py-4">
                                    <div className="mb-6">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            网站名称 *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="mt-2 py-2 px-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                                            required
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                                            网站链接 *
                                        </label>
                                        <input
                                            type="url"
                                            id="link"
                                            name="link"
                                            value={formData.link}
                                            onChange={handleChange}
                                            className="mt-2 py-2 px-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                                            required
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
                                            头像链接
                                        </label>
                                        <input
                                            type="url"
                                            id="avatar"
                                            name="avatar"
                                            value={formData.avatar}
                                            onChange={handleChange}
                                            className="mt-2 py-2 px-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                                        />
                                    </div>

                                    <div className="mb-8">
                                        <label htmlFor="descr" className="block text-sm font-medium text-gray-700 mb-2">
                                            网站描述
                                        </label>
                                        <textarea
                                            id="descr"
                                            name="descr"
                                            value={formData.descr}
                                            onChange={handleChange}
                                            rows={4}
                                            className="mt-2 py-2 px-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                                        ></textarea>
                                    </div>                                    <div className="text-right">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            {isSubmitting ? "提交中..." : "提交友链"}
                                        </button>
                                    </div>
                                </form>

                                {message && (
                                    <div className={`mt-6 p-4 rounded-md ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                        {message}
                                    </div>
                                )}
                            </>
                        ) : (<div className="text-center py-10">
                            <h3 className="text-xl font-medium text-gray-900 mb-4">请使用 GitHub 账号登录</h3>
                            <p className="text-gray-600 mb-8">登录后可以提交您的友链申请</p>
                            <button
                                onClick={() => signIn("github")}
                                className="flex items-center justify-center mx-auto py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                                </svg>
                                使用 GitHub 登录
                            </button>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
