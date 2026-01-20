# IronClash Development Guide

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Git**
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ironclash.git
   cd ironclash
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file** (optional):
   ```bash
   cp .env.example .env
   ```

4. **Start development servers**:
   ```bash
   npm start
   ```

   This starts:
   - Server on `http://localhost:2567`
   - Client on `http://localhost:8080`

5. **Open browser**:
   Navigate to `http://localhost:8080`

## Development Workflow

### Project Scripts

```bash
# Development
npm start              # Start both server and client
npm run dev            # Alias for npm start
npm run dev:server     # Start server only (with hot reload)
npm run dev:client     # Start client only (with webpack dev server)

# Building
npm run build          # Build both server and client
npm run build:server   # Build server to dist/
npm run build:client   # Build client to public/

# Testing
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report

# Type Checking
npm run typecheck      # Check types for both server and client

# Validation
npm run validate       # Run typecheck + tests

# Cleanup
npm run clean          # Remove dist/ and public/ directories
```

### Development Mode Features

**Server (ts-node-dev)**:
- Hot reload on file changes
- TypeScript compilation on the fly
- Automatic restart on crashes

**Client (webpack-dev-server)**:
- Hot Module Replacement (HMR)
- Automatic browser refresh
- Source maps for debugging

## Project Structure

```
IronClash/
├── src/
│   ├── server/              # Server code
│   │   ├── logic/           # Game logic (physics, etc.)
│   │   │   ├── PhysicsEngine.ts
│   │   │   └── __tests__/
│   │   ├── rooms/           # Colyseus room handlers
│   │   │   └── GameRoom.ts
│   │   ├── schemas/         # State schemas
│   │   │   ├── GameState.ts
│   │   │   ├── TankSchema.ts
│   │   │   ├── ShellSchema.ts
│   │   │   └── TerrainSchema.ts
│   │   └── index.ts         # Server entry point
│   ├── client/              # Client code
│   │   ├── managers/        # Client managers
│   │   │   ├── NetworkManager.ts
│   │   │   └── InputManager.ts
│   │   ├── scenes/          # Phaser scenes
│   │   │   └── GameScene.ts
│   │   ├── index.html       # HTML template
│   │   └── index.ts         # Client entry point
│   └── shared/              # Shared code
│       ├── constants.ts     # Game constants
│       ├── types.ts         # Shared types
│       └── __tests__/
├── docs/                    # Documentation
├── dist/                    # Compiled server (gitignored)
├── public/                  # Compiled client (gitignored)
├── .github/workflows/       # CI/CD workflows
├── tsconfig.json            # Server TypeScript config
├── tsconfig.client.json     # Client TypeScript config
├── webpack.config.js        # Webpack config
├── jest.config.js           # Jest config
├── Dockerfile               # Docker config
└── package.json             # Dependencies and scripts
```

## Common Development Tasks

### Adding a New Game Mechanic

1. **Update constants** (`src/shared/constants.ts`):
   ```typescript
   export const NEW_FEATURE_VALUE = 42;
   ```

2. **Implement logic** on server (`src/server/logic/PhysicsEngine.ts` or `src/server/rooms/GameRoom.ts`):
   ```typescript
   static newFeature(param: number): number {
     return param * CONST.NEW_FEATURE_VALUE;
   }
   ```

3. **Update schema** if adding new state (`src/server/schemas/`):
   ```typescript
   @type("number") newProperty: number = 0;
   ```

4. **Update client rendering** (`src/client/scenes/GameScene.ts`):
   ```typescript
   // Render new feature based on state
   ```

5. **Write tests** (`src/server/logic/__tests__/`):
   ```typescript
   it('should calculate new feature correctly', () => {
     expect(PhysicsEngine.newFeature(2)).toBe(84);
   });
   ```

6. **Run validation**:
   ```bash
   npm run validate
   ```

### Adding a New Input Command

1. **Add command to enum** (`src/shared/types.ts`):
   ```typescript
   export enum InputCommand {
     // ... existing commands
     NEW_COMMAND = 'new_command'
   }
   ```

2. **Map input on client** (`src/client/managers/InputManager.ts`):
   ```typescript
   if (key === 'X') {
     this.networkManager.sendInput(InputCommand.NEW_COMMAND);
   }
   ```

3. **Handle command on server** (`src/server/rooms/GameRoom.ts`):
   ```typescript
   private handleInput(client: Client, message: any) {
     if (message.command === InputCommand.NEW_COMMAND) {
       // Handle new command
     }
   }
   ```

### Modifying Physics

1. **Update constants** if needed (`src/shared/constants.ts`)

2. **Modify physics logic** (`src/server/logic/PhysicsEngine.ts`):
   ```typescript
   static updateShell(shell: ShellSchema, deltaTime: number, ...): boolean {
     // Updated physics logic
   }
   ```

3. **Write/update tests**:
   ```typescript
   it('should apply new physics correctly', () => {
     // Test new behavior
   });
   ```

4. **Test in game**:
   ```bash
   npm start
   ```

### Adding a New Schema Property

1. **Add to schema** (`src/server/schemas/TankSchema.ts`):
   ```typescript
   @type("number") newProperty: number = 0;
   ```

2. **Restart server** (Colyseus schema changes require restart)

3. **Use property on server** (`src/server/rooms/GameRoom.ts`):
   ```typescript
   tank.newProperty = 42;
   ```

4. **Read property on client** (`src/client/scenes/GameScene.ts`):
   ```typescript
   tank.newProperty // automatically synced
   ```

## Debugging

### Server Debugging

#### Using Console Logs

Add logging in server code:

```typescript
console.log('Tank position:', tank.x, tank.y);
console.error('Collision error:', error);
```

View logs in terminal where server is running.

#### Using VS Code Debugger

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev:server"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

Set breakpoints and press F5 to start debugging.

### Client Debugging

#### Using Browser DevTools

1. Open browser DevTools (F12)
2. Go to Console tab for logs
3. Go to Sources tab for breakpoints
4. Use `debugger` statement in code:
   ```typescript
   debugger; // Execution will pause here
   ```

#### Network Debugging

1. Open DevTools Network tab
2. Filter by "WS" (WebSocket)
3. View WebSocket messages (state updates, input commands)

### Common Issues

#### Server Won't Start

**Error**: `Port 2567 already in use`
- **Fix**: Kill existing process: `lsof -i :2567` then `kill -9 <PID>`

**Error**: `Cannot find module 'dotenv'`
- **Fix**: Install dependencies: `npm install`

**Error**: TypeScript compilation errors
- **Fix**: Run typecheck: `npm run typecheck`

#### Client Won't Connect

**Error**: `WebSocket connection failed`
- **Check**: Server is running on port 2567
- **Check**: `SERVER_URL` in NetworkManager matches server URL
- **Check**: Browser console for errors

**Error**: `Failed to join room`
- **Check**: Server logs for errors
- **Check**: Room is defined: `gameServer.define('game_room', GameRoom)`

#### Hot Reload Not Working

- **Server**: ts-node-dev should auto-restart. If not, manually restart.
- **Client**: Webpack dev server should auto-refresh. Check webpack logs.

#### Schema Changes Not Reflected

- **Fix**: Restart both server and client (schema changes require restart)

## Code Style

### TypeScript

- Use strict TypeScript settings (`strict: true`)
- Avoid `any` type (use proper types or `unknown`)
- Use interfaces for object shapes
- Use enums for fixed sets of values

### Naming Conventions

- **Files**: PascalCase for classes (`PhysicsEngine.ts`), camelCase for utilities
- **Classes**: PascalCase (`GameRoom`, `PhysicsEngine`)
- **Functions**: camelCase (`updateShell`, `calculateDamage`)
- **Constants**: UPPER_SNAKE_CASE (`GAME_WIDTH`, `GRAVITY`)
- **Variables**: camelCase (`playerCount`, `currentTurn`)

### Comments

- Use JSDoc for public APIs:
  ```typescript
  /**
   * Calculate damage based on distance from explosion
   * @param distance - Distance from explosion center
   * @returns Damage amount (0 if outside blast radius)
   */
  static calculateDamage(distance: number): number {
    // ...
  }
  ```

- Use inline comments for complex logic:
  ```typescript
  // Area damage decreases linearly with distance
  const ratio = 1 - (distance / CONST.BLAST_RADIUS);
  ```

### File Organization

- Keep files small (<400 lines typical, <800 max)
- One class per file
- Group related functions together
- Import order: external libraries, internal modules, types

## Testing During Development

### Run Tests Before Committing

```bash
npm run validate
```

This runs:
1. Type checking (server and client)
2. All tests

### Test-Driven Development

1. **Write test first**:
   ```typescript
   it('should calculate new feature', () => {
     expect(newFeature()).toBe(42);
   });
   ```

2. **Run test** (should fail):
   ```bash
   npm test
   ```

3. **Implement feature**:
   ```typescript
   function newFeature(): number {
     return 42;
   }
   ```

4. **Run test** (should pass):
   ```bash
   npm test
   ```

### Watch Mode

Keep tests running during development:

```bash
npm run test:watch
```

Tests automatically re-run when files change.

## Version Control

### Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/xyz`: New features
- `fix/xyz`: Bug fixes

### Commit Messages

Follow conventional commits format:

```
<type>: <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

Examples:
```
feat: add double jump mechanic
fix: resolve collision detection bug
refactor: extract damage calculation to PhysicsEngine
docs: update README with setup instructions
test: add tests for blast damage
chore: update dependencies
```

### Pull Request Workflow

1. Create feature branch:
   ```bash
   git checkout -b feature/new-mechanic
   ```

2. Make changes and commit:
   ```bash
   git add .
   git commit -m "feat: add new mechanic"
   ```

3. Push to remote:
   ```bash
   git push origin feature/new-mechanic
   ```

4. Create pull request on GitHub

5. Wait for review and CI checks

6. Merge when approved

## Performance Optimization

### Server Performance

- Use `console.time()` and `console.timeEnd()` to measure:
  ```typescript
  console.time('updateShells');
  this.updateShells(deltaTime);
  console.timeEnd('updateShells'); // Logs execution time
  ```

- Profile with Node.js built-in profiler:
  ```bash
  node --prof dist/server/index.js
  ```

- Keep game loop under 16ms (60 FPS)

### Client Performance

- Use browser Performance tab to profile
- Minimize object creation in game loop
- Use object pooling for shells/particles
- Optimize rendering (batch draws, reduce layers)

## Resources

### Documentation

- [Colyseus Documentation](https://docs.colyseus.io/)
- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### Tools

- **VS Code Extensions**:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Jest Runner

### Community

- GitHub Issues: Report bugs and request features
- Discussions: Ask questions and share ideas

## Troubleshooting

### TypeScript Errors

**Error**: `Cannot find module 'X'`
- Check import path is correct
- Check module is installed: `npm list X`
- Check tsconfig `include` covers the file

**Error**: Type mismatch
- Check types are imported correctly
- Use type assertions if needed: `value as Type`
- Use type guards for union types

### Build Errors

**Webpack build fails**:
- Check webpack.config.js syntax
- Check all imports resolve
- Clear cache: `rm -rf public && npm run build:client`

**TypeScript build fails**:
- Run `npm run typecheck` to see all errors
- Fix one error at a time
- Check tsconfig.json is correct

### Runtime Errors

**Server crashes**:
- Check logs for stack trace
- Add try-catch around suspect code
- Use debugger to step through

**Client errors**:
- Check browser console
- Check Network tab for failed requests
- Use debugger to step through

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Read [TESTING.md](./TESTING.md) for testing guidelines
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment process
- Start contributing! Pick an issue and submit a PR
