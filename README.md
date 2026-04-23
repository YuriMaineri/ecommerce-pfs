# E-commerce API (Clean Architecture)

Simplified e-commerce **REST API** built with **Node.js**, **TypeScript**, **NestJS**, **PostgreSQL**, and **Prisma**. The codebase follows **Clean Architecture**: domain and application layers are free of framework and ORM dependencies; infrastructure implements repository ports and technical services; presentation stays thin (controllers, guards, DTOs, Swagger).

## Features

- JWT authentication with **bcrypt** password hashing and **role-based access** (`ADMIN`, `CUSTOMER`)
- CRUD for **categories** and **products** (with category linkage, price and stock rules)
- **Orders** and **order items** with transactional stock updates and automatic **totalAmount** recalculation
- **Multipart** product **image** and **thumbnail** uploads (Multer, local storage, MIME validation)
- Global **validation** (`class-validator`) and **standardized error responses**
- **Swagger** UI at `/docs`
- **Jest** unit tests (use cases / domain) and **Supertest** e2e tests

## Architecture (layers)

| Layer | Responsibility |
|--------|----------------|
| **Domain** | Entities (`User`, `Category`, `Product`, `Order`, `OrderItem`), enums, domain errors, repository **interfaces** |
| **Application** | Use cases (business orchestration), application ports (`IPasswordHasher`, `ITokenProvider`, `IFileStoragePort`) |
| **Infrastructure** | Prisma repositories, mappers, bcrypt hasher, JWT provider, Multer/local file storage, env validation |
| **Presentation** | NestJS modules/controllers, DTOs, JWT strategy/guards, global exception filters |

**OrderItem** models the associative entity between **Order** and **Product** (many-to-many with attributes: `quantity`, `unitPrice`, `subtotal`).

## Prerequisites

- Node.js 18+
- Docker (optional, for PostgreSQL via `docker-compose.yml`)

## Environment

Copy `.env.example` to `.env` and adjust values.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `1d`) |
| `PORT` | HTTP port (default `3000`) |

## Database setup

Start PostgreSQL:

```bash
docker compose up -d
```

Apply migrations and seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

**Seed credentials**

- Email: `admin@example.com`
- Password: `Admin123!`

## Run the API

```bash
npm install
npx prisma generate
npm run start:dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- Uploaded files: `http://localhost:3000/uploads/...`

## Tests

```bash
npm test          # unit tests (Jest)
npm run test:e2e  # integration/e2e (requires DB + migrations + seed)
```

E2e tests expect the database from `.env` to be reachable (same as for local development).

## Business rules (summary)

1. Products must reference an **existing category**.
2. **Stock** cannot be negative; **price** must be **> 0**.
3. **Email** is unique; passwords are stored **hashed** (bcrypt).
4. Orders belong to the **authenticated user**; customers only see/manage **their** orders (admins can list all).
5. **ADMIN** manages categories/products and uploads; **CUSTOMER** creates orders and lines.
6. **Inactive** products cannot be added to orders.
7. **Insufficient stock** blocks line additions/quantity increases (validated inside a DB transaction).
8. **Order item quantity** must be at least **1**.
9. **totalAmount** is recalculated from line **subtotals** whenever items change.
10. **Cancel** restores product **stock** for all line quantities; **delete order** (CREATED only) restores stock and removes the order.
11. **Category delete** is blocked if products still reference the category.
12. **Product delete** is blocked if the product appears on any **order item** (historical integrity).
13. Uploads accept **JPEG / PNG / WebP** MIME types.

## REST endpoints (overview)

| Area | Method | Path | Notes |
|------|--------|------|--------|
| Auth | POST | `/auth/register` | Public; creates `CUSTOMER` |
| Auth | POST | `/auth/login` | Returns `{ accessToken, user }` |
| Auth | GET | `/auth/me` | Bearer JWT |
| Users | GET | `/users` | `ADMIN` |
| Users | GET | `/users/:id` | `ADMIN` or self |
| Users | PUT | `/users/:id` | `ADMIN` or self |
| Users | DELETE | `/users/:id` | `ADMIN` |
| Categories | POST | `/categories` | `ADMIN` |
| Categories | GET | `/categories` | Public |
| Categories | GET | `/categories/:id` | Public |
| Categories | PUT | `/categories/:id` | `ADMIN` |
| Categories | DELETE | `/categories/:id` | `ADMIN` |
| Products | POST | `/products` | `ADMIN` |
| Products | GET | `/products` | Public |
| Products | GET | `/products/category/:categoryId` | Public |
| Products | GET | `/products/:id` | Public |
| Products | PUT | `/products/:id` | `ADMIN` |
| Products | DELETE | `/products/:id` | `ADMIN` |
| Products | POST | `/products/:id/image` | `ADMIN`, `multipart/form-data` field `file` |
| Products | POST | `/products/:id/thumbnail` | `ADMIN`, `multipart/form-data` field `file` |
| Orders | POST | `/orders` | `CUSTOMER` |
| Orders | GET | `/orders` | Bearer JWT |
| Orders | GET | `/orders/:id` | Bearer JWT |
| Orders | PATCH | `/orders/:id/status` | Customer may **cancel** `CREATED` orders; admin may cancel broader states |
| Orders | DELETE | `/orders/:id` | CREATED only; restores stock |
| Order items | POST | `/orders/:orderId/items` | `CUSTOMER`; body `{ productId, quantity }` (quantity to **add**) |
| Order items | PUT | `/orders/:orderId/items/:itemId` | `CUSTOMER`; body `{ quantity }` absolute quantity |
| Order items | DELETE | `/orders/:orderId/items/:itemId` | `CUSTOMER` |

## Sample requests (cURL)

**Login (admin)**

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

**Create category**

```bash
curl -s -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Office","description":"Supplies"}'
```

**Create product**

```bash
curl -s -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook","description":"Ruled","stock":20,"price":9.99,"categoryId":"<CATEGORY_ID>"}'
```

**Customer register + create order + add item**

```bash
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","password":"password123"}'

curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"password123"}'

curl -s -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>"

curl -s -X POST http://localhost:3000/orders/<ORDER_ID>/items \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"productId":"<PRODUCT_ID>","quantity":2}'
```

**Upload image**

```bash
curl -s -X POST http://localhost:3000/products/<PRODUCT_ID>/image \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "file=@./picture.png"
```

## Error response format

```json
{
  "timestamp": "2026-04-23T12:00:00.000Z",
  "statusCode": 409,
  "error": "CONFLICT",
  "message": "Insufficient stock: available 3, requested 10",
  "path": "/orders/..."
}
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run start:dev` | Dev server with watch |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled app |
| `npm test` | Unit tests |
| `npm run test:e2e` | E2e tests |
| `npm run prisma:migrate` | Create/apply migrations |
| `npm run prisma:seed` | Seed admin + sample categories |

## License

Private / academic use.
