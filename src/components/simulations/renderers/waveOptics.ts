// ==========================================
// WAVE OPTICS SIMULATION RENDERERS
// ==========================================

function wavelengthToColor(wavelengthNm: number): string {
  if (wavelengthNm >= 380 && wavelengthNm < 440) return '#8B5CF6'; // Violet
  if (wavelengthNm >= 440 && wavelengthNm < 490) return '#3B82F6'; // Blue
  if (wavelengthNm >= 490 && wavelengthNm < 510) return '#06B6D4'; // Cyan
  if (wavelengthNm >= 510 && wavelengthNm < 580) return '#10B981'; // Green
  if (wavelengthNm >= 580 && wavelengthNm < 645) return '#F59E0B'; // Yellow/Orange
  if (wavelengthNm >= 645 && wavelengthNm <= 750) return '#EF4444'; // Red
  return '#38BDF8';
}

export function renderYDSE(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  t: number,
  onTelem: (data: Record<string, string>) => void
) {
  const lambdaNm = params.wavelength ?? 550; // nm
  const slitDistMm = params.slit_distance ?? 0.5; // mm (d)
  const screenDistM = params.screen_distance ?? 1.2; // m (D)

  const beamColor = wavelengthToColor(lambdaNm);
  // Fringe width beta = (lambda * D) / d
  // lambda in m: lambdaNm * 1e-9, D in m, d in m: slitDistMm * 1e-3
  const fringeWidthMm = (lambdaNm * 1e-6 * screenDistM) / (slitDistMm * 1e-3);
  const betaPx = Math.min(60, Math.max(12, fringeWidthMm * 24));

  const slitWallX = w * 0.22;
  const screenX = w * 0.76;
  const cy = h * 0.5;

  const dSeparationPx = Math.min(100, Math.max(25, slitDistMm * 65));
  const slit1Y = cy - dSeparationPx / 2;
  const slit2Y = cy + dSeparationPx / 2;

  ctx.save();

  // 1. Incoming Plane Wavefronts
  ctx.strokeStyle = beamColor;
  ctx.lineWidth = 1.5;
  const planeSpacing = 20;
  const planeOffset = (t * 40) % planeSpacing;

  for (let x = 20; x < slitWallX - 4; x += planeSpacing) {
    const curX = x + planeOffset;
    if (curX < slitWallX - 4) {
      ctx.beginPath();
      ctx.moveTo(curX, cy - 80);
      ctx.lineTo(curX, cy + 80);
      ctx.stroke();
    }
  }

  // 2. Slit Barrier Wall (Dark with 2 Pinholes)
  ctx.fillStyle = '#334155';
  ctx.fillRect(slitWallX - 4, 30, 8, slit1Y - 35);
  ctx.fillRect(slitWallX - 4, slit1Y + 5, 8, slit2Y - slit1Y - 10);
  ctx.fillRect(slitWallX - 4, slit2Y + 5, 8, h - slit2Y - 35);

  // Slit Source Labels
  ctx.fillStyle = '#94A3B8';
  ctx.font = '10px JetBrains Mono';
  ctx.textAlign = 'right';
  ctx.fillText('S₁', slitWallX - 8, slit1Y + 3);
  ctx.fillText('S₂', slitWallX - 8, slit2Y + 3);

  // 3. Expanding Circular Wavefront Ripples from S1 & S2
  const numRings = 12;
  const ringSpacing = 24;
  const ringAnim = (t * 35) % ringSpacing;

  ctx.lineWidth = 1.2;
  for (let r = 0; r < numRings; r++) {
    const radius = r * ringSpacing + ringAnim;
    if (radius > screenX - slitWallX + 30) continue;

    const alpha = Math.max(0.04, 0.45 * (1 - radius / (screenX - slitWallX + 40)));
    ctx.strokeStyle = `${beamColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;

    // Wavefront from S1
    ctx.beginPath();
    ctx.arc(slitWallX, slit1Y, radius, -Math.PI / 2.2, Math.PI / 2.2);
    ctx.stroke();

    // Wavefront from S2
    ctx.beginPath();
    ctx.arc(slitWallX, slit2Y, radius, -Math.PI / 2.2, Math.PI / 2.2);
    ctx.stroke();
  }

  // 4. Optical Screen on Right (Interference Fringes)
  const screenW = 28;
  const screenH = h - 60;
  const screenY = 30;

  for (let y = screenY; y < screenY + screenH; y += 2) {
    const yRel = y - cy;
    const phase = (Math.PI * yRel) / betaPx;
    const intensity = Math.pow(Math.cos(phase), 2);

    ctx.fillStyle = `${beamColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
    ctx.fillRect(screenX, y, screenW, 2);
  }

  // Screen Border
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(screenX, screenY, screenW, screenH);

  // 5. Intensity Distribution Curve I(y) beside screen
  const plotX = screenX + screenW + 12;
  const maxPlotW = w - plotX - 20;

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.beginPath();
  ctx.moveTo(plotX, screenY);
  ctx.lineTo(plotX, screenY + screenH);
  ctx.stroke();

  ctx.strokeStyle = beamColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let y = screenY; y < screenY + screenH; y += 2) {
    const yRel = y - cy;
    const phase = (Math.PI * yRel) / betaPx;
    const intensity = Math.pow(Math.cos(phase), 2);
    const px = plotX + intensity * Math.min(65, maxPlotW);

    if (y === screenY) ctx.moveTo(px, y);
    else ctx.lineTo(px, y);
  }
  ctx.stroke();

  // Central Maximum Marker
  ctx.fillStyle = '#FACC15';
  ctx.font = 'bold 10px JetBrains Mono';
  ctx.textAlign = 'left';
  ctx.fillText('Central Maxima (y = 0)', screenX + screenW + 10, cy - 6);

  ctx.restore();

  onTelem({
    fringe_width: `${fringeWidthMm.toFixed(2)} mm`,
    beam_color: `${lambdaNm} nm (${beamColor})`,
    path_diff_first_min: `λ/2 = ${(lambdaNm / 2).toFixed(1)} nm`,
    fringe_spacing: `β = λD / d`
  });
}

export function renderSingleSlitDiffraction(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  onTelem: (data: Record<string, string>) => void
) {
  const lambdaNm = params.wavelength ?? 600; // nm
  const slitWidthUm = params.slit_width ?? 12; // micrometers (a)
  const screenDistM = params.screen_distance ?? 1.0; // m (D)

  const beamColor = wavelengthToColor(lambdaNm);
  // Central maximum angular half-width theta = lambda / a
  // Central width on screen 2y_0 = 2 * lambda * D / a
  const centralWidthMm = (2 * lambdaNm * 1e-9 * screenDistM) / (slitWidthUm * 1e-6) * 1000;
  const centralPx = Math.min(180, Math.max(30, centralWidthMm * 2));

  const slitX = w * 0.24;
  const screenX = w * 0.74;
  const cy = h * 0.5;

  ctx.save();

  // 1. Slit Barrier
  const slitAperturePx = Math.min(50, Math.max(15, slitWidthUm * 2.5));
  ctx.fillStyle = '#334155';
  ctx.fillRect(slitX - 4, 30, 8, cy - slitAperturePx / 2 - 30);
  ctx.fillRect(slitX - 4, cy + slitAperturePx / 2, 8, h - cy - slitAperturePx / 2 - 30);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '10px JetBrains Mono';
  ctx.textAlign = 'right';
  ctx.fillText(`Slit a = ${slitWidthUm}μm`, slitX - 10, cy);

  // 2. Diffracted Ray Envelope
  ctx.fillStyle = `${beamColor}18`;
  ctx.beginPath();
  ctx.moveTo(slitX + 4, cy - slitAperturePx / 2);
  ctx.lineTo(screenX, cy - centralPx / 2);
  ctx.lineTo(screenX, cy + centralPx / 2);
  ctx.lineTo(slitX + 4, cy + slitAperturePx / 2);
  ctx.closePath();
  ctx.fill();

  // 3. Screen Optical Intensity: I = I_0 * (sin(beta) / beta)^2
  const screenW = 28;
  const screenH = h - 60;
  const screenY = 30;

  for (let y = screenY; y < screenY + screenH; y += 2) {
    const yRel = y - cy;
    const beta = (Math.PI * yRel) / (centralPx / 2);
    let intensity = 0;
    if (Math.abs(beta) < 0.001) intensity = 1.0;
    else intensity = Math.pow(Math.sin(beta) / beta, 2);

    ctx.fillStyle = `${beamColor}${Math.floor(Math.min(255, intensity * 255)).toString(16).padStart(2, '0')}`;
    ctx.fillRect(screenX, y, screenW, 2);
  }

  // Screen Border
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(screenX, screenY, screenW, screenH);

  // 4. Intensity Curve beside screen
  const plotX = screenX + screenW + 12;
  const maxPlotW = w - plotX - 20;

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.beginPath();
  ctx.moveTo(plotX, screenY);
  ctx.lineTo(plotX, screenY + screenH);
  ctx.stroke();

  ctx.strokeStyle = beamColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let y = screenY; y < screenY + screenH; y += 2) {
    const yRel = y - cy;
    const beta = (Math.PI * yRel) / (centralPx / 2);
    let intensity = 0;
    if (Math.abs(beta) < 0.001) intensity = 1.0;
    else intensity = Math.pow(Math.sin(beta) / beta, 2);

    const px = plotX + intensity * Math.min(80, maxPlotW);
    if (y === screenY) ctx.moveTo(px, y);
    else ctx.lineTo(px, y);
  }
  ctx.stroke();

  ctx.restore();

  onTelem({
    central_maximum_width: `${centralWidthMm.toFixed(2)} mm`,
    angular_half_width: `${((lambdaNm * 1e-9) / (slitWidthUm * 1e-6) * (180 / Math.PI)).toFixed(3)}°`,
    first_minima_condition: `a · sin θ = ±λ`,
    diffraction_scale: slitWidthUm < 20 ? 'Strong Fraunhofer Diffraction' : 'Narrowing Central Band'
  });
}

export function renderThinFilmInterference(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  onTelem: (data: Record<string, string>) => void
) {
  const thicknessNm = params.thickness ?? 480; // nm (t)
  const mu = params.refractive_index ?? 1.33; // soap film ~ 1.33, oil ~ 1.50
  const angleDeg = params.incident_angle ?? 30;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Snell's Law in film: 1 * sin(i) = mu * sin(r)
  const sinR = Math.sin(angleRad) / mu;
  const cosR = Math.sqrt(Math.max(0, 1 - sinR * sinR));
  const rDeg = (Math.asin(sinR) * 180) / Math.PI;

  // Optical Path Difference: Delta = 2 * mu * t * cos(r)
  // Reflection at upper boundary has pi (180 deg) phase flip (equivalent to lambda/2 path diff)
  const deltaNm = 2 * mu * thicknessNm * cosR;

  // Primary constructive wavelengths in visible band (380 - 750 nm):
  // 2 * mu * t * cos(r) = (m + 0.5) * lambda  => lambda = Delta / (m + 0.5)
  const visibleConstructive: number[] = [];
  for (let m = 0; m <= 6; m++) {
    const lam = deltaNm / (m + 0.5);
    if (lam >= 380 && lam <= 750) {
      visibleConstructive.push(Math.round(lam));
    }
  }

  const filmY = h * 0.42;
  const filmHeight = Math.min(120, Math.max(40, (thicknessNm / 600) * 80));

  ctx.save();

  // 1. Air Medium (Top)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.fillRect(0, 0, w, filmY);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '11px JetBrains Mono';
  ctx.fillText('Medium 1: Air (n₁ = 1.00)', 30, filmY - 20);

  // 2. Thin Dielectric Film (Soap/Oil)
  const filmGrad = ctx.createLinearGradient(0, filmY, 0, filmY + filmHeight);
  filmGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
  filmGrad.addColorStop(1, 'rgba(59, 130, 246, 0.25)');
  ctx.fillStyle = filmGrad;
  ctx.fillRect(0, filmY, w, filmHeight);

  // Film Boundaries
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, filmY);
  ctx.lineTo(w, filmY);
  ctx.moveTo(0, filmY + filmHeight);
  ctx.lineTo(w, filmY + filmHeight);
  ctx.stroke();

  ctx.fillStyle = '#38BDF8';
  ctx.fillText(`Thin Film (n₂ = ${mu.toFixed(2)}, t = ${thicknessNm} nm)`, 30, filmY + 22);

  // 3. Medium 3 (Bottom Substrate or Air)
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('Medium 3: Air (n₃ = 1.00)', 30, filmY + filmHeight + 25);

  // 4. Ray Optics Tracing
  const entryX = w * 0.45;
  const rayLen = 90;

  // Incident Ray
  const incStartX = entryX - rayLen * Math.sin(angleRad);
  const incStartY = filmY - rayLen * Math.cos(angleRad);
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(incStartX, incStartY);
  ctx.lineTo(entryX, filmY);
  ctx.stroke();

  // Ray 1: Reflected at Top Surface (Phase flip pi)
  const ref1EndX = entryX + rayLen * Math.sin(angleRad);
  const ref1EndY = filmY - rayLen * Math.cos(angleRad);
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(entryX, filmY);
  ctx.lineTo(ref1EndX, ref1EndY);
  ctx.stroke();
  ctx.fillStyle = '#38BDF8';
  ctx.font = '10px JetBrains Mono';
  ctx.fillText('Ray 1 (Phase Shift π)', ref1EndX + 6, ref1EndY);

  // Ray 2: Refracts down into film
  const bottomX = entryX + filmHeight * Math.tan((rDeg * Math.PI) / 180);
  const bottomY = filmY + filmHeight;
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(entryX, filmY);
  ctx.lineTo(bottomX, bottomY);

  // Reflects off bottom boundary and exits top surface
  const exitX = bottomX + filmHeight * Math.tan((rDeg * Math.PI) / 180);
  ctx.lineTo(exitX, filmY);
  ctx.stroke();

  // Ray 2 Exiting into air (parallel to Ray 1)
  const ref2EndX = exitX + rayLen * Math.sin(angleRad);
  const ref2EndY = filmY - rayLen * Math.cos(angleRad);
  ctx.strokeStyle = '#F43F5E';
  ctx.beginPath();
  ctx.moveTo(exitX, filmY);
  ctx.lineTo(ref2EndX, ref2EndY);
  ctx.stroke();
  ctx.fillStyle = '#F43F5E';
  ctx.fillText('Ray 2', ref2EndX + 6, ref2EndY);

  // 5. Resultant Reflected Color Palette Swatch (Iridescence)
  const swatchX = w * 0.78;
  const swatchY = filmY - 80;
  const swatchW = 75;
  const swatchH = 45;

  const domColor = visibleConstructive.length > 0 ? wavelengthToColor(visibleConstructive[0]) : '#64748B';
  ctx.fillStyle = domColor;
  ctx.fillRect(swatchX, swatchY, swatchW, swatchH);
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(swatchX, swatchY, swatchW, swatchH);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '10px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText('Dominant Color', swatchX + swatchW / 2, swatchY + swatchH + 15);

  ctx.restore();

  onTelem({
    path_difference: `2μt·cos(r) = ${deltaNm.toFixed(1)} nm`,
    refraction_angle: `r = ${rDeg.toFixed(1)}°`,
    constructive_colors: visibleConstructive.length > 0 ? visibleConstructive.map(l => `${l} nm`).join(', ') : 'None in visible band (Destructive)',
    phase_flip_status: 'π Phase Shift at Top Interface'
  });
}
