import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDatabase } from './server/database/db.ts';
import { generateContentFromExperience, refineContent } from './server/services/gemini.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Initialize SQLite database
  const dbService = await getDatabase();

  // Status check
  app.get('/api/status', (req: Request, res: Response) => {
    res.json({
      status: 'online',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      database: 'SQLite',
      model: 'gemini-3.8-flash',
    });
  });

  // GET /api/events - List all events
  app.get('/api/events', (req: Request, res: Response) => {
    try {
      const rows = dbService.query('SELECT * FROM events ORDER BY created_at DESC');
      res.json({ success: true, data: rows });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/events - Create new event by organizer
  app.post('/api/events', (req: Request, res: Response) => {
    try {
      const {
        name,
        description,
        date,
        time,
        location,
        speaker,
        topics,
        imageUrl,
      } = req.body;

      if (!name || !description || !date || !time || !location || !speaker) {
        return res.status(400).json({ error: 'All primary event fields are required.' });
      }

      const id = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      dbService.run(
        `INSERT INTO events (id, name, description, date, time, location, speaker, topics, image_url, attended, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
        [
          id,
          name.trim(),
          description.trim(),
          date,
          time,
          location.trim(),
          speaker.trim(),
          topics ? topics.trim() : '',
          imageUrl ? imageUrl.trim() : '',
        ]
      );

      const created = dbService.get('SELECT * FROM events WHERE id = ?', [id]);
      res.json({ success: true, data: created });
    } catch (error: any) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/events/:id - Get specific event
  app.get('/api/events/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const event = dbService.get('SELECT * FROM events WHERE id = ?', [id]);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/events/:id/attend - Mark event as attended
  app.post('/api/events/:id/attend', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      dbService.run('UPDATE events SET attended = 1 WHERE id = ?', [id]);
      const updated = dbService.get('SELECT * FROM events WHERE id = ?', [id]);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/feedback - Save attendee feedback
  app.post('/api/feedback', (req: Request, res: Response) => {
    try {
      const { eventId, feedbackText, rating } = req.body;
      if (!eventId || !feedbackText || !feedbackText.trim()) {
        return res.status(400).json({ error: 'Event ID and feedback text are required.' });
      }

      const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      dbService.run(
        `INSERT INTO feedbacks (id, event_id, feedback_text, rating, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [id, eventId, feedbackText.trim(), Number(rating) || 5]
      );

      // Ensure event is marked attended
      dbService.run('UPDATE events SET attended = 1 WHERE id = ?', [eventId]);

      const saved = dbService.get('SELECT * FROM feedbacks WHERE id = ?', [id]);
      res.json({ success: true, data: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/feedback - Get all user feedbacks with event details
  app.get('/api/feedback', (req: Request, res: Response) => {
    try {
      const rows = dbService.query(`
        SELECT f.*, e.name as event_name, e.date as event_date, e.location as event_location, e.speaker as event_speaker
        FROM feedbacks f
        JOIN events e ON f.event_id = e.id
        ORDER BY f.created_at DESC
      `);
      res.json({ success: true, data: rows });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/generate - Generate platform content from Actual Event + Actual Feedback
  app.post('/api/generate', async (req: Request, res: Response) => {
    try {
      const { event, feedback, platforms } = req.body;

      if (!event || !event.eventName || !feedback || !feedback.userFeedback) {
        return res.status(400).json({
          error: 'Please attend an event and share your experience first.',
        });
      }

      if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
        return res.status(400).json({
          error: 'Please select at least one platform.',
        });
      }

      const result = await generateContentFromExperience({
        event,
        feedback,
        platforms,
      });

      res.json({ success: true, data: result.platforms });
    } catch (error: any) {
      console.error('Error generating content:', error);
      res.status(500).json({
        error: error.message || 'AI generation is currently unavailable. Please check the API connection and try again.',
      });
    }
  });

  // POST /api/refine - Refine specific content with action
  app.post('/api/refine', async (req: Request, res: Response) => {
    try {
      const { currentContent, refinementAction, eventName, userFeedback, platform } = req.body;

      if (!currentContent || !refinementAction) {
        return res.status(400).json({ error: 'currentContent and refinementAction are required.' });
      }

      const result = await refineContent({
        currentContent,
        refinementAction,
        eventName: eventName || 'Event',
        userFeedback: userFeedback || '',
        platform: platform || 'Social Media',
      });

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error refining content:', error);
      res.status(500).json({
        error: error.message || 'AI generation is currently unavailable. Please check the API connection and try again.',
      });
    }
  });

  // POST /api/save-content - Save variation
  app.post('/api/save-content', (req: Request, res: Response) => {
    try {
      const {
        eventId,
        feedbackId,
        platform,
        style,
        hook,
        content,
        hashtags,
        cta,
        scoreAuthenticity,
        scoreEngagement,
        scorePlatformFit,
        whyThisWorks,
      } = req.body;

      const id = `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      dbService.run(
        `INSERT INTO generated_content
         (id, event_id, feedback_id, platform, style, hook, content, hashtags, cta, score_authenticity, score_engagement, score_platform_fit, why_this_works, saved, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
        [
          id,
          eventId || 'ev_current',
          feedbackId || '',
          platform,
          style,
          hook || '',
          content || '',
          Array.isArray(hashtags) ? JSON.stringify(hashtags) : hashtags,
          cta || '',
          scoreAuthenticity || 95,
          scoreEngagement || 90,
          scorePlatformFit || 92,
          whyThisWorks || '',
        ]
      );

      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/saved-content - Get saved variations
  app.get('/api/saved-content', (req: Request, res: Response) => {
    try {
      const rows = dbService.query(`
        SELECT gc.*, e.name as event_name
        FROM generated_content gc
        LEFT JOIN events e ON gc.event_id = e.id
        WHERE gc.saved = 1
        ORDER BY gc.created_at DESC
      `);
      res.json({ success: true, data: rows });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Setup Vite dev middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ContentForge AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
