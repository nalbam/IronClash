# IronClash Testing Guide

## Overview

IronClash uses Jest with ts-jest for unit and integration testing. The project aims for 70% code coverage on critical game logic.

## Running Tests

### Run All Tests

```bash
npm test
```

### Watch Mode

Automatically re-run tests when files change:

```bash
npm run test:watch
```

### Coverage Report

Generate and view test coverage:

```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view detailed coverage.

### Run Specific Test File

```bash
npm test -- PhysicsEngine.test
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="calculateDamage"
```

## Test Structure

Tests are located alongside the code they test in `__tests__` directories:

```
src/
├── server/
│   └── logic/
│       ├── PhysicsEngine.ts
│       └── __tests__/
│           └── PhysicsEngine.test.ts
└── shared/
    ├── constants.ts
    └── __tests__/
        └── constants.test.ts
```

## Test Configuration

Configuration is in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Coverage Thresholds

The project enforces minimum coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

If coverage falls below these thresholds, the test run will fail.

## Writing Tests

### Test File Naming

- Use `.test.ts` suffix for test files
- Place tests in `__tests__/` directory next to source
- Test file name should match source file name

Examples:
- `PhysicsEngine.ts` → `__tests__/PhysicsEngine.test.ts`
- `GameRoom.ts` → `__tests__/GameRoom.test.ts`

### Basic Test Structure

```typescript
import { PhysicsEngine } from '../PhysicsEngine';
import * as CONST from '../../shared/constants';

describe('PhysicsEngine', () => {
  describe('calculateDamage', () => {
    it('should return direct damage for direct hit', () => {
      const distance = CONST.SHELL_RADIUS - 1;
      const damage = PhysicsEngine.calculateDamage(distance);
      expect(damage).toBe(CONST.DIRECT_DAMAGE);
    });

    it('should return 0 damage outside blast radius', () => {
      const distance = CONST.BLAST_RADIUS + 10;
      const damage = PhysicsEngine.calculateDamage(distance);
      expect(damage).toBe(0);
    });
  });
});
```

### Test Patterns

#### Testing Pure Functions

For static methods and pure functions:

```typescript
describe('calculateDamage', () => {
  it('should decrease damage as distance increases', () => {
    const distance1 = CONST.SHELL_RADIUS + 10;
    const distance2 = CONST.SHELL_RADIUS + 20;
    const damage1 = PhysicsEngine.calculateDamage(distance1);
    const damage2 = PhysicsEngine.calculateDamage(distance2);
    expect(damage1).toBeGreaterThan(damage2);
  });
});
```

#### Testing with Mocks

For testing classes with dependencies:

```typescript
import { GameRoom } from '../GameRoom';

describe('GameRoom', () => {
  let room: GameRoom;

  beforeEach(() => {
    room = new GameRoom();
  });

  it('should initialize with waiting phase', () => {
    expect(room.state.phase).toBe(GamePhase.WAITING);
  });
});
```

#### Testing State Changes

For testing mutations:

```typescript
describe('applyBlastDamage', () => {
  it('should mark tank as dead when hp reaches 0', () => {
    const tanks = new Map<string, TankSchema>();
    const tank1 = new TankSchema();
    tank1.x = 100;
    tank1.y = 100;
    tank1.hp = 1;
    tank1.isAlive = true;
    tanks.set('tank1', tank1);

    PhysicsEngine.applyBlastDamage(100, 100, tanks);

    expect(tank1.hp).toBe(0);
    expect(tank1.isAlive).toBe(false);
  });
});
```

#### Testing Edge Cases

Always test boundary conditions:

```typescript
describe('checkTankCollision', () => {
  it('should not detect collision when tank is dead', () => {
    tank.isAlive = false;
    const collision = PhysicsEngine.checkTankCollision(shell, tank);
    expect(collision).toBe(false);
  });

  it('should not detect collision with same team', () => {
    tank.team = shell.team;
    const collision = PhysicsEngine.checkTankCollision(shell, tank);
    expect(collision).toBe(false);
  });
});
```

## What to Test

### High Priority (Must Test)

- **Core game logic**: Physics calculations, damage, collision detection
- **Game state transitions**: Phase changes, turn management
- **Win conditions**: Team elimination, scoring
- **Input validation**: Command validation, boundary checks

### Medium Priority (Should Test)

- **State management**: Tank/shell creation, updates
- **Team balancing**: Player assignment to teams
- **Constants validation**: Ensure all constants are valid

### Low Priority (Nice to Have)

- **Utility functions**: Helper methods
- **Rendering logic**: Client-side display code (hard to test)
- **Network code**: WebSocket communication (integration test)

## Test Coverage Goals

Current test coverage:

| Component | Coverage Target | Priority |
|-----------|-----------------|----------|
| PhysicsEngine | 90%+ | Critical |
| GameRoom | 80%+ | High |
| Schemas | 70%+ | Medium |
| Constants | 100% | Low |
| Client code | 50%+ | Low |

## Best Practices

### DO

- ✅ Test one thing per test case
- ✅ Use descriptive test names (`should X when Y`)
- ✅ Use `beforeEach` for common setup
- ✅ Test edge cases and boundary conditions
- ✅ Use constants from `shared/constants.ts` in tests
- ✅ Keep tests independent (no shared state)
- ✅ Make tests deterministic (no random values)

### DON'T

- ❌ Test framework internals (Colyseus, Phaser)
- ❌ Test implementation details (test behavior, not code)
- ❌ Use real network connections in unit tests
- ❌ Share state between tests
- ❌ Use hardcoded values (use constants instead)
- ❌ Skip tests or lower coverage thresholds without reason

## Debugging Tests

### Run Tests in Debug Mode

Add `debugger` statement in test:

```typescript
it('should calculate damage correctly', () => {
  debugger;
  const damage = PhysicsEngine.calculateDamage(50);
  expect(damage).toBeGreaterThan(0);
});
```

Run with Node inspector:

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Open `chrome://inspect` in Chrome and click "inspect"

### Verbose Output

Get detailed test output:

```bash
npm test -- --verbose
```

### Only Run Failed Tests

After a test failure, run only failed tests:

```bash
npm test -- --onlyFailures
```

## Continuous Integration

Tests automatically run on:
- Every commit (via pre-commit hook)
- Every pull request (via GitHub Actions)
- Every release (via GitHub Actions)

If tests fail, the build will fail and deployment will be blocked.

## Test Maintenance

### When to Update Tests

Update tests when:
- Adding new features (write tests first!)
- Fixing bugs (add regression test)
- Changing game mechanics (update affected tests)
- Refactoring code (tests should still pass)

### Keeping Tests Fast

- Use mocks for expensive operations
- Avoid real I/O (network, file system)
- Keep test data small
- Use `beforeEach` instead of repeating setup
- Run tests in parallel (Jest default)

Target: All tests should complete in < 10 seconds

## Common Issues

### Tests Pass Locally but Fail in CI

- Check for timing issues (use `jest.setTimeout()`)
- Check for environment differences (Node version, OS)
- Check for tests depending on execution order

### Flaky Tests

If tests fail intermittently:
- Check for async issues (use `async/await`)
- Check for race conditions
- Check for shared mutable state
- Add `.only` to isolate the flaky test

### Low Coverage

If coverage is below threshold:
- Identify untested code: `npm run test:coverage`
- Add tests for critical paths first
- Consider if code is testable (refactor if needed)
- Don't test third-party code

## Example Test Scenarios

### Testing Physics

```typescript
describe('updateShell', () => {
  it('should apply gravity to shell velocity', () => {
    const shell = new ShellSchema();
    shell.vy = 0;

    PhysicsEngine.updateShell(shell, 1, 0, terrain, 1600);

    expect(shell.vy).toBe(CONST.GRAVITY);
  });
});
```

### Testing Game Logic

```typescript
describe('GameRoom', () => {
  it('should end game when all tanks of one team are dead', () => {
    // Setup: Create game with 2 teams
    // Kill all tanks of team 0
    // Assert: Game phase is ENDED
    // Assert: Team 1 is winner
  });
});
```

### Testing Edge Cases

```typescript
describe('calculateDamage', () => {
  it('should handle distance of exactly blast radius', () => {
    const damage = PhysicsEngine.calculateDamage(CONST.BLAST_RADIUS);
    expect(damage).toBe(0); // At exact boundary, no damage
  });

  it('should handle negative distance', () => {
    const damage = PhysicsEngine.calculateDamage(-10);
    expect(damage).toBe(CONST.DIRECT_DAMAGE);
  });
});
```

## Future Testing Improvements

- Integration tests for full game flow
- End-to-end tests with real clients
- Performance benchmarks
- Load testing (multiple concurrent games)
- Visual regression testing (screenshot comparison)
- Mutation testing (verify test quality)
