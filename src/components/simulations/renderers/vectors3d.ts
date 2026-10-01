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

export function renderRiverBoatNavigator(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  t: number,
  onTelem: (data: Record<string, string>) => void
) {
  const vBoat = params.boat_speed ?? 5; // m/s relative to water
  const vRiver = params.river_speed ?? 3; // m/s
  const thetaDeg = params.heading_angle ?? 120; // angle with downstream river direction
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const riverWidthM = params.river_width ?? 100; // meters

  // Ground components
  // x-axis is downstream (rightwards), y-axis is cross-stream (upwards across river)
  const vNetX = vRiver + vBoat * Math.cos(thetaRad);
  const vNetY = vBoat * Math.sin(thetaRad); // Must be > 0 to cross
  const vNetMag = Math.hypot(vNetX, vNetY);

  const crossTimeS = vNetY > 0.1 ? riverWidthM / vNetY : 999;
  const driftM = vNetX * crossTimeS;

  const bankTop = h * 0.22;
  const bankBottom = h * 0.75;
  const riverHeightPx = bankBottom - bankTop;
  const pxPerMeter = riverHeightPx / riverWidthM;

  ctx.save();

  // 1. River Banks (Green Grass / Concrete)
  ctx.fillStyle = '#064E3B';
  ctx.fillRect(0, 0, w, bankTop);
  ctx.fillRect(0, bankBottom, w, h - bankBottom);

  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillText('Bank B (Destination Bank)', 24, bankTop - 12);
  ctx.fillText('Bank A (Starting Bank)', 24, bankBottom + 20);

  // 2. River Water with Flowing Currents
  const riverGrad = ctx.createLinearGradient(0, bankTop, 0, bankBottom);
  riverGrad.addColorStop(0, '#0284C7');
  riverGrad.addColorStop(1, '#0369A1');
  ctx.fillStyle = riverGrad;
  ctx.fillRect(0, bankTop, w, riverHeightPx);

  // Flow arrows
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1.2;
  const arrowSpacing = 65;
  const currentOffset = (t * vRiver * 18) % arrowSpacing;

  for (let x = -arrowSpacing + currentOffset; x < w; x += arrowSpacing) {
    for (let y = bankTop + 25; y < bankBottom - 15; y += 45) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 24, y);
      ctx.lineTo(x + 18, y - 4);
      ctx.moveTo(x + 24, y);
      ctx.lineTo(x + 18, y + 4);
      ctx.stroke();
    }
  }

  // 3. Starting Point & Target Opposite Point
  const startX = w * 0.28;
  const startY = bankBottom;
  const directlyOppositeX = startX;
  const directlyOppositeY = bankTop;

  // Dashed perpendicular line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(directlyOppositeX, directlyOppositeY);
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Net Ground Trajectory Line
  const netDestX = startX + driftM * pxPerMeter;
  const netDestY = bankTop;

  ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(netDestX, netDestY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Drift distance measurement
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(directlyOppositeX, directlyOppositeY - 8);
  ctx.lineTo(netDestX, netDestY - 8);
  ctx.stroke();
  ctx.fillStyle = '#FACC15';
  ctx.font = '10px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText(`Drift x = ${driftM.toFixed(1)} m`, (directlyOppositeX + netDestX) / 2, directlyOppositeY - 14);

  // 5. Animated Boat Position
  const cyclePeriod = Math.min(8, Math.max(3, crossTimeS * 0.4));
  const progress = (t % cyclePeriod) / cyclePeriod;
  const boatX = startX + (driftM * pxPerMeter) * progress;
  const boatY = startY - riverHeightPx * progress;

  // Boat Wake
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.beginPath();
  ctx.arc(boatX, boatY, 12, 0, Math.PI * 2);
  ctx.fill();

  // Boat Body
  ctx.save();
  ctx.translate(boatX, boatY);
  ctx.rotate(-thetaRad + Math.PI / 2);

  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(8, 12);
  ctx.lineTo(-8, 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 6. Vector Addition Triangle at Starting Anchor
  const vecScale = 8;
  const vbx = vBoat * Math.cos(thetaRad) * vecScale;
  const vby = -vBoat * Math.sin(thetaRad) * vecScale;
  const vrx = vRiver * vecScale;

  // Vector v_b (Boat in water)
  ctx.strokeStyle = '#F43F5E';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX + vbx, startY + vby);
  ctx.stroke();
  ctx.fillStyle = '#F43F5E';
  ctx.font = '10px JetBrains Mono';
  ctx.fillText('v⃗_b', startX + vbx / 2 - 12, startY + vby / 2);

  // Vector v_r (River)
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(startX + vbx, startY + vby);
  ctx.lineTo(startX + vbx + vrx, startY + vby);
  ctx.stroke();
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('v⃗_r', startX + vbx + vrx / 2, startY + vby - 6);

  // Resultant Net Vector v_net
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX + vbx + vrx, startY + vby);
  ctx.stroke();
  ctx.fillStyle = '#10B981';
  ctx.fillText('v⃗_ground', startX + (vbx + vrx) / 2 + 10, startY + vby / 2 + 10);

  ctx.restore();

  onTelem({
    crossing_time: `${crossTimeS.toFixed(1)} s`,
    drift_distance: `${driftM.toFixed(1)} m`,
    net_velocity: `${vNetMag.toFixed(2)} m/s`,
    shortest_path_condition: vBoat >= vRiver ? `Optimal angle: ${(180 - (Math.asin(vRiver / vBoat) * 180) / Math.PI).toFixed(1)}°` : 'Impossible (v_boat < v_river)'
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
