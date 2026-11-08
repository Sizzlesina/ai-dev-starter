# Database Standards

> **Scope:** Universal database principles for relational (MySQL, PostgreSQL) and document (MongoDB) databases.
> **Load:** On demand for database-related reviews and development.

---

## Schema Design

### Naming Conventions
- Table names: `snake_case`, plural nouns (`orders`, `user_profiles`).
- Column names: `snake_case`.
- Primary keys: `id` (auto-increment integer or UUID — be consistent).
- Foreign keys: `{referenced_table_singular}_id` (e.g., `user_id`, `order_id`).
- Boolean columns: `is_`, `has_`, `can_` prefix (`is_active`, `has_subscription`).
- Timestamp columns: `created_at`, `updated_at`, `deleted_at`.

### Data Integrity
- Define foreign key constraints. Do not rely on application-level integrity alone.
- Specify `ON DELETE` behavior explicitly (`CASCADE`, `SET NULL`, `RESTRICT`).
- Use `NOT NULL` by default. Allow `NULL` only when absence is semantically meaningful.
- Use appropriate column types — do not store numbers as strings or dates as strings.
- Apply `UNIQUE` constraints at the database level for unique business identifiers.

### Indexes
- Index every foreign key column.
- Index columns used in frequent `WHERE`, `ORDER BY`, and `JOIN` conditions.
- Use composite indexes when queries filter on multiple columns together.
- Do not over-index: indexes slow down writes and consume space.
- Review the `EXPLAIN` plan for queries on large tables.

---

## Migrations

### Rules
- Migrations must be reversible (implement `down()` method).
- Never modify an already-applied migration. Create a new migration.
- Do not perform data transformations in schema migrations that could fail on large datasets — use a separate data migration or background job.
- Never drop a column immediately after removing it from application code. Deprecate first, deploy, then drop.

### Dangerous Migration Patterns
- Adding a `NOT NULL` column without a default to a large table (table lock risk).
- Renaming a column while application code still references the old name.
- Dropping a table that still has application references.
- Running heavy data updates in a migration (causes long deployment downtime).

---

## Query Standards

### Safety
- Never concatenate user input into SQL strings.
- Always use parameterized queries or ORM query builders.
- Apply row-level authorization in queries, not only at the route level.

### Performance
- Avoid `SELECT *`. Specify columns explicitly.
- Apply `LIMIT` to all queries that could return unbounded result sets.
- Avoid `SELECT COUNT(*)` on large tables in hot paths — use approximate counts or cache.
- Prefer `EXISTS` over `IN` for subqueries on large sets.
- Do not load entire result sets into memory when streaming would suffice.

### Transactions
Wrap the following in transactions:
- Any operation that modifies 2+ related tables.
- Financial or inventory operations.
- Operations that must succeed atomically.

```php
// PHP / Laravel
DB::transaction(function () {
    // Multiple operations
});
```

```javascript
// Prisma (Node.js)
await prisma.$transaction([
    prisma.order.create({ data: orderData }),
    prisma.inventory.update({ where: { id }, data: { stock: { decrement: qty } } }),
]);
```

---

## Soft Deletes

- Use soft deletes (`deleted_at`) for user-visible records (users, orders, products).
- Ensure soft-deleted records are excluded from all queries by default.
- Ensure indexes account for `deleted_at IS NULL` filter where relevant.

---

## Sensitive Data

- Never store passwords in plaintext or with weak hashing (MD5, SHA1).
- Use bcrypt, argon2, or scrypt with appropriate cost factors.
- Encrypt PII at rest when regulations require it.
- Never store payment card numbers or CVVs directly — use a payment vault.
