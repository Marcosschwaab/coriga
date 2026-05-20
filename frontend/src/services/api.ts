import { Resident, Reservation, Payment, Holiday, PricingConfig, DashboardStats } from '../types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
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
    list: (search?: string) => request<Resident[]>(`/residents${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    get: (id: number) => request<Resident>(`/residents/${id}`),
    create: (data: Partial<Resident>) => request<Resident>('/residents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Resident>) => request<Resident>(`/residents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/residents/${id}`, { method: 'DELETE' }),
  },
  reservations: {
    list: (month?: string, status?: string) => {
      const params = new URLSearchParams();
      if (month) params.set('month', month);
      if (status) params.set('status', status);
      return request<Reservation[]>(`/reservations${params.toString() ? `?${params.toString()}` : ''}`);
    },
    get: (id: number) => request<Reservation>(`/reservations/${id}`),
    create: (data: Partial<Reservation>) => request<Reservation>('/reservations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Reservation>) => request<Reservation>(`/reservations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    cancel: (id: number) => request<Reservation>(`/reservations/${id}/cancel`, { method: 'POST' }),
  },
  payments: {
    list: (status?: string) => request<Payment[]>(`/payments${status ? `?status=${status}` : ''}`),
    get: (id: number) => request<Payment>(`/payments/${id}`),
    update: (id: number, data: Partial<Payment>) => request<Payment>(`/payments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    recordPayment: (id: number, amount: number, method: string) =>
      request<Payment>(`/payments/${id}/record`, { method: 'POST', body: JSON.stringify({ amount, method }) }),
  },
  holidays: {
    list: (year?: number) => request<Holiday[]>(`/holidays${year ? `?year=${year}` : ''}`),
    get: (id: number) => request<Holiday>(`/holidays/${id}`),
    create: (data: Partial<Holiday>) => request<Holiday>('/holidays', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Holiday>) => request<Holiday>(`/holidays/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/holidays/${id}`, { method: 'DELETE' }),
  },
  pricingConfig: {
    get: () => request<PricingConfig>('/pricing-config'),
    update: (data: Partial<PricingConfig>) => request<PricingConfig>('/pricing-config', { method: 'PATCH', body: JSON.stringify(data) }),
  },
};
