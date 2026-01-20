# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IronClash is a 3v3 real-time multiplayer tank battle game (Fortress style) built with:
- **Client**: Phaser 3 game engine with TypeScript
- **Server**: Colyseus multiplayer framework with Node.js
- **Communication**: WebSocket-based state synchronization

## Development Commands

### Running the Application
```bash
npm install                # Install dependencies
npm start                  # Start both server and client concurrently
npm run start:server       # Start server only (port 2567)
npm run start:client       # Start client only (port 8080)
```

### Building
```bash
npm run build              # Build both server and client
npm run build:server       # Build server (outputs to server/dist/)
npm run build:client       # Build client (outputs to client/dist/)
```

### Development Workflow
- Server runs on `http://localhost:2567`
- Client runs on `http://localhost:8080`
- For local development, run `npm start` or use separate terminals for server/client

## Architecture

### Server-Authoritative Design
The server owns all game logic and physics. The client is a "thin" renderer that:
1. Sends input commands to server via `NetworkManager`
2. Receives state updates from server
3. Renders the game state

**Critical**: Never implement game logic on the client. All gameplay mechanics (physics, damage, collision) must run on the server.

### State Synchronization Pattern
- Server maintains single source of truth in `GameState` (Colyseus Schema)
- State changes propagate automatically to all connected clients via WebSocket
- Client receives snapshots and interpolates for smooth rendering
- All network communication goes through `server/src/rooms/GameRoom.ts`

### Input Command Pattern
Client sends semantic input commands (not raw key presses):
```typescript
// Client sends:
{ command: 'move_left' }
{ command: 'fire_start' }

// Server processes in GameRoom.handleInput()
```

### Physics Engine
- **Location**: `server/src/logic/PhysicsEngine.ts`
- **Responsibilities**:
  - Shell trajectory simulation (gravity + wind)
  - Tank movement and terrain following
  - Collision detection (shell vs tank, shell vs terrain)
  - Blast damage calculation
- **Important**: All physics calculations use deltaTime for frame-rate independence

### Shared Code
The `shared/` directory contains code used by both client and server:
- `constants.ts`: Game parameters (speeds, damage values, sizes, tick rate)
- `types.ts`: TypeScript interfaces and enums

**Critical**: When changing game mechanics, update `shared/constants.ts` to keep client/server in sync. Never hardcode game values in client or server code.

## Key Files

### Server
- `server/src/rooms/GameRoom.ts`: Main game loop, input handling, win conditions, team balancing
- `server/src/logic/PhysicsEngine.ts`: All physics calculations
- `server/src/schemas/`: Colyseus state schemas (auto-sync to clients)
- `server/src/index.ts`: Express + Colyseus server setup

### Client
- `client/src/managers/NetworkManager.ts`: WebSocket connection, input sending, state change callbacks
- `client/src/managers/InputManager.ts`: Keyboard/touch input mapping to commands
- `client/src/scenes/GameScene.ts`: Phaser scene, rendering game state

### Shared
- `shared/src/constants.ts`: Single source of truth for all game parameters
- `shared/src/types.ts`: Shared interfaces (ITank, IShell, GamePhase, InputCommand)

## Common Development Scenarios

### Adding a New Game Mechanic
1. Update `shared/constants.ts` with new parameters
2. Implement logic in `server/src/logic/PhysicsEngine.ts` or `GameRoom.ts`
3. Update relevant schema in `server/src/schemas/` if adding new state
4. Update client rendering in `client/src/scenes/GameScene.ts` to visualize

### Adding a New Input Command
1. Add command to `InputCommand` enum in `shared/src/types.ts`
2. Map input in `client/src/managers/InputManager.ts`
3. Handle command in `server/src/rooms/GameRoom.ts` `handleInput()`

### Modifying Physics
- Edit `server/src/logic/PhysicsEngine.ts`
- Adjust constants in `shared/src/constants.ts`
- Never implement physics on the client

### Debugging Multiplayer Issues
- Check browser console for client-side logs
- Check server terminal for server-side logs
- Verify `NetworkManager` connection to `ws://localhost:2567`
- Use Colyseus devtools if needed: the room logs show state changes

## Important Constraints

### Colyseus Schemas
- All synchronized state must use `@type()` decorators
- Schemas support primitives, nested schemas, and MapSchema collections
- Changes to schema structure require client/server restart
- Reference: `server/src/schemas/GameState.ts` for pattern

### Game Loop Timing
- Server runs at 60 FPS (configurable via `TICK_RATE` in constants)
- Use `setSimulationInterval()` for game loop (NOT setInterval)
- All physics uses deltaTime in seconds for consistency

### TypeScript Configuration
- Root `tsconfig.json` includes server, client, and shared
- Server has separate `server/tsconfig.json` for build
- Webpack handles client TypeScript compilation via ts-loader

## Project Structure Details

```
server/src/
├── rooms/GameRoom.ts        # Main game logic, input handling, lifecycle
├── logic/PhysicsEngine.ts   # Physics calculations (static methods)
├── schemas/                 # Colyseus state schemas
│   ├── GameState.ts         # Root state (contains tanks, shells, terrain)
│   ├── TankSchema.ts        # Tank properties
│   ├── ShellSchema.ts       # Projectile properties
│   └── TerrainSchema.ts     # Destructible terrain height map
└── index.ts                 # Server entry point

client/src/
├── scenes/GameScene.ts      # Phaser game rendering
├── managers/
│   ├── NetworkManager.ts    # Colyseus client, room connection
│   └── InputManager.ts      # Input → command mapping
└── index.ts                 # Client entry point

shared/src/
├── constants.ts             # All game parameters (MUST use for values)
└── types.ts                 # Shared interfaces and enums
```

## Testing

Currently, no test framework is configured. When adding tests:
- Use Jest or Mocha for unit tests
- Test `PhysicsEngine` methods in isolation
- Mock Colyseus Room for testing `GameRoom` logic
- Avoid testing framework internals (Phaser, Colyseus)
