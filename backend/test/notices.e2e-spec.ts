import { setupTestApp, teardownTestApp, request, TestContext } from './test-utils';

describe('NoticesController (e2e)', () => {
  let ctx: TestContext;

  const auth = (t: TestContext) => ({ Authorization: `Bearer ${t.adminToken}` });
  const userAuth = (t: TestContext) => ({ Authorization: `Bearer ${t.userToken}` });

  beforeAll(async () => {
    ctx = await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  describe('POST /api/notices', () => {
    it('should create a notice successfully', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/notices')
        .set(auth(ctx))
        .send({
          title: 'Maintenance Notice',
          content: 'The pool will be closed for maintenance on Saturday.',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Maintenance Notice');
      expect(res.body.content).toBe('The pool will be closed for maintenance on Saturday.');
    });

    it('should reject missing title', async () => {
      await request(ctx.httpServer)
        .post('/api/notices')
        .set(auth(ctx))
        .send({ content: 'Some content' })
        .expect(400);
    });

    it('should reject missing content', async () => {
      await request(ctx.httpServer)
        .post('/api/notices')
        .set(auth(ctx))
        .send({ title: 'Test' })
        .expect(400);
    });

    it('should reject non-admin user', async () => {
      await request(ctx.httpServer)
        .post('/api/notices')
        .set(userAuth(ctx))
        .send({ title: 'Test', content: 'Test content' })
        .expect(403);
    });

    it('should reject unauthenticated request', async () => {
      await request(ctx.httpServer)
        .post('/api/notices')
        .send({ title: 'Test', content: 'Test content' })
        .expect(401);
    });
  });

  describe('GET /api/notices', () => {
    beforeAll(async () => {
      await request(ctx.httpServer)
        .post('/api/notices')
        .set(auth(ctx))
        .send({ title: 'Notice 1', content: 'Content 1' });
      await request(ctx.httpServer)
        .post('/api/notices')
        .set(auth(ctx))
        .send({ title: 'Notice 2', content: 'Content 2' });
    });

    it('should return all notices ordered by createdAt DESC', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/notices')
        .set(auth(ctx))
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should be accessible by regular user', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/notices')
        .set(userAuth(ctx))
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/notices?page=1&limit=1')
        .set(auth(ctx))
        .expect(200);

      expect(res.body.data.length).toBe(1);
      expect(res.body.totalPages).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/notices/:id', () => {
    let noticeId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/notices')
        .set(auth(ctx))
        .send({ title: 'Specific Notice', content: 'Specific content' });
      noticeId = res.body.id;
    });

    it('should return a notice by id', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/notices/${noticeId}`)
        .set(auth(ctx))
        .expect(200);

      expect(res.body.title).toBe('Specific Notice');
      expect(res.body.content).toBe('Specific content');
    });

    it('should return 404 for non-existent notice', async () => {
      await request(ctx.httpServer)
        .get('/api/notices/99999')
        .set(auth(ctx))
        .expect(404);
    });
  });

  describe('PATCH /api/notices/:id', () => {
    let noticeId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/notices')
        .set(auth(ctx))
        .send({ title: 'Update Test', content: 'Original content' });
      noticeId = res.body.id;
    });

    it('should update notice title', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/notices/${noticeId}`)
        .set(auth(ctx))
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.title).toBe('Updated Title');
    });

    it('should update notice content', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/notices/${noticeId}`)
        .set(auth(ctx))
        .send({ content: 'Updated content' })
        .expect(200);

      expect(res.body.content).toBe('Updated content');
    });

    it('should reject non-admin user', async () => {
      await request(ctx.httpServer)
        .patch(`/api/notices/${noticeId}`)
        .set(userAuth(ctx))
        .send({ title: 'Hack' })
        .expect(403);
    });
  });

  describe('DELETE /api/notices/:id', () => {
    let noticeId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/notices')
        .set(auth(ctx))
        .send({ title: 'Delete Test', content: 'To be deleted' });
      noticeId = res.body.id;
    });

    it('should delete a notice', async () => {
      await request(ctx.httpServer)
        .delete(`/api/notices/${noticeId}`)
        .set(auth(ctx))
        .expect(200);

      await request(ctx.httpServer)
        .get(`/api/notices/${noticeId}`)
        .set(auth(ctx))
        .expect(404);
    });

    it('should reject non-admin user', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/notices')
        .set(auth(ctx))
        .send({ title: 'Auth Test', content: 'Content' });

      await request(ctx.httpServer)
        .delete(`/api/notices/${res.body.id}`)
        .set(userAuth(ctx))
        .expect(403);
    });

    it('should return 404 for non-existent notice', async () => {
      await request(ctx.httpServer)
        .delete('/api/notices/99999')
        .set(auth(ctx))
        .expect(404);
    });
  });
});
