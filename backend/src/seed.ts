import { DataSource } from 'typeorm';
import { Resident } from './entities/resident.entity';
import { Reservation, ReservationStatus, DayType } from './entities/reservation.entity';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Holiday, HolidayType } from './entities/holiday.entity';
import { PricingConfig } from './entities/pricing-config.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'data/database.sqlite',
    entities: [Resident, Reservation, Payment, Holiday, PricingConfig],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Database connected. Starting seed...');

  const residentRepo = dataSource.getRepository(Resident);
  const reservationRepo = dataSource.getRepository(Reservation);
  const paymentRepo = dataSource.getRepository(Payment);
  const holidayRepo = dataSource.getRepository(Holiday);
  const pricingConfigRepo = dataSource.getRepository(PricingConfig);

  // Create pricing config
  const config = pricingConfigRepo.create({
    weekdayPrice: 100,
    weekendPrice: 150,
    holidayPrice: 200,
  });
  await pricingConfigRepo.save(config);
  console.log('Created pricing config');

  // Create residents
  const residents = residentRepo.create([
    { name: 'Zhang Wei', phone: '13800138001', address: 'Building 1, Unit 101', email: 'zhang.wei@example.com' },
    { name: 'Li Na', phone: '13800138002', address: 'Building 2, Unit 202', email: 'li.na@example.com' },
    { name: 'Wang Fang', phone: '13800138003', address: 'Building 3, Unit 303', email: 'wang.fang@example.com' },
    { name: 'Liu Yang', phone: '13800138004', address: 'Building 4, Unit 404', email: 'liu.yang@example.com' },
    { name: 'Chen Min', phone: '13800138005', address: 'Building 5, Unit 505', email: 'chen.min@example.com' },
  ]);
  const savedResidents = await residentRepo.save(residents);
  console.log(`Created ${savedResidents.length} residents`);

  // Create holidays for 2026
  const holidays = holidayRepo.create([
    { name: 'New Year Day', date: '2026-01-01', type: HolidayType.NATIONAL },
    { name: 'Spring Festival', date: '2026-02-17', type: HolidayType.NATIONAL },
    { name: 'Spring Festival Holiday', date: '2026-02-18', type: HolidayType.NATIONAL },
    { name: 'Qingming Festival', date: '2026-04-05', type: HolidayType.NATIONAL },
    { name: 'Labor Day', date: '2026-05-01', type: HolidayType.NATIONAL },
    { name: 'Dragon Boat Festival', date: '2026-06-19', type: HolidayType.NATIONAL },
    { name: 'Mid-Autumn Festival', date: '2026-09-25', type: HolidayType.NATIONAL },
    { name: 'National Day', date: '2026-10-01', type: HolidayType.NATIONAL },
    { name: 'Community Anniversary', date: '2026-06-15', type: HolidayType.CONDOMINIUM },
  ]);
  const savedHolidays = await holidayRepo.save(holidays);
  console.log(`Created ${savedHolidays.length} holidays`);

  // Create some reservations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const reservationData = [
    { residentIndex: 0, dayOffset: 3, status: ReservationStatus.RESERVED, dayType: DayType.WEEKDAY, price: 100 },
    { residentIndex: 1, dayOffset: 7, status: ReservationStatus.RESERVED, dayType: DayType.WEEKEND, price: 150 },
    { residentIndex: 2, dayOffset: 14, status: ReservationStatus.RESERVED, dayType: DayType.WEEKDAY, price: 100 },
    { residentIndex: 3, dayOffset: 21, status: ReservationStatus.RESERVED, dayType: DayType.WEEKEND, price: 150 },
    { residentIndex: 4, dayOffset: 28, status: ReservationStatus.RESERVED, dayType: DayType.WEEKDAY, price: 100 },
  ];

  for (const data of reservationData) {
    const date = new Date(currentYear, currentMonth, now.getDate() + data.dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    const reservation = reservationRepo.create({
      resident: savedResidents[data.residentIndex],
      date: dateStr,
      status: data.status,
      dayType: data.dayType,
      price: data.price,
      notes: 'Sample reservation',
    });
    const savedReservation = await reservationRepo.save(reservation);

    const payment = paymentRepo.create({
      reservation: savedReservation,
      totalAmount: data.price,
      paidAmount: data.residentIndex % 2 === 0 ? data.price : 0,
      remainingAmount: data.residentIndex % 2 === 0 ? 0 : data.price,
      status: data.residentIndex % 2 === 0 ? PaymentStatus.PAID : PaymentStatus.PENDING,
      paymentMethod: data.residentIndex % 2 === 0 ? PaymentMethod.PIX : undefined,
      paymentDate: data.residentIndex % 2 === 0 ? new Date() : undefined,
    });
    await paymentRepo.save(payment);

    savedReservation.paymentId = payment.id;
    await reservationRepo.save(savedReservation);
  }

  console.log('Created sample reservations and payments');
  console.log('Seed completed successfully!');

  await dataSource.destroy();
}

seed().catch(console.error);
