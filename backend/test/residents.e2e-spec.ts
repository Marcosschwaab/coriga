import { setupTestApp, teardownTestApp, request, TestContext } from './test-utils';

describe('ResidentsController (e2e)', () => {
  let ctx: TestContext;

  const auth = (t: TestContext) => ({ Authorization: `Bearer ${t.adminToken}` });

  beforeAll(async () => {
    ctx = await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  describe('POST /api/residents', () => {
    it('should create a resident successfully', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/residents')
        .set(auth(ctx))
        .send({
          name: 'John Doe',
          phone: '1234567890',
          address: 'Building 1, Unit 101',
          email: 'john@example.com',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('John Doe');
      expect(res.body.email).toBe('john@example.com');
      expect(res.body.isActive).toBe(true);
    });

    it('should reject duplicate email', async () => {
      await request(ctx.httpServer)
        .post('/api/residents')
        .set(auth(ctx))
        .send({
          name: 'Jane Doe',
          phone: '0987654321',
          address: 'Building 2, Unit 202',
          email: 'duplicate@example.com',
        })
        .expect(201);

      await request(ctx.httpServer)
        .post('/api/residents')
        .set(auth(ctx))
        .send({
          name: 'Jane Doe 2',
          phone: '0987654322',
          address: 'Building 3, Unit 303',
          email: 'duplicate@example.com',
        })
        .expect(409);
    });

    it('should reject missing required fields', async () => {
      await request(ctx.httpServer)
        .post('/api/residents')
        .set(auth(ctx))
        .send({ name: 'Only Name' })
        .expect(400);
    });
  });

  describe('GET /api/residents', () => {
    it('should return all residents', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/residents')
        .set(auth(ctx))
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
    });

    it('should search residents by name', async () => {
      await request(ctx.httpServer)
        .post('/api/residents')
        .set(auth(ctx))
        .send({
          name: 'Searchable Resident',
          phone: '1111111111',
          address: 'Building 10',
          email: 'searchable@example.com',
        })
        .expect(201);

      const res = await request(ctx.httpServer)
        .get('/api/residents?search=Searchable')
        .set(auth(ctx))
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].name).toBe('Searchable Resident');
    });

    it('should search residents by phone', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/residents?search=1234567890')
        .set(auth(ctx))
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should search residents by address', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/residents?search=Building 1')
        .set(auth(ctx))
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/residents/:id', () => {
    let residentId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/residents')
        .set(auth(ctx))
        .send({
          name: 'Find Me',
          phone: '2222222222',
          address: 'Building 20',
          email: 'findme@example.com',
        });
      residentId = res.body.id;
    });

    it('should return a resident by id', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/residents/${residentId}`)
        .set(auth(ctx))
        .expect(200);

      expect(res.body.name).toBe('Find Me');
    });

    it('should return 404 for non-existent resident', async () => {
      await request(ctx.httpServer)
        .get('/api/residents/99999')
        .set(auth(ctx))
        .expect(404);
    });
  });

  describe('PATCH /api/residents/:id', () => {
    let residentId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/residents')
        .set(auth(ctx))
        .send({
          name: 'Update Me',
          phone: '3333333333',
          address: 'Building 30',
          email: 'updateme@example.com',
        });
      residentId = res.body.id;
    });

    it('should update resident name', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/residents/${residentId}`)
        .set(auth(ctx))
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(res.body.name).toBe('Updated Name');
    });

    it('should update resident email', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/residents/${residentId}`)
        .set(auth(ctx))
        .send({ email: 'newemail@example.com' })
        .expect(200);

      expect(res.body.email).toBe('newemail@example.com');
    });

    it('should reject duplicate email on update', async () => {
      await request(ctx.httpServer)
        .post('/api/residents')
        .set(auth(ctx))
        .send({
          name: 'Other',
          phone: '4444444444',
          address: 'Building 40',
          email: 'other@example.com',
        });

      await request(ctx.httpServer)
        .patch(`/api/residents/${residentId}`)
        .set(auth(ctx))
        .send({ email: 'john@example.com' })
        .expect(409);
    });

    it('should deactivate resident', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/residents/${residentId}`)
        .set(auth(ctx))
        .send({ isActive: false })
        .expect(200);

      expect(res.body.isActive).toBe(false);
    });
  });

  describe('DELETE /api/residents/:id', () => {
    let residentId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/residents')
        .set(auth(ctx))
        .send({
          name: 'Delete Me',
          phone: '5555555555',
          address: 'Building 50',
          email: 'deleteme@example.com',
        });
      residentId = res.body.id;
    });

    it('should soft delete (deactivate) a resident', async () => {
      await request(ctx.httpServer)
        .delete(`/api/residents/${residentId}`)
        .set(auth(ctx))
        .expect(200);

      const res = await request(ctx.httpServer)
        .get(`/api/residents/${residentId}`)
        .set(auth(ctx))
        .expect(200);

      expect(res.body.isActive).toBe(false);
    });

    it('should return 404 for non-existent resident', async () => {
      await request(ctx.httpServer)
        .delete('/api/residents/99999')
        .set(auth(ctx))
        .expect(404);
    });
  });
});
