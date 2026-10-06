import type { Vector2D } from '../types';

export class Vec2 implements Vector2D {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  static fromAngle(radians: number, length = 1): Vec2 {
    return new Vec2(Math.cos(radians) * length, Math.sin(radians) * length);
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  add(v: Vector2D): Vec2 {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vector2D): Vec2 {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s: number): Vec2 {
    this.x *= s;
    this.y *= s;
    return this;
  }

  mag(): number {
    return Math.hypot(this.x, this.y);
  }

  magSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  heading(): number {
    return Math.atan2(this.y, this.x);
  }

  normalize(): Vec2 {
    const m = this.mag();
    if (m > 0.00001) {
      this.scale(1 / m);
    }
    return this;
  }

  dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector2D): number {
    return this.x * v.y - this.y * v.x;
  }

  dist(v: Vector2D): number {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }
}

export interface DrawVectorOptions {
  color?: string;
  lineWidth?: number;
  arrowHeadSize?: number;
  label?: string;
  showComponents?: boolean;
  componentColor?: string;
  dashedComponents?: boolean;
}

/**
 * Draw an arrow vector on HTML5 canvas with optional orthogonal decomposition
 */
export function drawVector2D(
  ctx: CanvasRenderingContext2D,
  origin: Vector2D,
  vector: Vector2D,
  options: DrawVectorOptions = {}
): void {
  const {
    color = '#38bdf8',
    lineWidth = 2.5,
    arrowHeadSize = 9,
    label,
    showComponents = false,
    componentColor = 'rgba(255, 255, 255, 0.35)'
  } = options;

  const endX = origin.x + vector.x;
  const endY = origin.y + vector.y;
  const mag = Math.hypot(vector.x, vector.y);

  if (mag < 1) return; // negligible vector

  ctx.save();

  // Draw orthogonal components if requested
  if (showComponents && Math.abs(vector.x) > 2 && Math.abs(vector.y) > 2) {
    ctx.strokeStyle = componentColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    // X-component
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(endX, origin.y);
    ctx.stroke();

    // Y-component
    ctx.beginPath();
    ctx.moveTo(endX, origin.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  // Draw main vector shaft
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Draw arrowhead
  const angle = Math.atan2(vector.y, vector.x);
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - arrowHeadSize * Math.cos(angle - Math.PI / 6),
    endY - arrowHeadSize * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    endX - arrowHeadSize * 0.7 * Math.cos(angle),
    endY - arrowHeadSize * 0.7 * Math.sin(angle)
  );
  ctx.lineTo(
    endX - arrowHeadSize * Math.cos(angle + Math.PI / 6),
    endY - arrowHeadSize * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  // Draw label
  if (label) {
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = color;
    const midX = origin.x + vector.x * 0.55;
    const midY = origin.y + vector.y * 0.55;
    const perpAngle = angle + Math.PI / 2;
    const offset = 14;
    ctx.fillText(label, midX + Math.cos(perpAngle) * offset, midY + Math.sin(perpAngle) * offset);
  }

  ctx.restore();
}
