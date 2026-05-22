import { setupTestApp, teardownTestApp, request, TestContext } from './test-utils';

describe('DashboardController (e2e)', () => {
  let ctx: TestContext;
  let residentId: number;

  const auth = (t: TestContext) => ({ Authorization: `Bearer ${t.adminToken}` });

  beforeAll(async () => {
    ctx = await setupTestApp();

    const res = await request(ctx.httpServer)
      .post('/api/residents')
      .set(auth(ctx))
      .send({
        name: 'Dashboard Resident',
        phone: '4444444444',
        address: 'Building 4',
        email: 'dashboard@example.com',
      });
    residentId = res.body.id;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    await request(ctx.httpServer)
      .post('/api/reservations')
      .set(auth(ctx))
      .send({
        residentId,
        date: `${monthStr}-05`,
        notes: 'Paid reservation',
      });

    await request(ctx.httpServer)
      .post('/api/reservations')
      .set(auth(ctx))
      .send({
        residentId,
        date: `${monthStr}-10`,
        notes: 'Pending reservation',
      });
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard statistics', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/dashboard/stats')
        .set(auth(ctx))
        .expect(200);

      expect(res.body).toHaveProperty('totalReservations');
      expect(res.body).toHaveProperty('confirmedReservations');
      expect(res.body).toHaveProperty('pendingPayments');
      expect(res.body).toHaveProperty('upcomingReservations');
      expect(res.body).toHaveProperty('predictedRevenue');
      expect(res.body).toHaveProperty('receivedRevenue');
    });

    it('should return stats for a specific month', async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;

      const res = await request(ctx.httpServer)
        .get(`/api/dashboard/stats?month=${monthStr}`)
        .set(auth(ctx))
        .expect(200);

      expect(res.body).toHaveProperty('totalReservations');
      expect(typeof res.body.totalReservations).toBe('number');
    });

    it('should return zero stats for month with no reservations', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/dashboard/stats?month=2030-01')
        .set(auth(ctx))
        .expect(200);

      expect(res.body.totalReservations).toBe(0);
      expect(res.body.confirmedReservations).toBe(0);
      expect(res.body.pendingPayments).toBe(0);
      expect(res.body.predictedRevenue).toBe(0);
      expect(res.body.receivedRevenue).toBe(0);
      expect(res.body.upcomingReservations).toEqual([]);
    });

    it('should return upcoming reservations sorted by date', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/dashboard/stats')
        .set(auth(ctx))
        .expect(200);

      if (res.body.upcomingReservations.length > 1) {
        const dates = res.body.upcomingReservations.map((r: any) => r.date);
        for (let i = 0; i < dates.length - 1; i++) {
          expect(new Date(dates[i]).getTime()).toBeLessThanOrEqual(
            new Date(dates[i + 1]).getTime(),
          );
        }
      }
    });

    it('should return predicted revenue as a number', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/dashboard/stats')
        .set(auth(ctx))
        .expect(200);

      expect(typeof res.body.predictedRevenue).toBe('number');
      expect(res.body.predictedRevenue).toBeGreaterThanOrEqual(0);
    });

    it('should return received revenue as a number', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/dashboard/stats')
        .set(auth(ctx))
        .expect(200);

      expect(typeof res.body.receivedRevenue).toBe('number');
      expect(res.body.receivedRevenue).toBeGreaterThanOrEqual(0);
    });
  });
});
