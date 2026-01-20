import { Schema, type, ArraySchema } from '@colyseus/schema';

export class TerrainSchema extends Schema {
  @type(['number']) heights: ArraySchema<number> = new ArraySchema<number>();
  
  constructor(width: number, height: number) {
    super();
    // Generate random terrain using simple algorithm
    this.generateTerrain(width, height);
  }

  private generateTerrain(width: number, height: number) {
    const segments = 20;
    const segmentWidth = width / segments;
    
    for (let i = 0; i <= segments; i++) {
      const baseHeight = height * 0.5 + Math.random() * height * 0.3;
      this.heights.push(baseHeight);
    }
    
    // Smooth terrain
    for (let i = 1; i < this.heights.length - 1; i++) {
      const prev = this.heights[i - 1];
      const curr = this.heights[i];
      const next = this.heights[i + 1];
      if (prev !== undefined && curr !== undefined && next !== undefined) {
        this.heights[i] = (prev + curr + next) / 3;
      }
    }
  }

  getHeightAt(x: number, width: number): number {
    const segments = this.heights.length - 1;
    const segmentWidth = width / segments;
    const segment = Math.floor(x / segmentWidth);
    
    if (segment < 0 || segment >= segments) {
      const idx = Math.max(0, Math.min(segments, segment));
      return this.heights[idx] ?? 0;
    }
    
    // Linear interpolation between two points
    const localX = (x % segmentWidth) / segmentWidth;
    const h1 = this.heights[segment] ?? 0;
    const h2 = this.heights[segment + 1] ?? 0;
    return h1 * (1 - localX) + h2 * localX;
  }

  destroyAt(x: number, y: number, radius: number, width: number) {
    const segments = this.heights.length - 1;
    const segmentWidth = width / segments;
    const centerSegment = Math.floor(x / segmentWidth);
    const affectedSegments = Math.ceil(radius / segmentWidth) + 1;

    for (let i = centerSegment - affectedSegments; i <= centerSegment + affectedSegments; i++) {
      if (i >= 0 && i < this.heights.length) {
        const segmentX = i * segmentWidth;
        const distance = Math.abs(segmentX - x);
        
        if (distance < radius) {
          // Calculate how much to lower terrain based on distance
          const factor = 1 - (distance / radius);
          const lowering = radius * factor * 0.8;
          
          const currentHeight = this.heights[i];
          if (currentHeight !== undefined) {
            // Only lower terrain, never raise it
            if (currentHeight > y) {
              this.heights[i] = Math.max(y - lowering, currentHeight - lowering);
            }
          }
        }
      }
    }
  }
}
