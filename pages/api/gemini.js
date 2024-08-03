// pages/api/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body;

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const result = await model.generateContent(text);
      const responseText = await result.response.text();

      res.status(200).json({ content: responseText });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Error fetching data from Google Gemini API: ' + error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}