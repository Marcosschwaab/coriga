import { setupTestApp, teardownTestApp, request, TestContext } from './test-utils';

describe('PricingConfigController (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  describe('GET /api/pricing-config', () => {
    it('should return pricing config, creating default if none exists', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/pricing-config')
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('weekdayPrice');
      expect(res.body).toHaveProperty('weekendPrice');
      expect(res.body).toHaveProperty('holidayPrice');
    });

    it('should return existing config on subsequent calls', async () => {
      const res1 = await request(ctx.httpServer)
        .get('/api/pricing-config')
        .expect(200);

      const res2 = await request(ctx.httpServer)
        .get('/api/pricing-config')
        .expect(200);

      expect(res1.body.id).toBe(res2.body.id);
    });
  });

  describe('PATCH /api/pricing-config', () => {
    it('should update weekday price', async () => {
      const res = await request(ctx.httpServer)
        .patch('/api/pricing-config')
        .send({ weekdayPrice: 120 })
        .expect(200);

      expect(Number(res.body.weekdayPrice)).toBe(120);
    });

    it('should update weekend price', async () => {
      const res = await request(ctx.httpServer)
        .patch('/api/pricing-config')
        .send({ weekendPrice: 180 })
        .expect(200);

      expect(Number(res.body.weekendPrice)).toBe(180);
    });

    it('should update holiday price', async () => {
      const res = await request(ctx.httpServer)
        .patch('/api/pricing-config')
        .send({ holidayPrice: 250 })
        .expect(200);

      expect(Number(res.body.holidayPrice)).toBe(250);
    });

    it('should update all prices at once', async () => {
      const res = await request(ctx.httpServer)
        .patch('/api/pricing-config')
        .send({ weekdayPrice: 100, weekendPrice: 150, holidayPrice: 200 })
        .expect(200);

      expect(Number(res.body.weekdayPrice)).toBe(100);
      expect(Number(res.body.weekendPrice)).toBe(150);
      expect(Number(res.body.holidayPrice)).toBe(200);
    });

    it('should reject negative price', async () => {
      await request(ctx.httpServer)
        .patch('/api/pricing-config')
        .send({ weekdayPrice: -10 })
        .expect(400);
    });

    it('should reject non-numeric price', async () => {
      await request(ctx.httpServer)
        .patch('/api/pricing-config')
        .send({ weekdayPrice: 'invalid' })
        .expect(400);
    });
  });
});
