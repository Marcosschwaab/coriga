import { setupTestApp, teardownTestApp, request, TestContext } from './test-utils';

describe('HolidaysController (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  describe('POST /api/holidays', () => {
    it('should create a holiday successfully', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/holidays')
        .send({
          name: 'Christmas',
          date: '2026-12-25',
          type: 'national',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Christmas');
      expect(res.body.date).toBe('2026-12-25');
      expect(res.body.type).toBe('national');
    });

    it('should create a holiday with default type', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/holidays')
        .send({
          name: 'New Year',
          date: '2026-01-01',
        })
        .expect(201);

      expect(res.body.type).toBe('national');
    });

    it('should create a holiday with notes', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/holidays')
        .send({
          name: 'Community Day',
          date: '2026-06-15',
          type: 'condominium',
          notes: 'Annual community celebration',
        })
        .expect(201);

      expect(res.body.notes).toBe('Annual community celebration');
    });

    it('should reject missing name', async () => {
      await request(ctx.httpServer)
        .post('/api/holidays')
        .send({ date: '2026-12-25' })
        .expect(400);
    });

    it('should reject missing date', async () => {
      await request(ctx.httpServer)
        .post('/api/holidays')
        .send({ name: 'Test Holiday' })
        .expect(400);
    });
  });

  describe('GET /api/holidays', () => {
    beforeAll(async () => {
      await request(ctx.httpServer)
        .post('/api/holidays')
        .send({ name: 'Test Holiday 2026', date: '2026-07-04', type: 'national' });
      await request(ctx.httpServer)
        .post('/api/holidays')
        .send({ name: 'Test Holiday 2025', date: '2025-07-04', type: 'national' });
    });

    it('should return all holidays', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/holidays')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter holidays by year', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/holidays?year=2026')
        .expect(200);

      expect(res.body.every((h: any) => h.date.startsWith('2026'))).toBe(true);
    });

    it('should return empty array for year with no holidays', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/holidays?year=2030')
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/holidays/:id', () => {
    let holidayId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/holidays')
        .send({ name: 'Find Holiday', date: '2026-08-15', type: 'municipal' });
      holidayId = res.body.id;
    });

    it('should return a holiday by id', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/holidays/${holidayId}`)
        .expect(200);

      expect(res.body.name).toBe('Find Holiday');
    });

    it('should return 404 for non-existent holiday', async () => {
      await request(ctx.httpServer)
        .get('/api/holidays/99999')
        .expect(404);
    });
  });

  describe('PATCH /api/holidays/:id', () => {
    let holidayId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/holidays')
        .send({ name: 'Update Holiday', date: '2026-09-01', type: 'national' });
      holidayId = res.body.id;
    });

    it('should update holiday name', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/holidays/${holidayId}`)
        .send({ name: 'Updated Holiday' })
        .expect(200);

      expect(res.body.name).toBe('Updated Holiday');
    });

    it('should update holiday date', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/holidays/${holidayId}`)
        .send({ date: '2026-10-01' })
        .expect(200);

      expect(res.body.date).toBe('2026-10-01');
    });

    it('should update holiday type', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/holidays/${holidayId}`)
        .send({ type: 'municipal' })
        .expect(200);

      expect(res.body.type).toBe('municipal');
    });

    it('should update holiday notes', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/holidays/${holidayId}`)
        .send({ notes: 'Updated notes' })
        .expect(200);

      expect(res.body.notes).toBe('Updated notes');
    });
  });

  describe('DELETE /api/holidays/:id', () => {
    let holidayId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/holidays')
        .send({ name: 'Delete Holiday', date: '2026-11-01', type: 'national' });
      holidayId = res.body.id;
    });

    it('should delete a holiday', async () => {
      await request(ctx.httpServer)
        .delete(`/api/holidays/${holidayId}`)
        .expect(200);

      await request(ctx.httpServer)
        .get(`/api/holidays/${holidayId}`)
        .expect(404);
    });

    it('should return 404 for non-existent holiday', async () => {
      await request(ctx.httpServer)
        .delete('/api/holidays/99999')
        .expect(404);
    });
  });
});
