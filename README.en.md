# Run and Deploy Your AI Studio App

<div align="center">
  <img width="1200" height="475" alt="AI Studio App banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-abd2-6e31a0763ed6" />
</div>

Build, run, and ship your AI Studio app with a few simple commands.

- **Project link:** https://ai.studio/apps/drive/1IXpqurgqg01Yjk7KFfXCoyvEuCQGJmvA
- **Prerequisite:** [Node.js](https://nodejs.org/) installed locally

## Project overview

**FocusFlow** is an AI-powered Pomodoro timer that keeps you on track with alternating focus and break sessions, ambient gradients, and a live circular progress indicator. It tracks daily session counts, plays completion chimes, and lets you pause, reset, or skip phases at any time.

An integrated Gemini prompt delivers motivational messages that adapt to your current phase (focus or break), while the settings panel lets you tune work/break durations, enable sounds, and auto-start the next session. A footer button also provides a downloadable desktop-friendly package placeholder for Windows users.

## Getting Started

Follow these steps to run the app on your machine:

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Set your API key**
   Add your Gemini key to `.env.local`:
   ```bash
   GEMINI_API_KEY=your_key_here
   ```
3. **Start the dev server**
   ```bash
   npm run dev
   ```

Once the server is running, open the provided local URL in your browser to interact with the app.

## Deployment

The app is ready to deploy to your preferred hosting provider. Build the production bundle with:
```bash
npm run build
```
Then follow your platform's deployment instructions (e.g., Vercel, Netlify, or a static hosting service).
