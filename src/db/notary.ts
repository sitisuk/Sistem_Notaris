import { db } from './index.ts';
import { services, registrations, activityLogs } from './schema.ts';
import { eq, desc, ilike, or, and, sql } from 'drizzle-orm';

export interface CreateRegistrationInput {
  clientType: 'INDIVIDUAL' | 'COMPANY';
  fullName: string;
  nik: string;
  npwp?: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  serviceId?: number;
  serviceName: string;
  serviceCategory: 'NOTARIS' | 'PPAT';
  consultationDate: string;
  consultationTime: string;
  notes?: string;
  documentsSubmitted?: string[];
  userUid?: string;
}

export interface UpdateRegistrationInput {
  status?: string;
  notaryDeedNumber?: string;
  repertoriumNumber?: string;
  estimatedCompletionDate?: string;
  officialFee?: number;
  adminNotes?: string;
  assignedStaff?: string;
  logTitle?: string;
  logDescription?: string;
  actor?: string;
}

// Generate unique registration code: NOT-YYYY-XXXX
export async function generateRegistrationNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  try {
    const latest = await db
      .select({ regNum: registrations.registrationNumber })
      .from(registrations)
      .where(ilike(registrations.registrationNumber, `NOT-${currentYear}-%`))
      .orderBy(desc(registrations.id))
      .limit(1);

    if (latest.length > 0 && latest[0].regNum) {
      const parts = latest[0].regNum.split('-');
      const num = parseInt(parts[2], 10);
      const nextNum = isNaN(num) ? 1 : num + 1;
      return `NOT-${currentYear}-${String(nextNum).padStart(4, '0')}`;
    }
    return `NOT-${currentYear}-0001`;
  } catch (error) {
    console.error('Error generating registration number:', error);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `NOT-${currentYear}-${rand}`;
  }
}

// 1. SERVICES
export async function getServices(onlyActive = true) {
  try {
    if (onlyActive) {
      return await db.select().from(services).where(eq(services.isActive, true));
    }
    return await db.select().from(services);
  } catch (error) {
    console.error('Database getServices failed:', error);
    throw new Error('Gagal mengambil daftar layanan notaris', { cause: error });
  }
}

export async function getServiceById(id: number) {
  try {
    const res = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return res[0] || null;
  } catch (error) {
    console.error('Database getServiceById failed:', error);
    throw new Error('Gagal mengambil data layanan', { cause: error });
  }
}

// 2. REGISTRATIONS
export async function getRegistrations(params?: {
  status?: string;
  category?: string;
  search?: string;
  userUid?: string;
}) {
  try {
    let query = db.select().from(registrations);
    const conditions = [];

    if (params?.status && params.status !== 'ALL') {
      conditions.push(eq(registrations.status, params.status));
    }
    if (params?.category && params.category !== 'ALL') {
      conditions.push(eq(registrations.serviceCategory, params.category));
    }
    if (params?.userUid) {
      conditions.push(eq(registrations.userUid, params.userUid));
    }
    if (params?.search && params.search.trim()) {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(registrations.registrationNumber, term),
          ilike(registrations.fullName, term),
          ilike(registrations.nik, term),
          ilike(registrations.email, term),
          ilike(registrations.phone, term),
          ilike(registrations.companyName, term),
          ilike(registrations.notaryDeedNumber, term),
          ilike(registrations.repertoriumNumber, term)
        )
      );
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(registrations.createdAt));
    }
    return await query.orderBy(desc(registrations.createdAt));
  } catch (error) {
    console.error('Database getRegistrations failed:', error);
    throw new Error('Gagal mengambil daftar berkas pendaftaran', { cause: error });
  }
}

export async function getRegistrationByNumber(regNumber: string) {
  try {
    const rows = await db
      .select()
      .from(registrations)
      .where(ilike(registrations.registrationNumber, regNumber.trim()))
      .limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Database getRegistrationByNumber failed:', error);
    throw new Error('Gagal melacak nomor pendaftaran', { cause: error });
  }
}

export async function getRegistrationById(id: number) {
  try {
    const rows = await db.select().from(registrations).where(eq(registrations.id, id)).limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Database getRegistrationById failed:', error);
    throw new Error('Gagal mengambil detail pendaftaran', { cause: error });
  }
}

export async function createRegistration(input: CreateRegistrationInput) {
  try {
    const regNumber = await generateRegistrationNumber();
    const docJson = input.documentsSubmitted ? JSON.stringify(input.documentsSubmitted) : '[]';

    // Get service fee if available
    let officialFee = 0;
    if (input.serviceId) {
      const s = await getServiceById(input.serviceId);
      if (s) officialFee = s.baseFee;
    }

    const inserted = await db
      .insert(registrations)
      .values({
        registrationNumber: regNumber,
        clientType: input.clientType,
        fullName: input.fullName,
        nik: input.nik,
        npwp: input.npwp || null,
        companyName: input.companyName || null,
        email: input.email,
        phone: input.phone,
        address: input.address,
        serviceId: input.serviceId || null,
        serviceName: input.serviceName,
        serviceCategory: input.serviceCategory,
        consultationDate: input.consultationDate,
        consultationTime: input.consultationTime,
        notes: input.notes || null,
        documentsSubmitted: docJson,
        status: 'MENUNGGU_VERIFIKASI',
        officialFee,
        userUid: input.userUid || null,
      })
      .returning();

    const created = inserted[0];

    // Initial activity log
    await db.insert(activityLogs).values({
      registrationId: created.id,
      status: 'MENUNGGU_VERIFIKASI',
      title: 'Pendaftaran Diterima',
      description: `Permohonan akta ${created.serviceName} berhasil diajukan dengan jadwal konsultasi ${created.consultationDate} pukul ${created.consultationTime}.`,
      actor: input.userUid ? 'Klien Terdaftar' : 'Pemohon Online',
    });

    return created;
  } catch (error) {
    console.error('Database createRegistration failed:', error);
    throw new Error('Gagal menyimpan pendaftaran berkas', { cause: error });
  }
}

export async function updateRegistration(id: number, data: UpdateRegistrationInput) {
  try {
    const existing = await getRegistrationById(id);
    if (!existing) {
      throw new Error('Data pendaftaran tidak ditemukan');
    }

    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.status !== undefined) updateFields.status = data.status;
    if (data.notaryDeedNumber !== undefined) updateFields.notaryDeedNumber = data.notaryDeedNumber;
    if (data.repertoriumNumber !== undefined) updateFields.repertoriumNumber = data.repertoriumNumber;
    if (data.estimatedCompletionDate !== undefined) updateFields.estimatedCompletionDate = data.estimatedCompletionDate;
    if (data.officialFee !== undefined) updateFields.officialFee = data.officialFee;
    if (data.adminNotes !== undefined) updateFields.adminNotes = data.adminNotes;
    if (data.assignedStaff !== undefined) updateFields.assignedStaff = data.assignedStaff;

    const result = await db
      .update(registrations)
      .set(updateFields)
      .where(eq(registrations.id, id))
      .returning();

    const updated = result[0];

    // Add activity log if status changed or log requested
    if (data.status || data.logTitle) {
      const title = data.logTitle || `Status diperbarui menjadi ${data.status || updated.status}`;
      const desc = data.logDescription || data.adminNotes || `Status berkas pendaftaran berhasil dimutakhirkan.`;
      await db.insert(activityLogs).values({
        registrationId: id,
        status: data.status || updated.status,
        title,
        description: desc,
        actor: data.actor || 'Admin Notaris / PPAT',
      });
    }

    return updated;
  } catch (error) {
    console.error('Database updateRegistration failed:', error);
    throw new Error('Gagal memperbarui data pendaftaran', { cause: error });
  }
}

export async function deleteRegistration(id: number) {
  try {
    await db.delete(registrations).where(eq(registrations.id, id));
    return { success: true };
  } catch (error) {
    console.error('Database deleteRegistration failed:', error);
    throw new Error('Gagal menghapus data pendaftaran', { cause: error });
  }
}

// 3. ACTIVITY LOGS
export async function getActivityLogs(registrationId: number) {
  try {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.registrationId, registrationId))
      .orderBy(desc(activityLogs.createdAt));
  } catch (error) {
    console.error('Database getActivityLogs failed:', error);
    throw new Error('Gagal mengambil riwayat berkas', { cause: error });
  }
}

// 4. DASHBOARD STATS
export async function getDashboardStats() {
  try {
    const all = await db.select().from(registrations);
    const total = all.length;

    let pending = 0;
    let inVerification = 0;
    let inDrafting = 0;
    let scheduledSigning = 0;
    let inLegalization = 0;
    let completed = 0;
    let rejected = 0;
    let totalFee = 0;
    let countNotaris = 0;
    let countPPAT = 0;

    for (const r of all) {
      if (r.status === 'MENUNGGU_VERIFIKASI') pending++;
      else if (r.status === 'VERIFIKASI_BERKAS') inVerification++;
      else if (r.status === 'PENYUSUNAN_DRAFT') inDrafting++;
      else if (r.status === 'JADWAL_TANDATANGAN') scheduledSigning++;
      else if (r.status === 'PROSES_PENGESAHAN') inLegalization++;
      else if (r.status === 'SELESAI') completed++;
      else if (r.status === 'DITOLAK') rejected++;

      if (r.serviceCategory === 'NOTARIS') countNotaris++;
      if (r.serviceCategory === 'PPAT') countPPAT++;

      totalFee += r.officialFee || 0;
    }

    return {
      total,
      pending,
      inVerification,
      inDrafting,
      scheduledSigning,
      inLegalization,
      completed,
      rejected,
      inProgress: inVerification + inDrafting + scheduledSigning + inLegalization,
      totalFee,
      countNotaris,
      countPPAT,
    };
  } catch (error) {
    console.error('Database getDashboardStats failed:', error);
    throw new Error('Gagal menghitung statistik pendaftaran', { cause: error });
  }
}
