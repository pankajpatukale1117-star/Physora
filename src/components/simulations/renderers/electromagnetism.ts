// ==========================================
// ELECTROMAGNETISM SIMULATION RENDERERS
// ==========================================

export function renderLorentzCyclotron(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  t: number,
  onTelem: (data: Record<string, string>) => void
) {
  const q = params.charge ?? 1; // +1, -1, 0 elementary charges
  const v = params.velocity ?? 30; // m/s
  const B = params.b_field ?? 2; // Tesla
  const pitchAngleDeg = params.pitch_angle ?? 20; // degrees out of plane
  const pitchRad = (pitchAngleDeg * Math.PI) / 180;

  const vPerp = v * Math.cos(pitchRad);
  const vParallel = v * Math.sin(pitchRad);

  const mass = 1.0;
  // Radius r = m * vPerp / (|q| * B)
  const effQ = Math.max(0.1, Math.abs(q));
  const rPhys = (mass * vPerp) / (effQ * Math.max(0.1, Math.abs(B)));
  const rScreen = Math.min(130, Math.max(25, rPhys * 3.5));
  const omega = (q * B) / mass;
  const period = Math.abs(omega) > 0.001 ? (2 * Math.PI) / Math.abs(omega) : 999;
  const fLorentz = Math.abs(q) * vPerp * B;

  const cx = w * 0.46;
  const cy = h * 0.50;

  // 1. Draw Magnetic Field Indicator Grid
  ctx.save();
  const gridSize = 45;
  for (let x = 60; x < w - 60; x += gridSize) {
    for (let y = 50; y < h - 50; y += gridSize) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.2;

      if (B >= 0) {
        // Into page: Draw "X" inside circle
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 3, y - 3);
        ctx.lineTo(x + 3, y + 3);
        ctx.moveTo(x + 3, y - 3);
        ctx.lineTo(x - 3, y + 3);
        ctx.stroke();
      } else {
        // Out of page: Draw dot inside circle
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Label for B-field
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.textAlign = 'left';
  ctx.fillText(B >= 0 ? 'Magnetic Field B ⊗ (Into Screen)' : 'Magnetic Field B ⊙ (Out of Screen)', 40, 32);

  // 2. Draw Helical or Circular Trajectory
  ctx.beginPath();
  const numPts = 160;
  const driftRate = vParallel * 0.8;
  const timeWindow = 8;

  for (let i = 0; i <= numPts; i++) {
    const s = (i / numPts) * timeWindow;
    const ang = omega * s;
    const px = cx + rScreen * Math.cos(ang) + (s - timeWindow / 2) * driftRate * 5;
    const py = cy + rScreen * Math.sin(ang) * 0.8; // subtle perspective tilt

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = q >= 0 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(244, 63, 94, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // 3. Current Particle Position
  const currAng = omega * (t * 2);
  const partX = cx + rScreen * Math.cos(currAng) + Math.sin(t * 0.8) * driftRate * 12;
  const partY = cy + rScreen * Math.sin(currAng) * 0.8;

  // Glow
  const glowGrad = ctx.createRadialGradient(partX, partY, 2, partX, partY, 22);
  const col = q > 0 ? '#00F0FF' : q < 0 ? '#F43F5E' : '#94A3B8';
  glowGrad.addColorStop(0, col);
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(partX, partY, 22, 0, Math.PI * 2);
  ctx.fill();

  // Core Particle
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(partX, partY, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 10px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(q > 0 ? '+q' : q < 0 ? '-q' : '0', partX, partY);

  // 4. Force Vector towards Center (Lorentz F = q(v x B))
  if (Math.abs(q) > 0.05 && Math.abs(B) > 0.05) {
    const fAngle = currAng + (q > 0 ? Math.PI : 0);
    const fLen = 40;
    const fx = partX + Math.cos(fAngle) * fLen;
    const fy = partY + Math.sin(fAngle) * fLen * 0.8;

    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(partX, partY);
    ctx.lineTo(fx, fy);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FACC15';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('F_mag', fx + 8, fy);
  }

  // 5. Velocity Vector (tangential)
  const vAngle = currAng + (omega >= 0 ? Math.PI / 2 : -Math.PI / 2);
  const vx = partX + Math.cos(vAngle) * 35;
  const vy = partY + Math.sin(vAngle) * 35 * 0.8;

  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(partX, partY);
  ctx.lineTo(vx, vy);
  ctx.stroke();
  ctx.fillStyle = '#10B981';
  ctx.font = '10px JetBrains Mono';
  ctx.fillText('v', vx + 6, vy);

  ctx.restore();

  onTelem({
    cyclotron_radius: `${rPhys.toFixed(2)} m`,
    cyclotron_omega: `${Math.abs(omega).toFixed(2)} rad/s`,
    time_period: `${period.toFixed(3)} s`,
    lorentz_force: `${fLorentz.toFixed(2)} N`
  });
}

export function renderCoulombDipole(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  onTelem: (data: Record<string, string>) => void
) {
  const q1 = params.q1 ?? 2; // microCoulombs
  const q2 = params.q2 ?? -2;
  const dCm = params.separation ?? 14; // cm
  const sepPx = dCm * 16;

  const cx = w / 2;
  const cy = h / 2;
  const p1 = { x: cx - sepPx / 2, y: cy };
  const p2 = { x: cx + sepPx / 2, y: cy };

  // 1. Draw Equipotential Contours
  ctx.save();
  const k = 8.99; // k constant scale
  const res = 18;
  for (let x = 40; x < w - 40; x += res) {
    for (let y = 40; y < h - 40; y += res) {
      const r1 = Math.hypot(x - p1.x, y - p1.y);
      const r2 = Math.hypot(x - p2.x, y - p2.y);
      if (r1 < 25 || r2 < 25) continue;

      // E-field components
      const E1 = (k * q1) / (r1 * r1);
      const E2 = (k * q2) / (r2 * r2);
      const Ex = E1 * ((x - p1.x) / r1) + E2 * ((x - p2.x) / r2);
      const Ey = E1 * ((y - p1.y) / r1) + E2 * ((y - p2.y) / r2);
      const Emag = Math.hypot(Ex, Ey);

      if (Emag > 0.001) {
        const arrowLen = Math.min(14, Math.max(5, Emag * 18));
        const uEx = (Ex / Emag) * arrowLen;
        const uEy = (Ey / Emag) * arrowLen;

        const alpha = Math.min(0.65, Math.max(0.12, Emag * 1.5));
        ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - uEx * 0.4, y - uEy * 0.4);
        ctx.lineTo(x + uEx * 0.6, y + uEy * 0.6);
        ctx.stroke();
      }
    }
  }

  // 2. Draw Streamlines / Curved Field Lines from charges
  const drawFieldLine = (startX: number, startY: number, stepSign: number) => {
    let px = startX;
    let py = startY;
    ctx.beginPath();
    ctx.moveTo(px, py);

    for (let step = 0; step < 90; step++) {
      const r1 = Math.hypot(px - p1.x, py - p1.y);
      const r2 = Math.hypot(px - p2.x, py - p2.y);
      if (r1 < 14 || r2 < 14 || px < 20 || px > w - 20 || py < 20 || py > h - 20) break;

      const E1 = (k * q1) / (r1 * r1);
      const E2 = (k * q2) / (r2 * r2);
      const Ex = E1 * ((px - p1.x) / r1) + E2 * ((px - p2.x) / r2);
      const Ey = E1 * ((py - p1.y) / r1) + E2 * ((py - p2.y) / r2);
      const Emag = Math.hypot(Ex, Ey);
      if (Emag < 0.0001) break;

      px += (Ex / Emag) * 7 * stepSign;
      py += (Ey / Emag) * 7 * stepSign;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  };

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
  ctx.lineWidth = 1.4;
  const numAngles = 14;
  for (let a = 0; a < numAngles; a++) {
    const th = (a / numAngles) * Math.PI * 2;
    if (q1 > 0) drawFieldLine(p1.x + Math.cos(th) * 16, p1.y + Math.sin(th) * 16, 1);
    else if (q1 < 0) drawFieldLine(p1.x + Math.cos(th) * 16, p1.y + Math.sin(th) * 16, -1);

    if (q2 > 0) drawFieldLine(p2.x + Math.cos(th) * 16, p2.y + Math.sin(th) * 16, 1);
    else if (q2 < 0) drawFieldLine(p2.x + Math.cos(th) * 16, p2.y + Math.sin(th) * 16, -1);
  }

  // 3. Draw Point Charges
  const renderCharge = (pos: { x: number; y: number }, qVal: number, label: string) => {
    const isPos = qVal > 0;
    const col = isPos ? '#00F0FF' : '#F43F5E';

    ctx.fillStyle = `${col}25`;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isPos ? `+${qVal}μC` : `${qVal}μC`, pos.x, pos.y);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText(label, pos.x, pos.y + 26);
  };

  renderCharge(p1, q1, 'Charge Q₁');
  renderCharge(p2, q2, 'Charge Q₂');

  // Dipole moment calculation: p = q * d
  const dipoleMoment = Math.abs(q1) * (dCm * 1e-2);
  const midForce = (k * Math.abs(q1 * q2)) / Math.pow(dCm * 0.01, 2);

  ctx.restore();

  onTelem({
    coulomb_force: `${midForce.toFixed(2)} N (${q1 * q2 > 0 ? 'Repulsive' : 'Attractive'})`,
    dipole_moment: `${dipoleMoment.toFixed(2)} × 10⁻⁶ C·m`,
    separation_dist: `${dCm.toFixed(1)} cm`,
    config_type: q1 * q2 < 0 ? 'Electric Dipole (+/-)' : 'Like Charges (+/+ or -/-)'
  });
}

export function renderFaradayInduction(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  t: number,
  onTelem: (data: Record<string, string>) => void
) {
  const B = params.b_field ?? 1.5; // Tesla
  const rpm = params.rpm ?? 60; // rotations per minute
  const numTurns = params.num_turns ?? 50;
  const loopArea = params.area ?? 0.04; // m^2

  const omega = (rpm * 2 * Math.PI) / 60;
  const angle = (omega * t) % (2 * Math.PI);

  const flux = B * loopArea * Math.cos(angle);
  const peakEMF = numTurns * B * loopArea * omega;
  const emf = peakEMF * Math.sin(angle);

  const cx = w * 0.38;
  const cy = h * 0.48;

  ctx.save();

  // 1. Draw Magnetic Pole Shoes (North on Left, South on Right)
  const poleW = 60;
  const poleH = 140;

  // North Pole (Red)
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(cx - 150, cy - poleH / 2, poleW, poleH);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', cx - 120, cy);

  // South Pole (Blue)
  ctx.fillStyle = '#3B82F6';
  ctx.fillRect(cx + 90, cy - poleH / 2, poleW, poleH);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('S', cx + 120, cy);

  // Magnetic Field Lines between poles
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1.5;
  for (let yOff = -50; yOff <= 50; yOff += 25) {
    ctx.beginPath();
    ctx.moveTo(cx - 90, cy + yOff);
    ctx.lineTo(cx + 90, cy + yOff);
    ctx.stroke();

    // Arrowheads pointing N -> S
    ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.beginPath();
    ctx.moveTo(cx, cy + yOff);
    ctx.lineTo(cx - 6, cy + yOff - 3);
    ctx.lineTo(cx - 6, cy + yOff + 3);
    ctx.fill();
  }

  // 2. Rotating Armature Coil (Perspective Loop)
  const coilW = 65;
  const coilH = 80;
  const cosAng = Math.cos(angle);
  const sinAng = Math.sin(angle);

  ctx.save();
  ctx.translate(cx, cy);

  // Rotating rectangular loop
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, Math.abs(coilW * cosAng), coilH, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Normal vector to coil
  const normLen = 50;
  const nx = normLen * sinAng;
  const ny = -normLen * cosAng * 0.4;
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(nx, ny);
  ctx.stroke();
  ctx.fillStyle = '#10B981';
  ctx.font = '10px JetBrains Mono';
  ctx.fillText('n̂', nx + 4, ny);

  ctx.restore();

  // 3. Real-Time Oscilloscope Output on Right (Voltage Waveform)
  const scopeX = w * 0.68;
  const scopeY = cy - 70;
  const scopeW = w * 0.28;
  const scopeH = 140;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.fillRect(scopeX, scopeY, scopeW, scopeH);
  ctx.strokeRect(scopeX, scopeY, scopeW, scopeH);

  // Center zero line
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.beginPath();
  ctx.moveTo(scopeX, scopeY + scopeH / 2);
  ctx.lineTo(scopeX + scopeW, scopeY + scopeH / 2);
  ctx.stroke();

  // Sine Wave plot
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < scopeW; i++) {
    const waveAngle = angle - (i / scopeW) * 4 * Math.PI;
    const val = Math.sin(waveAngle);
    const py = scopeY + scopeH / 2 - (val * (scopeH / 2 - 14));
    if (i === 0) ctx.moveTo(scopeX + scopeW - i, py);
    else ctx.lineTo(scopeX + scopeW - i, py);
  }
  ctx.stroke();

  // Scope label
  ctx.fillStyle = '#00F0FF';
  ctx.font = '10px JetBrains Mono';
  ctx.textAlign = 'left';
  ctx.fillText('Induced EMF (Oscilloscope)', scopeX + 8, scopeY + 16);
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(`Peak: ±${peakEMF.toFixed(1)} V`, scopeX + 8, scopeY + scopeH - 10);

  // 4. Glowing Neon Light Bulb Indicator
  const bulbX = cx;
  const bulbY = cy + 110;
  const intensity = Math.min(1, Math.pow(emf / (peakEMF || 1), 2));

  const bulbGrad = ctx.createRadialGradient(bulbX, bulbY, 2, bulbX, bulbY, 20);
  bulbGrad.addColorStop(0, `rgba(250, 204, 21, ${0.2 + intensity * 0.8})`);
  bulbGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = bulbGrad;
  ctx.beginPath();
  ctx.arc(bulbX, bulbY, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = intensity > 0.3 ? '#FACC15' : '#475569';
  ctx.beginPath();
  ctx.arc(bulbX, bulbY, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '10px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText('AC Load Bulb', bulbX, bulbY + 18);

  ctx.restore();

  onTelem({
    instant_emf: `${emf.toFixed(2)} V`,
    peak_emf: `${peakEMF.toFixed(2)} V`,
    magnetic_flux: `${(flux * 1000).toFixed(2)} mWb`,
    ac_frequency: `${(omega / (2 * Math.PI)).toFixed(1)} Hz`
  });
}
