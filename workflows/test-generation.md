# Workflow: Test Generation

> **Purpose:** Generate meaningful tests for existing or new code.
> **Authorization:** Read freely. Write only test files.
> **Constraint:** Use only the testing frameworks already present in the project.

---

## Trigger

- "generate tests", "write tests", "add tests", "test coverage"
- "تست بنویس", "تست اضافه کن", "پوشش تست"

---

## Required Context

1. `core/agent-principles.md`
2. `.agents/project-context.md`
3. `standards/testing.md`

---

## Execution Steps

### Step 1 — Identify Testing Setup

```bash
# PHP
cat composer.json | grep -i "phpunit\|pest\|codeception"
ls tests/

# JavaScript / TypeScript
cat package.json | grep -i "jest\|vitest\|mocha\|cypress\|playwright"
ls __tests__/ 2>/dev/null; ls src/__tests__/ 2>/dev/null; ls tests/ 2>/dev/null

# Python
cat pyproject.toml 2>/dev/null | grep -i "pytest\|unittest"
ls tests/

# Read one existing test file to understand conventions
find tests/ -name "*.test.*" -o -name "*Test.php" -o -name "*_test.py" | head -3 | xargs cat
```

Identify:
- Test framework (PHPUnit, Pest, Jest, Vitest, pytest).
- Test file naming conventions (`FeatureTest.php`, `Feature.test.ts`, etc.).
- Test organization (feature vs unit, mirroring `src/` structure).
- Assertion style.
- Mocking library.
- Database testing strategy (refresh, factory, fixtures).

### Step 2 — Understand the Code to Test

Read the target class or module fully:
- Public interface (all public methods).
- Dependencies (what it needs to function).
- Error conditions (what it throws or returns on failure).

```bash
# PHP: list public methods
grep -n "public function" app/Services/TargetService.php

# TypeScript: list exports
grep -n "^export " src/services/TargetService.ts
```

### Step 3 — Identify Test Cases

For each public method / exported function, identify:

| Scenario | Priority |
|----------|----------|
| Happy path (expected inputs → expected output) | High |
| Validation error (invalid input → validation error) | High |
| Not found (missing resource → 404 / null / exception) | High |
| Unauthorized (wrong permissions → 403 / error) | High |
| Boundary values (empty string, zero, max value) | Medium |
| Concurrent access (if relevant) | Medium |
| External service failure (if mocked) | Medium |

Do not generate tests for private methods directly. Test through the public interface.

### Step 4 — Present Test Plan

```markdown
## Test Plan: OrderService

**Framework:** PHPUnit / Pest
**Location:** `tests/Unit/Services/OrderServiceTest.php`
**Mocks required:** `PaymentGateway`, `InventoryService`

**Test cases:**
1. `test_create_order_with_valid_data_returns_order_model`
2. `test_create_order_with_missing_product_throws_not_found_exception`
3. `test_create_order_with_insufficient_stock_returns_error`
4. `test_create_order_calls_payment_gateway_once`
5. `test_create_order_rolls_back_on_payment_failure`

Shall I generate these tests?
```

**Wait for approval before writing files.**

### Step 5 — Generate Tests

Write tests that:
- Follow the project's naming and organization conventions exactly.
- Use `arrange / act / assert` (or `given / when / then`) structure with clear comments.
- Test one thing per test method.
- Have descriptive names that explain the scenario.
- Use the project's existing factory or fixture setup.

```php
// Example: PHPUnit / Pest (PHP)
it('creates an order and charges the payment gateway', function () {
    // Arrange
    $paymentGateway = Mockery::mock(PaymentGateway::class);
    $paymentGateway->expects('charge')->once()->andReturn(true);
    $this->app->instance(PaymentGateway::class, $paymentGateway);

    $product = Product::factory()->create(['stock' => 10]);

    // Act
    $order = app(OrderService::class)->create([
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    // Assert
    expect($order)->toBeInstanceOf(Order::class);
    expect($order->status)->toBe('confirmed');
});
```

### Step 6 — Run Generated Tests

```bash
# PHP
php artisan test --filter=OrderServiceTest
# or
./vendor/bin/pest tests/Unit/Services/OrderServiceTest.php

# JavaScript
npm test -- --testPathPattern=OrderService
# or
npx vitest run src/services/OrderService.test.ts

# Python
pytest tests/unit/test_order_service.py -v
```

Report actual output. Do not claim tests pass without running them.

---

## Completion Criteria

- Testing framework identified from existing setup.
- Test cases cover happy path and primary failure modes.
- Generated tests follow existing conventions exactly.
- Tests run successfully (or failures are documented with explanation).

---

## Boundaries

Do not introduce new testing dependencies (new libraries, new assertion styles) without user approval.
