import { GoogleGenAI, Type } from "@google/genai";
import { TimerMode, AIResponse } from '../types';

const WORK_QUOTES = [
  "专注当下，成就未来。",
  "业精于勤，荒于嬉。",
  "知之者不如好之者，好之者不如乐之者。",
  "最困难的时候，就是距离成功最近的时候。",
  "与其临渊羡鱼，不如退而结网。",
  "种一棵树最好的时间是十年前，其次是现在。",
  "不要等待机会，而要创造机会。",
  "唯有坚持，才能看到希望。",
  "流水不争先，争的是滔滔不绝。",
  "凡是过往，皆为序章。专注此刻。",
  "效率是做好工作的灵魂。",
  "耐得住寂寞，才守得住繁华。"
];

const BREAK_QUOTES = [
  "休息是为了走更远的路。",
  "站起来活动一下，身体是革命的本钱！",
  "喝杯水，深呼吸，放松一下紧绷的神经。",
  "眺望远方，保护视力。",
  "简单的伸展运动能让你充满活力。",
  "给大脑充个电，为了更高效的下一个番茄钟。",
  "去窗边看看风景吧。",
  "颈椎累了吗？活动一下脖子吧。",
  "哪怕只是站立一分钟，也对身体有益。",
  "闭上眼睛，听一首喜欢的歌。"
];

const getRandomQuote = (mode: TimerMode): AIResponse => {
  const list = mode === TimerMode.WORK ? WORK_QUOTES : BREAK_QUOTES;
  const message = list[Math.floor(Math.random() * list.length)];
  return { message };
};

const getClient = () => {
    const apiKey = process.env.API_KEY;
    // Gracefully handle missing key without warning logs visible to user
    if (!apiKey) {
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const fetchMotivation = async (mode: TimerMode): Promise<AIResponse> => {
  const ai = getClient();
  
  // Fallback to local quotes if no API client available
  if (!ai) {
    return getRandomQuote(mode);
  }

  const isWork = mode === TimerMode.WORK;
  
  // Different prompts based on context
  const prompt = isWork
    ? "Give me a short, powerful, motivating quote about focus, discipline, or hard work in Chinese. Return a JSON object with 'message' and optional 'author'."
    : "Give me a short, friendly, and energetic reminder to stand up, stretch, drink water, or walk around in Chinese. It should feel like a caring friend. Return a JSON object with 'message'.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                message: { type: Type.STRING },
                author: { type: Type.STRING }
            },
            required: ['message']
        }
      }
    });

    const text = response.text;
    if (!text) return getRandomQuote(mode);
    
    return JSON.parse(text) as AIResponse;

  } catch (error) {
    // Silently fail to local quotes on error
    console.error("AI fetch failed, using local fallback");
    return getRandomQuote(mode);
  }
};