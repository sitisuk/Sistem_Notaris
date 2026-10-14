import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getServices,
  getRegistrations,
  getRegistrationByNumber,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  getActivityLogs,
  getDashboardStats,
} from './src/db/notary.ts';
import { db } from './src/db/index.ts';
import { services, registrations, activityLogs, users } from './src/db/schema.ts';
import { desc } from 'drizzle-orm';
import { getOrCreateUser, getUserByUid } from './src/db/users.ts';
import { optionalAuth, requireAuth, AuthRequest } from './src/middleware/auth.ts';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // AI Studio requires the dev server to run on port 3000
  const PORT = 3000;

  app.use(express.json());

  // Serve AI Studio iframe helper assets if available on host
  if (fs.existsSync('/var/www/assets')) {
    app.use(express.static('/var/www/assets'));
  }

  // 1. Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Sistem Informasi Kantor Notaris & PPAT',
      database: 'Cloud SQL PostgreSQL',
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Services endpoint (public)
  app.get('/api/services', async (req: Request, res: Response) => {
    try {
      const data = await getServices();
      res.json(data);
    } catch (error: any) {
      console.error('API /api/services error:', error);
      res.status(500).json({ error: error.message || 'Gagal mengambil layanan' });
    }
  });

  // 3. Create new registration (public or authenticated)
  app.post('/api/registrations', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        clientType,
        fullName,
        nik,
        npwp,
        companyName,
        email,
        phone,
        address,
        serviceId,
        serviceName,
        serviceCategory,
        consultationDate,
        consultationTime,
        notes,
        documentsSubmitted,
      } = req.body;

      if (!fullName || !nik || !email || !phone || !serviceName || !consultationDate || !consultationTime) {
        return res.status(400).json({
          error: 'Mohon lengkapi seluruh formulir wajib (Nama, NIK, Email, No. HP, Layanan, dan Jadwal)',
        });
      }

      const result = await createRegistration({
        clientType: clientType || 'INDIVIDUAL',
        fullName,
        nik,
        npwp,
        companyName,
        email,
        phone,
        address: address || '-',
        serviceId: serviceId ? Number(serviceId) : undefined,
        serviceName,
        serviceCategory: serviceCategory || 'NOTARIS',
        consultationDate,
        consultationTime,
        notes,
        documentsSubmitted: Array.isArray(documentsSubmitted) ? documentsSubmitted : [],
        userUid: req.user?.uid,
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error('API POST /api/registrations error:', error);
      res.status(500).json({ error: error.message || 'Gagal menyimpan pendaftaran' });
    }
  });

  // 4. Track registration by registration number (public)
  app.get('/api/registrations/track/:regNumber', async (req: Request, res: Response) => {
    try {
      const regNumber = req.params.regNumber;
      if (!regNumber) {
        return res.status(400).json({ error: 'Nomor registrasi wajib diisi' });
      }

      const item = await getRegistrationByNumber(regNumber);
      if (!item) {
        return res.status(404).json({
          error: `Berkas dengan kode registrasi "${regNumber}" tidak ditemukan dalam basis data sistem Notaris & PPAT.`,
        });
      }

      const logs = await getActivityLogs(item.id);
      res.json({ registration: item, logs });
    } catch (error: any) {
      console.error('API /api/registrations/track error:', error);
      res.status(500).json({ error: error.message || 'Gagal melacak nomor registrasi' });
    }
  });

  // 5. Get all registrations (for Admin / Staff or client user)
  app.get('/api/registrations', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { status, category, search, onlyMine } = req.query;
      const userUid = onlyMine === 'true' && req.user ? req.user.uid : undefined;

      const items = await getRegistrations({
        status: typeof status === 'string' ? status : undefined,
        category: typeof category === 'string' ? category : undefined,
        search: typeof search === 'string' ? search : undefined,
        userUid,
      });

      res.json(items);
    } catch (error: any) {
      console.error('API /api/registrations error:', error);
      res.status(500).json({ error: error.message || 'Gagal memuat daftar berkas' });
    }
  });

  // 6. Get single registration detail with logs
  app.get('/api/registrations/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'ID tidak valid' });

      const item = await getRegistrationById(id);
      if (!item) return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan' });

      const logs = await getActivityLogs(id);
      res.json({ registration: item, logs });
    } catch (error: any) {
      console.error('API /api/registrations/:id error:', error);
      res.status(500).json({ error: error.message || 'Gagal memuat detail pendaftaran' });
    }
  });

  // 7. Update registration status / fields (Admin)
  app.patch('/api/registrations/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'ID tidak valid' });

      const {
        status,
        notaryDeedNumber,
        repertoriumNumber,
        estimatedCompletionDate,
        officialFee,
        adminNotes,
        assignedStaff,
        logTitle,
        logDescription,
      } = req.body;

      const actorName = req.user?.email ? `Admin (${req.user.email})` : 'Petugas Notaris & PPAT';

      const updated = await updateRegistration(id, {
        status,
        notaryDeedNumber,
        repertoriumNumber,
        estimatedCompletionDate,
        officialFee: officialFee !== undefined ? Number(officialFee) : undefined,
        adminNotes,
        assignedStaff,
        logTitle,
        logDescription,
        actor: actorName,
      });

      const logs = await getActivityLogs(id);
      res.json({ registration: updated, logs });
    } catch (error: any) {
      console.error('API PATCH /api/registrations/:id error:', error);
      res.status(500).json({ error: error.message || 'Gagal memperbarui data pendaftaran' });
    }
  });

  // 8. Delete registration (Admin)
  app.delete('/api/registrations/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'ID tidak valid' });

      await deleteRegistration(id);
      res.json({ success: true, message: 'Berkas berhasil dihapus' });
    } catch (error: any) {
      console.error('API DELETE /api/registrations/:id error:', error);
      res.status(500).json({ error: error.message || 'Gagal menghapus berkas' });
    }
  });

  // 9. Dashboard stats (Admin)
  app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
    try {
      const stats = await getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      console.error('API /api/dashboard/stats error:', error);
      res.status(500).json({ error: error.message || 'Gagal memuat statistik dashboard' });
    }
  });

  // 10. Sync user profile after Google Login
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || !req.user.uid || !req.user.email) {
        return res.status(400).json({ error: 'User token tidak lengkap' });
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email, req.user.name);
      res.json(user);
    } catch (error: any) {
      console.error('API /api/auth/sync error:', error);
      res.status(500).json({ error: error.message || 'Gagal sinkronisasi pengguna' });
    }
  });

  // 11. Get current profile
  app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const user = await getUserByUid(req.user.uid);
      res.json(user || { uid: req.user.uid, email: req.user.email, role: 'user' });
    } catch (error: any) {
      console.error('API /api/auth/me error:', error);
      res.status(500).json({ error: error.message || 'Gagal memuat profil' });
    }
  });

  // 11b. Verify Notary Office Staff Passcode for Admin Access
  app.post('/api/auth/admin-passcode', (req: Request, res: Response) => {
    const { passcode } = req.body;
    const validCodes = ['notaris2026', 'admin123', '123456', 'cikarang137'];
    if (passcode && validCodes.includes(String(passcode).trim().toLowerCase())) {
      return res.json({
        valid: true,
        role: 'admin',
        message: 'Akses administrator kantor berhasil diverifikasi',
        officeStaff: 'TRI AKHSANUL IMAN, S.H., M.Kn.',
      });
    }
    return res.status(401).json({
      valid: false,
      error: 'Kode sandi administrator salah. Silakan periksa kembali.',
    });
  });

  // 12. Database Inspection & Raw Tables Viewer
  app.get('/api/database/tables', async (req: Request, res: Response) => {
    try {
      const { table } = req.query;
      if (table === 'services') {
        const rows = await db.select().from(services);
        return res.json({ table: 'services', total: rows.length, rows });
      }
      if (table === 'activity_logs') {
        const rows = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(100);
        return res.json({ table: 'activity_logs', total: rows.length, rows });
      }
      if (table === 'users') {
        const rows = await db.select().from(users);
        return res.json({ table: 'users', total: rows.length, rows });
      }
      // default: registrations
      const rows = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
      return res.json({ table: 'registrations', total: rows.length, rows });
    } catch (error: any) {
      console.error('API /api/database/tables error:', error);
      res.status(500).json({ error: error.message || 'Gagal mengambil data tabel database' });
    }
  });

  // 13. Database Summary info
  app.get('/api/database/summary', async (req: Request, res: Response) => {
    try {
      const countRegs = await db.select().from(registrations);
      const countServices = await db.select().from(services);
      const countLogs = await db.select().from(activityLogs);
      const countUsers = await db.select().from(users);

      res.json({
        engine: 'PostgreSQL (Cloud SQL)',
        host: process.env.SQL_HOST ? 'Local Cloud SQL Auth Proxy' : 'localhost',
        database: process.env.SQL_DB_NAME || 'postgres',
        region: 'asia-southeast1',
        connected: true,
        tables: [
          { name: 'registrations', rowCount: countRegs.length, description: 'Berkas pendaftaran permohonan akta & status' },
          { name: 'services', rowCount: countServices.length, description: 'Katalog layanan Notaris & PPAT resmi' },
          { name: 'activity_logs', rowCount: countLogs.length, description: 'Riwayat mutasi & audit trail berkas' },
          { name: 'users', rowCount: countUsers.length, description: 'Akun admin & pemohon terautentikasi' },
        ],
      });
    } catch (error: any) {
      console.error('API /api/database/summary error:', error);
      res.status(500).json({ error: error.message || 'Gagal memuat ringkasan database' });
    }
  });

  // Vite Integration:
  // In production, serve dist folder. In development, mount Vite middleware with HTML transform.
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Serve index.html transformed by Vite for all non-API GET requests
    app.use('*', async (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const templatePath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Notaris PPAT System] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
