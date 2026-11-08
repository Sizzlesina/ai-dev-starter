# Testing Standards

> **Scope:** Universal testing principles. Framework-specific details inferred from project setup.
> **Load:** On demand for test-generation workflow and code reviews.

---

## Testing Pyramid

```
         /\
        /  \  E2E Tests
       /----\  (few, slow, expensive)
      /      \
     / Integr. \  Integration Tests
    /------------\  (moderate, test real interactions)
   /              \
  /   Unit Tests   \  (many, fast, isolated)
 /------------------\
```

- **Unit tests:** Test one function or class in isolation. Fast, numerous.
- **Integration tests:** Test multiple units working together (service + database, controller + middleware).
- **E2E tests:** Test full user flows through the UI or API. Expensive; use sparingly.

Target: **Unit tests for business logic, Integration tests for API endpoints, E2E for critical user flows only.**

---

## Test Quality Criteria

### A Good Test
- Tests a single, clearly named behavior.
- Has a descriptive name: `test_create_order_with_zero_stock_returns_error`.
- Has three distinct sections: Arrange / Act / Assert.
- Passes consistently (no flakiness from timing or external state).
- Runs in isolation (no dependency on test execution order).
- Cleans up after itself (no residual database or file state).

### A Bad Test
- Tests multiple behaviors in one test method.
- Has an uninformative name: `test_order_1`.
- Relies on external services without mocking.
- Checks implementation details rather than behavior.
- Cannot fail — asserts are missing or trivially true.

---

## What to Test

### Always Test
- Core business logic (calculations, state transitions, validations).
- Authorization rules (who can access what).
- Data validation (what inputs are accepted and rejected).
- Error paths (what happens when dependencies fail).
- Security-critical behavior (input sanitization, permission checks).

### Usually Test
- API endpoint contracts (request/response shapes, status codes).
- Database persistence (do the right records get created/updated/deleted?).
- Background job behavior.

### Often Skip
- Framework boilerplate (resource controllers that only delegate to services).
- Simple getters and setters.
- Generated code.

---

## Test Structure

```php
// PHP — Pest
it('charges the customer once per order', function () {
    // Arrange
    $payment = Mockery::mock(PaymentGateway::class);
    $payment->expects('charge')->once()->andReturn(['status' => 'success']);
    app()->instance(PaymentGateway::class, $payment);
    $order = Order::factory()->make();

    // Act
    $result = app(OrderService::class)->place($order);

    // Assert
    expect($result->status)->toBe('confirmed');
});
```

```typescript
// TypeScript — Vitest / Jest
describe('OrderService', () => {
    it('places an order and returns confirmed status', async () => {
        // Arrange
        const mockPayment = { charge: vi.fn().mockResolvedValue({ status: 'success' }) };
        const service = new OrderService(mockPayment);

        // Act
        const result = await service.place({ productId: 1, quantity: 2 });

        // Assert
        expect(result.status).toBe('confirmed');
        expect(mockPayment.charge).toHaveBeenCalledTimes(1);
    });
});
```

---

## Mocking Guidelines

- Mock at the boundary of your system (external APIs, email providers, payment gateways).
- Do not mock internal business logic — test it directly.
- Use fakes (in-memory implementations) over mocks when possible for stability.
- Reset mocks between tests.

---

## Test Coverage

- Coverage metrics are a guide, not a goal. 100% coverage does not mean correctness.
- Target 80%+ branch coverage on business logic classes.
- Prioritize covering error paths and edge cases.
- Use coverage reports to find untested critical paths, not to game percentages.

---

## Test Data

- Use factories to generate test data. Do not use production data in tests.
- Seed deterministic test data for predictable assertions.
- Do not rely on specific IDs (auto-increment values differ between runs).
- Isolate database state between tests (transaction rollback or database refresh).
