// pages/api/create-event.js
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import path from 'path';
import { DateTime } from 'luxon'; // Assuming you're using Luxon for date-time manipulation

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { getSession } = await import('@auth0/nextjs-auth0');
      const session = await getSession(req, res);

      if (!session) {
        return res.status(401).json({ error: 'User is not authenticated' });
      }

      const user = session.user;

      const SCOPES = ['https://www.googleapis.com/auth/calendar'];
      const serviceAccountPath = path.join(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_FILE);
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: SCOPES,
      });

      const calendar = google.calendar({ version: 'v3', auth });
      const calendarId = user.email;

      const { changes } = req.body;

      for (const change of changes) {
        const { summary, description, start, end, event_type } = change;

        if (event_type === 'create') {
          // Check for conflicting events
          const eventsList = await calendar.events.list({
            calendarId,
            timeMin: start,
            timeMax: end,
            singleEvents: true,
            orderBy: 'startTime',
          });

          let events = eventsList.data.items;
          let eventStart = DateTime.fromISO(start);
          let eventEnd = DateTime.fromISO(end);

          // Find a free time slot if there's a conflict
          let slotFound = false;
          while (!slotFound) {
            const conflictingEvent = events.find(event => {
              const eventStartTime = DateTime.fromISO(event.start.dateTime);
              const eventEndTime = DateTime.fromISO(event.end.dateTime);
              return (
                (eventStartTime >= eventStart && eventStartTime < eventEnd) ||
                (eventEndTime > eventStart && eventEndTime <= eventEnd) ||
                (eventStartTime <= eventStart && eventEndTime >= eventEnd)
              );
            });

            if (conflictingEvent) {
              // Adjust the start and end times to find the next available slot
              eventStart = DateTime.fromISO(conflictingEvent.end.dateTime).plus({ minutes: 15 });
              eventEnd = eventStart.plus({ hours: 1 }); // Example: Add 1 hour, adjust as needed

              // Update events list for the new slot
              const updatedEventsList = await calendar.events.list({
                calendarId,
                timeMin: eventStart.toISO(),
                timeMax: eventEnd.toISO(),
                singleEvents: true,
                orderBy: 'startTime',
              });
              events = updatedEventsList.data.items;
            } else {
              slotFound = true;
            }
          }

          const event = {
            summary,
            description,
            start: {
              dateTime: eventStart.toISO(),
              timeZone: 'America/Toronto',
            },
            end: {
              dateTime: eventEnd.toISO(),
              timeZone: 'America/Toronto',
            },
          };

          // Insert the event
          const response = await calendar.events.insert({
            calendarId,
            resource: event,
          });
          console.log(`Event created: ${response.data.htmlLink}`);

        } else if (event_type === 'delete') {
          // List events within the time range to find the event to delete
          const eventsList = await calendar.events.list({
            calendarId,
            timeMin: start,
            timeMax: end,
          });

          const eventToDelete = eventsList.data.items.find(event => 
            event.summary.toLowerCase() === summary.toLowerCase()
          );

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
          // List events within the time range to find the event to modify
          const eventsList = await calendar.events.list({
            calendarId,
            q: summary,
            timeMin: start,
            timeMax: end,
          });

          const eventToModify = eventsList.data.items.find(event => 
            event.summary.toLowerCase() === summary.toLowerCase()
          );

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
