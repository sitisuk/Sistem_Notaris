import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabel Pengguna / Admin
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('user').notNull(), // 'admin', 'staff', 'user'
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabel Layanan Notaris & PPAT
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  category: text('category').notNull(), // 'NOTARIS' | 'PPAT'
  name: text('name').notNull(),
  description: text('description').notNull(),
  requirements: text('requirements').notNull(), // JSON string array of documents
  estimatedDays: integer('estimated_days').default(7).notNull(),
  baseFee: integer('base_fee').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabel Pendaftaran & Permohonan Akta
export const registrations = pgTable('registrations', {
  id: serial('id').primaryKey(),
  registrationNumber: text('registration_number').notNull().unique(), // contoh: NOT-2026-0001
  clientType: text('client_type').notNull(), // 'INDIVIDUAL' | 'COMPANY'
  fullName: text('full_name').notNull(),
  nik: text('nik').notNull(),
  npwp: text('npwp'),
  companyName: text('company_name'),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  serviceId: integer('service_id').references(() => services.id),
  serviceName: text('service_name').notNull(),
  serviceCategory: text('service_category').notNull(), // 'NOTARIS' | 'PPAT'
  consultationDate: text('consultation_date').notNull(), // YYYY-MM-DD
  consultationTime: text('consultation_time').notNull(), // HH:MM
  notes: text('notes'),
  documentsSubmitted: text('documents_submitted'), // JSON array list
  status: text('status').default('MENUNGGU_VERIFIKASI').notNull(),
  // Status: MENUNGGU_VERIFIKASI | VERIFIKASI_BERKAS | PENYUSUNAN_DRAFT | JADWAL_TANDATANGAN | PROSES_PENGESAHAN | SELESAI | DITOLAK
  notaryDeedNumber: text('notary_deed_number'), // No Akta resmi
  repertoriumNumber: text('repertorium_number'), // No Buku Repertorium
  estimatedCompletionDate: text('estimated_completion_date'),
  officialFee: integer('official_fee').default(0).notNull(),
  adminNotes: text('admin_notes'),
  assignedStaff: text('assigned_staff'),
  userUid: text('user_uid'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabel Riwayat Log Aktivitas Berkas
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  registrationId: integer('registration_id').references(() => registrations.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  actor: text('actor').default('Sistem Kantor Notaris').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relasi tabel
export const usersRelations = relations(users, ({ many }) => ({
  // User relations
}));

export const servicesRelations = relations(services, ({ many }) => ({
  registrations: many(registrations),
}));

export const registrationsRelations = relations(registrations, ({ one, many }) => ({
  service: one(services, {
    fields: [registrations.serviceId],
    references: [services.id],
  }),
  logs: many(activityLogs),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  registration: one(registrations, {
    fields: [activityLogs.registrationId],
    references: [registrations.id],
  }),
}));
