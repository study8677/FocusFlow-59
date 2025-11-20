# 运行并部署你的 AI Studio 应用

<div align="center">
  <img width="1200" height="475" alt="AI Studio 应用横幅" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-abd2-6e31a0763ed6" />
</div>

只需几个命令，就能完成 AI Studio 应用的构建、运行与发布。

- **项目链接：** https://ai.studio/apps/drive/1IXpqurgqg01Yjk7KFfXCoyvEuCQGJmvA
- **运行要求：** 本地已安装 [Node.js](https://nodejs.org/)

## 项目简介

**FocusFlow** 是一款由 AI 驱动的番茄钟工具，通过交替的专注与休息时段、动感渐变背景和实时环形进度条帮助你保持节奏。它会记录每日专注次数，在阶段结束时播放提示音，并支持随时暂停、重置或跳过当前阶段。

内置 Gemini 提示会根据当前模式（专注/休息）推送激励语，设置面板可调整工作/休息时长、开启提示音、自动进入下一阶段。页脚还提供 Windows 桌面版下载占位包，方便桌面用户体验。

## 快速开始

按以下步骤在本地启动应用：

1. **安装依赖**
   ```bash
   npm install
   ```
2. **配置 API Key**
   将你的 Gemini Key 写入 `.env.local`：
   ```bash
   GEMINI_API_KEY=your_key_here
   ```
3. **启动开发服务器**
   ```bash
   npm run dev
   ```

当服务启动后，打开终端中提示的本地地址即可在浏览器中体验应用。

## 部署

应用支持部署到任意托管平台。先构建生产版本：
```bash
npm run build
```
随后按平台要求完成上线（如 Vercel、Netlify 或任意静态托管服务）。
