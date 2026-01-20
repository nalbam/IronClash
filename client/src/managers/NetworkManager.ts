import * as Colyseus from 'colyseus.js';
import { GameState } from '../../../server/src/schemas/GameState';

export class NetworkManager {
  private client: Colyseus.Client;
  private room: Colyseus.Room<GameState> | null = null;
  private onStateChangeCallback: ((state: GameState) => void) | null = null;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = process.env.SERVER_PORT || '2567';
    
    // For development, use localhost
    const serverUrl = `${protocol}//${host}:${port}`;
    this.client = new Colyseus.Client(serverUrl);
    
    console.log('Connecting to:', serverUrl);
  }

  async joinRoom(): Promise<Colyseus.Room<GameState>> {
    try {
      this.room = await this.client.joinOrCreate<GameState>('game_room');
      console.log('Joined room:', this.room.id);

      // Listen to state changes
      this.room.onStateChange((state) => {
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback(state);
        }
      });

      return this.room;
    } catch (e) {
      console.error('Failed to join room:', e);
      throw e;
    }
  }

  sendInput(command: string) {
    if (this.room) {
      this.room.send('input', { command });
    }
  }

  onStateChange(callback: (state: GameState) => void) {
    this.onStateChangeCallback = callback;
  }

  getRoom(): Colyseus.Room<GameState> | null {
    return this.room;
  }

  leave() {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
  }
}
