import { setupTestApp, teardownTestApp, request, TestContext } from './test-utils';

describe('PaymentsController (e2e)', () => {
  let ctx: TestContext;
  let residentId: number;

  beforeAll(async () => {
    ctx = await setupTestApp();

    const res = await request(ctx.httpServer)
      .post('/api/residents')
      .send({
        name: 'Payment Resident',
        phone: '3333333333',
        address: 'Building 3',
        email: 'payment@example.com',
      });
    residentId = res.body.id;
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  async function createReservationWithPayment(date: string) {
    const res = await request(ctx.httpServer)
      .post('/api/reservations')
      .send({ residentId, date });
    return { reservationId: res.body.id, paymentId: res.body.paymentId };
  }

  describe('POST /api/payments', () => {
    it('should reject payment for reservation that already has payment', async () => {
      const { reservationId } = await createReservationWithPayment('2026-11-01');

      await request(ctx.httpServer)
        .post('/api/payments')
        .send({
          reservationId,
          totalAmount: 150,
          paidAmount: 150,
          paymentMethod: 'pix',
        })
        .expect(400);
    });

    it('should reject payment for non-existent reservation', async () => {
      await request(ctx.httpServer)
        .post('/api/payments')
        .send({
          reservationId: 99999,
          totalAmount: 100,
        })
        .expect(404);
    });
  });

  describe('GET /api/payments', () => {
    beforeAll(async () => {
      await createReservationWithPayment('2026-11-02');
      await createReservationWithPayment('2026-11-03');
    });

    it('should return all payments', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/payments')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter payments by status', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/payments?status=pending')
        .expect(200);

      expect(res.body.every((p: any) => p.status === 'pending')).toBe(true);
    });
  });

  describe('GET /api/payments/:id', () => {
    let paymentId: number;

    beforeAll(async () => {
      const { paymentId: pid } = await createReservationWithPayment('2026-11-10');
      paymentId = pid;
    });

    it('should return a payment by id', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/payments/${paymentId}`)
        .expect(200);

      expect(res.body.id).toBe(paymentId);
    });

    it('should return 404 for non-existent payment', async () => {
      await request(ctx.httpServer)
        .get('/api/payments/99999')
        .expect(404);
    });
  });

  describe('PATCH /api/payments/:id', () => {
    let paymentId: number;
    let totalAmount: number;

    beforeAll(async () => {
      const { paymentId: pid } = await createReservationWithPayment('2026-11-15');
      paymentId = pid;
      const res = await request(ctx.httpServer).get(`/api/payments/${paymentId}`);
      totalAmount = Number(res.body.totalAmount);
    });

    it('should update paid amount and auto-set status to paid', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/payments/${paymentId}`)
        .send({ paidAmount: totalAmount })
        .expect(200);

      expect(res.body.status).toBe('paid');
      expect(Number(res.body.paidAmount)).toBe(totalAmount);
      expect(Number(res.body.remainingAmount)).toBe(0);
    });

    it('should update paid amount to partial', async () => {
      const { paymentId: pid } = await createReservationWithPayment('2026-11-16');
      const res2 = await request(ctx.httpServer).get(`/api/payments/${pid}`);
      const total2 = Number(res2.body.totalAmount);

      const res = await request(ctx.httpServer)
        .patch(`/api/payments/${pid}`)
        .send({ paidAmount: Math.floor(total2 / 2) })
        .expect(200);

      expect(res.body.status).toBe('partially_paid');
      expect(Number(res.body.remainingAmount)).toBeGreaterThan(0);
    });

    it('should update total amount', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/payments/${paymentId}`)
        .send({ totalAmount: 200 })
        .expect(200);

      expect(Number(res.body.totalAmount)).toBe(200);
    });

    it('should update payment method', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/payments/${paymentId}`)
        .send({ paymentMethod: 'card' })
        .expect(200);

      expect(res.body.paymentMethod).toBe('card');
    });

    it('should update payment date', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/payments/${paymentId}`)
        .send({ paymentDate: '2026-12-01' })
        .expect(200);

      expect(res.body.paymentDate).toBeDefined();
    });

    it('should update payment status directly', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/payments/${paymentId}`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(res.body.status).toBe('cancelled');
    });

    it('should update payment notes', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/payments/${paymentId}`)
        .send({ notes: 'Test notes' })
        .expect(200);

      expect(res.body.notes).toBe('Test notes');
    });
  });

  describe('POST /api/payments/:id/record', () => {
    let paymentId: number;
    let totalAmount: number;

    beforeAll(async () => {
      const { paymentId: pid } = await createReservationWithPayment('2026-11-20');
      paymentId = pid;
      const res = await request(ctx.httpServer).get(`/api/payments/${paymentId}`);
      totalAmount = Number(res.body.totalAmount);
    });

    it('should record a partial payment', async () => {
      const halfAmount = Math.floor(totalAmount / 2);
      const res = await request(ctx.httpServer)
        .post(`/api/payments/${paymentId}/record`)
        .send({ amount: halfAmount, method: 'pix' })
        .expect(201);

      expect(res.body.status).toBe('partially_paid');
      expect(Number(res.body.paidAmount)).toBe(halfAmount);
      expect(res.body.paymentMethod).toBe('pix');
    });

    it('should record full payment and mark as paid', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/payments/${paymentId}`);
      const remaining = Number(res.body.remainingAmount);

      const payRes = await request(ctx.httpServer)
        .post(`/api/payments/${paymentId}/record`)
        .send({ amount: remaining, method: 'pix' })
        .expect(201);

      expect(payRes.body.status).toBe('paid');
      expect(Number(payRes.body.remainingAmount)).toBe(0);
    });

    it('should reject payment exceeding remaining balance', async () => {
      const { paymentId: pid } = await createReservationWithPayment('2026-11-21');

      await request(ctx.httpServer)
        .post(`/api/payments/${pid}/record`)
        .send({ amount: 99999, method: 'pix' })
        .expect(400);
    });
  });
});
