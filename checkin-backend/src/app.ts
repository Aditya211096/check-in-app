import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken';
import { tenantHandler } from './middleware/tenant';
import { sseManager } from './services/sse';
import prisma from './config/db';
import { TaskStatus } from '@prisma/client';

// Import Routes
import authRoutes from './routes/auth';
import tenantRoutes from './routes/tenant';
import guestRoutes from './routes/guest';
import stayRoutes from './routes/stay';
import taskRoutes from './routes/task';
import orderRoutes from './routes/order';
import feedbackRoutes from './routes/feedback';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'kashi_vishwanath_spiritual_dawn_secret_key_987654';

// Middleware
app.use(cors({ origin: '*' })); // Allow all cross-origins for easy testing
app.use(express.json());
app.use(tenantHandler); // Scopes and identifies X-Tenant-ID headers

// Mount Static File Directory for Uploads Fallback
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/stay', stayRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);

// Realtime Server-Sent Events stream entrypoint
app.get('/api/realtime/stream', (req: Request, res: Response) => {
  const token = req.query.token as string;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized stream request. Token query is required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;
    const tenantId = decoded.tenantId || 'global';

    // Set connection headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for proxy services (nginx/GCP)
    });

    sseManager.addClient(userId, tenantId, res);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
});

// Root check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// --- SLA Escalation Daemon (Interval checking PENDING ticket SLA breaches) ---
setInterval(async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Fetch all PENDING tasks that were created over 10 minutes ago
    const breachedTasks = await prisma.task.findMany({
      where: {
        status: TaskStatus.PENDING,
        createdAt: { lt: tenMinutesAgo },
      },
    });

    if (breachedTasks.length > 0) {
      console.log(`[SLA Daemon] Escalating ${breachedTasks.length} breached complaints...`);

      for (const task of breachedTasks) {
        // Mark as BREACHED in database
        const updatedTask = await prisma.task.update({
          where: { id: task.id },
          data: { status: TaskStatus.BREACHED },
          include: { booking: true },
        });

        // Push real-time warning notification to Manager & Owner dashboards
        sseManager.sendToTenantStaff(task.tenantId, 'task_sla_breach', updatedTask);
        // Sync to Guest
        sseManager.sendToUser(updatedTask.booking.guestId, 'task_updated', updatedTask);
      }
    }
  } catch (err) {
    console.error('Error running SLA Escalation daemon:', err);
  }
}, 60000); // Scans once per minute

app.listen(PORT, () => {
  console.log(`[Varanasi Server] Check-In Service running on http://localhost:${PORT}`);
});
export default app;
