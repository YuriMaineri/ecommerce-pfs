import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createE2eApp } from './e2e-setup';

describe('E-commerce API (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;
  let categoryId: string;
  let productId: string;
  let orderId: string;
  let itemId: string;

  beforeAll(async () => {
    app = await createE2eApp();
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin123!' })
      .expect(200);
    adminToken = adminLogin.body.accessToken as string;

    const suffix = Date.now();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test Customer',
        email: `customer-${suffix}@example.com`,
        password: 'password123',
      })
      .expect(201);

    const customerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `customer-${suffix}@example.com`,
        password: 'password123',
      })
      .expect(200);
    customerToken = customerLogin.body.accessToken as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject protected routes without token', async () => {
    await request(app.getHttpServer()).get('/orders').expect(401);
  });

  it('should reject category create without admin role', async () => {
    await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'X', description: 'Y' })
      .expect(403);
  });

  it('should create category as admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Cat-${Date.now()}`, description: 'Desc' })
      .expect(201);
    categoryId = res.body.id as string;
    expect(categoryId).toBeDefined();
  });

  it('should create product as admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Prod-${Date.now()}`,
        description: 'A product',
        stock: 5,
        price: 19.99,
        categoryId,
      })
      .expect(201);
    productId = res.body.id as string;
    expect(res.body.stock).toBe(5);
  });

  it('should update product as admin', async () => {
    const res = await request(app.getHttpServer())
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: 10, price: 25.5 })
      .expect(200);
    expect(res.body.stock).toBe(10);
    expect(Number(res.body.price)).toBe(25.5);
  });

  it('should upload product image', async () => {
    const png = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6300010000050001',
      'hex',
    );
    const res = await request(app.getHttpServer())
      .post(`/products/${productId}/image`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', png, 'tiny.png')
      .expect(200);
    expect(res.body.image).toContain('/uploads/products/');
  });

  it('should upload product thumbnail', async () => {
    const png = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6300010000050001',
      'hex',
    );
    const res = await request(app.getHttpServer())
      .post(`/products/${productId}/thumbnail`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', png, 'tiny.png')
      .expect(200);
    expect(res.body.thumbnail).toContain('/uploads/products/');
  });

  it('should create order as customer', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(201);
    orderId = res.body.id as string;
    expect(res.body.status).toBe('CREATED');
    expect(Number(res.body.totalAmount)).toBe(0);
  });

  it('should add product to order and recalculate total', async () => {
    const res = await request(app.getHttpServer())
      .post(`/orders/${orderId}/items`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, quantity: 2 })
      .expect(201);
    expect(res.body.items.length).toBe(1);
    itemId = res.body.items[0].id as string;
    expect(res.body.items[0].quantity).toBe(2);
    expect(Number(res.body.totalAmount)).toBeCloseTo(51, 5);
  });

  it('should block add when stock is insufficient', async () => {
    await request(app.getHttpServer())
      .post(`/orders/${orderId}/items`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, quantity: 50 })
      .expect(409);
  });

  it('should remove item from order and restore totals', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/orders/${orderId}/items/${itemId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect(res.body.items.length).toBe(0);
    expect(Number(res.body.totalAmount)).toBe(0);
  });
});
