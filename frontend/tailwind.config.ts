/**
 * Tailwind CSS 主题配置
 * 定义前端项目的字体、颜色和阴影扩展
 */
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"LXGW WenKai Screen"',
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', "Consolas", "monospace"],
      },
      colors: {
        parchment: "#f5f7f6",
        ink: "#17211f",
        soot: "#25312e",
        moss: "#1f7a5b",
        brass: "#b7791f",
        tomato: "#c2413a",
        mist: "#dfe7e3",
      },
      boxShadow: {
        line: "0 1px 0 rgba(23, 33, 31, 0.08)",
        panel: "0 20px 60px rgba(23, 33, 31, 0.10)",
      },
    },
  },
  plugins: [],
} satisfies Config;
