# IronClash Architecture

## Overview

IronClash is a 3v3 real-time multiplayer tank battle game built with a server-authoritative architecture. The server maintains the single source of truth for all game state, while clients act as thin renderers that display the game state and send input commands.

## Technology Stack

- **Server**: Node.js + TypeScript + Colyseus (WebSocket multiplayer framework)
- **Client**: Phaser 3 (game engine) + TypeScript
- **State Synchronization**: Colyseus Schema (automatic state sync via WebSocket)
- **Build**: Webpack (client) + TypeScript compiler (server)
- **Testing**: Jest + ts-jest

## Directory Structure

```
IronClash/
├── src/
│   ├── server/           # Server-side code
│   │   ├── logic/        # Game logic (physics, etc.)
│   │   ├── rooms/        # Colyseus room handlers
│   │   ├── schemas/      # State schemas (auto-synced to clients)
│   │   └── index.ts      # Server entry point
│   ├── client/           # Client-side code
│   │   ├── managers/     # Client managers (network, input)
│   │   ├── scenes/       # Phaser game scenes
│   │   ├── index.html    # HTML template
│   │   └── index.ts      # Client entry point
│   └── shared/           # Shared code (constants, types)
│       ├── constants.ts  # Game constants (MUST use for all values)
│       └── types.ts      # Shared interfaces and enums
├── docs/                 # Documentation
├── .github/workflows/    # CI/CD workflows
├── dist/                 # Compiled server code
├── public/               # Compiled client code (served to browsers)
└── tests/                # Test files
```

## System Architecture

### Server-Authoritative Design

**The server owns all game logic and physics.** The client is a "thin" renderer that:

1. Sends input commands to server via `NetworkManager`
2. Receives state updates from server
3. Renders the game state

**Critical**: Never implement game logic on the client. All gameplay mechanics (physics, damage, collision) must run on the server.

### State Synchronization Pattern

```
Server (GameRoom)
  └─> GameState (Colyseus Schema)
       ├─> Tanks (MapSchema<TankSchema>)
       ├─> Shells (MapSchema<ShellSchema>)
       ├─> Terrain (TerrainSchema)
       └─> Game metadata (phase, turn, wind, etc.)
           │
           │ (WebSocket, automatic sync)
           ↓
Client (NetworkManager)
  └─> GameScene (Phaser)
       └─> Renders current state
```

- Server maintains single source of truth in `GameState` (Colyseus Schema)
- State changes propagate automatically to all connected clients via WebSocket
- Client receives snapshots and interpolates for smooth rendering
- All network communication goes through `server/src/rooms/GameRoom.ts`

### Input Command Pattern

Clients send semantic input commands (not raw key presses):

```typescript
// Client sends:
{ command: 'move_left' }
{ command: 'fire_start' }
{ command: 'fire_end' }

// Server processes in GameRoom.handleInput()
```

This pattern:
- Prevents client cheating (server validates all commands)
- Reduces network traffic (semantic commands vs. continuous state)
- Simplifies server logic (no need to track raw input state)

## Core Components

### Server Components

#### `src/server/rooms/GameRoom.ts`

Main game loop and orchestration:
- Handles client connections and disconnections
- Processes input commands from clients
- Runs game loop at 60 FPS (configurable via `TICK_RATE`)
- Manages game phases (waiting, playing, ended)
- Handles win conditions and team balancing
- Updates `GameState` schema (auto-syncs to clients)

#### `src/server/logic/PhysicsEngine.ts`

All physics calculations (static methods):
- Shell trajectory simulation (gravity + wind)
- Tank movement and terrain following
- Collision detection (shell vs tank, shell vs terrain)
- Blast damage calculation
- All physics uses deltaTime for frame-rate independence

#### `src/server/schemas/`

Colyseus state schemas (auto-sync to clients):
- `GameState.ts`: Root state (contains tanks, shells, terrain, metadata)
- `TankSchema.ts`: Tank properties (position, HP, angle, team, etc.)
- `ShellSchema.ts`: Projectile properties (position, velocity, team)
- `TerrainSchema.ts`: Destructible terrain height map

### Client Components

#### `src/client/managers/NetworkManager.ts`

WebSocket connection and state management:
- Connects to Colyseus server
- Joins/creates game room
- Sends input commands to server
- Receives state updates from server
- Provides state change callbacks to game scene

#### `src/client/managers/InputManager.ts`

Keyboard/touch input mapping:
- Maps keyboard keys to input commands
- Maps touch/click events to input commands
- Sends commands via `NetworkManager`

#### `src/client/scenes/GameScene.ts`

Phaser game scene:
- Renders game state received from server
- Displays tanks, shells, terrain, UI
- Handles visual effects (explosions, etc.)
- Does NOT implement game logic (only rendering)

### Shared Components

#### `src/shared/constants.ts`

**Single source of truth for all game parameters:**
- Game dimensions (width, height, terrain height)
- Physics constants (gravity, shell speed, wind)
- Tank constants (size, speed, max HP)
- Combat constants (damage, blast radius, reload time)
- Team configuration (team size, team IDs)
- Game loop timing (tick rate, fixed time step)

**Critical**: When changing game mechanics, update `shared/constants.ts` to keep client/server in sync. Never hardcode game values in client or server code.

#### `src/shared/types.ts`

Shared TypeScript interfaces and enums:
- `ITank`: Tank interface
- `IShell`: Shell interface
- `GamePhase`: Enum for game phases (WAITING, PLAYING, ENDED)
- `InputCommand`: Enum for input commands

## Data Flow

### Typical Game Loop

1. **Client sends input**: User presses "A" key
   - `InputManager` maps "A" to `{ command: 'move_left' }`
   - `NetworkManager.sendInput('move_left')` sends to server

2. **Server processes input**: `GameRoom.handleInput()`
   - Validates command (is it this player's turn?)
   - Updates `TankSchema.velocity` based on command
   - State automatically syncs to all clients

3. **Server updates physics**: `GameRoom.update()` (60 FPS)
   - Calls `PhysicsEngine.updateTank()` for all tanks
   - Calls `PhysicsEngine.updateShell()` for all shells
   - Checks collisions, applies damage
   - Updates `GameState` schema

4. **Client receives state**: `NetworkManager.onStateChange()`
   - Colyseus automatically sends state diff to all clients
   - `GameScene` receives updated state
   - Renders new positions, HP, etc.

### Combat Flow

1. **Player charges shot**: Holds fire button
   - Client sends `fire_start` command
   - Server tracks charge time

2. **Player releases shot**: Releases fire button
   - Client sends `fire_end` command
   - Server calculates velocity from charge time
   - Server creates new `ShellSchema` in `GameState`

3. **Server simulates shell**:
   - `PhysicsEngine.updateShell()` updates position each frame
   - Checks terrain collision
   - Checks tank collision via `PhysicsEngine.checkTankCollision()`

4. **Shell hits**: Collision detected
   - Server calculates damage via `PhysicsEngine.calculateDamage()`
   - Server applies damage via `PhysicsEngine.applyBlastDamage()`
   - Updates tank HP, marks as dead if HP <= 0
   - State syncs to clients, explosion rendered

## Design Principles

### Server-Authoritative

- Server is the single source of truth
- Clients cannot cheat by sending fake state
- All game logic runs on server
- Clients only render and send input

### State Synchronization

- Use Colyseus Schema for all synchronized state
- State changes propagate automatically
- No manual serialization/deserialization
- Efficient delta compression (only changed data sent)

### Shared Constants

- All game parameters in `src/shared/constants.ts`
- Both client and server use same values
- Easy to tune game balance
- No magic numbers in code

### Frame-Rate Independence

- All physics uses deltaTime (seconds)
- Server runs at 60 FPS (configurable)
- Smooth rendering even if frame rate varies
- Consistent gameplay across different hardware

## Scalability Considerations

Current architecture supports:
- Multiple game rooms (each room = 1 game instance)
- Up to 6 players per room (3v3)
- Multiple concurrent rooms on single server

For horizontal scaling:
- Use Colyseus Presence with Redis for multi-server coordination
- Use load balancer to distribute rooms across servers
- Share state via Redis or database if needed

## Security Considerations

- **Server-authoritative**: Clients cannot cheat by sending fake game state
- **Input validation**: Server validates all input commands before processing
- **Rate limiting**: Prevent command spamming (not yet implemented)
- **Team assignment**: Server assigns teams, clients cannot choose
- **Damage calculation**: Server calculates damage, clients cannot manipulate

## Performance

- **Server**: 60 FPS game loop, ~16.67ms per frame
- **Client**: Renders at browser's refresh rate (typically 60 FPS)
- **Network**: WebSocket with delta compression, low latency
- **State size**: Small (~1-2 KB per frame with delta compression)

## Future Improvements

- Interpolation and prediction for smoother rendering
- Server-side hit registration (currently instant)
- Replay system (record/playback game states)
- Spectator mode (join room as observer)
- Persistent player stats (database integration)
