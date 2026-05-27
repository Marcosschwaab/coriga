import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Resident } from './entities/resident.entity';
import { Reservation, ReservationStatus, DayType } from './entities/reservation.entity';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Holiday, HolidayType } from './entities/holiday.entity';
import { PricingConfig } from './entities/pricing-config.entity';
import { User, UserRole } from './entities/user.entity';
import { Guest } from './entities/guest.entity';
import { Recipient } from './entities/recipient.entity';
import { PackageOrder } from './entities/package-order.entity';
import { Notice } from './entities/notice.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'data/database.sqlite',
    entities: [User, Resident, Reservation, Payment, Holiday, PricingConfig, Guest, Recipient, PackageOrder, Notice],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connected. Starting seed...');

  const userRepo = dataSource.getRepository(User);
  const residentRepo = dataSource.getRepository(Resident);
  const reservationRepo = dataSource.getRepository(Reservation);
  const paymentRepo = dataSource.getRepository(Payment);
  const holidayRepo = dataSource.getRepository(Holiday);
  const pricingConfigRepo = dataSource.getRepository(PricingConfig);

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin', 10);
  const existingAdmin = await userRepo.findOne({ where: { username: 'admin' } });
  if (!existingAdmin) {
    const admin = userRepo.create({
      username: 'admin',
      email: 'admin@coriga.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    });
    await userRepo.save(admin);
    console.log('Created admin user (username: admin, password: admin)');
  } else {
    console.log('Admin user already exists');
  }

  // Create default user
  const userPassword = await bcrypt.hash('user', 10);
  const existingUser = await userRepo.findOne({ where: { username: 'user' } });
  if (!existingUser) {
    const user = userRepo.create({
      username: 'user',
      email: 'user@coriga.com',
      password: userPassword,
      role: UserRole.USER,
    });
    await userRepo.save(user);
    console.log('Created user (username: user, password: user)');
  } else {
    console.log('User already exists');
  }

  // Create concierge user
  const conciergePassword = await bcrypt.hash('porteiro', 10);
  const existingConcierge = await userRepo.findOne({ where: { username: 'porteiro' } });
  if (!existingConcierge) {
    const concierge = userRepo.create({
      username: 'porteiro',
      email: 'porteiro@coriga.com',
      password: conciergePassword,
      role: UserRole.CONCIERGE,
    });
    await userRepo.save(concierge);
    console.log('Created concierge user (username: porteiro, password: porteiro)');
  } else {
    console.log('Concierge user already exists');
  }

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
    { name: 'Carlos Alberto Souza', phone: '51999990001', address: 'Av. Ipiranga, 1000 - Apto 401', email: 'carlos.souza@email.com.br' },
    { name: 'Fernanda Costa Lima', phone: '51999990002', address: 'Rua da Praia, 200 - Apto 1202', email: 'fernanda.lima@email.com.br' },
    { name: 'Roberto Oliveira Dias', phone: '51999990003', address: 'Rua Independência, 500 - Casa 3', email: 'roberto.dias@email.com.br' },
    { name: 'Juliana Martins Rocha', phone: '51999990004', address: 'Av. João Pessoa, 300 - Apto 801', email: 'juliana.rocha@email.com.br' },
    { name: 'Marcos Vinicius Schwaab', phone: '51999990005', address: 'Rua Padre Chagas, 150 - Apto 502', email: 'marcos.schwaab@email.com.br' },
  ]);
  const savedResidents = await residentRepo.save(residents);
  console.log(`Created ${savedResidents.length} residents`);

  // Create holidays for 2026
  const holidays = holidayRepo.create([
    { name: 'Ano Novo', date: '2026-01-01', type: HolidayType.NATIONAL },
    { name: 'Carnaval', date: '2026-02-17', type: HolidayType.NATIONAL },
    { name: 'Carnaval (ponto facultativo)', date: '2026-02-18', type: HolidayType.NATIONAL },
    { name: 'Sexta-feira Santa', date: '2026-04-03', type: HolidayType.NATIONAL },
    { name: 'Tiradentes', date: '2026-04-21', type: HolidayType.NATIONAL },
    { name: 'Dia do Trabalho', date: '2026-05-01', type: HolidayType.NATIONAL },
    { name: 'Corpus Christi', date: '2026-06-04', type: HolidayType.NATIONAL },
    { name: 'Independência do Brasil', date: '2026-09-07', type: HolidayType.NATIONAL },
    { name: 'Nossa Sra. Aparecida', date: '2026-10-12', type: HolidayType.NATIONAL },
    { name: 'Finados', date: '2026-11-02', type: HolidayType.NATIONAL },
    { name: 'Proclamação da República', date: '2026-11-15', type: HolidayType.NATIONAL },
    { name: 'Natal', date: '2026-12-25', type: HolidayType.NATIONAL },
    { name: 'Aniversário de Porto Alegre', date: '2026-03-26', type: HolidayType.CONDOMINIUM },
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
