export interface Resident {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DayType = 'weekday' | 'weekend' | 'holiday';
export type ReservationStatus = 'reserved' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'partially_paid' | 'cancelled';
export type PaymentMethod = 'pix' | 'cash' | 'card' | 'transfer' | 'other';

export interface Payment {
  id: number;
  status: PaymentStatus;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod | null;
  paymentDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: number;
  resident: Resident;
  residentId: number;
  date: string;
  status: ReservationStatus;
  notes: string | null;
  price: number;
  dayType: DayType;
  payment: Payment | null;
  paymentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  id: number;
  name: string;
  date: string;
  type: 'national' | 'municipal' | 'condominium';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PricingConfig {
  id: number;
  weekdayPrice: number;
  weekendPrice: number;
  holidayPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalReservations: number;
  confirmedReservations: number;
  pendingPayments: number;
  upcomingReservations: Reservation[];
  predictedRevenue: number;
  receivedRevenue: number;
}
