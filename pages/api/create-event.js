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
      //GET this from api/auth/me
      const calendarId = 'alexandrepayumo123@gmail.com'; // Use your calendar ID here

      const { changes } = req.body;

      // console.log(changes);
      for (const change of changes) {
        const { summary, description, start, end, event_type } = change;
        console.log(change);

        if (event_type === 'create') {
          // console.log("Creating an event");
          const event = {
            summary,
            description,
            start: {
              dateTime: start,
              timeZone: 'America/Toronto',
            },
            end: {
              dateTime: end,
              timeZone: 'America/Toronto',
            },
          };

          const response = await calendar.events.insert({
            calendarId,
            resource: event,
          });
          console.log(`Event created: ${response.data.htmlLink}`);

        } else if (event_type === 'delete') {
          const eventsList = await calendar.events.list({
            calendarId,
            q: summary,
            timeMin: start,
            timeMax: end,
          });

          const eventToDelete = eventsList.data.items.find(event => event.summary === summary);

          if (eventToDelete) {
            await calendar.events.delete({
              calendarId,
              eventId: eventToDelete.id,
            });
            console.log(`Event deleted: ${summary}`);
          } else {
            console.log(`Event not found: ${summary}`);
          }

        } else if (event_type === 'modify') {
          const eventsList = await calendar.events.list({
            calendarId,
            q: summary,
            timeMin: start,
            timeMax: end,
          });

          const eventToModify = eventsList.data.items.find(event => event.summary === summary);

          if (eventToModify) {
            const updatedEvent = {
              summary,
              description,
              start: {
                dateTime: start,
                timeZone: 'America/Toronto',
              },
              end: {
                dateTime: end,
                timeZone: 'America/Toronto',
              },
            };

            const response = await calendar.events.update({
              calendarId,
              eventId: eventToModify.id,
              resource: updatedEvent,
            });
            console.log(`Event modified: ${response.data.htmlLink}`);
          } else {
            console.log(`Event not found: ${summary}`);
          }
        }
      }

      res.status(200).json({ message: 'Events processed successfully' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error processing events' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
