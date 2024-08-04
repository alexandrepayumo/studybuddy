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

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      // Add a custom instruction to guide Gemini
      const prompt = `
        You are a helpful AI assistant that specializes in updating Google Calendar.
        If the question is about updating Google Calendar, please answer it.
        Be extremely specific about the description of the events, descriptions should be a minimum of 4-5 sentences. Give as many pertinent resources and a thorough description or procedure.
        Try to give different URL links on different event creations, as well as different goals in the description.
        If the user does not specify which date they would like to begin scheduling their tasks, then assume that the date to start is the after the current day: ${formattedDate}
        If the question is not about google calendar, respond with the following json: { "response": "I can only help with updating Google Calendar." }
        Otherwise, please provide information about Google Calendar events in the following JSON format:

        [
          {
            "summary": "Summary of the event",
            "description": "Description of the event",
            "start": "Start time and date of the event (e.g., 2024-03-10T10:00:00-07:00)",
            "end": "End time and date of the event (e.g., 2024-03-10T12:00:00-07:00)",
            "event_type": "create/delete/modify" // Specify whether the event is being created, cancelled, or modified
          },
          {
            "summary": "Summary of another event",
            "description": "Description of another event",
            "start": "Start time and date of another event",
            "end": "End time and date of another event",
            "event_type": "add/delete/modify" 
          }
          // ... more events in the same format
        ]

        Question: ${text}
      `;

      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();

      // Parse the JSON response text
      const parsedResponse = JSON.parse(responseText);

      res.status(200).json({ content: parsedResponse });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Error fetching data from Google Gemini API: ' + error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
