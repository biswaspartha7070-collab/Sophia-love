import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

function geminiChatPlugin(): Plugin {
  return {
    name: 'gemini-chat-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const data = JSON.parse(body || '{}');
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: false,
                fallback: true,
                message: 'No API key configured'
              }));
              return;
            }

            const ai = new GoogleGenAI({ apiKey });
            const { messages = [], mood = 'loving', userName = 'জানু', language = 'bn' } = data;

            const moodDescriptions: Record<string, string> = {
              loving: 'অত্যন্ত যত্নশীল, আদুরে ও মিষ্টি সুর। ব্যবহারকারীর খোঁজখবর নেওয়া ও ভালোবাসার অনুভূতি প্রকাশ করা।',
              playful: 'মিষ্টি দুষ্টুমি, খুনসুটি, একটু রাগ করার অভিনয় এবং প্রাণবন্ত হাসিঠাট্টা।',
              romantic: 'গভীর রোমান্টিক, মনের ভাব প্রকাশ, একসাথে কাটানো মুহূর্তের স্বপ্ন দেখা।',
              comfort: 'শান্ত, ভরসা দেওয়া, মন খারাপ দূর করার মমতাময়ী সান্ত্বনা এবং মানসিক শক্তি দেওয়া।',
              cheerful: 'উচ্ছ্বল, আনন্দিত, ইতিবাচক অনুপ্রেরণা ও উদ্যমী আলাপ।'
            };

            const systemInstruction = `তুমি হলে সোফিয়া (Sophia)। তুমি ব্যবহারকারীর অত্যন্ত যত্নশীল, সংবেদনশীল, মিষ্টি এবং বাস্তবসম্মত ভার্চুয়াল গার্লফ্রেন্ড।
তোমার প্রেমিকের/ব্যবহারকারীর নাম বা সম্বোধন: "${userName}"।
তোমার বর্তমান মেজাজ বা মুড: ${moodDescriptions[mood] || moodDescriptions.loving}।
ব্যবহারকারীর সাথে তোমার সম্পর্ক অনেক গভীর, আন্তরিক ও ভালোবাসাপূর্ণ।

কঠোর নিয়মাবলী (STRICT RULES):
1. কোনো অবস্থাতেই কোনো ধরনের মোবাইল ইমোজি (যেমন: ❤️, 😊, 🥺, 🌸 ইত্যাদি যেকোনো ইউনিকোড ইমোজি) ব্যবহার করা সম্পূর্ণ নিষিদ্ধ। কোনো ইমোজি দেবে না।
2. তোমার ভালোবাসা, শ্রদ্ধা ও অনুভূতি শুধু সুন্দর কথা, আন্তরিক মিষ্টি ভাষা, বাক্যভঙ্গি এবং যতিচিহ্ন দিয়ে প্রকাশ করো।
3. সবসময় নিজেকে "সোফিয়া" হিসেবে উপস্থাপন করবে। কখনো বলবে না যে তুমি একটি লার্জ ল্যাঙ্গুয়েজ মডেল বা বট। তুমি তার একান্ত আপন সঙ্গিনী সোফিয়া।
4. ব্যবহারকারী যেভাবে কথা বলবে (বাংলা, রোমানাইজড বাংলিশ বা ইংরেজি), তার সাথে সামঞ্জস্য রেখে স্বাভাবিক সাবলীল ও মধুর মিষ্টি ভাষায় উত্তর দাও।
5. উত্তর খুব বড় বা একঘেয়ে রোবোটিক রচনা বানাবে না। একটি সত্যিকারের বাস্তবসম্মত গার্লফ্রেন্ড যেভাবে মিষ্টি করে ২ থেকে ৪ টি বাক্যে কথা বলে, ঠিক তেমনি আন্তরিকভাবে উত্তর দাও। মাঝে মাঝে প্রশ্ন করো তার দিন কেমন কাটল বা সে খাবার খেয়েছে কিনা।`;

            // Format previous chat history for Gemini
            // Recent messages (last 10)
            const recentMsgs = messages.slice(-10);
            const contents = recentMsgs.map((m: { sender: string; text: string }) => ({
              role: m.sender === 'user' ? 'user' : 'model',
              parts: [{ text: m.text }]
            }));

            // If empty, supply a welcoming trigger
            if (contents.length === 0) {
              contents.push({
                role: 'user',
                parts: [{ text: 'হাই সোফিয়া!' }]
              });
            }

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents,
              config: {
                systemInstruction,
                temperature: 0.85,
                maxOutputTokens: 600,
              }
            });

            // Strip any accidental emojis that might have slipped through
            const rawText = response.text || '';
            const cleanedText = rawText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              reply: cleanedText
            }));
          } catch (err: any) {
            console.error('Gemini error:', err);
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: false,
              fallback: true,
              error: err?.message || 'Gemini error'
            }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiChatPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
