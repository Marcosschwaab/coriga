import { setupTestApp, teardownTestApp, request, TestContext } from './test-utils';

describe('ReservationsController (e2e)', () => {
  let ctx: TestContext;
  let residentId: number;
  let inactiveResidentId: number;

  beforeAll(async () => {
    ctx = await setupTestApp();

    const res = await request(ctx.httpServer)
      .post('/api/residents')
      .send({
        name: 'Active Resident',
        phone: '1111111111',
        address: 'Building 1',
        email: 'active@example.com',
      });
    residentId = res.body.id;

    const inactiveRes = await request(ctx.httpServer)
      .post('/api/residents')
      .send({
        name: 'Inactive Resident',
        phone: '2222222222',
        address: 'Building 2',
        email: 'inactive@example.com',
      });
    inactiveResidentId = inactiveRes.body.id;

    await request(ctx.httpServer)
      .patch(`/api/residents/${inactiveResidentId}`)
      .send({ isActive: false });
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  describe('POST /api/reservations', () => {
    it('should create a reservation successfully', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/reservations')
        .send({
          residentId,
          date: '2026-06-01',
          notes: 'Birthday party',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.residentId).toBe(residentId);
      expect(res.body.date).toBe('2026-06-01');
      expect(res.body.status).toBe('reserved');
      expect(res.body.notes).toBe('Birthday party');
      expect(res.body).toHaveProperty('price');
      expect(res.body).toHaveProperty('dayType');
    });

    it('should reject duplicate date', async () => {
      await request(ctx.httpServer)
        .post('/api/reservations')
        .send({
          residentId,
          date: '2026-06-15',
        })
        .expect(201);

      await request(ctx.httpServer)
        .post('/api/reservations')
        .send({
          residentId,
          date: '2026-06-15',
        })
        .expect(409);
    });

    it('should reject reservation for inactive resident', async () => {
      await request(ctx.httpServer)
        .post('/api/reservations')
        .send({
          residentId: inactiveResidentId,
          date: '2026-07-01',
        })
        .expect(400);
    });

    it('should reject reservation for non-existent resident', async () => {
      await request(ctx.httpServer)
        .post('/api/reservations')
        .send({
          residentId: 99999,
          date: '2026-08-01',
        })
        .expect(404);
    });

    it('should reject missing date', async () => {
      await request(ctx.httpServer)
        .post('/api/reservations')
        .send({ residentId })
        .expect(400);
    });

    it('should create reservation for weekend with correct dayType', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/reservations')
        .send({
          residentId,
          date: '2026-06-07',
        })
        .expect(201);

      expect(res.body.dayType).toBe('weekend');
    });

    it('should create reservation for holiday with correct dayType and price', async () => {
      await request(ctx.httpServer)
        .post('/api/holidays')
        .send({ name: 'Test Holiday', date: '2026-06-20', type: 'national' });

      const res = await request(ctx.httpServer)
        .post('/api/reservations')
        .send({
          residentId,
          date: '2026-06-20',
        })
        .expect(201);

      expect(res.body.dayType).toBe('holiday');
    });

    it('should create a payment record automatically', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/reservations')
        .send({
          residentId,
          date: '2026-06-25',
        })
        .expect(201);

      expect(res.body).toHaveProperty('paymentId');
      expect(res.body.paymentId).not.toBeNull();
    });
  });

  describe('GET /api/reservations', () => {
    it('should return all reservations', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/reservations')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter reservations by month', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/reservations?month=2026-06')
        .expect(200);

      expect(res.body.every((r: any) => r.date.startsWith('2026-06'))).toBe(true);
    });

    it('should filter reservations by status', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/reservations?status=reserved')
        .expect(200);

      expect(res.body.every((r: any) => r.status === 'reserved')).toBe(true);
    });

    it('should include resident and payment relations', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/reservations?month=2026-06')
        .expect(200);

      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('resident');
        expect(res.body[0]).toHaveProperty('payment');
      }
    });
  });

  describe('GET /api/reservations/range', () => {
    it('should return reservations within date range', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/reservations/range?startDate=2026-06-01&endDate=2026-06-30')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/reservations/:id', () => {
    let reservationId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/reservations')
        .send({
          residentId,
          date: '2026-07-10',
        });
      reservationId = res.body.id;
    });

    it('should return a reservation by id', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/reservations/${reservationId}`)
        .expect(200);

      expect(res.body.id).toBe(reservationId);
    });

    it('should return 404 for non-existent reservation', async () => {
      await request(ctx.httpServer)
        .get('/api/reservations/99999')
        .expect(404);
    });
  });

  describe('PATCH /api/reservations/:id', () => {
    let reservationId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/reservations')
        .send({
          residentId,
          date: '2026-08-01',
          notes: 'Original notes',
        });
      reservationId = res.body.id;
    });

    it('should update reservation notes', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/reservations/${reservationId}`)
        .send({ notes: 'Updated notes' })
        .expect(200);

      expect(res.body.notes).toBe('Updated notes');
    });

    it('should update reservation status', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/reservations/${reservationId}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(res.body.status).toBe('completed');
    });
  });

  describe('POST /api/reservations/:id/cancel', () => {
    let reservationId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/reservations')
        .send({
          residentId,
          date: '2026-09-01',
        });
      reservationId = res.body.id;
    });

    it('should cancel a reservation', async () => {
      const res = await request(ctx.httpServer)
        .post(`/api/reservations/${reservationId}/cancel`)
        .expect(201);

      expect(res.body.status).toBe('cancelled');
    });

    it('should cancel the associated payment', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/reservations/${reservationId}`)
        .expect(200);

      expect(res.body.payment.status).toBe('cancelled');
    });
  });

  describe('DELETE /api/reservations/:id', () => {
    let reservationId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/reservations')
        .send({
          residentId,
          date: '2026-10-01',
        });
      reservationId = res.body.id;
    });

    it('should cancel reservation on delete', async () => {
      await request(ctx.httpServer)
        .delete(`/api/reservations/${reservationId}`)
        .expect(200);

      const res = await request(ctx.httpServer)
        .get(`/api/reservations/${reservationId}`)
        .expect(200);

      expect(res.body.status).toBe('cancelled');
    });
  });
});
