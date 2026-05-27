import { Resident, Reservation, Payment, Holiday, PricingConfig, DashboardStats, PaginatedResponse, Notice } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: getAuthHeaders(),
    ...options,
  });
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
}

export const api = {
  dashboard: {
    getStats: (month?: string) => request<DashboardStats>(`/dashboard/stats${month ? `?month=${month}` : ''}`),
  },
  residents: {
    list: (search?: string, page = 1, limit = 20) => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', String(limit));
      return request<PaginatedResponse<Resident>>(`/residents?${params.toString()}`);
    },
    get: (id: number) => request<Resident>(`/residents/${id}`),
    create: (data: Partial<Resident>) => request<Resident>('/residents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Resident>) => request<Resident>(`/residents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/residents/${id}`, { method: 'DELETE' }),
  },
  reservations: {
    list: (month?: string, status?: string, page = 1, limit = 20) => {
      const params = new URLSearchParams();
      if (month) params.set('month', month);
      if (status) params.set('status', status);
      params.set('page', String(page));
      params.set('limit', String(limit));
      return request<PaginatedResponse<Reservation>>(`/reservations?${params.toString()}`);
    },
    get: (id: number) => request<Reservation>(`/reservations/${id}`),
    create: (data: Partial<Reservation>) => request<Reservation>('/reservations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Reservation>) => request<Reservation>(`/reservations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    cancel: (id: number) => request<Reservation>(`/reservations/${id}/cancel`, { method: 'POST' }),
  },
  payments: {
    list: (status?: string, page = 1, limit = 20) => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('page', String(page));
      params.set('limit', String(limit));
      return request<PaginatedResponse<Payment>>(`/payments?${params.toString()}`);
    },
    get: (id: number) => request<Payment>(`/payments/${id}`),
    update: (id: number, data: Partial<Payment>) => request<Payment>(`/payments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    recordPayment: (id: number, amount: number, method: string) =>
      request<Payment>(`/payments/${id}/record`, { method: 'POST', body: JSON.stringify({ amount, method }) }),
  },
  holidays: {
    list: (year?: number, page = 1, limit = 20) => {
      const params = new URLSearchParams();
      if (year) params.set('year', String(year));
      params.set('page', String(page));
      params.set('limit', String(limit));
      return request<PaginatedResponse<Holiday>>(`/holidays?${params.toString()}`);
    },
    get: (id: number) => request<Holiday>(`/holidays/${id}`),
    create: (data: Partial<Holiday>) => request<Holiday>('/holidays', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Holiday>) => request<Holiday>(`/holidays/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/holidays/${id}`, { method: 'DELETE' }),
  },
  notices: {
    list: (page = 1, limit = 20) => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      return request<PaginatedResponse<Notice>>(`/notices?${params.toString()}`);
    },
    get: (id: number) => request<Notice>(`/notices/${id}`),
    create: (data: Partial<Notice>) => request<Notice>('/notices', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Notice>) => request<Notice>(`/notices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/notices/${id}`, { method: 'DELETE' }),
  },
  pricingConfig: {
    get: () => request<PricingConfig>('/pricing-config'),
    update: (data: Partial<PricingConfig>) => request<PricingConfig>('/pricing-config', { method: 'PATCH', body: JSON.stringify(data) }),
  },
};
