/* Վիրտուալ կամերա — պրոտոյի PerspectiveCamera-ի 2D համարժեքը։
 * Իրական pinhole պրոյեկցիա. դիրք (0, camY, camZ), lookAt-ը ease-ով (երբեք snap), FOV ուղղահայաց,
 * portraitK (պրոտո. նեղ էկրանին FOV-ը լայնանում ա), roll։ Աշխարհը մետրերով ա։
 */
export class Camera {
  constructor() {
    this.x = 0; this.y = 4.5; this.z = 14;
    this.fov = 55;
    this.roll = 0;
    this.look = { x: 0, y: 2, z: -30 };   // lookCur (eased)
    this.W = 1; this.H = 1;
    this._F = 1; this._pitch = 0; this._yaw = 0;
  }
  portraitK() { const a = this.W / this.H; return a < 1 ? Math.min(1.45, Math.pow(1 / a, .33)) : 1; }
  /* կադրի սկզբում մեկ անգամ — բոլոր project()-ները էս թվերով են */
  update(W, H) {
    this.W = W; this.H = H;
    const fovV = this.fov * this.portraitK() * Math.PI / 180;
    this._F = (H / 2) / Math.tan(fovV / 2);
    const dx = this.look.x - this.x, dy = this.look.y - this.y, dz = this.z - this.look.z;
    this._yaw = Math.atan2(dx, dz);
    this._pitch = Math.atan2(-dy, Math.hypot(dx, dz)); // դրական = ներքև
    this._cy = Math.cos(this._yaw); this._sy = Math.sin(this._yaw);
    this._cp = Math.cos(this._pitch); this._sp = Math.sin(this._pitch);
  }
  get F() { return this._F; }
  /* աշխարհի կետ → {sx, sy, d (խորություն, մ), s (px/մ)}։ d<=0.3 → հետևում/շատ մոտ */
  project(x, y, z, out) {
    const dx = x - this.x, dy = y - this.y, dzc = this.z - z;
    const rx = dx * this._cy - dzc * this._sy;
    const rz = dx * this._sy + dzc * this._cy;
    const d = rz * this._cp - dy * this._sp;
    const up = dy * this._cp + rz * this._sp;
    out = out || {};
    out.d = d;
    if (d <= 0.3) { out.s = 0; out.sx = 0; out.sy = 0; return out; }
    const s = this._F / d;
    out.s = s;
    out.sx = this.W / 2 + rx * s;
    out.sy = this.H / 2 - up * s;
    return out;
  }
  /* հորիզոնի էկրանային y-ը (z→−∞) */
  horizonY() { return this.H / 2 - Math.tan(this._pitch) * this._F; }
}
