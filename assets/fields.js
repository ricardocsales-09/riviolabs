// Dot-field hero visuals for the product pages. One variant per product, same visual language as the home terrain.
(() => {
  const TAU = Math.PI * 2;
  const BG = "#0E1014";

  function rgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function seeded(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const mix = (a, b, k) => a + (b - a) * k;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const WHITE = [236, 240, 247];
  function col(c, a) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${clamp(a, 0, 1).toFixed(3)})`; }
  function tint(c1, c2, k) { return [mix(c1[0], c2[0], k), mix(c1[1], c2[1], k), mix(c1[2], c2[2], k)]; }
  function dot(ctx, x, y, r, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5, r), 0, TAU);
    ctx.fill();
  }

  // Ground plane seen from a low camera, like the home terrain.
  function ground(s, horizonK, Z1) {
    const CAM = 0.85, Z0 = 1;
    const horizon = s.H * horizonK;
    const f = (s.H - horizon) / CAM;
    const xMax = (s.W / 2) * Z1 / f * 1.04;
    return { CAM, Z0, Z1, horizon, f, xMax, cx: s.W / 2 };
  }
  function grid(P, stepBase) {
    const out = [];
    for (let z = P.Z0; z <= P.Z1; z += stepBase * (0.7 + 0.3 * z)) {
      for (let x = -P.xMax; x <= P.xMax; x += stepBase * (0.7 + 0.3 * z)) out.push({ x, z });
    }
    return out;
  }
  const depthFade = (P, z) => 0.15 + 0.85 * Math.pow(1 - (z - P.Z0) / (P.Z1 - P.Z0), 0.85);

  const VARIANTS = {};

  // MAMBA: specialist agents roam a field of accounts, light up what they examine and link up when they meet.
  VARIANTS.agents = {
    init(s) {
      const P = (s.P = ground(s, s.W < 760 ? 0.3 : 0.26, 5.5));
      s.cells = grid(P, s.W < 760 ? 0.085 : 0.064).map((c) => ({ ...c, heat: 0, sx: 0, sy: 0 }));
      const R = seeded(11);
      s.accounts = Array.from({ length: 6 }, () => ({ x: (R() * 2 - 1) * P.xMax * 0.7, z: P.Z0 + 0.6 + R() * (P.Z1 - P.Z0 - 1.2) }));
      for (const c of s.cells) {
        c.acct = 0;
        for (const a of s.accounts) {
          const d = Math.hypot(c.x - a.x, (c.z - a.z) * 0.8);
          c.acct = Math.max(c.acct, clamp(1 - d / (0.22 + 0.05 * a.z), 0, 1));
        }
      }
      s.agents = Array.from({ length: 7 }, (_, i) => {
        const a = s.accounts[i % s.accounts.length];
        return { x: a.x + (R() - 0.5), z: clamp(a.z + (R() - 0.5), P.Z0 + 0.2, P.Z1 - 0.3), vx: 0, vz: 0, tx: a.x, tz: a.z, dwell: 0, R: seeded(100 + i) };
      });
    },
    step(s, dt) {
      const P = s.P;
      for (const g of s.agents) {
        const dx = g.tx - g.x, dz = g.tz - g.z, d = Math.hypot(dx, dz);
        if (d < 0.06) {
          g.dwell += dt;
          if (g.dwell > 0.9) {
            g.dwell = 0;
            if (g.R() < 0.7) {
              const a = s.accounts[(g.R() * s.accounts.length) | 0];
              g.tx = a.x + (g.R() - 0.5) * 0.3; g.tz = a.z + (g.R() - 0.5) * 0.3;
            } else {
              g.tx = (g.R() * 2 - 1) * P.xMax * 0.8; g.tz = P.Z0 + 0.4 + g.R() * (P.Z1 - P.Z0 - 0.8);
            }
          }
        }
        const sp = 0.42 * (0.6 + 0.4 * g.z);
        g.vx = mix(g.vx, (dx / (d || 1)) * sp * clamp(d * 3, 0, 1), 0.05);
        g.vz = mix(g.vz, (dz / (d || 1)) * sp * clamp(d * 3, 0, 1), 0.05);
        g.x += g.vx * dt; g.z = clamp(g.z + g.vz * dt, P.Z0 + 0.1, P.Z1 - 0.1);
      }
      const decay = Math.exp(-dt / 1.8);
      for (const c of s.cells) {
        c.heat *= decay;
        for (const g of s.agents) {
          const dx = c.x - g.x, dz = (c.z - g.z) * 0.8;
          const r = 0.16 + 0.05 * g.z;
          if (Math.abs(dx) < r && Math.abs(dz) < r) {
            const k = 1 - Math.hypot(dx, dz) / r;
            if (k > c.heat) c.heat = k;
          }
        }
      }
    },
    draw(ctx, s) {
      const P = s.P, t = s.t, A = s.accent;
      const h = (x, z) => 0.06 * Math.sin(x * 1.2 + t * 0.35) * Math.cos(z * 1.1 - t * 0.25) + 0.03 * Math.sin(x * 2.7 - z * 1.9 + t * 0.6);
      for (const c of s.cells) {
        const y = h(c.x, c.z);
        const sx = P.cx + (c.x * P.f) / c.z, sy = P.horizon + ((P.CAM - y) * P.f) / c.z;
        c.sx = sx; c.sy = sy;
        if (sx < -8 || sx > s.W + 8 || sy > s.H + 8) continue;
        const fade = depthFade(P, c.z);
        const k = c.heat;
        let r = (2.1 / Math.pow(c.z, 0.9)) * (1 + 0.25 * c.acct + 0.7 * k);
        const base = 0.06 + 0.5 * fade * (0.45 + 0.55 * c.acct);
        dot(ctx, sx, sy, r, col(tint(WHITE, A, Math.min(1, k * 1.4)), base + k * 0.8 * fade));
      }
      // links between agents working near each other
      const proj = s.agents.map((g) => [P.cx + (g.x * P.f) / g.z, P.horizon + ((P.CAM - h(g.x, g.z) - 0.02) * P.f) / g.z, g.z]);
      ctx.lineWidth = 1;
      for (let i = 0; i < s.agents.length; i++) {
        for (let j = i + 1; j < s.agents.length; j++) {
          const a = s.agents[i], b = s.agents[j];
          const d = Math.hypot(a.x - b.x, a.z - b.z);
          if (d < 1.1) {
            ctx.strokeStyle = col(A, (1 - d / 1.1) * 0.35);
            ctx.beginPath(); ctx.moveTo(proj[i][0], proj[i][1]); ctx.lineTo(proj[j][0], proj[j][1]); ctx.stroke();
          }
        }
      }
      for (const [x, y, z] of proj) {
        const r = 3.2 / Math.pow(z, 0.7);
        dot(ctx, x, y, r * 3.2, col(A, 0.12));
        dot(ctx, x, y, r, col(tint(A, WHITE, 0.35), 0.95));
      }
    },
  };

  // Automata: a screen made of dots; a cursor replays a recorded path and follows panels when the layout drifts.
  VARIANTS.interface = {
    init(s) {
      const mob = s.W < 760;
      s.scr = { cx: s.W * (mob ? 0.5 : 0.7), cy: s.H * (mob ? 0.3 : 0.4), F: Math.min(s.W * (mob ? 0.9 : 0.5), s.H * (mob ? 0.62 : 1.05)), D: 2.4, ay: mob ? -0.2 : -0.46, ax: 0.12 };
      s.sp = mob ? 0.05 : 0.036;
      s.panels = [
        { x0: -1, y0: 0.52, x1: 1, y1: 0.62, ox: 0, oy: 0, tx: 0, ty: 0, flash: 0 },          // top bar
        { x0: -1, y0: -0.62, x1: -0.64, y1: 0.44, ox: 0, oy: 0, tx: 0, ty: 0, flash: 0 },      // side nav
        { x0: -0.54, y0: 0.08, x1: 0.1, y1: 0.42, ox: 0, oy: 0, tx: 0, ty: 0, flash: 0 },      // form card
        { x0: 0.2, y0: 0.08, x1: 0.94, y1: 0.42, ox: 0, oy: 0, tx: 0, ty: 0, flash: 0 },       // table card
        { x0: -0.54, y0: -0.5, x1: 0.94, y1: -0.02, ox: 0, oy: 0, tx: 0, ty: 0, flash: 0 },    // results
        { x0: 0.56, y0: -0.6, x1: 0.94, y1: -0.54, ox: 0, oy: 0, tx: 0, ty: 0, flash: 0, btn: 1 }, // action button
      ];
      s.route = [2, 3, 4, 5, 1];
      s.cur = { u: 0, v: 0, from: 0, k: 1, leg: 0, trail: [], click: 0 };
      s.nextDrift = 3.5;
      s.R = seeded(5);
      s.bg = [];
      for (let u = -1; u <= 1.0001; u += s.sp) for (let v = -0.62; v <= 0.6201; v += s.sp) s.bg.push([u, v]);
    },
    project(s, u, v) {
      const S = s.scr;
      const X = u * Math.cos(S.ay);
      const Y = v * Math.cos(S.ax);
      const Z = S.D + u * Math.sin(S.ay) + v * Math.sin(S.ax);
      return [S.cx + (X * S.F) / Z, S.cy - (Y * S.F) / Z, Z];
    },
    center(p) { return [(p.x0 + p.x1) / 2 + p.ox, (p.y0 + p.y1) / 2 + p.oy]; },
    step(s, dt) {
      for (const p of s.panels) {
        p.ox = mix(p.ox, p.tx, 1 - Math.exp(-dt * 2.2));
        p.oy = mix(p.oy, p.ty, 1 - Math.exp(-dt * 2.2));
        p.flash = Math.max(0, p.flash - dt * 0.8);
      }
      s.nextDrift -= dt;
      if (s.nextDrift <= 0) {
        s.nextDrift = 5 + s.R() * 3;
        const p = s.panels[2 + ((s.R() * 4) | 0)];
        if (p.tx || p.ty) { p.tx = 0; p.ty = 0; }
        else if (p.btn) { p.tx = -0.62 - s.R() * 0.3; }
        else { p.ty = (s.R() < 0.5 ? -1 : 1) * 0.05; p.tx = (s.R() - 0.5) * 0.12; }
        p.flash = 1;
      }
      const c = s.cur;
      c.k += dt / 1.25;
      if (c.k >= 1) {
        c.k = 0; c.leg = (c.leg + 1) % s.route.length; c.click = 1;
        c.fu = c.u; c.fv = c.v;
      }
      const target = this.center(s.panels[s.route[c.leg]]);
      const e = c.k < 0.5 ? 2 * c.k * c.k : 1 - Math.pow(-2 * c.k + 2, 2) / 2;
      c.u = mix(c.fu ?? target[0], target[0], e);
      c.v = mix(c.fv ?? target[1], target[1], e);
      c.click = Math.max(0, c.click - dt * 1.6);
      c.trail.push([c.u, c.v]);
      if (c.trail.length > 46) c.trail.shift();
    },
    draw(ctx, s) {
      const A = s.accent, sp = s.sp;
      for (const [u, v] of s.bg) {
        const [x, y, z] = this.project(s, u, v);
        dot(ctx, x, y, 1.1 * (2.4 / z), col(WHITE, 0.1));
      }
      for (const p of s.panels) {
        const x0 = p.x0 + p.ox, x1 = p.x1 + p.ox, y0 = p.y0 + p.oy, y1 = p.y1 + p.oy;
        for (let u = x0; u <= x1 + 1e-6; u += sp) {
          for (let v = y0; v <= y1 + 1e-6; v += sp) {
            const edge = u - x0 < sp * 0.9 || x1 - u < sp * 0.9 || v - y0 < sp * 0.9 || y1 - v < sp * 0.9;
            const [x, y, z] = this.project(s, u, v);
            const a = p.btn ? 0.85 : edge ? 0.62 : 0.2;
            const c = p.btn ? A : tint(WHITE, A, p.flash);
            dot(ctx, x, y, (edge || p.btn ? 1.5 : 1.2) * (2.4 / z), col(c, a + p.flash * 0.3));
          }
        }
      }
      const tr = s.cur.trail;
      for (let i = 0; i < tr.length; i++) {
        const [x, y, z] = this.project(s, tr[i][0], tr[i][1]);
        dot(ctx, x, y, (1 + (i / tr.length) * 1.4) * (2.4 / z), col(A, (i / tr.length) * 0.5));
      }
      const [x, y, z] = this.project(s, s.cur.u, s.cur.v);
      if (s.cur.click > 0) {
        ctx.strokeStyle = col(A, s.cur.click * 0.7);
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, (1 - s.cur.click) * 26 + 4, 0, TAU); ctx.stroke();
      }
      dot(ctx, x, y, 11, col(A, 0.14));
      dot(ctx, x, y, 3.4 * (2.4 / z), col(tint(A, WHITE, 0.4), 1));
    },
  };

  // Denial Intelligence: claims stream toward the payer; risk is caught at the prevention line, what slips through is contested.
  VARIANTS.stream = {
    init(s) {
      const P = (s.P = ground(s, s.W < 760 ? 0.3 : 0.24, 6));
      s.half = (z) => (s.W / 2) * z / P.f;           // visible half-width of the plane at depth z
      s.lanes = [];
      const n = s.W < 760 ? 12 : 18;
      for (let i = 0; i < n; i++) s.lanes.push(P.Z0 + 0.25 + Math.pow(i / (n - 1), 1.15) * (P.Z1 - P.Z0 - 0.4));
      s.g1 = -0.05; s.g2 = 0.55;                      // gates, in screen-normalized units (-1 left, 1 right)
      s.parts = [];
      s.R = seeded(21);
      s.spawn = 0;
      for (let i = 0; i < 400; i++) this.step(s, 0.05);
    },
    step(s, dt) {
      const R = s.R;
      s.spawn += dt * (s.W < 760 ? 26 : 44);
      while (s.spawn >= 1) {
        s.spawn -= 1;
        const z = s.lanes[(R() * s.lanes.length) | 0];
        s.parts.push({ z, u: -1.08 - R() * 0.1, v: 0.1 + R() * 0.05, st: R() < 0.28 ? 1 : 0, k: 0, off: (R() - 0.5) * 0.05 });
      }
      for (const p of s.parts) {
        const u0 = p.u;
        p.u += p.v * dt;
        p.k = Math.max(0, p.k - dt * 0.8);
        if (p.st === 1 && u0 < s.g1 && p.u >= s.g1) {
          if (R() < 0.78) { p.st = 2; p.k = 1; } else { p.st = 3; }
        } else if (p.st === 3 && u0 < s.g2 && p.u >= s.g2) {
          if (R() < 0.7) { p.st = 4; p.k = 1; }
        }
      }
      s.parts = s.parts.filter((p) => p.u < 1.1);
    },
    draw(ctx, s) {
      const P = s.P, A = s.accent, t = s.t;
      const pr = (u, z, dz = 0) => [P.cx + u * s.W / 2, P.horizon + (P.CAM * P.f) / (z + dz)];
      for (const z of s.lanes) {
        const [, y] = pr(0, z);
        const fade = depthFade(P, z);
        for (let u = -1; u <= 1; u += 0.018 * Math.pow(z, 0.5)) dot(ctx, P.cx + u * s.W / 2, y, 0.9 / Math.pow(z, 0.6), col(WHITE, 0.04 + 0.08 * fade));
      }
      for (const [g, strong] of [[s.g1, 1], [s.g2, 0.65]]) {
        for (const z of s.lanes) {
          const [x, y] = pr(g, z);
          const shimmer = 0.6 + 0.4 * Math.sin(z * 5 - t * 2.4);
          dot(ctx, x, y, 2.2 / Math.pow(z, 0.6), col([126, 184, 255], (0.35 + 0.4 * shimmer) * strong));
        }
      }
      for (const p of s.parts) {
        const [x, y] = pr(p.u, p.z);
        const yy = y + p.off * P.f / p.z;
        const fade = depthFade(P, p.z);
        let c = WHITE, a = 0.3 + 0.6 * fade, r = 2.6 / Math.pow(p.z, 0.8);
        if (p.st === 1 || p.st === 3) { c = A; a = 0.55 + 0.45 * fade; r *= 1.35; }
        if (p.st === 2) { c = tint(WHITE, [126, 184, 255], p.k); a += p.k * 0.4; r *= 1 + p.k * 0.9; }
        if (p.st === 4) { c = tint([126, 184, 255], [5, 117, 230], 1 - p.k); a = 0.6 + 0.4 * fade; r *= 1.25 + p.k * 0.9; }
        for (let i = 1; i <= 4; i++) dot(ctx, x - i * r * 1.6, yy, r * (1 - i * 0.18), col(c, a * (0.32 - i * 0.07)));
        dot(ctx, x, yy, r, col(c, a));
      }
    },
  };

  // Atlas: a fan of documents read by a scanning beam; key fields lift off the page into a structured column.
  VARIANTS.pages = {
    init(s) {
      const mob = s.W < 760;
      s.cam = { cx: s.W * (mob ? 0.5 : 0.64), cy: s.H * (mob ? 0.28 : 0.36), F: Math.min(s.W * (mob ? 0.95 : 0.6), s.H * (mob ? 0.62 : 1.3)) };
      const R = seeded(33);
      s.pages = [];
      const N = mob ? 4 : 5;
      for (let i = 0; i < N; i++) {
        const pts = [];
        const hw = 0.33, hh = 0.47, rowH = 0.036, colW = mob ? 0.024 : 0.017;
        let v = hh - 0.06, row = 0;
        while (v > -hh + 0.05) {
          const kind = row === 0 ? "head" : R() < 0.12 ? "gap" : R() < 0.14 ? "field" : "text";
          const len = kind === "head" ? 0.55 : 0.45 + R() * 0.55;
          if (kind !== "gap") {
            for (let u = -hw + 0.05; u < -hw + 0.05 + (2 * hw - 0.1) * len; u += colW) pts.push({ u, v, key: kind === "field" && u > 0 ? 1 : 0, head: kind === "head" ? 1 : 0, lit: 0, sent: 0 });
          }
          v -= rowH * (kind === "head" ? 1.6 : 1); row++;
        }
        for (let a = 0; a < TAU; a += 0.3) pts.push({ u: 0.18 + Math.cos(a) * 0.07, v: -0.33 + Math.sin(a) * 0.07, key: 0, head: 0, stamp: 1, lit: 0, sent: 0 });
        for (let u = -0.26; u < 0.02; u += colW * 0.8) pts.push({ u, v: -0.38 + Math.sin(u * 40) * 0.015, key: 0, head: 0, sig: 1, lit: 0, sent: 0 });
        s.pages.push({ pts, rot: -0.5 + i * (mob ? 0.2 : 0.16), x: (mob ? -0.6 : -0.7) + i * (mob ? 0.36 : 0.5), z: 3.3 - i * 0.1, y: 0.03 * i });
      }
      s.scan = { page: 0, v: 0.55 };
      s.flyers = [];
      s.slots = [];
      const sx = mob ? 0.9 : 1.75;
      for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) s.slots.push({ x: sx + c * 0.05, y: 0.34 - r * 0.075, z: 2.9, on: 0 });
      s.slotNext = 0;
    },
    toWorld(pg, u, v) {
      const c = Math.cos(pg.rot), sn = Math.sin(pg.rot);
      return [pg.x + u * c, pg.y + v, pg.z + u * sn];
    },
    proj(s, X, Y, Z) { return [s.cam.cx + (X * s.cam.F) / Z, s.cam.cy - (Y * s.cam.F) / Z]; },
    step(s, dt) {
      const sc = s.scan;
      sc.v -= dt * 0.28;
      const pg = s.pages[sc.page];
      for (const p of pg.pts) {
        if (!p.lit && p.v > sc.v) {
          p.lit = 1;
          if (p.key && !p.sent && s.R_ok !== false) {
            p.sent = 1;
            if (Math.random() < 0.34) {
              const slot = s.slots[s.slotNext % s.slots.length];
              s.slotNext++;
              const [X, Y, Z] = this.toWorld(pg, p.u, p.v);
              s.flyers.push({ X, Y, Z, slot, k: 0 });
            }
          }
        }
      }
      if (sc.v < -0.56) {
        sc.page = (sc.page + 1) % s.pages.length;
        sc.v = 0.55;
        if (sc.page === 0) { s.slots.forEach((o) => (o.on = 0)); s.slotNext = 0; }
        for (const p of s.pages[sc.page].pts) { p.lit = 0; p.sent = 0; }
      }
      for (const pgx of s.pages) for (const p of pgx.pts) if (p.lit && pgx !== pg) p.lit = Math.max(0.2, p.lit - dt * 0.4);
      for (const f of s.flyers) {
        f.k += dt * 0.9;
        if (f.k >= 1 && !f.done) { f.done = 1; f.slot.on = 1; }
      }
      s.flyers = s.flyers.filter((f) => !f.done);
    },
    draw(ctx, s) {
      const A = s.accent;
      for (let i = s.pages.length - 1; i >= 0; i--) {
        const pg = s.pages[i];
        const scanning = i === s.scan.page;
        for (const p of pg.pts) {
          const [X, Y, Z] = this.toWorld(pg, p.u, p.v);
          const [x, y] = this.proj(s, X, Y, Z);
          const near = scanning ? Math.exp(-Math.pow((p.v - s.scan.v) / 0.03, 2)) : 0;
          let c = WHITE, a = 0.16 + (p.head ? 0.2 : 0) + p.lit * 0.22 + near * 0.6;
          if (p.key) { c = tint(WHITE, A, 0.6 * p.lit + near); a += 0.12; }
          if (p.stamp) { c = [120, 140, 200]; a = 0.3 + p.lit * 0.2; }
          if (p.sig) { a = 0.35 + p.lit * 0.25; }
          dot(ctx, x, y, (p.head ? 1.5 : 1.15) * (3 / Z), col(near > 0.3 ? tint(c, A, near) : c, a));
        }
        if (scanning) {
          const [lx0, ly0] = this.proj(s, ...this.toWorld(pg, -0.36, s.scan.v));
          const [lx1, ly1] = this.proj(s, ...this.toWorld(pg, 0.36, s.scan.v));
          const g = ctx.createLinearGradient(lx0, ly0, lx1, ly1);
          g.addColorStop(0, col(A, 0)); g.addColorStop(0.5, col(A, 0.8)); g.addColorStop(1, col(A, 0));
          ctx.strokeStyle = g; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(lx0, ly0); ctx.lineTo(lx1, ly1); ctx.stroke();
        }
      }
      for (const o of s.slots) {
        const [x, y] = this.proj(s, o.x, o.y, o.z);
        dot(ctx, x, y, 1.6, col(o.on ? A : WHITE, o.on ? 0.85 : 0.1));
      }
      for (const f of s.flyers) {
        const e = f.k * f.k * (3 - 2 * f.k);
        const X = mix(f.X, f.slot.x, e), Y = mix(f.Y, f.slot.y, e) + Math.sin(e * Math.PI) * 0.12, Z = mix(f.Z, f.slot.z, e);
        const [x, y] = this.proj(s, X, Y, Z);
        dot(ctx, x, y, 5, col(A, 0.12));
        dot(ctx, x, y, 1.8, col(tint(A, WHITE, 0.3), 0.95));
      }
    },
  };

  // Payer Model: history as ridgelines that recede into the distance; the forecast glows ahead of the present.
  VARIANTS.strata = {
    init(s) {
      const P = (s.P = ground(s, s.W < 760 ? 0.22 : 0.16, 7));
      const R = seeded(44);
      s.bumps = [-0.72, -0.4, -0.1, 0.18, 0.46, 0.76].map((c, i) => ({ c, w: 0.045 + R() * 0.05, a: 0.07 + R() * 0.07, f: 0.35 + R() * 0.8, ph: i * 1.7 }));
      s.gap = 0.3;
      s.age = 0;
      s.dx = s.W < 760 ? 0.012 : 0.0075;
      s.noiseSeed = R;
    },
    heightAt(s, xn, tl, noisy) {
      let y = 0;
      for (const b of s.bumps) {
        const amp = b.a * (0.55 + 0.45 * Math.sin(tl * b.f + b.ph));
        y += amp * Math.exp(-Math.pow((xn - b.c) / b.w, 2));
      }
      if (noisy) y += 0.012 * Math.sin(xn * 41 + tl * 7.3) + 0.01 * Math.sin(xn * 17 - tl * 3.1);
      return y;
    },
    step(s, dt) { s.age += dt * 0.32; },
    draw(ctx, s) {
      const P = s.P, A = s.accent;
      const shift = (s.age % 1) * s.gap;
      const base = Math.floor(s.age);
      const layers = [];
      for (let i = 0; ; i++) {
        const z = P.Z0 + 0.55 + i * s.gap + shift;
        if (z > P.Z1) break;
        layers.push({ z, tl: base - i, forecast: false });
      }
      layers.push({ z: P.Z0 + 0.55 + shift - s.gap, tl: base + 1, forecast: true });
      layers.sort((a, b) => b.z - a.z);
      for (const L of layers) {
        if (L.z < P.Z0 + 0.05) continue;
        const pts = [];
        for (let xn = -1; xn <= 1.0001; xn += s.dx) {
          const x = xn * P.xMax * 0.92;
          const y = this.heightAt(s, xn, L.tl * 0.35, !L.forecast) * 2.1;
          pts.push([P.cx + (x * P.f) / L.z, P.horizon + ((P.CAM - y) * P.f) / L.z, y]);
        }
        ctx.fillStyle = BG;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (const p of pts) ctx.lineTo(p[0], p[1]);
        ctx.lineTo(pts[pts.length - 1][0], s.H); ctx.lineTo(pts[0][0], s.H); ctx.closePath();
        ctx.fill();
        const fade = depthFade(P, L.z);
        const r = 1.35 / Math.pow(L.z, 0.8);
        for (const [x, y, hy] of pts) {
          if (L.forecast) {
            const pulse = 0.6 + 0.4 * Math.sin(s.t * 2.2 + x * 0.01);
            dot(ctx, x, y, r * (1.2 + hy * 2), col(A, (0.45 + hy * 2) * pulse));
          } else {
            dot(ctx, x, y, r * (0.9 + hy * 1.2), col(tint(WHITE, A, clamp(hy * 2.2, 0, 0.8)), (0.12 + 0.6 * fade) * (0.5 + hy * 1.6)));
          }
        }
      }
    },
  };

  // Hospital Twin: the hospital as it is (noisy, many dialects) above, its twin (one language) below; a sync sweep aligns both.
  VARIANTS.twin = {
    init(s) {
      const P = (s.P = ground(s, s.W < 760 ? 0.34 : 0.38, 5));
      const R = seeded(55);
      s.cells = grid(P, s.W < 760 ? 0.1 : 0.075).map((c) => ({ ...c, d: (R() * 3) | 0, jx: (R() - 0.5) * 0.05, jz: (R() - 0.5) * 0.08, jy: (R() - 0.5) * 0.08, sync: 0 }));
      s.sweep = -1.2;
    },
    step(s, dt) {
      const P = s.P;
      s.sweep += dt * 0.22;
      if (s.sweep > 1.25) s.sweep = -1.25;
      const sx = s.sweep * P.xMax;
      for (const c of s.cells) {
        const near = Math.exp(-Math.pow((c.x - sx) / (0.09 * c.z), 2));
        c.sync = Math.max(c.sync * Math.exp(-dt / 2.4), near);
      }
    },
    draw(ctx, s) {
      const P = s.P, A = s.accent, t = s.t;
      const dialects = [WHITE, [176, 140, 240], [224, 138, 46]];
      const sweepX = s.sweep * P.xMax;
      ctx.lineWidth = 1;
      for (const c of s.cells) {
        const fade = depthFade(P, c.z);
        const k = c.sync;
        const yT = 0.05 * Math.sin(c.x * 3.1 + t * 0.7) * Math.cos(c.z * 2.3 - t * 0.5) + c.jy * (1 - k);
        const xT = c.x + c.jx * (1 - k), zT = c.z + c.jz * (1 - k);
        const tx = P.cx + (xT * P.f) / zT, ty = P.horizon - ((P.CAM * 0.72 - yT) * P.f) / zT;
        const yB = 0.035 * Math.sin(c.x * 1.4 + t * 0.4) * Math.cos(c.z * 1.2 - t * 0.3);
        const bx = P.cx + (c.x * P.f) / c.z, by = P.horizon + ((P.CAM - yB) * P.f) / c.z;
        const r = 1.9 / Math.pow(c.z, 0.9);
        if (tx > -8 && tx < s.W + 8 && ty > -8) {
          dot(ctx, tx, ty, r, col(tint(dialects[c.d], A, k), (0.1 + 0.45 * fade) * (0.7 + 0.3 * k) + k * 0.25));
        }
        if (bx > -8 && bx < s.W + 8 && by < s.H + 8) {
          dot(ctx, bx, by, r * (1 + 0.5 * k), col(A, 0.12 + 0.5 * fade + k * 0.35));
        }
        if (k > 0.5 && Math.abs(c.x - sweepX) < 0.035 * c.z) {
          ctx.strokeStyle = col(A, (k - 0.5) * 0.7 * fade);
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(bx, by); ctx.stroke();
        }
      }
    },
  };

  function start(cv) {
    const V = VARIANTS[cv.dataset.visual];
    if (!V) return;
    const ctx = cv.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = { W: 0, H: 0, t: 0, accent: rgb(getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#7EB8FF") };
    let visible = true, raf = 0, last = 0;
    function paint() {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, s.W, s.H);
      V.draw(ctx, s);
    }
    function resize() {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.W = r.width; s.H = r.height;
      cv.width = Math.round(s.W * dpr); cv.height = Math.round(s.H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      V.init(s);
      if (reduce) { for (let i = 0; i < 180; i++) { s.t += 1 / 60; V.step && V.step(s, 1 / 60); } paint(); }
    }
    function frame(now) {
      const dt = Math.min(0.048, (now - (last || now)) / 1000); last = now;
      s.t += dt;
      V.step && V.step(s, dt);
      paint();
      raf = visible ? requestAnimationFrame(frame) : 0;
    }
    new ResizeObserver(resize).observe(cv);
    resize();
    if (reduce) return;
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    }).observe(cv);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && visible && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    });
  }

  document.querySelectorAll("canvas[data-visual]").forEach(start);
})();
