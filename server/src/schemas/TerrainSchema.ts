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
      this.heights[i] = (this.heights[i - 1] + this.heights[i] + this.heights[i + 1]) / 3;
    }
  }

  getHeightAt(x: number, width: number): number {
    const segments = this.heights.length - 1;
    const segmentWidth = width / segments;
    const segment = Math.floor(x / segmentWidth);
    
    if (segment < 0 || segment >= segments) {
      return this.heights[Math.max(0, Math.min(segments, segment))];
    }
    
    // Linear interpolation between two points
    const localX = (x % segmentWidth) / segmentWidth;
    return this.heights[segment] * (1 - localX) + this.heights[segment + 1] * localX;
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
          
          // Only lower terrain, never raise it
          if (this.heights[i] > y) {
            this.heights[i] = Math.max(y - lowering, this.heights[i] - lowering);
          }
        }
      }
    }
  }
}
