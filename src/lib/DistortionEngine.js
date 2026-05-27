/**
 * DistortionEngine models a 2D spring-mass lattice mapped to a flat Float32Array.
 * Maintains displacement and velocity offsets for X and Y directions.
 */
export default class DistortionEngine {
  /**
   * @param {number} cols - Number of columns in the ASCII grid
   * @param {number} rows - Number of rows in the ASCII grid
   */
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    
    // Maintain flat 1D Float32Array buffers. 
    // Length is cols * rows * 2 because each cell has X and Y values:
    // For cell index `idx`: 
    // - X-value is at `idx * 2`
    // - Y-value is at `idx * 2 + 1`
    const len = cols * rows * 2;
    this.displacements = new Float32Array(len);
    this.velocities = new Float32Array(len);
  }

  /**
   * Applies a directional force pushing cell velocities away from the center (x, y)
   * 
   * @param {number} x - Target X-coordinate in grid-space
   * @param {number} y - Target Y-coordinate in grid-space
   * @param {number} radius - Interaction radius in grid-space cells
   * @param {number} strength - Force scaling factor
   * @param {string} mode - Active visual mode ('Warp' | 'Ripple' | 'Glitch-lite')
   * @param {number} time - Performance time stamp
   */
  applyForce(x, y, radius, strength, mode = 'Warp', time = 0) {
    const cols = this.cols;
    const rows = this.rows;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dx = c - x;
        const dy = r - y;
        const dist = Math.hypot(dx, dy);
        
        // Only apply force within the radial threshold
        if (dist < radius) {
          const index = (r * cols + c) * 2;
          
          // Base radial inverse-square force
          const distSq = dist * dist;
          // Add 1.0 to avoid division by zero/singularity at the cursor center
          let f = strength / (distSq + 1.0);
          
          // Calculate unit direction vector away from (x, y)
          const nx = dist > 0 ? dx / dist : 0;
          const ny = dist > 0 ? dy / dist : 0;
          
          if (mode === 'Ripple') {
            // Ripple wave effect: alternates radial push/pull directions based on distance and time
            f *= Math.sin(dist * 1.2 - time * 0.015);
          }
          
          if (mode === 'Glitch-lite') {
            // Glitch-lite effect: adds tangential wave jitter
            const tx = -ny;
            const ty = nx;
            const jitter = Math.sin(time * 0.035 + index * 0.73);
            this.velocities[index] += (nx + tx * jitter * 0.9) * f;
            this.velocities[index + 1] += (ny + ty * jitter * 0.9) * f;
          } else {
            // Warp mode (standard radial expansion push)
            this.velocities[index] += nx * f;
            this.velocities[index + 1] += ny * f;
          }
        }
      }
    }
  }

  /**
   * Updates the simulation state for all grid cells:
   * 1. Applies spring force pulling displacements back to 0,0
   * 2. Applies friction damping to velocities
   * 3. Integrates velocities to update displacements
   * 
   * @param {number} recovery - Spring constant pulling displacement back to rest (0.0 to 1.0)
   * @param {number} friction - Velocity damping factor (typically 0.8 to 0.99)
   * @returns {Float32Array} The displacement buffer
   */
  update(recovery, friction, time = 0) {
    const len = this.cols * this.rows * 2;
    const driftX = Math.sin(time * 0.001) * 0.1;
    const driftY = Math.cos(time * 0.0008) * 0.1;
    
    for (let i = 0; i < len; i += 2) {
      // 1. Spring force: Force is proportional to displacement but in the opposite direction
      const springForceX = -recovery * this.displacements[i];
      const springForceY = -recovery * this.displacements[i + 1];
      
      // 2. Accumulate spring force, apply global autonomous drift, and apply velocity friction
      this.velocities[i] = (this.velocities[i] + springForceX + driftX) * friction;
      this.velocities[i + 1] = (this.velocities[i + 1] + springForceY + driftY) * friction;
      
      // 3. Integrate velocity to update displacement
      this.displacements[i] += this.velocities[i];
      this.displacements[i + 1] += this.velocities[i + 1];
    }
    
    return this.displacements;
  }
}
