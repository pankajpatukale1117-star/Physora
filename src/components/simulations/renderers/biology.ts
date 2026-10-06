// ==========================================
// BIOLOGY SIMULATION RENDERERS (PhET Calibrated)
// Topics:
// 1. Natural Selection (Bunnies, Wolves, Camouflage & Genetics)
// 2. Gene Expression Essentials (DNA Transcription & Translation)
// 3. Membrane Transport (Diffusion, Ion Channels & ATP Pump)
// 4. Neuron (Action Potential & Voltage-Gated Channels)
// ==========================================

// ----------------------------------------------------
// 1. NATURAL SELECTION
// ----------------------------------------------------
interface Bunny {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trait: 'white' | 'brown';
  alive: boolean;
  hopPhase: number;
}

interface Wolf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetBunnyIdx: number;
}

// Persistent simulation state caches
let bunniesState: Bunny[] = [];
let wolvesState: Wolf[] = [];
let lastSimTime = 0;
let historyCounts: { time: number; white: number; brown: number }[] = [];

export function renderNaturalSelection(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  t: number,
  onTelem: (data: Record<string, string>) => void
) {
  const wolvesCount = Math.round(params.wolves ?? 2);
  const environment = Math.round(params.environment ?? 0); // 0: Arctic Snow, 1: Savannah Grass
  const brownMutation = Math.round(params.mutation ?? 1); // 1: Brown fur mutation present, 0: White only
  const foodAbundance = params.food ?? 70; // 20 to 100%

  // Time delta
  const dt = Math.min(0.05, Math.max(0.01, t - lastSimTime));
  lastSimTime = t;

  // Initialize or reseed bunnies if needed
  if (bunniesState.length === 0 || bunniesState.filter((b) => b.alive).length < 2) {
    bunniesState = [];
    const initialPop = 14;
    for (let i = 0; i < initialPop; i++) {
      bunniesState.push({
        x: 60 + Math.random() * (w - 180),
        y: 80 + Math.random() * (h - 180),
        vx: (Math.random() - 0.5) * 35,
        vy: (Math.random() - 0.5) * 35,
        trait: brownMutation === 1 && i % 3 === 0 ? 'brown' : 'white',
        alive: true,
        hopPhase: Math.random() * Math.PI * 2
      });
    }
  }

  // Sync wolves
  while (wolvesState.length < wolvesCount) {
    wolvesState.push({
      x: Math.random() < 0.5 ? 40 : w - 80,
      y: 60 + Math.random() * (h - 160),
      vx: (Math.random() - 0.5) * 45,
      vy: (Math.random() - 0.5) * 45,
      targetBunnyIdx: -1
    });
  }
  if (wolvesState.length > wolvesCount) {
    wolvesState = wolvesState.slice(0, wolvesCount);
  }

  // Update Bunny positions and reproduction
  const isArctic = environment === 0;
  // In Arctic: White bunnies are camouflaged, Brown are vulnerable.
  // In Savannah: Brown bunnies are camouflaged, White are vulnerable.
  const whiteVulnerability = isArctic ? 0.25 : 0.85;
  const brownVulnerability = isArctic ? 0.85 : 0.25;

  bunniesState.forEach((b) => {
    if (!b.alive) return;
    b.hopPhase += dt * 5;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // Boundary bounces
    const minX = 40;
    const maxX = w - 160;
    const minY = 60;
    const maxY = h - 110;

    if (b.x < minX) { b.x = minX; b.vx *= -1; }
    if (b.x > maxX) { b.x = maxX; b.vx *= -1; }
    if (b.y < minY) { b.y = minY; b.vy *= -1; }
    if (b.y > maxY) { b.y = maxY; b.vy *= -1; }

    // Random turn
    if (Math.random() < 0.02) {
      b.vx = (Math.random() - 0.5) * 40;
      b.vy = (Math.random() - 0.5) * 40;
    }
  });

  // Reproduction cycle (every ~3.5 seconds)
  if (Math.floor(t * 0.3) > Math.floor((t - dt) * 0.3) && bunniesState.length < 40) {
    const aliveBunnies = bunniesState.filter((b) => b.alive);
    if (aliveBunnies.length >= 2) {
      const parent = aliveBunnies[Math.floor(Math.random() * aliveBunnies.length)];
      let childTrait = parent.trait;
      if (brownMutation === 1 && Math.random() < 0.25) {
        childTrait = Math.random() < 0.5 ? 'brown' : 'white';
      }
      bunniesState.push({
        x: parent.x + (Math.random() - 0.5) * 20,
        y: parent.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30,
        trait: childTrait,
        alive: true,
        hopPhase: 0
      });
    }
  }

  // Wolves hunting
  wolvesState.forEach((wlf) => {
    // Find closest live vulnerable bunny
    let closestDist = 99999;
    let target = -1;
    bunniesState.forEach((b, idx) => {
      if (!b.alive) return;
      const d = Math.hypot(b.x - wlf.x, b.y - wlf.y);
      const vuln = b.trait === 'white' ? whiteVulnerability : brownVulnerability;
      const effectiveDist = d / vuln;
      if (effectiveDist < closestDist) {
        closestDist = effectiveDist;
        target = idx;
      }
    });

    if (target !== -1) {
      const tb = bunniesState[target];
      const dx = tb.x - wlf.x;
      const dy = tb.y - wlf.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        wlf.x += (dx / dist) * 55 * dt;
        wlf.y += (dy / dist) * 55 * dt;
      }
      // Eat bunny on contact
      if (dist < 18) {
        tb.alive = false;
      }
    }
  });

  // 1. Draw Biome Background
  ctx.save();
  if (isArctic) {
    // Arctic Snow Biome
    const snowGrad = ctx.createLinearGradient(0, 0, 0, h);
    snowGrad.addColorStop(0, '#E2E8F0');
    snowGrad.addColorStop(0.5, '#F1F5F9');
    snowGrad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = snowGrad;
    ctx.fillRect(0, 0, w, h);

    // Snow dunes
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.ellipse(w * 0.3, h - 80, 220, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.ellipse(w * 0.7, h - 70, 260, 70, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Savannah Grassland Biome
    const grassGrad = ctx.createLinearGradient(0, 0, 0, h);
    grassGrad.addColorStop(0, '#FEF08A');
    grassGrad.addColorStop(0.4, '#84CC16');
    grassGrad.addColorStop(1, '#4D7C0F');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, 0, w, h);

    // Grass clumps
    ctx.strokeStyle = '#365314';
    ctx.lineWidth = 1.5;
    for (let gx = 50; gx < w - 80; gx += 70) {
      const gy = (gx * 37) % (h - 140) + 70;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx - 4, gy - 12);
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + 2, gy - 14);
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + 6, gy - 10);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 2. Draw Food bushes
  const foodCount = Math.floor(foodAbundance / 15);
  ctx.save();
  for (let fi = 0; fi < foodCount; fi++) {
    const fx = 60 + ((fi * 97) % (w - 200));
    const fy = 80 + ((fi * 73) % (h - 180));
    ctx.fillStyle = isArctic ? '#93C5FD' : '#15803D';
    ctx.beginPath();
    ctx.arc(fx, fy, 10, 0, Math.PI * 2);
    ctx.arc(fx + 8, fy - 4, 8, 0, Math.PI * 2);
    ctx.arc(fx - 6, fy - 2, 7, 0, Math.PI * 2);
    ctx.fill();
    // Berries
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(fx, fy - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(fx + 6, fy - 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 3. Draw Bunnies
  bunniesState.forEach((b) => {
    if (!b.alive) return;
    ctx.save();
    ctx.translate(b.x, b.y);

    const hopOffset = Math.abs(Math.sin(b.hopPhase)) * 6;
    ctx.translate(0, -hopOffset);

    const isWhite = b.trait === 'white';
    const bodyColor = isWhite ? '#FFFFFF' : '#78350F';
    const earInner = isWhite ? '#FBCFE8' : '#D97706';
    const strokeColor = isWhite ? '#94A3B8' : '#451A03';

    // Body
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    const faceDir = b.vx >= 0 ? 1 : -1;
    ctx.beginPath();
    ctx.arc(7 * faceDir, -4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ears
    ctx.beginPath();
    ctx.ellipse(5 * faceDir, -13, 2.5, 6, 0.2 * faceDir, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = earInner;
    ctx.beginPath();
    ctx.ellipse(5 * faceDir, -13, 1.2, 4, 0.2 * faceDir, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(9 * faceDir, -5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(-11 * faceDir, -1, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  });

  // 4. Draw Wolves
  wolvesState.forEach((wlf) => {
    ctx.save();
    ctx.translate(wlf.x, wlf.y);
    const dir = wlf.vx >= 0 ? 1 : -1;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wolf Body
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wolf Head & Snout
    ctx.beginPath();
    ctx.moveTo(10 * dir, -4);
    ctx.lineTo(24 * dir, 0);
    ctx.lineTo(14 * dir, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ear
    ctx.beginPath();
    ctx.moveTo(8 * dir, -7);
    ctx.lineTo(11 * dir, -16);
    ctx.lineTo(15 * dir, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fierce glowing eye
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(14 * dir, -2, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Paws
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-10, 8, 4, 6);
    ctx.fillRect(8, 8, 4, 6);

    ctx.restore();
  });

  // 5. Population & Trait Ratio Overlay HUD
  const liveWhite = bunniesState.filter((b) => b.alive && b.trait === 'white').length;
  const liveBrown = bunniesState.filter((b) => b.alive && b.trait === 'brown').length;
  const totalBunnies = liveWhite + liveBrown;
  const whiteRatio = totalBunnies > 0 ? (liveWhite / totalBunnies) * 100 : 0;
  const brownRatio = totalBunnies > 0 ? (liveBrown / totalBunnies) * 100 : 0;

  // Track historical data for graph
  if (t % 1 < dt * 1.5) {
    historyCounts.push({ time: t, white: liveWhite, brown: liveBrown });
    if (historyCounts.length > 50) historyCounts.shift();
  }

  // Draw HUD Card in upper-right
  const hudW = 200;
  const hudH = 100;
  const hudX = w - hudW - 20;
  const hudY = 16;

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(hudX, hudY, hudW, hudH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('POPULATION FREQUENCIES', hudX + 12, hudY + 18);

  // White trait bar
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`White Fur: ${liveWhite} (${whiteRatio.toFixed(0)}%)`, hudX + 12, hudY + 38);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(hudX + 12, hudY + 44, 176, 6);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(hudX + 12, hudY + 44, (176 * whiteRatio) / 100, 6);

  // Brown trait bar
  ctx.fillStyle = '#F59E0B';
  ctx.fillText(`Brown Fur: ${liveBrown} (${brownRatio.toFixed(0)}%)`, hudX + 12, hudY + 68);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
  ctx.fillRect(hudX + 12, hudY + 74, 176, 6);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(hudX + 12, hudY + 74, (176 * brownRatio) / 100, 6);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '9px sans-serif';
  ctx.fillText(`Biome: ${isArctic ? 'Arctic (White Favored)' : 'Savannah (Brown Favored)'}`, hudX + 12, hudY + 92);
  ctx.restore();

  // Update telemetry
  onTelem({
    total_population: `${totalBunnies}`,
    white_fur_pct: `${whiteRatio.toFixed(1)}%`,
    brown_fur_pct: `${brownRatio.toFixed(1)}%`,
    predator_count: `${wolvesCount}`,
    carrying_capacity: `${Math.round(foodAbundance * 0.55)}`
  });
}

// ----------------------------------------------------
// 2. GENE EXPRESSION ESSENTIALS
// ----------------------------------------------------
export function renderGeneExpression(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  t: number,
  onTelem: (data: Record<string, string>) => void
) {
  const tfConc = params.tf_conc ?? 60; // 0 to 100%
  const affinity = params.affinity ?? 2; // 1: Low, 2: Med, 3: High
  const ribosomeCount = Math.round(params.ribosomes ?? 4); // 1 to 8
  const degradation = params.degradation ?? 30; // %

  // DNA strand vertical center
  const dnaY = h * 0.32;
  const leftX = 50;
  const rightX = w - 60;

  // 1. Draw Cellular Environment Background
  ctx.save();
  const cellGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.7);
  cellGrad.addColorStop(0, '#0F172A');
  cellGrad.addColorStop(1, '#020617');
  ctx.fillStyle = cellGrad;
  ctx.fillRect(0, 0, w, h);

  // Cytoplasm micro-particles
  ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
  for (let i = 0; i < 35; i++) {
    const px = (i * 123 + t * 8) % w;
    const py = (i * 77 + Math.sin(t + i) * 20) % h;
    ctx.fillRect(px, py, 2, 2);
  }

  // 2. Draw DNA Double Helix Strand
  const baseSpacing = 16;
  const promoterStart = leftX + 80;
  const promoterEnd = promoterStart + 90;
  const geneStart = promoterEnd + 10;
  const geneEnd = rightX - 60;

  // DNA Backbones
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#38BDF8';
  ctx.beginPath();
  for (let x = leftX; x <= rightX; x += 4) {
    const yTop = dnaY - 14 + Math.sin(x * 0.04 + t * 0.5) * 4;
    if (x === leftX) ctx.moveTo(x, yTop);
    else ctx.lineTo(x, yTop);
  }
  ctx.stroke();

  ctx.strokeStyle = '#818CF8';
  ctx.beginPath();
  for (let x = leftX; x <= rightX; x += 4) {
    const yBot = dnaY + 14 - Math.sin(x * 0.04 + t * 0.5) * 4;
    if (x === leftX) ctx.moveTo(x, yBot);
    else ctx.lineTo(x, yBot);
  }
  ctx.stroke();

  // Complementary Base Pairs
  const baseColors = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B']; // A, T, C, G
  for (let x = leftX + 8; x < rightX; x += baseSpacing) {
    const colorIdx = Math.floor(x / baseSpacing) % 4;
    ctx.strokeStyle = baseColors[colorIdx];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, dnaY - 10);
    ctx.lineTo(x, dnaY + 10);
    ctx.stroke();
  }

  // Promoter Box highlight
  ctx.fillStyle = 'rgba(234, 179, 8, 0.18)';
  ctx.strokeStyle = '#EAB308';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(promoterStart, dnaY - 24, promoterEnd - promoterStart, 48, 6);
  ctx.fill();
  ctx.stroke();
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FDE047';
  ctx.fillText('PROMOTER', promoterStart + 16, dnaY - 28);

  // Gene Region Label
  ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
  ctx.strokeStyle = '#10B981';
  ctx.beginPath();
  ctx.roundRect(geneStart, dnaY - 24, geneEnd - geneStart, 48, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#34D399';
  ctx.fillText('CODING GENE REGION', geneStart + 24, dnaY - 28);

  // 3. Transcription Factors (Positive Regulators)
  const isTfBound = tfConc > 25 && (Math.sin(t * 1.5) > -0.6 || affinity >= 2);
  const tfX = promoterStart + 40;
  const tfY = isTfBound ? dnaY - 32 : dnaY - 70 - Math.sin(t * 2) * 12;

  ctx.fillStyle = isTfBound ? '#E11D48' : '#FDA4AF';
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(tfX, tfY, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = '8px sans-serif';
  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'center';
  ctx.fillText('TF', tfX, tfY + 3);

  // 4. RNA Polymerase Complex
  // Transcribes along gene when TF is bound
  const transcribeSpeed = affinity * 45;
  const rnaPolProgress = isTfBound ? ((t * transcribeSpeed) % (geneEnd - geneStart + 120)) : 0;
  const rnaPolX = geneStart + Math.min(geneEnd - geneStart, rnaPolProgress);
  const isTranscribing = isTfBound && rnaPolProgress < (geneEnd - geneStart);

  ctx.fillStyle = isTranscribing ? '#2563EB' : '#475569';
  ctx.strokeStyle = '#60A5FA';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(rnaPolX, dnaY, 24, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = '8px sans-serif';
  ctx.fillStyle = '#FFF';
  ctx.fillText('RNA POL', rnaPolX, dnaY + 3);

  // 5. Emerging mRNA Transcript
  const mrnaY = dnaY + 54;
  if (isTranscribing && rnaPolProgress > 20) {
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rnaPolX, dnaY + 14);
    ctx.bezierCurveTo(
      rnaPolX - 20, dnaY + 35,
      rnaPolX - 40, mrnaY,
      geneStart, mrnaY
    );
    ctx.stroke();

    // Codon letters on mRNA
    ctx.font = '8px monospace';
    ctx.fillStyle = '#FECDD3';
    ctx.fillText('mRNA: 5\'-AUG CGA CCU UAA-3\'', geneStart + 40, mrnaY - 8);
  }

  // 6. Ribosomes Translating mRNA into Protein Chain
  const riboY = h * 0.70;
  ctx.strokeStyle = '#F43F5E';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(leftX + 20, riboY);
  ctx.lineTo(w - 120, riboY);
  ctx.stroke();

  for (let rIdx = 0; rIdx < ribosomeCount; rIdx++) {
    const rx = leftX + 80 + rIdx * 70 + ((t * 22) % 65);
    if (rx > w - 140) continue;

    // Ribosome Large & Small Subunits
    ctx.fillStyle = '#059669';
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 1.5;

    // Large subunit
    ctx.beginPath();
    ctx.ellipse(rx, riboY - 14, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Small subunit
    ctx.beginPath();
    ctx.ellipse(rx, riboY + 10, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Nascent polypeptide chain emerging from ribosome
    const chainLen = 5 + (rIdx * 2);
    ctx.beginPath();
    for (let c = 0; c < chainLen; c++) {
      const cx = rx - c * 6 + Math.sin(t * 3 + c) * 3;
      const cy = riboY - 26 - c * 7;
      ctx.fillStyle = ['#F59E0B', '#3B82F6', '#EC4899', '#10B981'][c % 4];
      ctx.beginPath();
      ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // 7. Folded Functional Proteins in Cytoplasm
  const proteinCount = Math.max(0, Math.round((tfConc * 0.8 * (100 - degradation)) / 100));
  for (let p = 0; p < Math.min(18, proteinCount); p++) {
    const px = w - 180 + ((p * 47 + Math.sin(t + p) * 15) % 140);
    const py = h * 0.55 + ((p * 37 + Math.cos(t + p) * 12) % (h * 0.35));

    // Multi-lobed folded globular protein
    ctx.fillStyle = '#A855F7';
    ctx.strokeStyle = '#C084FC';
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.arc(px + 6, py - 4, 6, 0, Math.PI * 2);
    ctx.arc(px - 5, py + 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();

  // Telemetry
  const transcriptionRate = isTfBound ? (affinity * 2.8).toFixed(1) : '0.0';
  const proteinOutput = (proteinCount * 12).toFixed(0);
  onTelem({
    tf_binding_status: isTfBound ? 'BOUND (Active)' : 'DISSOCIATED',
    transcription_rate: `${transcriptionRate} transcripts/min`,
    mrna_abundance: `${isTfBound ? 'HIGH' : 'LOW'}`,
    functional_protein_conc: `${proteinOutput} nM`,
    ribosome_activity: `${ribosomeCount} Active Polysomes`
  });
}

// ----------------------------------------------------
// 3. CELL MEMBRANE TRANSPORT
// ----------------------------------------------------
interface Molecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'sodium' | 'potassium' | 'glucose';
}

let molecules: Molecule[] = [];

export function renderMembraneTransport(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  t: number,
  onTelem: (data: Record<string, string>) => void
) {
  const concOut = params.conc_out ?? 70; // Extracellular
  const concIn = params.conc_in ?? 20; // Intracellular
  const channelOpen = Math.round(params.channels_open ?? 1) === 1;
  const atpSupply = params.atp ?? 80; // %

  const memY = h * 0.50;
  const memThickness = 50;
  const topMem = memY - memThickness * 0.5;
  const botMem = memY + memThickness * 0.5;

  // Initialize particles
  const targetCount = Math.round((concOut + concIn) * 0.6);
  if (molecules.length !== targetCount) {
    molecules = [];
    const outCount = Math.round(concOut * 0.6);
    const inCount = Math.round(concIn * 0.6);

    for (let i = 0; i < outCount; i++) {
      molecules.push({
        x: Math.random() * w,
        y: 30 + Math.random() * (topMem - 40),
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50,
        type: i % 3 === 0 ? 'sodium' : i % 3 === 1 ? 'potassium' : 'glucose'
      });
    }
    for (let i = 0; i < inCount; i++) {
      molecules.push({
        x: Math.random() * w,
        y: botMem + 10 + Math.random() * (h - botMem - 40),
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50,
        type: i % 3 === 0 ? 'sodium' : i % 3 === 1 ? 'potassium' : 'glucose'
      });
    }
  }

  // Update molecules
  const channelX = w * 0.38;
  const channelW = 34;
  const pumpX = w * 0.68;
  const pumpW = 44;

  molecules.forEach((m) => {
    m.x += m.vx * 0.016;
    m.y += m.vy * 0.016;

    // Boundary bounces
    if (m.x < 10) { m.x = 10; m.vx *= -1; }
    if (m.x > w - 10) { m.x = w - 10; m.vx *= -1; }
    if (m.y < 20) { m.y = 20; m.vy *= -1; }
    if (m.y > h - 20) { m.y = h - 20; m.vy *= -1; }

    // Membrane collision or channel passage
    const inChannel = channelOpen && Math.abs(m.x - channelX) < channelW * 0.5;
    const inPump = atpSupply > 20 && Math.abs(m.x - pumpX) < pumpW * 0.5;

    if (!inChannel && !inPump) {
      if (m.y > topMem && m.y < botMem) {
        if (m.vy > 0) { m.y = topMem; m.vy *= -1; }
        else { m.y = botMem; m.vy *= -1; }
      }
    }
  });

  // 1. Fluid Backgrounds
  ctx.save();
  // Extracellular fluid (Top)
  const outGrad = ctx.createLinearGradient(0, 0, 0, topMem);
  outGrad.addColorStop(0, '#0284C7');
  outGrad.addColorStop(1, '#0369A1');
  ctx.fillStyle = outGrad;
  ctx.fillRect(0, 0, w, topMem);

  // Intracellular fluid (Bottom)
  const inGrad = ctx.createLinearGradient(0, botMem, 0, h);
  inGrad.addColorStop(0, '#0F766E');
  inGrad.addColorStop(1, '#115E59');
  ctx.fillStyle = inGrad;
  ctx.fillRect(0, botMem, w, h - botMem);

  // Labels
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#E0F2FE';
  ctx.fillText('EXTRACELLULAR FLUID (Outside Cell)', 24, 30);
  ctx.fillStyle = '#CCFBF1';
  ctx.fillText('CYTOPLASM (Inside Cell)', 24, h - 24);

  // 2. Phospholipid Bilayer
  const headRadius = 5.5;
  const lipidCount = Math.floor(w / 14);

  for (let i = 0; i <= lipidCount; i++) {
    const lx = i * 14;

    // Skip channel and pump gaps
    if (Math.abs(lx - channelX) < channelW * 0.6) continue;
    if (Math.abs(lx - pumpX) < pumpW * 0.6) continue;

    // Top layer lipid (Hydrophilic head up)
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(lx, topMem, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hydrophobic fatty acid tails pointing down
    ctx.strokeStyle = '#FDE68A';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(lx - 2, topMem + headRadius);
    ctx.lineTo(lx - 2 + Math.sin(t * 4 + i) * 2, memY - 3);
    ctx.moveTo(lx + 2, topMem + headRadius);
    ctx.lineTo(lx + 2 - Math.sin(t * 4 + i) * 2, memY - 3);
    ctx.stroke();

    // Bottom layer lipid (Hydrophilic head down)
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(lx, botMem, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tails pointing up
    ctx.strokeStyle = '#FDE68A';
    ctx.beginPath();
    ctx.moveTo(lx - 2, botMem - headRadius);
    ctx.lineTo(lx - 2 - Math.sin(t * 4 + i) * 2, memY + 3);
    ctx.moveTo(lx + 2, botMem - headRadius);
    ctx.lineTo(lx + 2 + Math.sin(t * 4 + i) * 2, memY + 3);
    ctx.stroke();
  }

  // 3. Facilitated Aquaporin / Ion Channel Protein
  ctx.fillStyle = channelOpen ? '#3B82F6' : '#64748B';
  ctx.strokeStyle = '#93C5FD';
  ctx.lineWidth = 2;

  // Left channel wall
  ctx.beginPath();
  ctx.roundRect(channelX - channelW * 0.5, topMem - 8, 12, memThickness + 16, 4);
  ctx.fill();
  ctx.stroke();

  // Right channel wall
  ctx.beginPath();
  ctx.roundRect(channelX + channelW * 0.5 - 12, topMem - 8, 12, memThickness + 16, 4);
  ctx.fill();
  ctx.stroke();

  // Gate mechanism in center
  if (!channelOpen) {
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(channelX - 6, memY - 4, 12, 8);
  }
  ctx.font = '9px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(channelOpen ? 'PORE OPEN' : 'GATED', channelX, topMem - 14);

  // 4. ATP-Driven Active Transport Pump (Na+/K+ Pump)
  ctx.fillStyle = atpSupply > 20 ? '#8B5CF6' : '#475569';
  ctx.strokeStyle = '#C4B5FD';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(pumpX - pumpW * 0.5, topMem - 10, pumpW, memThickness + 20, 8);
  ctx.fill();
  ctx.stroke();

  // ATP Binding Pocket
  const atpPulse = Math.sin(t * 4) * 1.5;
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(pumpX, botMem + 4, 7 + atpPulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '8px monospace';
  ctx.fillStyle = '#000';
  ctx.fillText('ATP', pumpX, botMem + 7);

  ctx.font = '9px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Na+/K+ PUMP', pumpX, topMem - 14);

  // 5. Solute Molecules
  molecules.forEach((m) => {
    ctx.beginPath();
    if (m.type === 'sodium') {
      ctx.fillStyle = '#38BDF8';
      ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
    } else if (m.type === 'potassium') {
      ctx.fillStyle = '#34D399';
      ctx.arc(m.x, m.y, 4.5, 0, Math.PI * 2);
    } else {
      ctx.fillStyle = '#FBBF24';
      ctx.arc(m.x, m.y, 5.5, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });

  ctx.restore();

  // Telemetry
  const deltaC = concOut - concIn;
  const flux = channelOpen ? (deltaC * 0.14).toFixed(2) : '0.00';
  onTelem({
    extracellular_conc: `${concOut} mM`,
    intracellular_conc: `${concIn} mM`,
    gradient_delta: `${deltaC > 0 ? '+' : ''}${deltaC} mM`,
    diffusion_flux: `${flux} mmol/(m²·s)`,
    pump_state: atpSupply > 20 ? 'ACTIVE (ATP Hydrolysis)' : 'INACTIVE (Starved)'
  });
}

// ----------------------------------------------------
// 4. NEURON ACTION POTENTIAL
// ----------------------------------------------------
let voltageHistory: number[] = [];
let spikeTriggerTime = -99;

export function renderNeuron(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  t: number,
  onTelem: (data: Record<string, string>) => void
) {
  const stimulus = params.stimulus ?? 35; // 0 to 80 uA
  const gNa = params.na_conductance ?? 120; // mS/cm^2
  const gK = params.k_conductance ?? 36; // mS/cm^2

  // Trigger action potential spike periodically if stimulus is above threshold (~25 uA)
  const isThresholdMet = stimulus >= 25;
  const cyclePeriod = Math.max(1.5, 4.0 - (stimulus / 80) * 2.5);

  if (isThresholdMet && (t - spikeTriggerTime) > cyclePeriod) {
    spikeTriggerTime = t;
  }

  // Compute Hodgkin-Huxley style voltage pulse
  const elapsedSpike = t - spikeTriggerTime;
  let Vm = -70; // Resting potential -70 mV

  if (elapsedSpike >= 0 && elapsedSpike < 1.2) {
    if (elapsedSpike < 0.25) {
      // Rapid Depolarization (Na+ influx)
      const prog = elapsedSpike / 0.25;
      Vm = -70 + (100 * (gNa / 120)) * Math.sin(prog * (Math.PI / 2));
    } else if (elapsedSpike < 0.65) {
      // Repolarization (K+ efflux modulated by gK)
      const prog = (elapsedSpike - 0.25) / 0.4;
      Vm = 30 - (110 * (gK / 36)) * Math.sin(prog * (Math.PI / 2));
    } else {
      // Refractory undershoot (-80 mV) returning to -70 mV
      const prog = (elapsedSpike - 0.65) / 0.55;
      Vm = -80 + 10 * prog;
    }
  }

  voltageHistory.push(Vm);
  if (voltageHistory.length > 200) voltageHistory.shift();

  // 1. Dark Bio-Electrical Lab Background
  ctx.save();
  ctx.fillStyle = '#090D16';
  ctx.fillRect(0, 0, w, h);

  // 2. Axon Cylinder Membrane Representation
  const axonTop = 45;
  const axonH = h * 0.42;
  const axonBot = axonTop + axonH;

  // Axon interior (Axoplasm)
  const axoGrad = ctx.createLinearGradient(0, axonTop, 0, axonBot);
  axoGrad.addColorStop(0, '#1E293B');
  axoGrad.addColorStop(0.5, '#0F172A');
  axoGrad.addColorStop(1, '#1E293B');
  ctx.fillStyle = axoGrad;
  ctx.fillRect(40, axonTop, w - 80, axonH);

  // Membrane top & bottom borders
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(40, axonTop);
  ctx.lineTo(w - 40, axonTop);
  ctx.moveTo(40, axonBot);
  ctx.lineTo(w - 40, axonBot);
  ctx.stroke();

  // 3. Voltage-Gated Na+ (Sodium, Blue) and K+ (Potassium, Green) Channels
  const channelCount = 6;
  const isDepolarizing = elapsedSpike > 0 && elapsedSpike < 0.35;
  const isRepolarizing = elapsedSpike >= 0.35 && elapsedSpike < 0.70;

  for (let c = 0; c < channelCount; c++) {
    const cx = 90 + c * ((w - 180) / (channelCount - 1));

    // Na+ Channel (Blue)
    ctx.fillStyle = isDepolarizing ? '#38BDF8' : '#1E3A8A';
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 14, axonTop - 8, 12, 16, 3);
    ctx.roundRect(cx - 14, axonBot - 8, 12, 16, 3);
    ctx.fill();
    ctx.stroke();

    // K+ Channel (Green)
    ctx.fillStyle = isRepolarizing ? '#34D399' : '#064E3B';
    ctx.strokeStyle = '#6EE7B7';
    ctx.beginPath();
    ctx.roundRect(cx + 4, axonTop - 8, 12, 16, 3);
    ctx.roundRect(cx + 4, axonBot - 8, 12, 16, 3);
    ctx.fill();
    ctx.stroke();

    // Action potential wave packet moving along axon
    const waveX = 40 + ((elapsedSpike / 1.0) * (w - 80));
    if (elapsedSpike > 0 && elapsedSpike < 1.0 && Math.abs(cx - waveX) < 40) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, axonTop + axonH * 0.5, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Channel Legend
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('■ Na+ Channel (Voltage-Gated)', 48, axonTop + 24);
  ctx.fillStyle = '#34D399';
  ctx.fillText('■ K+ Channel (Delayed Rectifier)', 48, axonTop + 40);

  // 4. Real-Time Voltage Oscilloscope Screen
  const oscY = axonBot + 20;
  const oscH = h - oscY - 16;
  const oscW = w - 80;

  ctx.fillStyle = '#020617';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(40, oscY, oscW, oscH, 6);
  ctx.fill();
  ctx.stroke();

  // Grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.beginPath();
  // +30 mV line
  const y30 = oscY + oscH * 0.15;
  ctx.moveTo(40, y30); ctx.lineTo(40 + oscW, y30);
  // 0 mV line
  const y0 = oscY + oscH * 0.40;
  ctx.moveTo(40, y0); ctx.lineTo(40 + oscW, y0);
  // -70 mV line (Resting)
  const y70 = oscY + oscH * 0.78;
  ctx.moveTo(40, y70); ctx.lineTo(40 + oscW, y70);
  ctx.stroke();

  // Voltage labels
  ctx.font = '9px monospace';
  ctx.fillStyle = '#EF4444'; ctx.fillText('+30 mV (Peak Spike)', 48, y30 - 3);
  ctx.fillStyle = '#94A3B8'; ctx.fillText('  0 mV', 48, y0 - 3);
  ctx.fillStyle = '#38BDF8'; ctx.fillText('-70 mV (Resting Potential)', 48, y70 - 3);

  // Trace the Voltage curve
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  voltageHistory.forEach((vVal, idx) => {
    const px = 40 + (idx / 200) * oscW;
    // Map -80 to +40 mV onto oscilloscope height
    const normalized = (vVal - (-85)) / 125;
    const py = oscY + oscH - normalized * oscH;
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Current voltage pip
  const currentNorm = (Vm - (-85)) / 125;
  const curY = oscY + oscH - currentNorm * oscH;
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(40 + (voltageHistory.length / 200) * oscW, curY, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Telemetry
  onTelem({
    membrane_potential: `${Vm.toFixed(1)} mV`,
    na_state: isDepolarizing ? 'ACTIVATED (Na+ Influx)' : 'INACTIVATED/RESTING',
    k_state: isRepolarizing ? 'OPEN (K+ Efflux Repolarization)' : 'CLOSED',
    firing_frequency: isThresholdMet ? `${(1 / cyclePeriod).toFixed(1)} Hz` : '0 Hz (Subthreshold)',
    conduction_status: isThresholdMet ? 'ACTION POTENTIAL SPIKING' : 'POLARIZED RESTING'
  });
}
