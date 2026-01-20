# IronClash ⚔️

3v3 Real-time Tank Battle Game (Fortress Style)

## Features

- **Real-time Multiplayer**: 3v3 team battles powered by Colyseus
- **Physics-based Combat**: Projectile trajectory with gravity and random wind
- **Destructible Terrain**: Explosions destroy the landscape
- **Strategic Gameplay**: 
  - Angle adjustment (up/down)
  - Power charging system (0.2s-0.7s hold)
  - Shell reload mechanic (3 seconds, max 3 shells)
  - Health system (10 HP, 4 direct damage)
- **Mobile Support**: Virtual joystick and touch controls
- **Team-based Victory**: Eliminate the enemy team to win

## Technology Stack

- **Client**: Phaser 3 (game engine), TypeScript
- **Server**: Colyseus (multiplayer framework), Node.js
- **Real-time Sync**: WebSocket-based state synchronization

## Installation

```bash
npm install
```

## Running the Game

### Development Mode

Start both server and client in development mode:

```bash
npm start
```

Or run them separately:

```bash
# Terminal 1 - Start server
npm run start:server

# Terminal 2 - Start client
npm run start:client
```

The server will run on `http://localhost:2567` and the client on `http://localhost:8080`.

### Production Build

```bash
npm run build
```

## How to Play

### Controls

**Desktop:**
- `A` or `←`: Move left
- `D` or `→`: Move right
- `W` or `↑`: Adjust angle up
- `S` or `↓`: Adjust angle down
- `SPACE`: Hold to charge power, release to fire

**Mobile:**
- Use on-screen virtual buttons
- Movement buttons (left/right)
- Angle adjustment buttons (up/down)
- Fire button (hold and release)

### Game Mechanics

1. **Movement**: Tanks can move left and right along the terrain
2. **Aiming**: Adjust your cannon angle to aim at enemies
3. **Firing**: 
   - Hold SPACE (or fire button) to charge power (0.2s-0.7s)
   - Release to fire
   - Shells are limited - you have max 3 shells
   - Each shell reloads after 3 seconds
4. **Physics**: Projectiles follow realistic ballistic trajectories affected by gravity and wind
5. **Terrain**: Explosions create craters, changing the battlefield
6. **Damage**: 
   - Direct hit: 4 damage
   - Explosion radius: Decreasing damage based on distance
   - Each tank has 10 HP
7. **Victory**: Eliminate all enemy tanks to win!

## Project Structure

```
IronClash/
├── server/          # Colyseus game server
│   └── src/
│       ├── rooms/       # Game room logic
│       ├── schemas/     # State schemas
│       └── logic/       # Physics and game mechanics
├── client/          # Phaser 3 client
│   └── src/
│       ├── scenes/      # Game scenes
│       ├── managers/    # Network and input managers
│       └── ui/          # UI components
└── shared/          # Shared constants and types
```

## Development

The game uses TypeScript for both client and server, enabling:
- Type safety across the entire codebase
- Shared types and constants
- Better developer experience

## License

MIT