/* filigree.js — Root & Rise (SAFE LAYERED)
   Subtle animated filigree haze in the corners (canvas overlay).
   - Never blocks clicks
   - Always renders BEHIND the app UI (fixes “missing text”)
   - Respects prefers-reduced-motion
   - Auto-resizes, DPI aware, lightweight
*/

(() => {
  "use strict";

  const CFG = {
    opacity: 0.22,     // visibility (0.0–0.6)
    blur: 10,          // px
    speed: 0.22,       // 0–1
    density: 1.0,      // 0.5–2.0
    vignette: 0.32     // 0–0.8
  };

  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  function ensureLayering() {
    // Create a dedicated background layer container with strict stacking.
    let layer = document.getElementById("rrFXLayer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "rrFXLayer";
      Object.assign(layer.style, {
        position: "fixed",
        inset: "0",
        pointerEvents: "none",
        zIndex: "0" // FX layer sits at 0
      });
      document.body.prepend(layer);
    }

    // Force the app shell above it (so text/buttons never get covered)
    const shell = document.querySelector(".rr-shell");
    if (shell) {
      const s = shell.style;
      if (!s.position) s.position = "relative";
      s.zIndex = "2";
    }

    // Some browsers behave better if body establishes a stacking context.
    const b = document.body.style;
    if (!b.position) b.position = "relative";
    if (!b.isolation) b.isolation = "isolate";

    return layer;
  }

  // Canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  canvas.className = "rr-filigree-canvas";
  Object.assign(canvas.style, {
    width: "100%",
    height: "100%",
    display: "block",
    opacity: String(CFG.opacity),
    filter: `blur(${CFG.blur}px)`,
    mixBlendMode: "screen"
  });

  let w = 0, h = 0, dpr = 1;

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize, { passive: true });

  // Deterministic-ish RNG
  function hash(n) {
    n = (n ^ 61) ^ (n >>> 16);
    n = n + (n << 3);
    n = n ^ (n >>> 4);
    n = Math.imul(n, 0x27d4eb2d);
    n = n ^ (n >>> 15);
    return (n >>> 0) / 4294967296;
  }

  function filigreeStroke(x, y, r, t, spin, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);

    const g = ctx.createLinearGradient(-r, -r, r, r);
    g.addColorStop(0, `rgba(255,245,230,${alpha})`);
    g.addColorStop(0.55, `rgba(255,170,225,${alpha * 0.9})`);
    g.addColorStop(1, `rgba(215,235,255,${alpha * 0.75})`);

    ctx.strokeStyle = g;
    ctx.lineWidth = Math.max(1, r * 0.04);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    const steps = 140;
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const a = p * Math.PI * 2;

      const k1 = 1.6 + 0.35 * Math.sin(t * 0.9);
      const k2 = 2.2 + 0.30 * Math.cos(t * 0.7);

      const rr = r * (0.55 + 0.40 * Math.sin(a * k1 + t * 0.6));
      const xx = rr * Math.cos(a * k2 + t * 0.25);
      const yy = rr * Math.sin(a * k1 - t * 0.18);

      if (i === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }
    ctx.stroke();

    // secondary curls
    ctx.globalAlpha *= 0.75;
    ctx.beginPath();
    const steps2 = 90;
    for (let i = 0; i <= steps2; i++) {
      const p = i / steps2;
      const a = p * Math.PI * 2;
      const rr = r * 0.32 * (0.75 + 0.25 * Math.cos(a * 3 + t));
      const xx = rr * Math.cos(a * 2.8 - t * 0.22);
      const yy = rr * Math.sin(a * 2.0 + t * 0.19);
      if (i === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }
    ctx.stroke();

    ctx.restore();
  }

  function drawVignette() {
    if (CFG.vignette <= 0) return;
    ctx.save();
    const g = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.10,
      w / 2, h / 2, Math.max(w, h) * 0.70
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${CFG.vignette})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  let start = performance.now();

  function frame(now) {
    const t = ((now - start) / 1000) * (reduced ? 0 : CFG.speed);

    ctx.clearRect(0, 0, w, h);

    const corners = [
      { x: w * 0.10, y: h * 0.18, s: 1.0 },
      { x: w * 0.90, y: h * 0.18, s: 0.95 },
      { x: w * 0.10, y: h * 0.86, s: 0.85 },
      { x: w * 0.90, y: h * 0.86, s: 0.80 }
    ];

    const base = Math.min(w, h);
    const count = Math.max(3, Math.round(6 * CFG.density));

    for (let i = 0; i < corners.length; i++) {
      const c = corners[i];
      for (let j = 0; j < count; j++) {
        const seed = i * 1000 + j * 77;

        const jitterX = (hash(seed + 1) - 0.5) * base * 0.08;
        const jitterY = (hash(seed + 2) - 0.5) * base * 0.10;

        const r = base * (0.10 + 0.08 * hash(seed + 3)) * c.s;
        const spin =
          (hash(seed + 4) - 0.5) * 0.8 + Math.sin(t * 0.35 + j) * 0.08;

        const alpha = 0.22 + 0.18 * hash(seed + 5);

        filigreeStroke(
          c.x + jitterX + Math.sin(t * 0.25 + j) * base * 0.01,
          c.y + jitterY + Math.cos(t * 0.22 + j) * base * 0.012,
          r,
          t + j * 0.15,
          spin,
          alpha
        );
      }
    }

    drawVignette();
    requestAnimationFrame(frame);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const layer = ensureLayering();
    layer.appendChild(canvas);
    resize();
    requestAnimationFrame(frame);
  });
})();