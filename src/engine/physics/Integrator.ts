/**
 * Physora Physics Numerical Integrators
 *
 * Implements standard, energy-conserving and high-order numerical ODE integration schemes:
 * 1. Velocity Verlet (symplectic, excellent for orbital and harmonic Hamiltonian systems)
 * 2. Runge-Kutta 4th Order (RK4, for velocity-dependent drag & dissipative flows)
 * 3. Semi-Implicit Euler (fast, stable for real-time interactive physics)
 */

export interface ParticleState2D {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  m: number;
}

export type ForceCalculator2D = (
  x: number,
  y: number,
  vx: number,
  vy: number,
  t: number
) => { fx: number; fy: number };

/**
 * Runge-Kutta 4th Order (RK4) integration for a 2D particle
 * Used for ballistic projectiles with non-linear aerodynamic air resistance:
 * d(pos)/dt = v
 * d(v)/dt = F(pos, v, t) / m
 */
export function rk4Step2D(
  state: ParticleState2D,
  t: number,
  dt: number,
  forceFn: ForceCalculator2D
): ParticleState2D {
  const m = Math.max(0.0001, state.m);

  // k1
  const k1_vx = state.vx;
  const k1_vy = state.vy;
  const f1 = forceFn(state.x, state.y, state.vx, state.vy, t);
  const k1_ax = f1.fx / m;
  const k1_ay = f1.fy / m;

  // k2
  const x_k2 = state.x + 0.5 * dt * k1_vx;
  const y_k2 = state.y + 0.5 * dt * k1_vy;
  const vx_k2 = state.vx + 0.5 * dt * k1_ax;
  const vy_k2 = state.vy + 0.5 * dt * k1_ay;
  const f2 = forceFn(x_k2, y_k2, vx_k2, vy_k2, t + 0.5 * dt);
  const k2_ax = f2.fx / m;
  const k2_ay = f2.fy / m;

  // k3
  const x_k3 = state.x + 0.5 * dt * vx_k2;
  const y_k3 = state.y + 0.5 * dt * vy_k2;
  const vx_k3 = state.vx + 0.5 * dt * k2_ax;
  const vy_k3 = state.vy + 0.5 * dt * k2_ay;
  const f3 = forceFn(x_k3, y_k3, vx_k3, vy_k3, t + 0.5 * dt);
  const k3_ax = f3.fx / m;
  const k3_ay = f3.fy / m;

  // k4
  const x_k4 = state.x + dt * vx_k3;
  const y_k4 = state.y + dt * vy_k3;
  const vx_k4 = state.vx + dt * k3_ax;
  const vy_k4 = state.vy + dt * k3_ay;
  const f4 = forceFn(x_k4, y_k4, vx_k4, vy_k4, t + dt);
  const k4_ax = f4.fx / m;
  const k4_ay = f4.fy / m;

  // Updated state
  const nextX = state.x + (dt / 6) * (k1_vx + 2 * vx_k2 + 2 * vx_k3 + vx_k4);
  const nextY = state.y + (dt / 6) * (k1_vy + 2 * vy_k2 + 2 * vy_k3 + vy_k4);
  const nextVx = state.vx + (dt / 6) * (k1_ax + 2 * k2_ax + 2 * k3_ax + k4_ax);
  const nextVy = state.vy + (dt / 6) * (k1_ay + 2 * k2_ay + 2 * k3_ay + k4_ay);

  const finalF = forceFn(nextX, nextY, nextVx, nextVy, t + dt);

  return {
    x: nextX,
    y: nextY,
    vx: nextVx,
    vy: nextVy,
    ax: finalF.fx / m,
    ay: finalF.fy / m,
    m
  };
}

/**
 * Velocity Verlet integrator (Symplectic)
 * Ideal for harmonic oscillators, spring-mass systems, and planetary orbits
 * where total mechanical energy E = K + U must be preserved over long durations.
 */
export function verletStep2D(
  state: ParticleState2D,
  t: number,
  dt: number,
  accelFn: (x: number, y: number, t: number) => { ax: number; ay: number }
): ParticleState2D {
  // 1. Half step velocity
  const v_half_x = state.vx + 0.5 * state.ax * dt;
  const v_half_y = state.vy + 0.5 * state.ay * dt;

  // 2. Full step position
  const nextX = state.x + v_half_x * dt;
  const nextY = state.y + v_half_y * dt;

  // 3. New acceleration at next position
  const newA = accelFn(nextX, nextY, t + dt);

  // 4. Second half step velocity
  const nextVx = v_half_x + 0.5 * newA.ax * dt;
  const nextVy = v_half_y + 0.5 * newA.ay * dt;

  return {
    x: nextX,
    y: nextY,
    vx: nextVx,
    vy: nextVy,
    ax: newA.ax,
    ay: newA.ay,
    m: state.m
  };
}

/**
 * Semi-Implicit Euler (Symplectic Euler)
 * Fast, stable, standard in real-time interactive physics engines.
 */
export function semiImplicitEulerStep2D(
  state: ParticleState2D,
  fx: number,
  fy: number,
  dt: number
): ParticleState2D {
  const m = Math.max(0.0001, state.m);
  const ax = fx / m;
  const ay = fy / m;

  // Update velocity first
  const nextVx = state.vx + ax * dt;
  const nextVy = state.vy + ay * dt;

  // Then update position using the new velocity
  const nextX = state.x + nextVx * dt;
  const nextY = state.y + nextVy * dt;

  return {
    x: nextX,
    y: nextY,
    vx: nextVx,
    vy: nextVy,
    ax,
    ay,
    m
  };
}
