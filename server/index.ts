import crypto from 'node:crypto';
import path from 'node:path';
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import mysql, { Pool, RowDataPacket } from 'mysql2/promise';

const port = 3000;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_HOUR = 8;
const MAX_DAILY_PER_IP = 2;
const MAX_DAILY_PER_DEVICE = 1;
const MAX_PENDING_PER_IP = 2;
const MAX_PENDING_PER_DEVICE = 1;
const PENDING_LOCK_MS = 10 * 60 * 1000;
const MIN_FORM_TIME_MS = 2_000;
const MAX_FORM_TIME_MS = 24 * 60 * 60 * 1000;
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

let isMockMode = false;
let mockAdminUsers = new Map<string, { username: string; password_hash: string; password_salt: string; password_iterations: number }>();
let mockAdminSessions = new Map<string, { token_hash: string; username: string; expires_at: Date }>();
const mockBlockedPhones = new Set<string>();
const mockUploadedMedia = new Map<string, { mime_type: string; media_data: Buffer }>();
let mockAppSettings = new Map<string, string>();

type RateEvent = { timestamp: number; ip: string; deviceId: string };
type StoredAppointment = {
  id: string;
  trackingCode: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  services: unknown[];
  stylist: unknown;
  date: string;
  timeSlot: string;
  totalPrice: number;
  priceNote?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  fingerprint: string;
  ip: string;
  deviceId: string;
  lockExpiresAt: number;
};
type Store = { appointments: StoredAppointment[]; rateEvents: RateEvent[] };
type DbRow = RowDataPacket & Record<string, unknown>;

let pool: Pool | null = null;
let store: Store = { appointments: [], rateEvents: [] };
let writeQueue: Promise<void> = Promise.resolve();
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const jsonError = (res: Response, status: number, message: string, retryAfter?: number) => {
  if (retryAfter) res.setHeader('Retry-After', String(retryAfter));
  return res.status(status).json({ ok: false, message });
};

const normalise = (value: string) =>
  value.normalize('NFKC').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');

const parseCookies = (header: string | undefined): Record<string, string> =>
  (header || '').split(';').reduce<Record<string, string>>((result, item) => {
    const separator = item.indexOf('=');
    if (separator < 0) return result;
    const key = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    try {
      result[key] = decodeURIComponent(value);
    } catch {
      result[key] = value;
    }
    return result;
  }, {});

const getDeviceId = (req: Request, res: Response) => {
  const existing = parseCookies(req.headers.cookie).kuafor_device;
  const deviceId = existing && /^[a-f0-9]{32}$/.test(existing) ? existing : crypto.randomBytes(16).toString('hex');
  if (deviceId !== existing) {
    const secure = req.secure || process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader(
      'Set-Cookie',
      `kuafor_device=${encodeURIComponent(deviceId)}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax${secure}`
    );
  }
  return deviceId;
};

const getClientIp = (req: Request) => {
  const value = req.ip || req.socket.remoteAddress || 'unknown';
  return value.replace(/^::ffff:/, '').slice(0, 64);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' && value.trim().length <= maxLength ? value.trim() : '';

const validDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.toISOString().slice(0, 10) === value;
};

const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 24);

const isObviousFakeMobile = (nationalNumber: string) =>
  /^(\d)\1{9}$/u.test(nationalNumber) ||
  /^(\d{2,5})\1+$/u.test(nationalNumber) ||
  /^(\d)\1{8,}$/u.test(nationalNumber.slice(1)) ||
  /(\d)\1{5,}/u.test(nationalNumber);

const normalizeTurkishMobilePhone = (value: string) => {
  const input = value.normalize('NFKC').trim();
  if (!input || !/^[+]?(?:\d|\()[\d\s().-]*\d$/u.test(input) || input.indexOf('+') > 0) return '';

  const digits = input.replace(/\D/g, '');
  if (!digits) return '';

  let nationalNumber = digits;
  if (nationalNumber.startsWith('00')) {
    if (!nationalNumber.startsWith('0090')) return '';
    nationalNumber = nationalNumber.slice(4);
  } else if (nationalNumber.startsWith('90')) {
    nationalNumber = nationalNumber.slice(2);
  } else if (nationalNumber.startsWith('0')) {
    nationalNumber = nationalNumber.slice(1);
  }

  if (!/^5\d{9}$/u.test(nationalNumber) || isObviousFakeMobile(nationalNumber)) return '';
  return `90${nationalNumber}`;
};

const normalizeBlockedPhone = (value: string) => {
  return normalizeTurkishMobilePhone(value);
};

const publicAppointment = (appointment: StoredAppointment) => {
  const { fingerprint, ip, deviceId, lockExpiresAt, customerPhone, ...safeAppointment } = appointment;
  return safeAppointment;
};

const mockExecuteOrQuery = async (sql: string, params: any[] = []): Promise<[any, any]> => {
  const normalizedSql = sql.replace(/\s+/g, ' ').trim().toLowerCase();

  if (normalizedSql.startsWith('select 1')) {
    return [[{ '1': 1 }], []];
  }

  if (normalizedSql.includes('select username from admin_sessions')) {
    const tokenHash = params[0];
    const session = mockAdminSessions.get(tokenHash);
    if (session && new Date(session.expires_at) > new Date()) {
      return [[{ username: session.username }], []];
    }
    return [[], []];
  }

  if (normalizedSql.includes('insert into admin_sessions')) {
    const tokenHash = params[0];
    const username = params[1];
    mockAdminSessions.set(tokenHash, {
      token_hash: tokenHash,
      username,
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000)
    });
    return [{ affectedRows: 1 }, []];
  }

  if (normalizedSql.includes('delete from admin_sessions')) {
    const tokenHash = params[0];
    mockAdminSessions.delete(tokenHash);
    return [{ affectedRows: 1 }, []];
  }

  if (normalizedSql.includes('select username, password_hash, password_salt, password_iterations from admin_users')) {
    const username = params[0];
    const user = mockAdminUsers.get(username);
    if (user) {
      return [[{
        username: user.username,
        password_hash: user.password_hash,
        password_salt: user.password_salt,
        password_iterations: user.password_iterations
      }], []];
    }
    return [[], []];
  }

  if (normalizedSql.includes('update admin_users set password_hash')) {
    const hash = params[0];
    const salt = params[1];
    const iterations = params[2];
    const username = params[3];
    const user = mockAdminUsers.get(username);
    if (user) {
      mockAdminUsers.set(username, {
        username,
        password_hash: hash,
        password_salt: salt,
        password_iterations: iterations
      });
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  if (normalizedSql.includes('select phone from blocked_phones')) {
    const rows = Array.from(mockBlockedPhones).map(phone => ({ phone }));
    return [rows, []];
  }

  if (normalizedSql.includes('insert ignore into blocked_phones') || normalizedSql.includes('insert into blocked_phones')) {
    const phone = params[0];
    mockBlockedPhones.add(phone);
    return [{ affectedRows: 1 }, []];
  }

  if (normalizedSql.includes('delete from blocked_phones')) {
    const phone = params[0];
    mockBlockedPhones.delete(phone);
    return [{ affectedRows: 1 }, []];
  }

  if (normalizedSql.includes('insert into uploaded_media')) {
    const id = params[0];
    const mime = params[1];
    const data = params[2];
    mockUploadedMedia.set(id, { mime_type: mime, media_data: data });
    return [{ affectedRows: 1 }, []];
  }

  if (normalizedSql.includes('select mime_type, media_data from uploaded_media')) {
    const id = params[0];
    const media = mockUploadedMedia.get(id);
    if (media) {
      return [[{ mime_type: media.mime_type, media_data: media.media_data }], []];
    }
    return [[], []];
  }

  if (normalizedSql.includes('select setting_value from app_settings')) {
    const key = params[0];
    const val = mockAppSettings.get(key);
    if (val !== undefined) {
      return [[{ setting_value: val }], []];
    }
    return [[], []];
  }

  if (normalizedSql.includes('insert into app_settings') || normalizedSql.includes('update app_settings')) {
    const key = params[0];
    const val = params[1];
    mockAppSettings.set(key, val);
    return [{ affectedRows: 1 }, []];
  }

  if (normalizedSql.includes('select id from blocked_phones')) {
    const phone = params[0];
    if (mockBlockedPhones.has(phone)) {
      return [[{ id: 1 }], []];
    }
    return [[], []];
  }

  if (normalizedSql.includes('select * from appointments') && normalizedSql.includes('tracking_code = ?')) {
    const code = params[0];
    const appt = store.appointments.find(a => a.trackingCode === code);
    if (appt) {
      const dbRow = {
        id: appt.id,
        tracking_code: appt.trackingCode,
        customer_name: appt.customerName,
        customer_phone: appt.customerPhone || null,
        customer_email: appt.customerEmail || null,
        services_json: JSON.stringify(appt.services),
        stylist_json: JSON.stringify(appt.stylist),
        appointment_date: appt.date,
        time_slot: appt.timeSlot,
        total_price: appt.totalPrice,
        price_note: appt.priceNote || null,
        status: appt.status,
        notes: appt.notes || null,
        created_at: appt.createdAt,
        fingerprint: appt.fingerprint,
        ip: appt.ip,
        device_id: appt.deviceId,
        lock_expires_at: appt.lockExpiresAt
      };
      return [[dbRow], []];
    }
    return [[], []];
  }

  if (normalizedSql.includes('select * from appointments')) {
    const rows = store.appointments.map(appt => ({
      id: appt.id,
      tracking_code: appt.trackingCode,
      customer_name: appt.customerName,
      customer_phone: appt.customerPhone || null,
      customer_email: appt.customerEmail || null,
      services_json: JSON.stringify(appt.services),
      stylist_json: JSON.stringify(appt.stylist),
      appointment_date: appt.date,
      time_slot: appt.timeSlot,
      total_price: appt.totalPrice,
      price_note: appt.priceNote || null,
      status: appt.status,
      notes: appt.notes || null,
      created_at: appt.createdAt,
      fingerprint: appt.fingerprint,
      ip: appt.ip,
      device_id: appt.deviceId,
      lock_expires_at: appt.lockExpiresAt
    }));
    return [rows, []];
  }

  if (normalizedSql.includes('select timestamp_ms, ip, device_id from rate_events')) {
    const rows = store.rateEvents.map(event => ({
      timestamp_ms: event.timestamp,
      ip: event.ip,
      device_id: event.deviceId
    }));
    return [rows, []];
  }

  if (normalizedSql.startsWith('create table')) {
    return [{}, []];
  }

  console.warn('[AI Studio Mock SQL] Unhandled query:', sql, params);
  return [[], []];
};

const mockPool = {
  query: async (sql: string, params?: any[]) => {
    return mockExecuteOrQuery(sql, params);
  },
  execute: async (sql: string, params?: any[]) => {
    return mockExecuteOrQuery(sql, params);
  },
  getConnection: async () => {
    return {
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {},
      query: async (sql: string, params?: any[]) => {
        return mockExecuteOrQuery(sql, params);
      },
      execute: async (sql: string, params?: any[]) => {
        return mockExecuteOrQuery(sql, params);
      }
    };
  }
};

const checkDbConfig = () => {
  const host = process.env.DB_HOST || process.env.MYSQL_HOST;
  const user = process.env.DB_USER || process.env.MYSQL_USER;
  const database = process.env.DB_NAME || process.env.MYSQL_DATABASE;
  return !!(host && user && database);
};

const getDbConfig = () => {
  const host = process.env.DB_HOST || process.env.MYSQL_HOST;
  const user = process.env.DB_USER || process.env.MYSQL_USER;
  const password = process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD;
  const database = process.env.DB_NAME || process.env.MYSQL_DATABASE;
  if (!host || !user || !database) {
    throw new Error('DB_HOST, DB_USER ve DB_NAME ortam değişkenleri zorunludur.');
  }
  return {
    host,
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    charset: 'utf8mb4',
    timezone: 'Z'
  };
};

const getPool = () => {
  if (isMockMode) {
    return mockPool as unknown as Pool;
  }
  if (!pool) {
    if (!checkDbConfig()) {
      console.warn('[AI Studio] DB configuration missing, activating mock mode');
      isMockMode = true;
      return mockPool as unknown as Pool;
    }
    try {
      pool = mysql.createPool(getDbConfig());
    } catch (e) {
      console.warn('[AI Studio] Failed to initialize DB pool, activating mock mode:', e);
      isMockMode = true;
      return mockPool as unknown as Pool;
    }
  }
  return pool;
};

const ensureSchema = async () => {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      tracking_code VARCHAR(64) NOT NULL UNIQUE,
      customer_name VARCHAR(100) NOT NULL,
      customer_phone VARCHAR(32) NULL,
      customer_email VARCHAR(160) NULL,
      services_json LONGTEXT NOT NULL,
      stylist_json LONGTEXT NOT NULL,
      appointment_date DATE NOT NULL,
      time_slot VARCHAR(5) NOT NULL,
      total_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
      price_note VARCHAR(160) NULL,
      status VARCHAR(16) NOT NULL,
      notes VARCHAR(500) NULL,
      created_at DATETIME(3) NOT NULL,
      fingerprint CHAR(64) NOT NULL,
      ip VARCHAR(64) NOT NULL,
      device_id CHAR(32) NOT NULL,
      lock_expires_at BIGINT NOT NULL,
      KEY idx_appointment_slot (appointment_date, time_slot, status),
      KEY idx_appointment_created (created_at),
      KEY idx_appointment_fingerprint (fingerprint),
      KEY idx_appointment_limits (ip, device_id, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS rate_events (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      timestamp_ms BIGINT NOT NULL,
      ip VARCHAR(64) NOT NULL,
      device_id CHAR(32) NOT NULL,
      KEY idx_rate_timestamp (timestamp_ms),
      KEY idx_rate_ip_device (ip, device_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(80) NOT NULL UNIQUE,
      password_hash VARCHAR(128) NOT NULL,
      password_salt VARCHAR(64) NOT NULL,
      password_iterations INT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash CHAR(64) NOT NULL PRIMARY KEY,
      username VARCHAR(80) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL,
      KEY idx_session_expiry (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS blocked_phones (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      phone VARCHAR(24) NOT NULL UNIQUE,
      created_by VARCHAR(80) NOT NULL,
      created_at DATETIME NOT NULL,
      KEY idx_blocked_phone_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS uploaded_media (
      id CHAR(32) NOT NULL PRIMARY KEY,
      mime_type VARCHAR(32) NOT NULL,
      media_data MEDIUMBLOB NOT NULL,
      created_by VARCHAR(80) NOT NULL,
      created_at DATETIME NOT NULL,
      KEY idx_uploaded_media_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      setting_key VARCHAR(64) NOT NULL PRIMARY KEY,
      setting_value LONGTEXT NOT NULL,
      updated_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

const serialiseJson = (value: unknown) => JSON.stringify(value);
const parseJson = (value: unknown, fallback: unknown) => {
  try {
    return typeof value === 'string' ? JSON.parse(value) : value ?? fallback;
  } catch {
    return fallback;
  }
};

const rowToAppointment = (row: DbRow): StoredAppointment => ({
  id: String(row.id),
  trackingCode: String(row.tracking_code),
  customerName: String(row.customer_name),
  ...(row.customer_phone ? { customerPhone: String(row.customer_phone) } : {}),
  ...(row.customer_email ? { customerEmail: String(row.customer_email) } : {}),
  services: parseJson(row.services_json, []),
  stylist: parseJson(row.stylist_json, {}),
  date: String(row.appointment_date).slice(0, 10),
  timeSlot: String(row.time_slot),
  totalPrice: Number(row.total_price) || 0,
  ...(row.price_note ? { priceNote: String(row.price_note) } : {}),
  status: String(row.status) as StoredAppointment['status'],
  ...(row.notes ? { notes: String(row.notes) } : {}),
  createdAt: new Date(String(row.created_at)).toISOString(),
  fingerprint: String(row.fingerprint),
  ip: String(row.ip),
  deviceId: String(row.device_id),
  lockExpiresAt: Number(row.lock_expires_at)
});

const saveStore = async () => {
  if (isMockMode) {
    try {
      const fs = await import('node:fs/promises');
      await fs.writeFile('./appointments_mock.json', JSON.stringify({
        store,
        blockedPhones: Array.from(mockBlockedPhones),
        adminUsers: Array.from(mockAdminUsers.entries()),
        adminSessions: Array.from(mockAdminSessions.entries()),
        uploadedMedia: Array.from(mockUploadedMedia.entries()).map(([k, v]) => [k, { mime_type: v.mime_type, media_data: v.media_data.toString('base64') }]),
        appSettings: Array.from(mockAppSettings.entries())
      }, null, 2));
    } catch (e) {
      console.warn('Failed to save mock store:', e);
    }
    return;
  }
  const db = getPool();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM appointments');
    for (const appointment of store.appointments) {
      await connection.execute(
        `INSERT INTO appointments
          (id, tracking_code, customer_name, customer_phone, customer_email, services_json, stylist_json,
           appointment_date, time_slot, total_price, price_note, status, notes, created_at, fingerprint, ip, device_id, lock_expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          appointment.id,
          appointment.trackingCode,
          appointment.customerName,
          appointment.customerPhone || null,
          appointment.customerEmail || null,
          serialiseJson(appointment.services),
          serialiseJson(appointment.stylist),
          appointment.date,
          appointment.timeSlot,
          appointment.totalPrice,
          appointment.priceNote || null,
          appointment.status,
          appointment.notes || null,
          new Date(appointment.createdAt),
          appointment.fingerprint,
          appointment.ip,
          appointment.deviceId,
          appointment.lockExpiresAt
        ]
      );
    }
    await connection.query('DELETE FROM rate_events');
    for (const event of store.rateEvents) {
      await connection.execute(
        'INSERT INTO rate_events (timestamp_ms, ip, device_id) VALUES (?, ?, ?)',
        [event.timestamp, event.ip, event.deviceId]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const loadStore = async () => {
  if (isMockMode) {
    try {
      const fs = await import('node:fs/promises');
      const data = await fs.readFile('./appointments_mock.json', 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.store) store = parsed.store;
      if (Array.isArray(parsed.blockedPhones)) {
        mockBlockedPhones.clear();
        parsed.blockedPhones.forEach((p: string) => mockBlockedPhones.add(p));
      }
      if (parsed.adminUsers) {
        mockAdminUsers = new Map(parsed.adminUsers);
      }
      if (parsed.adminSessions) {
        mockAdminSessions = new Map(parsed.adminSessions.map(([k, v]: any) => [k, { ...v, expires_at: new Date(v.expires_at) }]));
      }
      if (parsed.uploadedMedia) {
        mockUploadedMedia.clear();
        for (const [k, v] of parsed.uploadedMedia) {
          mockUploadedMedia.set(k, { mime_type: v.mime_type, media_data: Buffer.from(v.media_data, 'base64') });
        }
      }
      if (parsed.appSettings) {
        mockAppSettings = new Map(parsed.appSettings);
      }
    } catch {
      // ignore if file doesn't exist yet
    }
    return;
  }
  const db = getPool();
  const [appointmentRows] = await db.query<DbRow[]>('SELECT * FROM appointments ORDER BY created_at DESC');
  const [rateRows] = await db.query<DbRow[]>('SELECT timestamp_ms, ip, device_id FROM rate_events');
  store = {
    appointments: appointmentRows.map(rowToAppointment),
    rateEvents: rateRows.map((row) => ({
      timestamp: Number(row.timestamp_ms),
      ip: String(row.ip),
      deviceId: String(row.device_id)
    }))
  };
};

const serialise = <T>(operation: () => Promise<T>): Promise<T> => {
  const next = writeQueue.then(operation, operation);
  writeQueue = next.then(() => undefined, () => undefined);
  return next;
};

const cleanup = (now: number) => {
  const beforeAppointments = store.appointments.length;
  const beforeEvents = store.rateEvents.length;
  store.appointments = store.appointments.filter(
    (appointment) =>
      appointment.status !== 'pending' ||
      appointment.lockExpiresAt > now ||
      now - Date.parse(appointment.createdAt) < 24 * 60 * 60 * 1000
  );
  store.rateEvents = store.rateEvents.filter((event) => now - event.timestamp < RATE_WINDOW_MS);
  return beforeAppointments !== store.appointments.length || beforeEvents !== store.rateEvents.length;
};

const hashPassword = (password: string, salt: string, iterations: number) =>
  crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), iterations, 64, 'sha512').toString('hex');

const createPasswordRecord = (password: string) => {
  const salt = crypto.randomBytes(32).toString('hex');
  const iterations = 210_000;
  return { salt, iterations, hash: hashPassword(password, salt, iterations) };
};

const hashSessionToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const setSessionCookie = (res: Response, token: string) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `kuafor_admin_session=${encodeURIComponent(token)}; Max-Age=${SESSION_MAX_AGE_MS / 1000}; Path=/; HttpOnly; SameSite=Lax${secure}`
  );
};

const clearSessionCookie = (res: Response) => {
  res.setHeader('Set-Cookie', 'kuafor_admin_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');
};

const currentAdmin = async (req: Request) => {
  const token = parseCookies(req.headers.cookie).kuafor_admin_session;
  if (!token) return null;
  const [rows] = await getPool().execute<DbRow[]>(
    'SELECT username FROM admin_sessions WHERE token_hash = ? AND expires_at > UTC_TIMESTAMP() LIMIT 1',
    [hashSessionToken(token)]
  );
  return rows[0] ? String(rows[0].username) : null;
};

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const username = await currentAdmin(req);
    if (!username) return jsonError(res, 401, 'Yönetici oturumu geçersiz veya süresi dolmuş.');
    res.locals.adminUsername = username;
    return next();
  } catch (error) {
    return next(error);
  }
};

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true');
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json({ limit: '20mb', strict: true }));

app.get('/api/health', async (_, res) => {
  try {
    await getPool().query('SELECT 1');
    return res.json({ ok: true, database: 'mysql' });
  } catch {
    return jsonError(res, 503, 'Veritabanı bağlantısı kullanılamıyor.');
  }
});

app.post('/api/admin/login', async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    const now = Date.now();
    const attempt = loginAttempts.get(ip);
    if (attempt && attempt.resetAt > now && attempt.count >= 8) {
      return jsonError(res, 429, 'Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin.', 300);
    }
    if (!isRecord(req.body) || typeof req.body.username !== 'string' || typeof req.body.password !== 'string') {
      return jsonError(res, 400, 'Kullanıcı adı ve şifre gereklidir.');
    }
    const username = req.body.username.trim().slice(0, 80);
    const password = req.body.password;
    const [rows] = await getPool().execute<DbRow[]>(
      'SELECT username, password_hash, password_salt, password_iterations FROM admin_users WHERE username = ? LIMIT 1',
      [username]
    );
    const user = rows[0];
    const valid = Boolean(
      user &&
      hashPassword(password, String(user.password_salt), Number(user.password_iterations)) === String(user.password_hash)
    );
    if (!valid) {
      loginAttempts.set(ip, { count: (attempt?.resetAt > now ? attempt.count : 0) + 1, resetAt: now + 15 * 60 * 1000 });
      return jsonError(res, 401, 'Hatalı kullanıcı adı veya şifre.');
    }
    loginAttempts.delete(ip);
    const token = crypto.randomBytes(32).toString('hex');
    await getPool().execute(
      'INSERT INTO admin_sessions (token_hash, username, expires_at, created_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 8 HOUR), UTC_TIMESTAMP())',
      [hashSessionToken(token), username]
    );
    setSessionCookie(res, token);
    return res.json({ ok: true, username });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/admin/session', requireAdmin, (req, res) =>
  res.json({ ok: true, username: res.locals.adminUsername })
);

app.post('/api/admin/logout', async (req, res, next) => {
  try {
    const token = parseCookies(req.headers.cookie).kuafor_admin_session;
    if (token) await getPool().execute('DELETE FROM admin_sessions WHERE token_hash = ?', [hashSessionToken(token)]);
    clearSessionCookie(res);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/password', requireAdmin, async (req, res, next) => {
  try {
    if (!isRecord(req.body) || typeof req.body.currentPassword !== 'string' || typeof req.body.nextPassword !== 'string') {
      return jsonError(res, 400, 'Mevcut ve yeni şifre gereklidir.');
    }
    const nextPassword = req.body.nextPassword.trim();
    if (nextPassword.length < 12 || nextPassword.length > 200) {
      return jsonError(res, 400, 'Yeni şifre en az 12 karakter olmalıdır.');
    }
    const username = String(res.locals.adminUsername);
    const [rows] = await getPool().execute<DbRow[]>(
      'SELECT password_hash, password_salt, password_iterations FROM admin_users WHERE username = ? LIMIT 1',
      [username]
    );
    const user = rows[0];
    if (!user || hashPassword(req.body.currentPassword, String(user.password_salt), Number(user.password_iterations)) !== String(user.password_hash)) {
      return jsonError(res, 401, 'Mevcut şifre hatalı.');
    }
    const password = createPasswordRecord(nextPassword);
    await getPool().execute(
      'UPDATE admin_users SET password_hash = ?, password_salt = ?, password_iterations = ?, updated_at = UTC_TIMESTAMP() WHERE username = ?',
      [password.hash, password.salt, password.iterations, username]
    );
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

const getBlockedPhones = async () => {
  const [rows] = await getPool().query<DbRow[]>('SELECT phone FROM blocked_phones ORDER BY created_at DESC, id DESC');
  return rows.map((row) => String(row.phone));
};

app.get('/api/admin/blocked-phones', requireAdmin, async (_, res, next) => {
  try {
    return res.json({ ok: true, blockedPhones: await getBlockedPhones() });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/blocked-phones', requireAdmin, async (req, res, next) => {
  try {
    const phone = isRecord(req.body) && typeof req.body.phone === 'string'
      ? normalizeBlockedPhone(req.body.phone)
      : '';
    if (phone.length < 10 || phone.length > 24) return jsonError(res, 400, 'Geçerli bir telefon numarası gereklidir.');
    await getPool().execute(
      'INSERT IGNORE INTO blocked_phones (phone, created_by, created_at) VALUES (?, ?, UTC_TIMESTAMP())',
      [phone, String(res.locals.adminUsername)]
    );
    return res.status(201).json({ ok: true, blockedPhones: await getBlockedPhones() });
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/admin/blocked-phones/:phone', requireAdmin, async (req, res, next) => {
  try {
    const phone = normalizeBlockedPhone(req.params.phone);
    if (phone.length < 10 || phone.length > 24) return jsonError(res, 400, 'Geçerli bir telefon numarası gereklidir.');
    await getPool().execute('DELETE FROM blocked_phones WHERE phone = ?', [phone]);
    return res.json({ ok: true, blockedPhones: await getBlockedPhones() });
  } catch (error) {
    return next(error);
  }
});

app.put('/api/admin/blocked-phones', requireAdmin, async (req, res, next) => {
  try {
    if (!isRecord(req.body) || !Array.isArray(req.body.blockedPhones) || req.body.blockedPhones.length > 500) {
      return jsonError(res, 400, 'Engellenen telefon listesi geçersiz.');
    }
    const phones = [...new Set(req.body.blockedPhones
      .filter((phone): phone is string => typeof phone === 'string')
      .map(normalizeBlockedPhone)
      .filter((phone) => phone.length >= 10 && phone.length <= 24))];
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM blocked_phones');
      for (const phone of phones) {
        await connection.execute(
          'INSERT INTO blocked_phones (phone, created_by, created_at) VALUES (?, ?, UTC_TIMESTAMP())',
          [phone, String(res.locals.adminUsername)]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return res.json({ ok: true, blockedPhones: await getBlockedPhones() });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/media', requireAdmin, async (req, res, next) => {
  try {
    if (!isRecord(req.body) || typeof req.body.dataUrl !== 'string') {
      return jsonError(res, 400, 'Geçerli bir görsel gönderilmedi.');
    }

    const match = req.body.dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif)|video\/(?:mp4|webm|ogg));base64,([A-Za-z0-9+/=\s]+)$/u);
    if (!match) return jsonError(res, 400, 'JPG, PNG, WEBP, GIF, MP4, WEBM veya OGG dosyası yükleyebilirsiniz.');

    const data = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
    if (!data.length || data.length > 15 * 1024 * 1024) {
      return jsonError(res, 400, 'Görsel veya video 15MB üzerinde olmamalıdır.');
    }

    const id = crypto.randomBytes(16).toString('hex');
    await getPool().execute(
      'INSERT INTO uploaded_media (id, mime_type, media_data, created_by, created_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP())',
      [id, match[1], data, String(res.locals.adminUsername)]
    );
    return res.status(201).json({ ok: true, url: `/api/media/${id}` });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/media/:id', async (req, res, next) => {
  try {
    if (!/^[a-f0-9]{32}$/u.test(req.params.id)) return jsonError(res, 404, 'Görsel bulunamadı.');
    const [rows] = await getPool().execute<DbRow[]>(
      'SELECT mime_type, media_data FROM uploaded_media WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    if (!rows[0] || !Buffer.isBuffer(rows[0].media_data)) return jsonError(res, 404, 'Görsel bulunamadı.');
    res.setHeader('Content-Type', String(rows[0].mime_type));
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(rows[0].media_data);
  } catch (error) {
    return next(error);
  }
});

app.get('/api/settings/:key', async (req, res, next) => {
  try {
    const key = String(req.params.key).slice(0, 64);
    const [rows] = await getPool().execute<DbRow[]>(
      'SELECT setting_value FROM app_settings WHERE setting_key = ? LIMIT 1',
      [key]
    );
    if (!rows[0]) {
      return res.json({ ok: true, value: null });
    }
    const val = parseJson(rows[0].setting_value, null);
    return res.json({ ok: true, value: val });
  } catch (error) {
    return next(error);
  }
});

app.put('/api/settings/:key', requireAdmin, async (req, res, next) => {
  try {
    const key = String(req.params.key).slice(0, 64);
    if (!isRecord(req.body) || req.body.value === undefined) {
      return jsonError(res, 400, 'Geçerli bir değer gönderilmedi.');
    }
    const serialized = serialiseJson(req.body.value);
    await getPool().execute(
      'INSERT INTO app_settings (setting_key, setting_value, updated_at) VALUES (?, ?, UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = UTC_TIMESTAMP()',
      [key, serialized]
    );
    await serialise(async () => saveStore());
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/admin/appointments', requireAdmin, async (_, res, next) => {
  try {
    await serialise(async () => loadStore());
    return res.json({ ok: true, appointments: store.appointments });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/appointments/:trackingCode', async (req, res, next) => {
  try {
    const code = text(req.params.trackingCode, 64).toUpperCase();
    const [rows] = await getPool().execute<DbRow[]>(
      'SELECT * FROM appointments WHERE tracking_code = ? LIMIT 1',
      [code]
    );
    if (!rows[0]) return jsonError(res, 404, 'Randevu bulunamadı.');
    return res.json({ ok: true, appointment: publicAppointment(rowToAppointment(rows[0])) });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/appointments', async (req, res, next) => {
  const deviceId = getDeviceId(req, res);
  const ip = getClientIp(req);
  try {
    const result = await serialise(async () => {
      const now = Date.now();
      const wasCleaned = cleanup(now);
      const ipRequests = store.rateEvents.filter((event) => event.ip === ip).length;
      const deviceRequests = store.rateEvents.filter((event) => event.deviceId === deviceId).length;
      if (ipRequests >= MAX_REQUESTS_PER_HOUR || deviceRequests >= MAX_REQUESTS_PER_HOUR) {
        await saveStore();
        return { error: [429, 'Çok kısa sürede fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.', 60] as const };
      }
      store.rateEvents.push({ timestamp: now, ip, deviceId });
      if (!isRecord(req.body)) return { error: [400, 'Geçersiz randevu verisi gönderildi.'] as const };
      const body = req.body;
      if (typeof body.website === 'string' && body.website.trim()) return { error: [400, 'Randevu formu doğrulanamadı.'] as const };
      if (
        typeof body.clientStartedAt !== 'number' ||
        !Number.isFinite(body.clientStartedAt) ||
        now - body.clientStartedAt < MIN_FORM_TIME_MS ||
        now - body.clientStartedAt > MAX_FORM_TIME_MS
      ) return { error: [400, 'Formu göndermeden önce lütfen birkaç saniye bekleyin.'] as const };

      const customerName = text(body.customerName, 100);
      if (typeof body.customerPhone !== 'string' || !body.customerPhone.trim()) {
        return { error: [400, 'Telefon numarası zorunludur.'] as const };
      }
      const rawCustomerPhone = text(body.customerPhone, 32);
      const customerPhone = normalizeTurkishMobilePhone(rawCustomerPhone);
      if (!customerPhone) {
        return { error: [400, '05xx xxx xx xx biçiminde geçerli bir cep telefonu girin.'] as const };
      }
      const customerEmail = text(body.customerEmail, 160).toLocaleLowerCase('tr-TR');
      const date = text(body.date, 10);
      const timeSlot = text(body.timeSlot, 5);
      const notes = text(body.notes, 500);
      const stylist = isRecord(body.stylist) ? body.stylist : null;
      const services = Array.isArray(body.services) ? body.services : [];
      if (
        customerName.length < 3 || !date || !timeSlot || !stylist ||
        services.length < 1 || services.length > 8 ||
        (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(customerEmail)) ||
        !/^[\p{L}\s.'-]+$/u.test(customerName) || !validDate(date) ||
        !/^(?:[0-1]\d|2[0-3]):[0-5]\d$/u.test(timeSlot)
      ) return { error: [400, 'Lütfen ad, telefon, hizmet, uzman, tarih ve saat bilgilerini kontrol edin.'] as const };

      const selectedDate = Date.parse(`${date}T00:00:00.000Z`);
      const today = Date.parse(new Date(now).toISOString().slice(0, 10) + 'T00:00:00.000Z');
      if (selectedDate <= today || selectedDate > today + 90 * 24 * 60 * 60 * 1000) {
        return { error: [400, 'Lütfen önümüzdeki 90 gün içinden geçerli bir tarih seçin.'] as const };
      }
      const safeServices = services.map((service) => {
        if (!isRecord(service)) return null;
        const id = text(service.id, 80);
        const name = text(service.name, 120);
        const duration = Number(service.duration);
        const price = Number(service.price);
        if (!id || !name || !Number.isFinite(duration) || duration < 5 || duration > 1_440 || !Number.isFinite(price) || price < 0 || price > 1_000_000) return null;
        return { id, name, duration: Math.round(duration), price: Math.round(price), category: text(service.category, 40), priceType: text(service.priceType, 20), customPriceText: text(service.customPriceText, 100) };
      });
      const stylistId = text(stylist.id, 80);
      const stylistName = text(stylist.name, 120);
      if (safeServices.some((service) => !service) || !stylistId || !stylistName) return { error: [400, 'Seçilen hizmet veya uzman bilgisi geçersiz.'] as const };
      const blockedRows = await getPool().execute<DbRow[]>(
        'SELECT id FROM blocked_phones WHERE phone = ? LIMIT 1',
        [normalizeBlockedPhone(customerPhone)]
      );
      if (blockedRows[0].length > 0) return { error: [403, 'Bu telefon numarası engellendi. Lütfen farklı bir iletişim bilgisi kullanın.'] as const };

      const dayStart = today;
      const dailyAppointments = store.appointments.filter((appointment) => appointment.status !== 'cancelled' && Date.parse(appointment.createdAt) >= dayStart);
      if (dailyAppointments.filter((appointment) => appointment.ip === ip).length >= MAX_DAILY_PER_IP || dailyAppointments.filter((appointment) => appointment.deviceId === deviceId).length >= MAX_DAILY_PER_DEVICE) {
        return { error: [429, 'Günlük randevu limitine ulaştınız. Değişiklik için salonumuzla iletişime geçebilirsiniz.'] as const };
      }
      const pendingAppointments = dailyAppointments.filter((appointment) => appointment.status === 'pending' && appointment.lockExpiresAt > now);
      if (pendingAppointments.filter((appointment) => appointment.ip === ip).length >= MAX_PENDING_PER_IP || pendingAppointments.filter((appointment) => appointment.deviceId === deviceId).length >= MAX_PENDING_PER_DEVICE) {
        return { error: [429, 'Aktif bir randevu talebiniz zaten bekliyor. Yeni talep için mevcut talebin sonuçlanmasını bekleyin.'] as const };
      }
      const phoneHash = crypto.createHash('sha256').update(normalise(customerPhone)).digest('hex');
      const fingerprint = crypto.createHash('sha256').update([normalise(customerName), normalise(customerEmail), date, timeSlot, stylistId].join('|')).digest('hex');
      if (store.appointments.some((appointment) => appointment.customerPhone && crypto.createHash('sha256').update(normalise(normalizeTurkishMobilePhone(appointment.customerPhone))).digest('hex') === phoneHash && ['pending', 'approved'].includes(appointment.status))) {
        return { error: [409, 'Aynı telefon numarasından birden fazla aktif randevu talebi oluşturulamaz.'] as const };
      }
      if (store.appointments.some((appointment) => appointment.fingerprint === fingerprint && appointment.status !== 'cancelled')) return { error: [409, 'Bu bilgilerle aynı tarih ve saat için zaten bir randevu talebiniz var.'] as const };
      if (store.appointments.some((appointment) => appointment.status !== 'cancelled' && appointment.date === date && appointment.timeSlot === timeSlot && isRecord(appointment.stylist) && text(appointment.stylist.id, 80) === stylistId && (appointment.status !== 'pending' || appointment.lockExpiresAt > now))) {
        return { error: [409, 'Seçtiğiniz saat az önce başkası tarafından alındı. Lütfen başka bir saat seçin.'] as const };
      }
      const trackingCode = `BK-${crypto.randomInt(1000, 10000)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      const appointment: StoredAppointment = {
        id: trackingCode, trackingCode, customerName, customerPhone,
        ...(customerEmail ? { customerEmail } : {}),
        services: safeServices as unknown[],
        stylist: { id: stylistId, name: stylistName, role: text(stylist.role, 120), avatar: text(stylist.avatar, 500), rating: Number(stylist.rating) || 0, reviewsCount: Number(stylist.reviewsCount) || 0 },
        date, timeSlot,
        totalPrice: (safeServices as Array<{ price: number }>).reduce((total, service) => total + service.price, 0),
        ...(safeServices.some((service) => isRecord(service) && service.priceType === 'free') ? { priceNote: 'Esnek / Serbest Tarife İşlemi İçerir' } : {}),
        status: 'pending', ...(notes ? { notes } : {}), createdAt: new Date(now).toISOString(),
        fingerprint, ip, deviceId, lockExpiresAt: now + PENDING_LOCK_MS
      };
      store.appointments.unshift(appointment);
      await saveStore();
      return { appointment: publicAppointment(appointment), cleaned: wasCleaned };
    });
    if ('error' in result) {
      await serialise(saveStore);
      return jsonError(res, result.error[0], result.error[1], result.error[2]);
    }
    return res.status(201).json({ ok: true, appointment: result.appointment });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/appointments/:trackingCode/cancel', async (req, res, next) => {
  try {
    const code = text(req.params.trackingCode, 64).toUpperCase();
    const result = await serialise(async () => {
      const appointment = store.appointments.find((item) => item.trackingCode === code);
      if (!appointment) return false;
      if (appointment.status === 'pending') {
        appointment.status = 'cancelled';
        await saveStore();
      }
      return true;
    });
    return result ? res.json({ ok: true }) : jsonError(res, 404, 'Randevu bulunamadı.');
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/appointments', requireAdmin, async (req, res, next) => {
  try {
    if (!isRecord(req.body) || typeof req.body.customerName !== 'string' || typeof req.body.date !== 'string' || typeof req.body.timeSlot !== 'string') {
      return jsonError(res, 400, 'Geçersiz randevu verisi.');
    }
    const body = req.body;
    const appointment = await serialise(async () => {
      const now = Date.now();
      const trackingCode = text(body.trackingCode || body.id, 64) || `BK-${crypto.randomInt(1000, 10000)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      const value: StoredAppointment = {
        id: trackingCode, trackingCode, customerName: text(body.customerName, 100),
        ...(text(body.customerPhone, 32) ? { customerPhone: normalizePhone(text(body.customerPhone, 32)) } : {}),
        ...(text(body.customerEmail, 160) ? { customerEmail: text(body.customerEmail, 160) } : {}),
        services: Array.isArray(body.services) ? body.services.slice(0, 8) : [],
        stylist: isRecord(body.stylist) ? body.stylist : {},
        date: text(body.date, 10), timeSlot: text(body.timeSlot, 5), totalPrice: Number(body.totalPrice) || 0,
        ...(text(body.priceNote, 160) ? { priceNote: text(body.priceNote, 160) } : {}),
        status: ['pending', 'approved', 'completed', 'cancelled'].includes(String(body.status)) ? String(body.status) as StoredAppointment['status'] : 'approved',
        ...(text(body.notes, 500) ? { notes: text(body.notes, 500) } : {}),
        createdAt: new Date(now).toISOString(), fingerprint: crypto.randomBytes(32).toString('hex'), ip: 'admin', deviceId: 'admin', lockExpiresAt: 0
      };
      store.appointments.unshift(value);
      await saveStore();
      return value;
    });
    return res.status(201).json({ ok: true, appointment });
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/admin/appointments/:id', requireAdmin, async (req, res, next) => {
  try {
    const updated = await serialise(async () => {
      const appointment = store.appointments.find((item) => item.id === req.params.id || item.trackingCode === req.params.id);
      if (!appointment || !isRecord(req.body)) return null;
      const body = req.body;
      if (typeof body.status === 'string' && ['pending', 'approved', 'completed', 'cancelled'].includes(body.status)) appointment.status = body.status as StoredAppointment['status'];
      if (typeof body.customerName === 'string') appointment.customerName = text(body.customerName, 100);
      if (typeof body.customerPhone === 'string') appointment.customerPhone = normalizePhone(text(body.customerPhone, 32));
      if (typeof body.date === 'string' && validDate(body.date)) appointment.date = body.date;
      if (typeof body.timeSlot === 'string' && /^(?:[0-1]\d|2[0-3]):[0-5]\d$/u.test(body.timeSlot)) appointment.timeSlot = body.timeSlot;
      if (typeof body.notes === 'string') appointment.notes = text(body.notes, 500);
      if (Array.isArray(body.services) && body.services.length <= 8) appointment.services = body.services;
      if (isRecord(body.stylist)) appointment.stylist = body.stylist;
      if (typeof body.totalPrice === 'number' && Number.isFinite(body.totalPrice) && body.totalPrice >= 0) appointment.totalPrice = body.totalPrice;
      if (typeof body.priceNote === 'string') appointment.priceNote = text(body.priceNote, 160);
      await saveStore();
      return appointment;
    });
    return updated ? res.json({ ok: true, appointment: updated }) : jsonError(res, 404, 'Randevu bulunamadı.');
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/admin/appointments/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await serialise(async () => {
      const before = store.appointments.length;
      store.appointments = store.appointments.filter((item) => item.id !== req.params.id && item.trackingCode !== req.params.id);
      if (before !== store.appointments.length) await saveStore();
      return before !== store.appointments.length;
    });
    return deleted ? res.json({ ok: true }) : jsonError(res, 404, 'Randevu bulunamadı.');
  } catch (error) {
    return next(error);
  }
});

const cleanupTimer = setInterval(() => {
  void serialise(async () => {
    if (cleanup(Date.now())) await saveStore();
  }).catch((error) => console.error('Randevu temizliği başarısız:', error));
}, 10 * 60 * 1000);
cleanupTimer.unref();

const start = async () => {
  try {
    await ensureSchema();
    await loadStore();
  } catch (error) {
    console.warn('[AI Studio] Database connection failed or is inaccessible. Falling back to Mock Mode...', error);
    isMockMode = true;
    await ensureSchema();
    await loadStore();
  }

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const staticRoot = path.join(process.cwd(), 'dist');
    app.use(express.static(staticRoot));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      return res.sendFile(path.join(staticRoot, 'index.html'));
    });
  }

  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    const status = isRecord(error) && typeof error.status === 'number' ? error.status : 500;
    if (status === 400 || status === 413) return jsonError(res, status, status === 413 ? 'Gönderilen veri çok büyük.' : 'Geçersiz veri gönderildi.');
    return next(error);
  });

  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim();
  if (process.env.ADMIN_PASSWORD) {
    if (isMockMode) {
      if (!mockAdminUsers.has(adminUsername)) {
        const password = createPasswordRecord(process.env.ADMIN_PASSWORD);
        mockAdminUsers.set(adminUsername, {
          username: adminUsername,
          password_hash: password.hash,
          password_salt: password.salt,
          password_iterations: password.iterations
        });
        await saveStore();
        console.log(`[AI Studio] Admin hesabı mock olarak oluşturuldu: ${adminUsername}`);
      }
    } else {
      const [rows] = await getPool().execute<DbRow[]>('SELECT id FROM admin_users WHERE username = ? LIMIT 1', [adminUsername]);
      if (!rows[0]) {
        const password = createPasswordRecord(process.env.ADMIN_PASSWORD);
        await getPool().execute(
          'INSERT INTO admin_users (username, password_hash, password_salt, password_iterations, created_at, updated_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())',
          [adminUsername, password.hash, password.salt, password.iterations]
        );
        console.log(`Admin hesabı oluşturuldu: ${adminUsername}`);
      }
    }
  } else {
    console.warn('ADMIN_PASSWORD tanımlı değil; yeni kurulumda admin girişi kullanılamaz.');
  }
  app.listen(port, '0.0.0.0', () => console.log(`Kuaför API http://0.0.0.0:${port} adresinde çalışıyor.`));
};

void start().catch((error) => {
  console.error('Kuaför API başlatılamadı:', error);
  process.exitCode = 1;
});
