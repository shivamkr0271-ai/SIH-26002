import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const notificationRouter = Router();

// GET all notifications
notificationRouter.get('/', (req: Request, res: Response) => {
  try {
    const notifications = db.getNotifications();
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create notification
notificationRouter.post('/', (req: Request, res: Response) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'title and message are required.' });
    }
    const notif = db.addNotification(title, message, type || 'info');
    res.status(201).json({ success: true, data: notif });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH mark notification as read
notificationRouter.patch('/:id/read', (req: Request, res: Response) => {
  try {
    const success = db.markNotificationRead(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: `Notification ${req.params.id} not found.` });
    }
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST mark all notifications as read
notificationRouter.post('/read-all', (req: Request, res: Response) => {
  try {
    db.markAllNotificationsRead();
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

