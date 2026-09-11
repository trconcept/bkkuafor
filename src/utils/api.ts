import { Appointment } from '../types';

type ApiResponse<T> = { ok: boolean; message?: string } & T;

const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  });
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message || 'Sunucu isteği başarısız oldu.');
  }
  return payload;
};

export const loginAdmin = (username: string, password: string) =>
  request<{ ok: true; username: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

export const getAdminSession = () =>
  request<{ ok: true; username: string }>('/api/admin/session');

export const logoutAdmin = () =>
  request<{ ok: true }>('/api/admin/logout', { method: 'POST' });

export const changeAdminPassword = (currentPassword: string, nextPassword: string) =>
  request<{ ok: true }>('/api/admin/password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, nextPassword })
  });

export const getAdminBlockedPhones = () =>
  request<{ ok: true; blockedPhones: string[] }>('/api/admin/blocked-phones');

export const replaceAdminBlockedPhones = (blockedPhones: string[]) =>
  request<{ ok: true; blockedPhones: string[] }>('/api/admin/blocked-phones', {
    method: 'PUT',
    body: JSON.stringify({ blockedPhones })
  });

export const uploadAdminMedia = (dataUrl: string) =>
  request<{ ok: true; url: string }>('/api/admin/media', {
    method: 'POST',
    body: JSON.stringify({ dataUrl })
  });

export const createAppointment = (appointment: Record<string, unknown>) =>
  request<{ ok: true; appointment: Appointment }>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(appointment)
  });

export const lookupAppointment = async (trackingCode: string) => {
  const result = await request<{ ok: true; appointment: Appointment }>(
    `/api/appointments/${encodeURIComponent(trackingCode.trim().toUpperCase())}`
  );
  return [result.appointment];
};

export const cancelAppointment = (trackingCode: string) =>
  request<{ ok: true }>(`/api/appointments/${encodeURIComponent(trackingCode)}/cancel`, {
    method: 'POST'
  });

export const getAdminAppointments = () =>
  request<{ ok: true; appointments: Appointment[] }>('/api/admin/appointments');

export const createAdminAppointment = (appointment: Appointment) =>
  request<{ ok: true; appointment: Appointment }>('/api/admin/appointments', {
    method: 'POST',
    body: JSON.stringify(appointment)
  });

export const updateAdminAppointment = (id: string, appointment: Partial<Appointment>) =>
  request<{ ok: true; appointment: Appointment }>(`/api/admin/appointments/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(appointment)
  });

export const deleteAdminAppointment = (id: string) =>
  request<{ ok: true }>(`/api/admin/appointments/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
