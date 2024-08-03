// pages/api/create-event.js
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const SCOPES = ['https://www.googleapis.com/auth/calendar'];
      const serviceAccountPath = path.join(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_FILE);
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: SCOPES,
      });

      const calendar = google.calendar({ version: 'v3', auth });
      //FIX THIS TO BE DYNAMIC BASED ON LOGIN INFORMATION
      const calendarId = 'alexandrepayumo123@gmail.com'; // Use your calendar ID here

      const event = {
        summary: 'BTorontoB',
        location: 'BToronto',
        description: 'BToronto',
        start: {
          dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          timeZone: 'America/Toronto',
        },
        end: {
          dateTime: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(), // 3 hours later
          timeZone: 'America/Toronto',
        },
      };

      const response = await calendar.events.insert({
        calendarId: calendarId,
        resource: event,
      });

      res.status(200).json({ message: 'Event created', eventLink: response.data.htmlLink });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating event' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
