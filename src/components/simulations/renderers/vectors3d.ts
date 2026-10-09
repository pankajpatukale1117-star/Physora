// ==========================================
// VECTORS & 3D GEOMETRY SIMULATION RENDERERS
// ==========================================

export function renderCrossDotProduct(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  onTelem: (data: Record<string, string>) => void
) {
  const magA = params.mag_a ?? 6;
  const magB = params.mag_b ?? 5;
  const thetaDeg = params.theta ?? 50;
  const thetaRad = (thetaDeg * Math.PI) / 180;

  const dot = magA * magB * Math.cos(thetaRad);
  const crossMag = magA * magB * Math.sin(thetaRad);

  const originX = w * 0.38;
  const originY = h * 0.58;
  const scale = 22; // px per unit

  // Vector A lies along the horizontal axis
  const ax = originX + magA * scale;
  const ay = originY;

  // Vector B at angle theta
  const bx = originX + magB * scale * Math.cos(thetaRad);
  const by = originY - magB * scale * Math.sin(thetaRad);

  // Parallelogram fourth vertex: A + B
  const dx = ax + (bx - originX);
  const dy = ay + (by - originY);

  ctx.save();

  // 1. Shaded Parallelogram (Area = |A x B|)
  ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(ax, ay);
  ctx.lineTo(dx, dy);
  ctx.lineTo(bx, by);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Area label inside parallelogram
  const midX = (originX + dx) / 2;
  const midY = (originY + dy) / 2;
  ctx.fillStyle = '#C084FC';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText(`Area = |A × B| = ${crossMag.toFixed(1)}`, midX, midY);

  // 2. Vector A (Blue)
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(ax, ay);
  ctx.stroke();

  // Arrowhead A
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax - 10, ay - 5);
  ctx.lineTo(ax - 10, ay + 5);
  ctx.fill();
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.fillText('A⃗', ax + 14, ay + 4);

  // 3. Vector B (Pink/Rose)
  ctx.strokeStyle = '#F43F5E';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(bx, by);
  ctx.stroke();

  // Arrowhead B
  const bAngle = -thetaRad;
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx - 10 * Math.cos(bAngle - 0.3), by - 10 * Math.sin(bAngle - 0.3));
  ctx.lineTo(bx - 10 * Math.cos(bAngle + 0.3), by - 10 * Math.sin(bAngle + 0.3));
  ctx.fill();
  ctx.fillText('B⃗', bx + 10, by - 6);

  // 4. Cross Product Normal Vector C = A x B (pointing "Up" in 3D perspective)
  const normLen = Math.min(110, Math.max(15, crossMag * 3.5));
  const cx = originX;
  const cy = originY - normLen;

  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(cx, cy);
  ctx.stroke();

  // Arrowhead C
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - 5, cy + 10);
  ctx.lineTo(cx + 5, cy + 10);
  ctx.fill();
  ctx.fillText('C⃗ = A⃗ × B⃗ (Right Hand Rule)', cx + 16, cy);

  // 5. Scalar Projection (Dot Product Shadow)
  const projLen = magB * Math.cos(thetaRad) * scale;
  const projX = originX + projLen;

  // Drop line from B tip to A
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(projX, originY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Projected segment on A
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(projX, originY);
  ctx.stroke();
  ctx.fillStyle = '#10B981';
  ctx.fillText(`Proj = B·cosθ`, originX + projLen / 2, originY + 22);

  // Angle Arc
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(originX, originY, 32, -thetaRad, 0);
  ctx.stroke();
  ctx.fillStyle = '#F8FAFC';
  ctx.font = '10px JetBrains Mono';
  ctx.fillText(`θ = ${thetaDeg}°`, originX + 42, originY - 10);

  ctx.restore();

  onTelem({
    dot_product: `${dot.toFixed(2)} (Scalar)`,
    cross_magnitude: `${crossMag.toFixed(2)} (Area of Parallelogram)`,
    direction_rule: thetaDeg <= 180 ? 'Pointing Out (Right Hand Thumb Up)' : 'Pointing In (Down)',
    orthogonality: Math.abs(dot) < 0.05 ? 'Orthogonal (Perpendicular θ = 90°)' : 'Non-Orthogonal'
  });
}


/**
 * Draws a sleek, minimalist academic mathematical vector pill label on HTML5 Canvas.
 * Strips neon glow and thick borders; uses a subtle, semi-transparent dark pill with crisp typography.
 */
function drawMinimalVectorLabel(
  ctx: CanvasRenderingContext2D,
  symbol: string,      // e.g. "v"
  subscript: string,   // e.g. "b", "r", "ground"
  valueText: string,   // e.g. "= 5.0 m/s"
  x: number,
  y: number,
  color: string
) {
  ctx.save();
  const baseFont = '600 11px "JetBrains Mono", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
  const subFont = '600 8.5px "JetBrains Mono", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
  const valFont = '500 10.5px "JetBrains Mono", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';

  ctx.font = baseFont;
  const symWidth = ctx.measureText(symbol).width;

  ctx.font = subFont;
  const subWidth = ctx.measureText(subscript).width;

  ctx.font = valFont;
  const valWidth = valueText ? ctx.measureText(valueText).width : 0;

  const padX = 6;
  const totalContentWidth = symWidth + subWidth + (valueText ? valWidth + 5 : 0);
  const boxW = totalContentWidth + padX * 2;
  const boxH = 19;

  const boxX = x - boxW / 2;
  const boxY = y - boxH / 2;

  // Minimal subtle semi-transparent dark pill with soft border, NO neon blur
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.80)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 4);
  ctx.fill();
  ctx.stroke();

  // Content inside pill
  const startX = boxX + padX;
  const baselineY = y + 3.5;

  // 1. Symbol (e.g. "v")
  ctx.font = baseFont;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(symbol, startX, baselineY);

  // 2. Micro overhead vector arrow
  const arrowY = baselineY - 11;
  const arrowStartX = startX;
  const arrowEndX = startX + symWidth + 1;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(arrowStartX, arrowY);
  ctx.lineTo(arrowEndX, arrowY);
  ctx.stroke();

  // Arrow tip
  ctx.beginPath();
  ctx.moveTo(arrowEndX, arrowY);
  ctx.lineTo(arrowEndX - 2.8, arrowY - 2);
  ctx.lineTo(arrowEndX - 1.2, arrowY);
  ctx.lineTo(arrowEndX - 2.8, arrowY + 2);
  ctx.closePath();
  ctx.fill();

  // 3. Subscript
  const subX = startX + symWidth + 1;
  ctx.font = subFont;
  ctx.fillStyle = color;
  ctx.fillText(subscript, subX, baselineY + 2);

  // 4. Numerical value string
  if (valueText) {
    const valX = subX + subWidth + 4;
    ctx.font = valFont;
    ctx.fillStyle = '#F1F5F9';
    ctx.fillText(valueText, valX, baselineY);
  }

  ctx.restore();
}

/**
 * Draws a sharp, clean vector arrow on HTML5 Canvas without glowing drop-shadows.
 */
function drawCleanVectorArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  lineWidth = 2.6,
  arrowLength = 10
) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;

  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.shadowBlur = 0; // Strip neon bloom for clean academic aesthetic

  // Main shaft
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Solid Arrowhead
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - arrowLength * Math.cos(angle - Math.PI / 6),
    toY - arrowLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - (arrowLength * 0.6) * Math.cos(angle),
    toY - (arrowLength * 0.6) * Math.sin(angle)
  );
  ctx.lineTo(
    toX - arrowLength * Math.cos(angle + Math.PI / 6),
    toY - arrowLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draws a sleek, abstract flat geometric boat silhouette (minimal modern dart hull).
 * Replaces cartoonish sprite with precision academic aesthetic.
 */
function drawMinimalGeometricBoat(
  ctx: CanvasRenderingContext2D,
  boatX: number,
  boatY: number,
  headingCanvasAngle: number
) {
  ctx.save();
  ctx.translate(boatX, boatY);
  ctx.rotate(headingCanvasAngle + Math.PI / 2);

  // Subtle ambient contact shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 1, 8, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flat geometric dart hull
  ctx.save();
  ctx.fillStyle = '#1E293B'; // Matte dark slate
  ctx.strokeStyle = '#E2E8F0'; // Precision crisp edge
  ctx.lineWidth = 1.4;

  ctx.beginPath();
  ctx.moveTo(0, -17);      // Tapered sharp bow
  ctx.lineTo(6.5, 3);      // Starboard shoulder
  ctx.lineTo(5.5, 12);     // Starboard transom corner
  ctx.lineTo(0, 9.5);      // Center keel notch
  ctx.lineTo(-5.5, 12);    // Port transom corner
  ctx.lineTo(-6.5, 3);     // Port shoulder
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Centerline alignment spine
  ctx.strokeStyle = '#38BDF8'; // Subtle cyan precision axis
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, 7);
  ctx.stroke();

  // Tiny center of mass focal node (2px dot at (0, 0))
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

/**
 * Draws an elegant, minimalist fading V-shaped wake line trailing behind the boat.
 * Replaces large frothy bubbles with subtle, hydrodynamic fading lines.
 */
function drawMinimalVWake(
  ctx: CanvasRenderingContext2D,
  boatX: number,
  boatY: number,
  headingCanvasAngle: number,
  vNetX: number,
  vNetY: number
) {
  const sternDist = 12;
  const sternX = boatX - Math.cos(headingCanvasAngle) * sternDist;
  const sternY = boatY - Math.sin(headingCanvasAngle) * sternDist;

  const travelGroundAngle = Math.atan2(-vNetY, vNetX);
  const backDirX = -Math.cos(travelGroundAngle);
  const backDirY = -Math.sin(travelGroundAngle);

  const normX = -backDirY;
  const normY = backDirX;

  ctx.save();
  ctx.lineWidth = 1.1;

  // Two delicate, fading V-shaped wake lines
  const wakeDistances = [22, 48];
  for (let i = 0; i < wakeDistances.length; i++) {
    const dist = wakeDistances[i];
    const spread = dist * 0.55;
    const alpha = i === 0 ? 0.26 : 0.12;

    const apexX = sternX + backDirX * (dist * 0.25);
    const apexY = sternY + backDirY * (dist * 0.25);

    const portX = sternX + backDirX * dist + normX * spread;
    const portY = sternY + backDirY * dist + normY * spread;

    const stbdX = sternX + backDirX * dist - normX * spread;
    const stbdY = sternY + backDirY * dist - normY * spread;

    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(apexX, apexY);
    ctx.lineTo(portX, portY);
    ctx.moveTo(apexX, apexY);
    ctx.lineTo(stbdX, stbdY);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Dynamic radial offset algorithm for velocity labels.
 * Solves label stacking and ensures labels spread out radially from the boat
 * without ever obscuring the boat graphic or clipping under the top-right Vector Panel.
 */
function computeRadialLabelPositions(
  boatX: number,
  boatY: number,
  vbx: number,
  vby: number,
  vrx: number,
  vgx: number,
  vgy: number,
  hudX: number
) {
  const R_BOAT = 30; // Clearance radius around boat center of mass
  const labelW = 86;
  const labelH = 20;

  // 1. Initial radial anchors
  // vb: outward along heading vector, angled slightly counter-clockwise
  const angleB = Math.atan2(vby, vbx);
  const distB = Math.max(R_BOAT + 16, Math.hypot(vbx, vby) * 0.65 + 10);
  let xb = boatX + Math.cos(angleB - 0.42) * distB;
  let yb = boatY + Math.sin(angleB - 0.42) * distB;

  // vg: outward along resultant ground vector, angled slightly clockwise
  const angleG = Math.atan2(vgy, vgx);
  const distG = Math.max(R_BOAT + 18, Math.hypot(vgx, vgy) * 0.70 + 12);
  let xg = boatX + Math.cos(angleG + 0.42) * distG;
  let yg = boatY + Math.sin(angleG + 0.42) * distG;

  // vr: placed along horizontal river vector shaft
  let xr = boatX + vbx + vrx * 0.5;
  let yr = boatY + vby - 16;
  const distR = Math.hypot(xr - boatX, yr - boatY);
  if (distR < R_BOAT + 12) {
    const angleR = Math.atan2(yr - boatY, xr - boatX);
    xr = boatX + Math.cos(angleR) * (R_BOAT + 16);
    yr = boatY + Math.sin(angleR) * (R_BOAT + 16);
  }

  const labels = [
    { key: 'vb', x: xb, y: yb },
    { key: 'vr', x: xr, y: yr },
    { key: 'vg', x: xg, y: yg }
  ];

  // 2. Relaxation passes to guarantee zero overlap with boat and between labels
  for (let iter = 0; iter < 4; iter++) {
    for (let i = 0; i < labels.length; i++) {
      // Must stay outside boat clearance circle
      const dBoat = Math.hypot(labels[i].x - boatX, labels[i].y - boatY);
      if (dBoat < R_BOAT + 10) {
        const a = Math.atan2(labels[i].y - boatY, labels[i].x - boatX);
        labels[i].x = boatX + Math.cos(a) * (R_BOAT + 14);
        labels[i].y = boatY + Math.sin(a) * (R_BOAT + 14);
      }

      // Check pairwise collisions between labels
      for (let j = i + 1; j < labels.length; j++) {
        const dx = labels[i].x - labels[j].x;
        const dy = labels[i].y - labels[j].y;
        if (Math.abs(dx) < labelW * 0.85 && Math.abs(dy) < labelH * 1.1) {
          const pushY = (labelH * 1.1 - Math.abs(dy)) * 0.6;
          if (dy >= 0) {
            labels[i].y += pushY;
            labels[j].y -= pushY;
          } else {
            labels[i].y -= pushY;
            labels[j].y += pushY;
          }
          const pushX = 14;
          if (dx >= 0) {
            labels[i].x += pushX;
            labels[j].x -= pushX;
          } else {
            labels[i].x -= pushX;
            labels[j].x += pushX;
          }
        }
      }
    }
  }

  // 3. Keep strictly clear of HUD panel
  for (const l of labels) {
    if (l.x + labelW / 2 > hudX - 12) {
      l.x = hudX - 12 - labelW / 2;
    }
  }

  return {
    vb: labels[0],
    vr: labels[1],
    vg: labels[2]
  };
}

export function renderRiverBoatNavigator(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  t: number,
  onTelem: (data: Record<string, string>) => void
) {
  const vBoat = params.boat_speed ?? 5; // m/s relative to water
  const vRiver = params.river_speed ?? 3; // m/s downstream
  const thetaDeg = params.heading_angle ?? 120; // steering angle with downstream river direction
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const riverWidthM = params.river_width ?? 100; // meters

  // Velocity decomposition (x = downstream, y = cross-stream across river)
  const vBoatX = vBoat * Math.cos(thetaRad);
  const vBoatY = vBoat * Math.sin(thetaRad); // Must be > 0 to cross
  const vNetX = vRiver + vBoatX;
  const vNetY = vBoatY;
  const vNetMag = Math.hypot(vNetX, vNetY);

  const crossTimeS = vNetY > 0.05 ? riverWidthM / vNetY : 999;
  const driftM = vNetX * crossTimeS;

  const bankTop = Math.max(64, h * 0.22);
  const bankBottom = Math.min(h - 64, h * 0.74);
  const riverHeightPx = bankBottom - bankTop;
  const pxPerMeter = riverHeightPx / riverWidthM;

  // 0. HUD Legend Bounds (Top-Right Corner)
  const hudW = Math.min(270, Math.max(220, w * 0.32));
  const hudH = 195;
  const hudX = w - hudW - 14;
  const hudY = 14;

  // Coordinate Bounds: Ensure trajectory, drift marker, and boat never clip under the HUD panel
  const maxSafeX = hudX - 35;
  const minSafeX = 75;
  const driftPx = driftM * pxPerMeter;

  let startX: number;
  if (driftPx >= 0) {
    const baseStartX = Math.max(minSafeX, w * 0.20);
    if (baseStartX + driftPx > maxSafeX) {
      startX = Math.max(minSafeX, maxSafeX - driftPx);
    } else {
      startX = baseStartX;
    }
  } else {
    const baseStartX = Math.max(minSafeX - driftPx, w * 0.32);
    startX = Math.min(maxSafeX, baseStartX);
  }

  const startY = bankBottom;
  const directlyOppositeX = startX;
  const directlyOppositeY = bankTop;
  const netDestX = startX + driftPx;
  const netDestY = bankTop;

  ctx.save();

  // 1. River Banks (Realism Overhaul: Gradients, Shorelines & Grass Texture)
  // Bank B (Destination Shore - Top)
  const bankBGrad = ctx.createLinearGradient(0, 0, 0, bankTop);
  bankBGrad.addColorStop(0, '#052E16');
  bankBGrad.addColorStop(0.7, '#166534');
  bankBGrad.addColorStop(1, '#14532D');
  ctx.fillStyle = bankBGrad;
  ctx.fillRect(0, 0, w, bankTop);

  // Procedural Grass & Soil Texture Overlay on Bank B
  ctx.save();
  for (let gx = 10; gx < w; gx += 16) {
    const bladeSeed = Math.sin(gx * 83.1) * 43758.5453;
    const bladeH = 3 + (bladeSeed - Math.floor(bladeSeed)) * 6;
    const gy = bankTop - 4;
    ctx.strokeStyle = (gx % 32 === 0) ? '#22C55E' : '#15803D';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx - 2, gy - bladeH);
    ctx.moveTo(gx + 4, gy);
    ctx.lineTo(gx + 6, gy - bladeH * 0.85);
    ctx.stroke();

    if (gx % 24 === 0) {
      ctx.fillStyle = 'rgba(20, 83, 45, 0.6)';
      ctx.fillRect(gx + 8, gy - 12, 1.5, 1.5);
    }
  }
  ctx.restore();

  // Sandy shoreline border along Bank B
  ctx.fillStyle = '#B45309';
  ctx.fillRect(0, bankTop - 3.5, w, 3.5);
  ctx.fillStyle = 'rgba(254, 243, 199, 0.55)';
  ctx.fillRect(0, bankTop - 1, w, 1);

  // Bank A (Departure Shore - Bottom)
  const bankAGrad = ctx.createLinearGradient(0, bankBottom, 0, h);
  bankAGrad.addColorStop(0, '#14532D');
  bankAGrad.addColorStop(0.3, '#166534');
  bankAGrad.addColorStop(1, '#052E16');
  ctx.fillStyle = bankAGrad;
  ctx.fillRect(0, bankBottom, w, h - bankBottom);

  // Procedural Grass & Soil Texture Overlay on Bank A
  ctx.save();
  for (let gx = 10; gx < w; gx += 16) {
    const bladeSeed = Math.sin(gx * 97.3) * 43758.5453;
    const bladeH = 3 + (bladeSeed - Math.floor(bladeSeed)) * 6;
    const gy = bankBottom + 4;
    ctx.strokeStyle = (gx % 32 === 0) ? '#22C55E' : '#15803D';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + 2, gy + bladeH);
    ctx.moveTo(gx + 4, gy);
    ctx.lineTo(gx + 6, gy + bladeH * 0.85);
    ctx.stroke();

    if (gx % 24 === 0) {
      ctx.fillStyle = 'rgba(20, 83, 45, 0.6)';
      ctx.fillRect(gx + 8, gy + 10, 1.5, 1.5);
    }
  }
  ctx.restore();

  // Sandy shoreline border along Bank A
  ctx.fillStyle = '#B45309';
  ctx.fillRect(0, bankBottom, w, 3.5);
  ctx.fillStyle = 'rgba(254, 243, 199, 0.55)';
  ctx.fillRect(0, bankBottom + 2.5, w, 1);

  // 2. River Water Depth Gradient
  const riverGrad = ctx.createLinearGradient(0, bankTop, 0, bankBottom);
  riverGrad.addColorStop(0, '#0284C7');
  riverGrad.addColorStop(0.12, '#0369A1');
  riverGrad.addColorStop(0.32, '#0C4A6E');
  riverGrad.addColorStop(0.50, '#082F49');
  riverGrad.addColorStop(0.68, '#0C4A6E');
  riverGrad.addColorStop(0.88, '#0369A1');
  riverGrad.addColorStop(1, '#0284C7');
  ctx.fillStyle = riverGrad;
  ctx.fillRect(0, bankTop, w, riverHeightPx);

  // Thin foam lapping lines along water edges
  ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
  ctx.fillRect(0, bankTop, w, 1.5);
  ctx.fillRect(0, bankBottom - 1.5, w, 1.5);

  // 3. Dynamic Animated River Particle System (No Static Grid)
  const numCurrentStreaks = 85;
  for (let i = 0; i < numCurrentStreaks; i++) {
    const seed1 = Math.sin(i * 127.1 + 31.7) * 43758.5453;
    const randY = seed1 - Math.floor(seed1);
    const seed2 = Math.sin(i * 269.5 + 183.3) * 43758.5453;
    const randX = seed2 - Math.floor(seed2);
    const seed3 = Math.sin(i * 419.2 + 71.9) * 43758.5453;
    const randLen = 22 + (seed3 - Math.floor(seed3)) * 40;
    const seed4 = Math.sin(i * 571.3 + 99.1) * 43758.5453;
    const baseAlpha = 0.12 + (seed4 - Math.floor(seed4)) * 0.22;

    const yPos = bankTop + 14 + randY * (riverHeightPx - 28);
    const channelProfile = Math.sin(randY * Math.PI);
    const speedMultiplier = 0.55 + 0.65 * channelProfile;

    const streamSpeed = vRiver * 38 * speedMultiplier;
    const particleX = ((randX * (w + 140)) + t * streamSpeed) % (w + 140) - 70;

    const streakGrad = ctx.createLinearGradient(particleX, yPos, particleX + randLen, yPos);
    streakGrad.addColorStop(0, 'rgba(186, 230, 253, 0)');
    streakGrad.addColorStop(0.35, `rgba(224, 242, 254, ${baseAlpha})`);
    streakGrad.addColorStop(0.85, `rgba(186, 230, 253, ${baseAlpha * 1.25})`);
    streakGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');

    ctx.strokeStyle = streakGrad;
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(particleX, yPos);
    ctx.lineTo(particleX + randLen, yPos);
    ctx.stroke();

    if (randLen > 42 && vRiver > 0.8) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${baseAlpha * 0.65})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(particleX + randLen - 8, yPos - 1.5);
      ctx.lineTo(particleX + randLen, yPos);
      ctx.lineTo(particleX + randLen - 8, yPos + 1.5);
      ctx.stroke();
    }
  }

  // 4. Shoreline Facilities & Labels (Clean Minimal Academic Styling)
  // Wooden Departure Dock at Bank A
  ctx.fillStyle = '#78350F';
  ctx.fillRect(startX - 18, bankBottom - 8, 36, 12);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(startX - 18, bankBottom - 8, 36, 12);
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.arc(startX - 12, bankBottom - 2, 2.5, 0, Math.PI * 2);
  ctx.arc(startX + 12, bankBottom - 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Wooden Destination Dock at Bank B (Shortest Normal Path)
  ctx.fillStyle = '#78350F';
  ctx.fillRect(directlyOppositeX - 18, bankTop - 4, 36, 12);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(directlyOppositeX - 18, bankTop - 4, 36, 12);

  // Shoreline Clean Labels
  ctx.save();
  ctx.font = 'bold 12px "JetBrains Mono", Inter, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('BANK B (Destination Shore — y = 100 m)', 22, bankTop - 18);
  ctx.fillText('BANK A (Departure Shore — y = 0 m)', 22, bankBottom + 26);

  ctx.font = '500 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.70)';
  ctx.fillText('Target Landing Zone', 22, bankTop - 4);
  ctx.fillText('Launch Harbor Origin (0, 0)', 22, bankBottom + 42);
  ctx.restore();

  // 5. Geometry References: Normal Shortest Path & Projected Trajectory
  // Normal perpendicular path line (Shortest crossing distance)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
  ctx.lineWidth = 1.4;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(directlyOppositeX, directlyOppositeY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Perpendicular marker square at departure dock
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.strokeRect(startX, startY - 14, 14, 14);

  // Normal path label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '500 9.5px "JetBrains Mono", monospace';
  ctx.fillText(`Normal Path (d = ${riverWidthM} m)`, directlyOppositeX + 8, (bankTop + bankBottom) / 2);
  ctx.restore();

  // Ground Trajectory Line (Dashed yellow projected path across river)
  ctx.save();
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.60)';
  ctx.lineWidth = 2.0;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(netDestX, netDestY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Landing Target Beacon Buoy (Clean minimal ring, no neon bloom)
  ctx.fillStyle = '#EAB308';
  ctx.beginPath();
  ctx.arc(netDestX, netDestY, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(netDestX, netDestY, 8, 0, Math.PI * 2);
  ctx.stroke();

  // Drift distance measurement bracket
  ctx.strokeStyle = '#EAB308';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(directlyOppositeX, directlyOppositeY - 8);
  ctx.lineTo(netDestX, netDestY - 8);
  ctx.moveTo(directlyOppositeX, directlyOppositeY - 13);
  ctx.lineTo(directlyOppositeX, directlyOppositeY - 3);
  ctx.moveTo(netDestX, netDestY - 13);
  ctx.lineTo(netDestX, netDestY - 3);
  ctx.stroke();

  // Drift distance label (Minimalist pill, no neon glow)
  const driftMidX = (directlyOppositeX + netDestX) / 2;
  drawMinimalVectorLabel(
    ctx,
    'x',
    'drift',
    `= ${driftM.toFixed(1)} m`,
    driftMidX,
    directlyOppositeY - 21,
    '#EAB308'
  );
  ctx.restore();

  // 6. Live Boat Kinematics & Position
  const cyclePeriod = Math.min(8, Math.max(3, crossTimeS * 0.45));
  const progress = (t % cyclePeriod) / cyclePeriod;
  const boatX = startX + (driftM * pxPerMeter) * progress;
  const boatY = startY - riverHeightPx * progress;

  // Heading direction in canvas coordinates
  const headingCanvasAngle = Math.atan2(-vBoatY, vBoatX);

  // 7. Minimalist Fading V-Shaped Wake (Drawn underneath boat)
  drawMinimalVWake(
    ctx,
    boatX,
    boatY,
    headingCanvasAngle,
    vNetX,
    vNetY
  );

  // 8. Flat Geometric Dart Hull Silhouette
  drawMinimalGeometricBoat(
    ctx,
    boatX,
    boatY,
    headingCanvasAngle
  );

  // 9. Traveling Vector Arrows from Boat's Center of Mass
  const vecScale = 8;
  const vbx = vBoatX * vecScale;
  const vby = -vBoatY * vecScale;
  const vrx = vRiver * vecScale;
  const vgx = vNetX * vecScale;
  const vgy = -vNetY * vecScale;

  // Refined Color Palette (Academic Solid Tones):
  // v_b = Rose Crimson (#F43F5E)
  // v_r = Clean Sky Cyan (#0284C7)
  // v_ground = Amber Gold (#EAB308)

  // Vector v_b: Boat velocity relative to water
  drawCleanVectorArrow(
    ctx,
    boatX,
    boatY,
    boatX + vbx,
    boatY + vby,
    '#F43F5E',
    2.8,
    10
  );

  // Vector v_r: River flow push (tip-to-tail vector addition)
  drawCleanVectorArrow(
    ctx,
    boatX + vbx,
    boatY + vby,
    boatX + vbx + vrx,
    boatY + vby,
    '#0284C7',
    2.8,
    10
  );

  // Subtle dashed parallelogram guide from boat center
  ctx.save();
  ctx.strokeStyle = 'rgba(2, 132, 199, 0.40)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(boatX, boatY);
  ctx.lineTo(boatX + vrx, boatY);
  ctx.lineTo(boatX + vgx, boatY + vgy);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Vector v_ground: Resultant net ground velocity
  drawCleanVectorArrow(
    ctx,
    boatX,
    boatY,
    boatX + vgx,
    boatY + vgy,
    '#EAB308',
    3.2,
    11
  );

  // 10. Dynamic Radial Offset Algorithm for Labels (Zero Overlap with Boat or Each Other)
  const labelPositions = computeRadialLabelPositions(
    boatX,
    boatY,
    vbx,
    vby,
    vrx,
    vgx,
    vgy,
    hudX
  );

  // Render minimal clean labels
  drawMinimalVectorLabel(
    ctx,
    'v',
    'b',
    `= ${vBoat.toFixed(1)} m/s`,
    labelPositions.vb.x,
    labelPositions.vb.y,
    '#F43F5E'
  );

  drawMinimalVectorLabel(
    ctx,
    'v',
    'r',
    `= ${vRiver.toFixed(1)} m/s`,
    labelPositions.vr.x,
    labelPositions.vr.y,
    '#0284C7'
  );

  drawMinimalVectorLabel(
    ctx,
    'v',
    'ground',
    `= ${vNetMag.toFixed(2)} m/s`,
    labelPositions.vg.x,
    labelPositions.vg.y,
    '#EAB308'
  );

  // 11. Floating 'Dynamic Vector Resolution' Panel in Top-Right Corner (Preserved Exactly)
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1.2;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.roundRect(hudX, hudY, hudW, hudH, 10);
  ctx.fill();
  ctx.stroke();

  // Header Pill
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('DYNAMIC VECTOR RESOLUTION', hudX + 14, hudY + 20);

  // Equation Title: v_ground = v_boat + v_river
  const eqY = hudY + 36;
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FFE600';
  ctx.fillText('v', hudX + 14, eqY);
  ctx.strokeStyle = '#FFE600';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(hudX + 14, eqY - 11);
  ctx.lineTo(hudX + 22, eqY - 11);
  ctx.lineTo(hudX + 20, eqY - 13);
  ctx.stroke();
  ctx.font = 'bold 8px "JetBrains Mono", monospace';
  ctx.fillText('ground', hudX + 23, eqY + 2);

  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(' = ', hudX + 60, eqY);

  ctx.fillStyle = '#FF2D95';
  ctx.fillText('v', hudX + 78, eqY);
  ctx.strokeStyle = '#FF2D95';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(hudX + 78, eqY - 11);
  ctx.lineTo(hudX + 86, eqY - 11);
  ctx.lineTo(hudX + 84, eqY - 13);
  ctx.stroke();
  ctx.font = 'bold 8px "JetBrains Mono", monospace';
  ctx.fillText('b', hudX + 87, eqY + 2);

  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(' + ', hudX + 98, eqY);

  ctx.fillStyle = '#00F0FF';
  ctx.fillText('v', hudX + 116, eqY);
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(hudX + 116, eqY - 11);
  ctx.lineTo(hudX + 124, eqY - 11);
  ctx.lineTo(hudX + 122, eqY - 13);
  ctx.stroke();
  ctx.font = 'bold 8px "JetBrains Mono", monospace';
  ctx.fillText('r', hudX + 125, eqY + 2);

  // Mini Vector Triangle Geometry inside the Legend
  const triBoxX = hudX + 14;
  const triBoxY = hudY + 48;
  const triBoxW = hudW - 28;
  const triBoxH = 92;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.roundRect(triBoxX, triBoxY, triBoxW, triBoxH, 6);
  ctx.fill();

  const maxVel = Math.max(vBoat, vRiver, vNetMag, 4);
  const triScale = Math.min(8.5, (triBoxW * 0.45) / maxVel);

  const triOriginX = triBoxX + triBoxW * 0.42;
  const triOriginY = triBoxY + triBoxH * 0.82;

  const p0x = triOriginX;
  const p0y = triOriginY;
  const p1x = p0x + vBoat * Math.cos(thetaRad) * triScale;
  const p1y = p0y - vBoat * Math.sin(thetaRad) * triScale;
  const p2x = p1x + vRiver * triScale;
  const p2y = p1y;

  drawCleanVectorArrow(ctx, p0x, p0y, p1x, p1y, '#FF2D95', 2.4, 8);
  drawCleanVectorArrow(ctx, p1x, p1y, p2x, p2y, '#00F0FF', 2.4, 8);
  drawCleanVectorArrow(ctx, p0x, p0y, p2x, p2y, '#FFE600', 2.6, 9);

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(p0x, p0y, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '600 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FF2D95';
  ctx.fillText(`• v_b: ${vBoat.toFixed(1)} m/s (θ = ${thetaDeg}°)`, hudX + 14, hudY + 155);
  ctx.fillStyle = '#00F0FF';
  ctx.fillText(`• v_r: ${vRiver.toFixed(1)} m/s`, hudX + 14, hudY + 170);
  ctx.fillStyle = '#FFE600';
  ctx.fillText(`• v_net: ${vNetMag.toFixed(2)} m/s`, hudX + 14, hudY + 185);
  ctx.restore();

  ctx.restore();

  // 12. Real-Time Physics Telemetry Output
  const isShortestPathFeasible = vBoat >= vRiver;
  const optimalAngleDeg = isShortestPathFeasible
    ? (180 - (Math.asin(vRiver / vBoat) * 180) / Math.PI).toFixed(1)
    : 'Impossible (v_b < v_r)';

  onTelem({
    crossing_time: `${crossTimeS.toFixed(1)} s`,
    drift_distance: `${driftM.toFixed(1)} m`,
    net_velocity: `${vNetMag.toFixed(2)} m/s`,
    shortest_path_condition: isShortestPathFeasible
      ? `Optimal: ${optimalAngleDeg}°`
      : 'Drift Unavoidable'
  });
}

export function renderComponentDecomposition(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  onTelem: (data: Record<string, string>) => void
) {
  const mag = params.magnitude ?? 8;
  const thetaDeg = params.theta ?? 35;
  const phiDeg = params.phi_3d ?? 25; // 3D elevation
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const phiRad = (phiDeg * Math.PI) / 180;

  const vx = mag * Math.cos(thetaRad) * Math.cos(phiRad);
  const vy = mag * Math.sin(thetaRad) * Math.cos(phiRad);
  const vz = mag * Math.sin(phiRad);

  const originX = w * 0.35;
  const originY = h * 0.65;
  const scale = 20;

  // 3D Isometric projection axes:
  // x-axis: (cos(-30°), sin(30°))
  // y-axis: (-cos(-30°), sin(30°))
  // z-axis: straight up (0, -1)
  const toScreen = (x3: number, y3: number, z3: number) => {
    const sx = originX + (x3 * 0.866 - y3 * 0.866) * scale;
    const sy = originY + (x3 * 0.5 + y3 * 0.5 - z3) * scale;
    return { x: sx, y: sy };
  };

  ctx.save();

  // 1. Draw 3D Axes (X, Y, Z)
  const axisLen = 10;
  const originPt = toScreen(0, 0, 0);
  const xPt = toScreen(axisLen, 0, 0);
  const yPt = toScreen(0, axisLen, 0);
  const zPt = toScreen(0, 0, axisLen);

  ctx.lineWidth = 1.5;

  // X-axis (Red)
  ctx.strokeStyle = '#EF4444';
  ctx.beginPath();
  ctx.moveTo(originPt.x, originPt.y);
  ctx.lineTo(xPt.x, xPt.y);
  ctx.stroke();
  ctx.fillStyle = '#EF4444';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillText('X (î)', xPt.x + 8, xPt.y + 4);

  // Y-axis (Green)
  ctx.strokeStyle = '#10B981';
  ctx.beginPath();
  ctx.moveTo(originPt.x, originPt.y);
  ctx.lineTo(yPt.x, yPt.y);
  ctx.stroke();
  ctx.fillStyle = '#10B981';
  ctx.fillText('Y (ĵ)', yPt.x - 22, yPt.y + 4);

  // Z-axis (Blue)
  ctx.strokeStyle = '#38BDF8';
  ctx.beginPath();
  ctx.moveTo(originPt.x, originPt.y);
  ctx.lineTo(zPt.x, zPt.y);
  ctx.stroke();
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('Z (k̂)', zPt.x - 4, zPt.y - 10);

  // 2. Projection Box (Cuboid in 3D)
  const tipPt = toScreen(vx, vy, vz);
  const xyPt = toScreen(vx, vy, 0);
  const xPtProj = toScreen(vx, 0, 0);
  const yPtProj = toScreen(0, vy, 0);
  const zPtProj = toScreen(0, 0, vz);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);

  // Bottom face
  ctx.beginPath();
  ctx.moveTo(originPt.x, originPt.y);
  ctx.lineTo(xPtProj.x, xPtProj.y);
  ctx.lineTo(xyPt.x, xyPt.y);
  ctx.lineTo(yPtProj.x, yPtProj.y);
  ctx.closePath();
  ctx.stroke();

  // Vertical pillar to tip
  ctx.beginPath();
  ctx.moveTo(xyPt.x, xyPt.y);
  ctx.lineTo(tipPt.x, tipPt.y);
  ctx.moveTo(originPt.x, originPt.y);
  ctx.lineTo(zPtProj.x, zPtProj.y);
  ctx.lineTo(toScreen(vx, 0, vz).x, toScreen(vx, 0, vz).y);
  ctx.lineTo(tipPt.x, tipPt.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // 3. Highlighted Component Vectors
  // Vx
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(originPt.x, originPt.y);
  ctx.lineTo(xPtProj.x, xPtProj.y);
  ctx.stroke();

  // Vy
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(originPt.x, originPt.y);
  ctx.lineTo(yPtProj.x, yPtProj.y);
  ctx.stroke();

  // Vz
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(originPt.x, originPt.y);
  ctx.lineTo(zPtProj.x, zPtProj.y);
  ctx.stroke();

  // 4. Main 3D Vector V (Yellow Glow)
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(originPt.x, originPt.y);
  ctx.lineTo(tipPt.x, tipPt.y);
  ctx.stroke();

  // Tip Marker
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(tipPt.x, tipPt.y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.fillText('V⃗', tipPt.x + 10, tipPt.y - 6);

  ctx.restore();

  const pythagoreanCheck = Math.sqrt(vx * vx + vy * vy + vz * vz);

  onTelem({
    vector_notation: `${vx.toFixed(2)}î + ${vy.toFixed(2)}ĵ + ${vz.toFixed(2)}k̂`,
    v_magnitude: `${mag.toFixed(2)}`,
    pythagorean_verify: `√(Vx² + Vy² + Vz²) = ${pythagoreanCheck.toFixed(2)}`,
    direction_cosines: `cos α = ${(vx / mag).toFixed(2)}, cos β = ${(vy / mag).toFixed(2)}, cos γ = ${(vz / mag).toFixed(2)}`
  });
}
