/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // 使用 class 策略来控制暗色模式
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
