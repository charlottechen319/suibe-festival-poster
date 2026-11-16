/* ============================================================
   上经贸大研究生会 · 节日海报场景生成器
   纯 SVG / 无外部依赖；同一 config 输出完全一致（seed 固定）。
   画面语汇：宣纸、淡墨远山、雾带、校园剪影、折枝花木、暖阳。
   ============================================================ */
(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const W = 1080, H = 1920;
  const cfg = Object.assign({
    name: "冬至",
    english: "WINTER SOLSTICE",
    date: "2026/12/22",
    lunar: "农历冬月十四",
    seal: "节气",
    couplet: ["天时人事日相催", "冬至阳生春又来"],
    palette: "winter",
    motif: "plum",
    seed: 0,
    sun: [742, 872],
    logoTextColor: "ink"
  }, JSON.parse(document.getElementById("poster-config").textContent || "{}"));

  /* ---------- 颜色 ---------- */
  const PALETTES = {
    winter: {
      paper: "#f7f3ea", paperDeep: "#ece1cf",
      ink: "#23282b", inkSoft: "#3a3e3d", accent: "#b43c2c",
      sky: "#f7e9d8", sun: "#eec29a", sunCore: "#f8ddc0",
      far: "#aebdc2", mid: "#82959a", near: "#617276",
      campus: "#687c80", snow: "#fcf8ef", snowShadow: "#d8e3e6",
      branch: "#3a332b", leaf: ["#6c7954", "#8a9468"],
      flower: ["#c9553f", "#e7a99c"], center: "#e0b25a"
    },
    autumn: {
      paper: "#f8f1e2", paperDeep: "#ecdfc4",
      ink: "#24231f", inkSoft: "#403b31", accent: "#bb3a28",
      sky: "#f8ead3", sun: "#eaa94f", sunCore: "#f6cf92",
      far: "#c8b99f", mid: "#a08e73", near: "#776b55",
      campus: "#7c705a", snow: "#fbf4e2", snowShadow: "#e6d6b8",
      branch: "#3c342a", leaf: ["#c99733", "#e0b447"],
      flower: ["#e0a93c", "#f0c96a"], center: "#b9782c"
    },
    spring: {
      paper: "#f7f4e8", paperDeep: "#e8e3cd",
      ink: "#25302b", inkSoft: "#3c463d", accent: "#b5533c",
      sky: "#f4efdc", sun: "#f0d0a2", sunCore: "#f8e2c2",
      far: "#bcc7b9", mid: "#90a28c", near: "#6d8069",
      campus: "#77856f", snow: "#fbf8ec", snowShadow: "#dfe7d8",
      branch: "#3b3a2d", leaf: ["#7f9464", "#a3b183"],
      flower: ["#d98a86", "#efc0b8"], center: "#c79a4c"
    },
    summer: {
      paper: "#f4f5ec", paperDeep: "#e2e6d6",
      ink: "#22302f", inkSoft: "#33413f", accent: "#9c3b31",
      sky: "#eef0e0", sun: "#f0cf9a", sunCore: "#f8e3c0",
      far: "#aec4c0", mid: "#7f9b96", near: "#5d7873",
      campus: "#647d76", snow: "#f7f8ef", snowShadow: "#dde6df",
      branch: "#35402f", leaf: ["#5f7f57", "#86a279"],
      flower: ["#d98a9a", "#f0c2c6"], center: "#d8b25e"
    },
    red: {
      paper: "#f9eadc", paperDeep: "#eed4bd",
      ink: "#2a1d19", inkSoft: "#4a2a23", accent: "#b01f1f",
      sky: "#f8d9b8", sun: "#e8a267", sunCore: "#f7cfa2",
      far: "#c98d6f", mid: "#a9553f", near: "#7e2f26",
      campus: "#8a4a3a", snow: "#fbeadb", snowShadow: "#e9c9b3",
      branch: "#40261f", leaf: ["#7c8a5c", "#9aa777"],
      flower: ["#bf3a2b", "#e39a8a"], center: "#e8c06a"
    },
    ink: {
      paper: "#f6f2e8", paperDeep: "#e9e2d2",
      ink: "#25282a", inkSoft: "#3b3e3d", accent: "#a83a2b",
      sky: "#f2eee2", sun: "#d8c5a8", sunCore: "#eee0c8",
      far: "#b7c1c4", mid: "#8d9b9e", near: "#6a787a",
      campus: "#6f7e80", snow: "#faf7ee", snowShadow: "#dfe5e4",
      branch: "#37332c", leaf: ["#7a8266", "#98a083"],
      flower: ["#b95a45", "#dda596"], center: "#d9b26a"
    }
  };

  const P = Object.assign({}, PALETTES[cfg.palette] || PALETTES.winter, cfg.colors || {});

  /* ---------- 工具 ---------- */
  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const v = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
  }
  function rgba(hex, a) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }
  function el(name, attrs = {}, parent) {
    const node = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null) continue;
      node.setAttribute(k, v);
    }
    if (parent) parent.appendChild(node);
    return node;
  }
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const seed = cfg.seed || hash(cfg.name + cfg.date + cfg.motif);
  const rng = mulberry32(seed);
  const rand = (a, b) => a + (b - a) * rng();
  const pick = arr => arr[Math.floor(rng() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- CSS 变量 ---------- */
  if (cfg.layout === "left") document.getElementById("poster").classList.add("date-left", "couplet-left");
  if (cfg.transparent) {
    document.documentElement.classList.add("overlay");
    document.body.classList.add("overlay");
    document.getElementById("poster").classList.add("overlay");
    document.getElementById("scene").style.display = "none";
  }
  const root = document.documentElement.style;
  root.setProperty("--paper", P.paper);
  root.setProperty("--paper-deep", P.paperDeep);
  root.setProperty("--ink", P.ink);
  root.setProperty("--ink-soft", P.inkSoft);
  root.setProperty("--accent", P.accent);
  if (cfg.logoTextColor === "light" || cfg.textTheme === "light") document.getElementById("logo").classList.add("on-dark");
  if (cfg.textTheme === "light") {
    root.setProperty("--ink", "#FBF5E7");
    root.setProperty("--ink-soft", "#F1E8D8");
    root.setProperty("--logo-ink", "#FDF8EF");
  }

  /* ---------- 文字 ---------- */
  const eyebrow = document.getElementById("eyebrow");
  let twoLine = false;
  if (cfg.english && cfg.english.trim()) {
    const text = cfg.english.trim();
    twoLine = cfg.englishLines === 2 || text.length > 17;
    if (twoLine) {
      eyebrow.classList.add("is-two-line");
      const parts = text.split(/\s+/);
      const mid = Math.ceil(parts.length / 2);
      [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")].forEach(line => {
        const s = document.createElement("span");
        s.className = "line";
        s.textContent = line;
        eyebrow.appendChild(s);
      });
    } else {
      eyebrow.textContent = text;
    }
    // 单行过长时自动缩字，保证左右留白
    let fs = parseFloat(getComputedStyle(eyebrow).fontSize);
    let guard = 0;
    while (eyebrow.scrollWidth > 958 && fs > 48 && guard++ < 40) {
      fs -= 3;
      eyebrow.style.fontSize = fs + "px";
    }
  } else {
    eyebrow.style.display = "none";
  }

  const dateBox = document.getElementById("date");
  if (cfg.date || cfg.lunar) {
    dateBox.querySelector(".g").textContent = cfg.date || "";
    dateBox.querySelector(".l").textContent = cfg.lunar || "";
    dateBox.style.display = cfg.date ? "block" : "none";
    if (twoLine) dateBox.style.top = "306px";
  } else {
    dateBox.style.display = "none";
  }

  const calli = document.getElementById("calligraphy");
  const chars = Array.from(cfg.name || "");
  const nChars = chars.length;
  const sizeClass = nChars >= 4 ? "is-four" : nChars === 3 ? "is-long" : "";
  if (sizeClass) calli.classList.add(sizeClass);
  const fontSize = nChars >= 4 ? 236 : nChars === 3 ? 280 : 334;
  const titleOffsets = cfg.titleOffsets || [0, 0, 0, 0];
  chars.forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "ch";
    span.textContent = ch;
    span.style.transform = `translateX(${titleOffsets[i] || 0}px)`;
    calli.appendChild(span);
  });

  // 按字形墨迹中心对齐，而不是按字宽对齐
  function alignTitle() {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `${fontSize}px PosterBrush`;
    calli.querySelectorAll(".ch").forEach(span => {
      const m = ctx.measureText(span.textContent);
      const inkCenter = (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
      const corr = m.width / 2 - inkCenter;
      span.style.transform = `translateX(${corr.toFixed(1)}px)`;
    });
  }

  const seal = document.getElementById("seal");
  const sealText = Array.from(cfg.seal || "");
  if (sealText.length) {
    seal.querySelectorAll(".s").forEach((node, i) => { node.textContent = sealText[i] || ""; });
    const top = 352 + fontSize * 0.93 * 0.62;
    const left = 82 + fontSize * 0.97 + (nChars >= 3 ? -10 : 0);
    seal.style.top = `${top}px`;
    seal.style.left = `${left}px`;
    seal.style.transform = "none";
  } else {
    seal.style.display = "none";
  }

  const couplet = document.getElementById("couplet");
  if (cfg.couplet && cfg.couplet.length) {
    cfg.couplet.forEach((line, i) => {
      const col = document.createElement("div");
      col.className = "col";
      col.textContent = line;
      couplet.appendChild(col);
    });
  } else {
    couplet.style.display = "none";
  }

  /* ---------- 场景 ---------- */
  const scene = document.getElementById("scene");
  if (cfg.background) {
    const poster = document.getElementById("poster");
    poster.classList.add("has-bg");
    const bg = document.createElement("img");
    bg.className = "bg";
    bg.src = cfg.background;
    bg.alt = "";
    poster.insertBefore(bg, poster.firstChild);
    scene.style.display = "none";
  }
  const defs = el("defs", {}, scene);

  // 纸张 / 天空 / 阳光 渐变
  function lg(id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
    const g = el("linearGradient", { id, x1, y1, x2, y2 }, defs);
    stops.forEach(([offset, color, opacity]) => {
      el("stop", { offset, "stop-color": color, "stop-opacity": opacity }, g);
    });
  }
  function rg(id, stops, cx = "50%", cy = "50%", r = "50%") {
    const g = el("radialGradient", { id, cx, cy, r }, defs);
    stops.forEach(([offset, color, opacity]) => {
      el("stop", { offset, "stop-color": color, "stop-opacity": opacity }, g);
    });
  }

  lg("skyWash", [[0, P.sky, 0.55], [0.55, P.sky, 0.18], [1, P.paper, 0]]);
  rg("sunHalo", [[0, P.sunCore, 0.55], [0.35, P.sun, 0.32], [1, P.sun, 0]]);
  lg("mFar", [[0, P.far, 0.52], [0.55, P.far, 0.30], [1, P.far, 0.05]]);
  lg("mMid", [[0, P.mid, 0.46], [0.6, P.mid, 0.26], [1, P.mid, 0.04]]);
  lg("mNear", [[0, P.near, 0.42], [0.55, P.near, 0.24], [1, P.near, 0.05]]);
  rg("mist", [[0, P.snow, 0.85], [0.55, P.snow, 0.45], [1, P.snow, 0]]);
  rg("groundGlow", [[0, P.snow, 0.9], [0.55, P.snow, 0.4], [1, P.snow, 0]], "50%", "0%", "80%");
  rg("flowerA", [[0, rgba(P.accent, 0.85), 0.9], [0.55, P.flower[0], 0.96], [1, P.flower[1], 0.92]]);
  rg("flowerB", [[0, rgba(P.accent, 0.7), 0.85], [0.5, P.flower[1], 0.9], [1, P.flower[0], 0.85]]);
  lg("lake", [[0, "#c9d6da", 0.55], [0.38, "#e7e4d8", 0.30], [1, "#f8f1e4", 0.42]]);
  lg("ice", [[0, "#eaf0f1", 0.55], [0.5, "#f4f2e9", 0.35], [1, "#fbf7ee", 0.55]]);

  // 滤镜
  function filter(id, body, region = { x: "-20%", y: "-20%", w: "140%", h: "140%" }) {
    const f = el("filter", {
      id,
      x: region.x, y: region.y, width: region.w, height: region.h,
      "color-interpolation-filters": "sRGB"
    }, defs);
    body(f);
    return f;
  }
  filter("soft", f => el("feGaussianBlur", { stdDeviation: 1.6 }, f));
  filter("soft2", f => el("feGaussianBlur", { stdDeviation: 3.2 }, f));
  filter("blurBig", f => el("feGaussianBlur", { stdDeviation: 16 }, f), { x: "-50%", y: "-50%", w: "200%", h: "200%" });
  filter("blurMid", f => el("feGaussianBlur", { stdDeviation: 7 }, f), { x: "-40%", y: "-40%", w: "180%", h: "180%" });
  filter("inkEdge", f => {
    el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.012 0.03", numOctaves: 3, seed: 7, result: "n" }, f);
    el("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: 16, xChannelSelector: "R", yChannelSelector: "G", result: "d" }, f);
    el("feGaussianBlur", { in: "d", stdDeviation: 1.1 }, f);
  });
  filter("inkEdge2", f => {
    el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.02 0.045", numOctaves: 3, seed: 11, result: "n" }, f);
    el("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: 11, xChannelSelector: "R", yChannelSelector: "G", result: "d" }, f);
    el("feGaussianBlur", { in: "d", stdDeviation: 0.8 }, f);
  });
  filter("painterly", f => {
    el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.004 0.009", numOctaves: 3, seed: 13, result: "n" }, f);
    el("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: 9, xChannelSelector: "R", yChannelSelector: "G", result: "d" }, f);
    el("feGaussianBlur", { in: "d", stdDeviation: 0.35 }, f);
  }, { x: "-3%", y: "-2%", w: "106%", h: "104%" });
  filter("paperFiber", f => {
    el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.9", numOctaves: 4, stitchTiles: "stitch", result: "n" }, f);
    el("feColorMatrix", { in: "n", type: "saturate", values: "0" }, f);
    el("feComponentTransfer", {}, f).appendChild(el("feFuncA", { type: "table", tableValues: "0 0.55" }));
  }, { x: "0", y: "0", w: "100%", h: "100%" });

  scene.setAttribute("filter", "url(#painterly)");

  /* ---- 天空 ---- */
  el("rect", { x: -40, y: -40, width: W + 80, height: 1380, fill: "url(#skyWash)" }, scene);

  const [sunX, sunY] = cfg.sun || [748, 760];
  const isMoon = cfg.celestial === "moon";
  el("circle", { cx: sunX, cy: sunY, r: isMoon ? 180 : 230, fill: isMoon ? "#e8eef0" : "url(#sunHalo)", opacity: isMoon ? 0.22 : 1, filter: "url(#blurMid)" }, scene);
  el("circle", { cx: sunX, cy: sunY, r: 70, fill: isMoon ? "#f6f0dd" : P.sunCore, opacity: isMoon ? 0.85 : 0.72, filter: "url(#soft2)" }, scene);
  el("circle", { cx: sunX, cy: sunY, r: 56, fill: isMoon ? "#fbf5e4" : P.sun, opacity: isMoon ? 0.9 : 0.55, filter: "url(#soft)" }, scene);

  /* ---- 远山 ---- */
  function washTexture(d, color, seedOffset, opacity = 0.05) {
    const g = el("g", { opacity }, scene);
    const cp = el("clipPath", { id: `clip${seedOffset}` }, defs);
    el("path", { d }, cp);
    const t = el("g", { "clip-path": `url(#clip${seedOffset})` }, g);
    const r = mulberry32(seed + 991 * seedOffset);
    for (let i = 0; i < 26; i++) {
      const x = -80 + r() * 1240;
      const y = 1020 + r() * 420;
      el("ellipse", {
        cx: x, cy: y, rx: 40 + r() * 150, ry: 3 + r() * 12,
        fill: color, opacity: 0.18 + r() * 0.3,
        transform: `rotate(${(r() * 2 - 1) * 6} ${x} ${y})`,
        filter: "url(#soft2)"
      }, t);
    }
  }

  function ridge(y, amp, n, seedOffset) {
    const r = mulberry32(seed + 137 * seedOffset);
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const x = -120 + i * ((W + 240) / n);
      let yy = y + (r() * 2 - 1) * amp;
      if (i === 0 || i === n) yy = y + amp * 0.9;
      pts.push([x, yy]);
    }
    // 主峰略高，增强画面重心
    const peak = 1 + Math.floor(n * 0.62);
    if (pts[peak]) pts[peak][1] -= amp * 0.55;
    let d = `M -120 1920 L ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    d += " L 1200 1920 Z";
    return d;
  }

  let midD = "", nearD = "";
  const farG = el("g", { filter: "url(#inkEdge)" }, scene);
  {
    const d1 = ridge(1046, 76, 6, 1);
    el("path", { d: d1, fill: "url(#mFar)" }, farG);
    washTexture(d1, P.far, 1, 0.10);
    el("path", { d: d1, fill: "none", stroke: rgba(P.far, 0.35), "stroke-width": 2.2, filter: "url(#soft)" }, farG);
  }
  const farG2 = el("g", { filter: "url(#inkEdge2)" }, scene);
  {
    const d2 = ridge(1118, 58, 7, 2);
    el("path", { d: d2, fill: "url(#mFar)", opacity: 0.55 }, farG2);
    el("path", { d: d2, fill: "none", stroke: rgba(P.far, 0.3), "stroke-width": 1.8, filter: "url(#soft)" }, farG2);
  }

  // 雾带 1
  el("ellipse", { cx: 320, cy: 1128, rx: 470, ry: 62, fill: "url(#mist)", filter: "url(#blurBig)" }, scene);
  el("ellipse", { cx: 860, cy: 1092, rx: 420, ry: 48, fill: "url(#mist)", filter: "url(#blurBig)", opacity: 0.85 }, scene);

  const midG = el("g", { filter: "url(#inkEdge)" }, scene);
  {
    const d3 = ridge(1196, 70, 7, 3);
    midD = d3;
    el("path", { d: d3, fill: "url(#mMid)" }, midG);
    washTexture(d3, P.mid, 3, 0.12);
    el("path", { d: d3, fill: "none", stroke: rgba(P.mid, 0.42), "stroke-width": 2, filter: "url(#soft)" }, midG);
  }

  // 山间雾气
  el("ellipse", { cx: 560, cy: 1244, rx: 560, ry: 52, fill: "url(#mist)", filter: "url(#blurBig)", opacity: 0.9 }, scene);

  const nearG = el("g", { filter: "url(#inkEdge)" }, scene);
  {
    const d4 = ridge(1298, 52, 8, 4);
    nearD = d4;
    el("path", { d: d4, fill: "url(#mNear)" }, nearG);
    washTexture(d4, P.near, 4, 0.14);
    el("path", { d: d4, fill: "none", stroke: rgba(P.near, 0.5), "stroke-width": 2.2, filter: "url(#soft)" }, nearG);
  }

  // 校园前的一层薄雾，让剪影退远
  el("ellipse", { cx: 620, cy: 1382, rx: 620, ry: 42, fill: "url(#mist)", filter: "url(#blurBig)", opacity: 0.55 }, scene);

  // 雪坡（前景），给底部一个缓慢的形
  el("path", {
    d: "M -40 1920 L -40 1628 C 120 1588 250 1600 380 1648 C 500 1692 610 1700 760 1682 L 1120 1650 L 1120 1920 Z",
    fill: P.snow, opacity: 0.98
  }, scene);
  el("path", {
    d: "M -40 1628 C 120 1588 250 1600 380 1648 C 500 1692 610 1700 760 1682",
    fill: "none", stroke: P.snowShadow, "stroke-width": 10, opacity: 0.5, filter: "url(#blurMid)"
  }, scene);
  el("ellipse", { cx: 210, cy: 1348, rx: 420, ry: 46, fill: "url(#mist)", filter: "url(#blurBig)", opacity: 0.8 }, scene);
  el("ellipse", { cx: 900, cy: 1362, rx: 380, ry: 40, fill: "url(#mist)", filter: "url(#blurBig)", opacity: 0.75 }, scene);

  // 山间小亭：给中景一个安静的落点
  if (cfg.pavilion) {
    const pg = el("g", { transform: "translate(316 1198) scale(0.82)", fill: P.near, opacity: 0.30, filter: "url(#soft)" }, scene);
    el("path", { d: "M -46 -6 Q -20 -30 0 -34 Q 20 -30 46 -6 L 32 4 L 24 4 L 30 -8 Q 12 -26 0 -29 Q -12 -26 -30 -8 L -24 4 L -32 4 Z" }, pg);
    el("path", { d: "M -28 -2 Q -12 -20 0 -23 Q 12 -20 28 -2 L 18 0 Q 8 -14 0 -16 Q -8 -14 -18 0 Z", fill: P.snow, opacity: 0.55 }, pg);
    for (const x of [-22, -8, 8, 22]) el("rect", { x, y: 2, width: 2.6, height: 26 }, pg);
    el("rect", { x: -32, y: 26, width: 64, height: 4 }, pg);
    el("rect", { x: -2, y: -34, width: 4, height: 6 }, pg);
  }

  /* ---- 校园剪影（置于近山之前、雪岸之后） ---- */
  const campus = el("g", { fill: P.campus, opacity: cfg.palette === "autumn" ? 0.20 : 0.30, filter: "url(#soft2)" }, scene);
  function building(x, base, w, h, opts = {}) {
    const g = el("g", {}, campus);
    el("rect", { x, y: base - h, width: w, height: h }, g);
    // 坡屋顶
    el("path", { d: `M ${x - 8} ${base - h} L ${x + w / 2} ${base - h - 18} L ${x + w + 8} ${base - h} Z` }, g);
    // 檐口积雪
    el("path", { d: `M ${x - 8} ${base - h} L ${x + w / 2} ${base - h - 18} L ${x + w + 8} ${base - h}`, fill: "none", stroke: P.snow, "stroke-width": 4, opacity: 0.75 }, g);
    if (opts.tower) {
      el("rect", { x: x + w * 0.31, y: base - h - 66, width: w * 0.38, height: 50 }, g);
      el("path", { d: `M ${x + w * 0.25} ${base - h - 66} L ${x + w * 0.5} ${base - h - 96} L ${x + w * 0.75} ${base - h - 66} Z` }, g);
      el("circle", { cx: x + w * 0.5, cy: base - h - 34, r: 9, fill: P.paper, opacity: 0.9 }, g);
      el("circle", { cx: x + w * 0.5, cy: base - h - 34, r: 1.6, fill: P.campus }, g);
    }
    // 窗：暖光与暗窗相间
    const rows = Math.max(2, Math.floor(h / 22));
    const cols = Math.max(4, Math.floor(w / 22));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if ((i * 3 + j) % 7 === 0) continue;
        const warm = (i + j * 2) % 5 === 0;
        el("rect", {
          x: x + 8 + j * ((w - 16) / cols),
          y: base - h + 10 + i * ((h - 16) / rows),
          width: Math.max(4, (w - 16) / cols * 0.44),
          height: 3.6,
          fill: warm ? P.sunCore : P.paper,
          opacity: warm ? 0.75 : 0.5
        }, g);
      }
    }
  }
  building(330, 1430, 132, 74);
  building(472, 1430, 190, 96);
  building(688, 1430, 68, 128, { tower: true });
  building(766, 1430, 122, 66);
  building(900, 1430, 54, 48);

  // 校园前后树丛
  const treeBlobs = el("g", { fill: P.campus, opacity: 0.26, filter: "url(#soft2)" }, scene);
  for (let i = 0; i < 14; i++) {
    const x = 300 + i * 48 + rand(-10, 10);
    const y = 1372 + rand(-16, 10);
    el("ellipse", { cx: x, cy: y, rx: rand(18, 34), ry: rand(12, 20) }, treeBlobs);
  }

  /* ---- 雪岸与冰湖 ---- */
  const groundY = 1402;
  // 远岸雪坡
  let gd = `M -40 1920 L -40 ${groundY + 6}`;
  const gr = mulberry32(seed + 77);
  const gpts = [];
  for (let i = 0; i <= 10; i++) {
    const x = -40 + i * 116;
    gpts.push([x, groundY + (gr() * 2 - 1) * 13]);
  }
  gd += ` L ${gpts[0][0]} ${gpts[0][1]}`;
  for (let i = 0; i < gpts.length - 1; i++) {
    const p1 = gpts[i], p2 = gpts[i + 1];
    gd += ` Q ${(p1[0] + p2[0]) / 2} ${(p1[1] + p2[1]) / 2 - 5} ${p2[0]} ${p2[1]}`;
  }
  gd += " L 1120 1920 Z";
  el("path", { d: gd, fill: P.snow, opacity: 0.97 }, scene);

  // 冰湖
  el("path", {
    d: "M -40 1442 C 220 1424 420 1448 640 1462 C 840 1474 980 1454 1120 1436 L 1120 1920 L -40 1920 Z",
    fill: "url(#ice)", opacity: 0.96
  }, scene);
  el("path", {
    d: "M -40 1442 C 220 1424 420 1448 640 1462 C 840 1474 980 1454 1120 1436",
    fill: "none", stroke: P.snowShadow, "stroke-width": 12, opacity: 0.55, filter: "url(#blurMid)"
  }, scene);
  el("rect", { x: 0, y: 1460, width: 1080, height: 460, fill: "url(#lake)", opacity: 0.5 }, scene);
  // 冰面倒影：镜像近山与校园，压住空旷的下半部
  const lakeClip = el("clipPath", { id: "lakeClip" }, defs);
  el("path", { d: "M -40 1452 C 220 1434 420 1458 640 1472 C 840 1484 980 1464 1120 1446 L 1120 1920 L -40 1920 Z" }, lakeClip);
  const reflArt = el("g", { "clip-path": "url(#lakeClip)", opacity: 0.30, filter: "url(#soft2)" }, scene);
  const mirror = el("g", { transform: "translate(0 2916) scale(1 -1)" }, reflArt);
  if (midD) el("path", { d: midD, fill: P.mid, opacity: 0.55 }, mirror);
  if (nearD) el("path", { d: nearD, fill: P.near, opacity: 0.5 }, mirror);
  const campusRef = campus.cloneNode(true);
  campusRef.setAttribute("opacity", 0.6);
  mirror.appendChild(campusRef);
  const treeRef = treeBlobs.cloneNode(true);
  treeRef.setAttribute("opacity", 0.4);
  mirror.appendChild(treeRef);

  // 远山倒影：只用极淡的竖向晕染，避免出现块状
  const refl = el("g", { opacity: 0.10, filter: "url(#blurBig)" }, scene);
  for (let i = 0; i < 6; i++) {
    el("ellipse", {
      cx: rand(200, 900), cy: 1510 + i * 42, rx: rand(220, 380), ry: rand(20, 34),
      fill: i % 2 ? P.mid : P.near
    }, refl);
  }
  // 冰面细纹（横向）
  const iceLines = el("g", { stroke: rgba(P.near, 0.16), "stroke-width": 1, fill: "none" }, scene);
  for (let i = 0; i < 22; i++) {
    const y = 1500 + i * 18 + rand(-8, 8);
    const x = rand(20, 700);
    el("path", { d: `M ${x} ${y} q 40 ${rand(-3, 3)} ${rand(60, 220)} 0`, opacity: rand(0.2, 0.6) }, iceLines);
  }

  // 日光倒影
  const sunRef = el("g", { filter: "url(#blurMid)" }, scene);
  for (let i = 0; i < 14; i++) {
    const w = 30 + i * 8 + rand(-8, 12);
    el("ellipse", {
      cx: sunX + rand(-8, 8), cy: 1470 + i * 24, rx: w, ry: rand(2, 4),
      fill: P.sun, opacity: 0.32 - i * 0.016
    }, sunRef);
  }

  // 冰裂纹
  const cracks = el("g", { stroke: rgba(P.near, 0.22), "stroke-width": 1, fill: "none" }, scene);
  for (let i = 0; i < 12; i++) {
    const x = rand(40, 1040), y = rand(1490, 1880);
    el("path", {
      d: `M ${x} ${y} q ${rand(30, 80)} ${rand(-6, 6)} ${rand(90, 170)} ${rand(-3, 3)}`,
      opacity: rand(0.25, 0.7)
    }, cracks);
  }

  // 近处雪堆（左右下角），为前景折枝提供落点
  el("path", {
    d: "M -40 1920 L -40 1728 C 60 1700 150 1706 230 1746 C 300 1780 330 1840 320 1920 Z",
    fill: P.snow, opacity: 0.98
  }, scene);
  el("path", {
    d: "M -40 1728 C 60 1700 150 1706 230 1746",
    fill: "none", stroke: P.snowShadow, "stroke-width": 9, opacity: 0.4, filter: "url(#blurMid)"
  }, scene);

  // 雪地蓝调阴影
  const shadows = el("g", { fill: P.snowShadow, filter: "url(#blurMid)" }, scene);
  el("ellipse", { cx: 300, cy: 1510, rx: 430, ry: 26, opacity: 0.32 }, shadows);
  el("ellipse", { cx: 840, cy: 1600, rx: 380, ry: 24, opacity: 0.26 }, shadows);
  el("ellipse", { cx: 160, cy: 1770, rx: 280, ry: 24, opacity: 0.28 }, shadows);

  // 远处枯树
  function bareTree(x, base, height, color, opacity) {
    const g = el("g", { stroke: color, "stroke-linecap": "round", fill: "none", opacity, filter: "url(#soft)" }, scene);
    function limb(x0, y0, ang, len, wdt, depth) {
      const x1 = x0 + Math.cos(ang) * len;
      const y1 = y0 + Math.sin(ang) * len;
      el("path", { d: `M ${x0.toFixed(1)} ${y0.toFixed(1)} Q ${((x0 + x1) / 2 + rand(-5, 5)).toFixed(1)} ${((y0 + y1) / 2 + rand(-4, 4)).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`, "stroke-width": wdt }, g);
      if (depth <= 0) return;
      const branches = depth > 2 ? 2 : 3;
      for (let i = 0; i < branches; i++) {
        limb(x1, y1, ang + rand(-0.55, 0.55) + (i - 1) * 0.18, len * rand(0.55, 0.74), Math.max(0.6, wdt * 0.55), depth - 1);
      }
    }
    limb(x, base, -Math.PI / 2 + rand(-0.08, 0.08), height * 0.55, height / 80, 3);
  }
  bareTree(148, 1440, 250, P.near, 0.30);
  bareTree(270, 1428, 170, P.near, 0.22);
  bareTree(1012, 1436, 200, P.near, 0.20);

  /* ---- 折枝花木 ---- */
  const MB = {
    plum: { flower: "plum", leaf: null, buds: true, leafColors: null },
    osmanthus: { flower: "osmanthus", leaf: "oval", buds: false, leafColors: ["#5e6c4a", "#7c8865"] },
    ginkgo: { flower: null, leaf: "fan", buds: false, leafColors: ["#d3a52f", "#e9c65d"] },
    maple: { flower: null, leaf: "maple", buds: false, leafColors: ["#bd5433", "#d98a4c"] },
    chrys: { flower: "chrys", leaf: "oval", buds: false, leafColors: ["#5a6944", "#7b875c"] },
    pine: { flower: null, leaf: "needle", buds: false, leafColors: ["#3f584a", "#5b7260"] },
    willow: { flower: null, leaf: "willow", buds: false, leafColors: ["#8b9a5e", "#aab77a"] },
    none: { flower: null, leaf: null, buds: false, leafColors: null }
  };
  const motif = MB[cfg.motif] || MB.plum;

  function drawPetal(parent, color, petalLen, petalWid, fill) {
    el("ellipse", { cx: 0, cy: -petalLen * 0.62, rx: petalWid, ry: petalLen * 0.62, fill: fill || color, opacity: 0.96 }, parent);
  }

  function flowerGroup(x, y, scale, rot) {
    const g = el("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${scale.toFixed(2)})` }, branchLayer);
    const color = pick(P.flower);
    const grad = rng() > 0.5 ? "url(#flowerA)" : "url(#flowerB)";
    if (motif.flower === "osmanthus") {
      for (let c = 0; c < 4; c++) {
        const cx = rand(-7, 7), cy = rand(-7, 7);
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2;
          el("circle", { cx: cx + Math.cos(a) * 4.6, cy: cy + Math.sin(a) * 4.6, r: 3.4, fill: color, opacity: 0.95 }, g);
        }
        el("circle", { cx, cy, r: 1.5, fill: P.center }, g);
      }
      return g;
    }
    if (motif.flower === "chrys") {
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * 360;
        const p = el("g", { transform: `rotate(${a})` }, g);
        el("ellipse", { cx: 0, cy: -12, rx: 3.4, ry: 12, fill: color, opacity: 0.9 }, p);
      }
      el("circle", { r: 6, fill: P.center }, g);
      return g;
    }
    // 花瓣下的淡淡投影，增加体积
    el("ellipse", { cx: 1.5, cy: 2, rx: 22, ry: 20, fill: rgba(P.branch, 0.14), filter: "url(#soft)" }, g);
    // plum / default 五瓣
    for (let k = 0; k < 5; k++) {
      const p = el("g", { transform: `rotate(${k * 72})` }, g);
      drawPetal(p, color, 19.5, 8.6, grad);
    }
    el("circle", { r: 3.4, fill: P.center }, g);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      el("line", {
        x1: 0, y1: 0, x2: Math.cos(a) * 9, y2: Math.sin(a) * 9,
        stroke: rgba(P.accent, 0.65), "stroke-width": 0.8
      }, g);
      el("circle", { cx: Math.cos(a) * 9, cy: Math.sin(a) * 9, r: 1.2, fill: P.center }, g);
    }
    return g;
  }

  function leafGroup(x, y, scale, rot) {
    const color = pick(motif.leafColors || P.leaf);
    const g = el("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${scale.toFixed(2)})` }, branchLayer);
    if (motif.leaf === "fan") {
      el("path", {
        d: "M0 2 C -15 0 -25 -12 -20 -23 C -16 -31 -8 -33 -3 -29 L 0 -24 L 3 -29 C 8 -33 16 -31 20 -23 C 25 -12 15 0 0 2 Z",
        fill: color, opacity: 0.94
      }, g);
      el("path", { d: "M0 2 L 0 -22", stroke: rgba(P.branch, 0.45), "stroke-width": 1 }, g);
      el("path", { d: "M0 -6 L -12 -18 M0 -10 L 12 -20", stroke: rgba(P.branch, 0.25), "stroke-width": 0.7, fill: "none" }, g);
    } else if (motif.leaf === "maple") {
      el("path", {
        d: "M0 0 L -2 -8 L -11 -6 L -9 -14 L -17 -13 L -12 -21 L -4 -20 L 0 -30 L 4 -20 L 12 -21 L 17 -13 L 9 -14 L 11 -6 L 2 -8 Z",
        fill: color, opacity: 0.95
      }, g);
      el("path", { d: "M0 0 L 0 8", stroke: rgba(P.branch, 0.6), "stroke-width": 1.2 }, g);
    } else if (motif.leaf === "needle") {
      for (let k = 0; k < 11; k++) {
        const a = -Math.PI / 2 + (k - 5) * 0.19;
        el("line", {
          x1: 0, y1: 0, x2: Math.cos(a) * 26, y2: Math.sin(a) * 26,
          stroke: color, "stroke-width": 1.7, "stroke-linecap": "round", opacity: 0.9
        }, g);
      }
    } else if (motif.leaf === "willow") {
      el("path", { d: "M0 0 C 4 8 4 18 2 28", stroke: color, "stroke-width": 2.4, fill: "none", opacity: 0.9 }, g);
      for (let k = 0; k < 5; k++) {
        const yy = 4 + k * 6;
        el("ellipse", { cx: 2 + (k % 2 ? 2 : -2), cy: yy + 5, rx: 2.2, ry: 7, fill: color, opacity: 0.85, transform: `rotate(${k % 2 ? 18 : -18} ${2} ${yy})` }, g);
      }
    } else {
      // oval 叶
      el("path", { d: "M0 0 C 10 -6 18 -16 15 -24 C 8 -28 -2 -22 -4 -12 C -5 -6 -3 -1 0 0 Z", fill: color, opacity: 0.94 }, g);
      el("path", { d: "M0 0 L 11 -21", stroke: rgba(P.branch, 0.35), "stroke-width": 0.8 }, g);
    }
    return g;
  }

  function bud(x, y, scale) {
    el("circle", { cx: x, cy: y, r: 3.2 * scale, fill: rgba(P.accent, 0.55) }, branchLayer);
    el("circle", { cx: x, cy: y, r: 1.6 * scale, fill: P.branch, opacity: 0.6 }, branchLayer);
  }

  function grow(x0, y0, c1x, c1y, c2x, c2y, x1, y1, width, depth, side) {
    const g = el("g", { fill: "none", stroke: P.branch, "stroke-linecap": "round", opacity: 0.92 }, scene);
    const d = `M ${x0} ${y0} C ${c1x} ${c1y} ${c2x} ${c2y} ${x1} ${y1}`;
    // 水彩洇开
    el("path", { d, stroke: rgba(P.branch, 0.16), "stroke-width": width * 2.4, filter: "url(#soft2)" }, g);
    el("path", { d, "stroke-width": width }, g);
    // 干笔飞白
    el("path", {
      d, stroke: rgba(P.paper, 0.20), "stroke-width": width * 0.30,
      "stroke-dasharray": "7 20 3 14"
    }, g);
    el("path", {
      d, stroke: rgba(P.branch, 0.55), "stroke-width": Math.max(0.8, width * 0.34),
      transform: "translate(0.8 -0.8)", opacity: 0.5
    }, g);

    if (depth <= 0) return;

    if (depth < 2) return;

    const twigs = [
      { t: 0.30, a: 0.95, len: [120, 180] },
      { t: 0.56, a: -0.85, len: [100, 160] },
      { t: 0.78, a: 0.9, len: [90, 145] }
    ];
    for (const tw of twigs) {
      const bx = cubic(x0, c1x, c2x, x1, tw.t);
      const by = cubic(y0, c1y, c2y, y1, tw.t);
      const dx = cubic(x0, c1x, c2x, x1, tw.t + 0.01) - bx;
      const dy = cubic(y0, c1y, c2y, y1, tw.t + 0.01) - by;
      const ang = Math.atan2(dy, dx) + tw.a * rand(0.8, 1.1) * side;
      const len = rand(tw.len[0], tw.len[1]);
      const ex = bx + Math.cos(ang) * len;
      const ey = by + Math.sin(ang) * len * 0.72;
      const mx = (bx + ex) / 2 + rand(-18, 18);
      const my = (by + ey) / 2 + rand(-14, 14);
      grow(bx, by, mx, my, mx, my, ex, ey, Math.max(1.4, width * 0.44), depth - 1, -side);
      if (motif.flower) {
        flowerGroup(ex + rand(-6, 6), ey + rand(-6, 6), rand(0.7, 1.0), rand(-35, 35));
        bud(ex + rand(-16, 16), ey + rand(-16, 16), rand(0.7, 1.1));
      }
    }
  }
  function cubic(a, b, c, d, t) {
    const mt = 1 - t;
    return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
  }

  // 主枝：右侧入画，折枝取势；整体下移，给日期留出干净的角
  const branchLayer = el("g", { transform: "translate(-74 124)" }, scene);
  function limb(pts, w, opacity = 0.92) {
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
    el("path", { d, stroke: rgba(P.branch, 0.15), "stroke-width": w * 2.1, fill: "none", filter: "url(#soft2)" }, branchLayer);
    el("path", {
      d, stroke: P.branch, "stroke-width": w, fill: "none",
      "stroke-linejoin": "round", "stroke-linecap": "round", opacity,
      filter: w >= 8 ? "url(#inkEdge2)" : undefined
    }, branchLayer);
    el("path", {
      d, stroke: rgba(P.paper, 0.20), "stroke-width": w * 0.28, fill: "none",
      "stroke-linecap": "round", "stroke-dasharray": "9 26 4 18"
    }, branchLayer);
    el("path", {
      d, stroke: rgba(P.branch, 0.6), "stroke-width": Math.max(1, w * 0.3), fill: "none",
      transform: "translate(1 -1)", opacity: 0.45
    }, branchLayer);
    if (w > 8) {
      el("path", {
        d, stroke: "rgba(255,252,244,0.5)", "stroke-width": Math.max(1.2, w * 0.14), fill: "none",
        transform: "translate(-1.5 -3.5)", opacity: 0.38, "stroke-linecap": "round"
      }, branchLayer);
    }
    if (motif.leaf) {
      const ln = w > 10 ? 1 : 2;
      const nSeg = pts.length - 1;
      for (let i = 0; i < ln; i++) {
        const t = rand(0.25, 0.95);
        const seg = Math.min(nSeg - 1, Math.floor(t * nSeg));
        const lt = t * nSeg - seg;
        const lx = pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * lt + rand(-12, 12);
        const ly = pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * lt + rand(-12, 12);
        leafGroup(lx, ly, rand(0.9, 1.3), rand(-70, 70));
      }
    }
  }

  // 先画一枝在后的细枝，制造穿插
  limb([[1008, 492], [948, 520], [902, 548]], 3.4, 0.55);

  limb([[1150, 462], [1080, 450], [1036, 470], [1002, 518]], 18, 0.95);
  limb([[1012, 508], [974, 566], [918, 590], [862, 604]], 12, 0.94);
  limb([[1002, 518], [1022, 576], [1000, 638], [944, 662], [884, 674]], 9.2, 0.92);
  // 细枝穿插
  limb([[1062, 452], [1050, 494], [1064, 532]], 2.2, 0.65);
  limb([[930, 600], [916, 636], [892, 656]], 2.0, 0.6);
  limb([[880, 672], [858, 700], [836, 714]], 1.9, 0.55);
  limb([[1036, 470], [1012, 432], [980, 412], [938, 400]], 5.0, 0.88);
  limb([[974, 566], [958, 620], [924, 652]], 3.2, 0.8);
  limb([[918, 590], [886, 630], [846, 642]], 3.6, 0.8);
  limb([[1080, 450], [1074, 408], [1096, 378]], 2.6, 0.7);

  // 花簇：聚于枝梢与折点，大小错落
  const clusters = [
    [1128, 438, 2, 0.92], [1082, 440, 2, 0.8], [1042, 438, 3, 1.0],
    [1008, 502, 2, 0.86], [980, 556, 3, 1.04], [938, 392, 3, 0.88],
    [890, 668, 3, 1.0], [848, 640, 2, 0.84], [924, 646, 2, 0.78],
    [906, 544, 2, 0.8], [1096, 370, 1, 0.72]
  ];
  clusters.forEach(([cx, cy, n, base]) => {
    if (motif.flower) {
      for (let i = 0; i < n; i++) {
        flowerGroup(cx + rand(-24, 24), cy + rand(-24, 24), base * rand(0.75, 1.05), rand(-35, 35));
      }
    }
    if (motif.leaf) {
      const ln = motif.flower ? 2 : 3;
      for (let i = 0; i < ln; i++) {
        leafGroup(cx + rand(-30, 30), cy + rand(-30, 30), base * (motif.flower ? rand(0.65, 0.9) : rand(0.9, 1.25)), rand(-60, 60));
      }
    }
    if (rng() > 0.45) bud(cx + rand(-30, 30), cy + rand(-24, 24), rand(0.8, 1.15));
  });

  // 前景虚化折枝（左下）
  // 冰面残雪
  const patches = el("g", { fill: P.snow, filter: "url(#blurMid)" }, scene);
  for (let i = 0; i < 8; i++) {
    el("ellipse", {
      cx: rand(40, 1040), cy: rand(1520, 1860),
      rx: rand(24, 74), ry: rand(5, 12), opacity: rand(0.35, 0.6)
    }, patches);
  }

  // 前景折枝：右下角压色，和上方梅枝呼应
  if (cfg.foregroundBranch) {
    const fb = el("g", { opacity: 0.82, filter: "url(#soft2)" }, scene);
    el("path", { d: "M 1148 1920 C 1080 1868 1036 1812 1010 1758 C 996 1728 980 1706 956 1690", stroke: P.branch, "stroke-width": 12, fill: "none", "stroke-linecap": "round", filter: "url(#inkEdge2)" }, fb);
    el("path", { d: "M 1148 1920 C 1080 1868 1036 1812 1010 1758", stroke: "rgba(255,252,244,0.45)", "stroke-width": 2.2, fill: "none", "stroke-linecap": "round", transform: "translate(-2 -4)" }, fb);
    el("path", { d: "M 1054 1824 C 1032 1856 1004 1874 976 1880", stroke: P.branch, "stroke-width": 5, fill: "none", "stroke-linecap": "round" }, fb);
    const spots = [[986, 1712, 1.2], [1022, 1776, 1.05], [996, 1872, 0.95], [1084, 1858, 0.9]];
    for (const [x, y, sc] of spots) {
      const g = el("g", { transform: `translate(${x} ${y}) scale(${sc})` }, fb);
      for (let k = 0; k < 5; k++) {
        el("g", { transform: `rotate(${k * 72})` }, g)
          .appendChild(el("ellipse", { cx: 0, cy: -19, rx: 8.4, ry: 15.5, fill: "url(#flowerA)", opacity: 0.95 }));
      }
      el("circle", { r: 4, fill: P.center }, g);
    }
    for (let i = 0; i < 5; i++) {
      el("circle", { cx: 960 + rand(0, 140), cy: 1690 + rand(0, 200), r: rand(2, 4), fill: rgba(P.accent, 0.55) }, fb);
    }
  }

  // 前景：雪岸与疏苇，压住底部
  const fg = el("g", {}, scene);
  el("path", {
    d: "M -40 1920 L -40 1782 C 70 1758 160 1768 232 1806 C 292 1838 318 1878 318 1920 Z",
    fill: P.snow, opacity: 0.99
  }, fg);
  el("path", {
    d: "M -40 1782 C 70 1758 160 1768 232 1806",
    fill: "none", stroke: P.snowShadow, "stroke-width": 10, opacity: 0.38, filter: "url(#blurMid)"
  }, fg);
  const reed = el("g", { stroke: P.near, "stroke-width": 1.5, "stroke-linecap": "round", fill: "none", opacity: 0.28 }, fg);
  for (let i = 0; i < 26; i++) {
    const x = 14 + i * 11 + rand(-4, 4);
    const y = 1888 + rand(-26, 20);
    const h = rand(80, 190);
    el("path", { d: `M ${x} ${y} q ${rand(-20, 12)} ${-h * 0.55} ${rand(-30, 4)} ${-h}` }, reed);
    if (i % 4 === 0) {
      el("ellipse", { cx: x + rand(-16, 4), cy: y - h + rand(-6, 6), rx: 2.2, ry: 9, fill: P.near, opacity: 0.5, transform: `rotate(${rand(-25, 10)} ${x} ${y - h})` }, reed);
    }
  }

  // 近山松林：成簇、不等距，像远树而非栅栏
  (function pineForest() {
    const g = el("g", { fill: P.near, opacity: 0.17, filter: "url(#soft)" }, scene);
    let x = 8;
    while (x < 1070) {
      const clusterN = Math.floor(rand(1, 4));
      for (let c = 0; c < clusterN; c++) {
        const px = x + rand(-8, 12);
        const base = 1372 + rand(-34, 22);
        const h = rand(24, 78) * (c === 0 ? 1 : rand(0.55, 0.9));
        const wd = h * rand(0.30, 0.44);
        const p = el("g", { transform: `translate(${px} ${base}) rotate(${rand(-3, 3)})`, opacity: rand(0.35, 0.95).toFixed(2) }, g);
        for (let l = 0; l < 4; l++) {
          const t = l / 4;
          const yy = -h + h * t * 0.72;
          const ww = wd * (1 - t * 0.42);
          el("path", { d: `M 0 ${yy} L ${ww} ${yy + h * 0.22} L ${ww * 0.55} ${yy + h * 0.20} L ${ww * 0.8} ${yy + h * 0.34} L ${-ww * 0.8} ${yy + h * 0.34} L ${-ww * 0.55} ${yy + h * 0.20} L ${-ww} ${yy + h * 0.22} Z` }, p);
        }
        el("rect", { x: -1.2, y: -h * 0.06, width: 2.4, height: h * 0.1 }, p);
      }
      x += rand(26, 62);
    }
  })();

  // 湖面薄雾：软化岸线
  el("ellipse", { cx: 340, cy: 1472, rx: 520, ry: 26, fill: P.paper, opacity: 0.55, filter: "url(#blurBig)" }, scene);
  el("ellipse", { cx: 840, cy: 1520, rx: 480, ry: 24, fill: P.paper, opacity: 0.45, filter: "url(#blurBig)" }, scene);

  // 远空飞鸟
  const birds = el("g", { stroke: P.ink, "stroke-width": 1.6, fill: "none", opacity: 0.32, "stroke-linecap": "round" }, scene);
  [[604, 700, 1], [644, 682, 0.8], [680, 712, 0.65]].forEach(([x, y, s]) => {
    el("path", { d: `M ${x - 9 * s} ${y} q ${5 * s} ${-5 * s} ${9 * s} 0 q ${4 * s} ${-5 * s} ${9 * s} 0` }, birds);
  });

  // 飘落花瓣 / 雪
  const fall = el("g", {}, scene);
  if (motif.flower) {
    for (let i = 0; i < 14; i++) {
      const x = rand(520, 1080), y = rand(420, 1330), r = rand(2.5, 5.5);
      el("ellipse", {
        cx: x, cy: y, rx: r, ry: r * 1.7,
        fill: pick(P.flower), opacity: rand(0.4, 0.75),
        transform: `rotate(${rand(-60, 60)} ${x} ${y})`
      }, fall);
    }
  }
  const snowN = cfg.snowfall || 42;
  for (let i = 0; i < snowN; i++) {
    el("circle", {
      cx: rand(20, 1060), cy: rand(120, 1700), r: rand(0.9, 2.8),
      fill: "#ffffff", opacity: rand(0.25, 0.6)
    }, fall);
  }

  // 统一色调：上暖下冷，轻胶片
  const grade = el("g", { style: "mix-blend-mode:soft-light" }, scene);
  const grad = el("linearGradient", { id: "gradeGrad", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el("stop", { offset: 0, "stop-color": "#ffd7a8", "stop-opacity": 0.35 }, grad);
  el("stop", { offset: 0.45, "stop-color": "#f4e6cf", "stop-opacity": 0.12 }, grad);
  el("stop", { offset: 1, "stop-color": "#b9cdd2", "stop-opacity": 0.22 }, grad);
  el("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#gradeGrad)" }, grade);

  /* ---- 纸纹 ---- */
  const grain = document.getElementById("grain");
  grain.innerHTML = `<svg xmlns="${NS}" width="100%" height="100%"><filter id="grainFilter" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.5"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#grainFilter)" opacity="0.42"/></svg>`;

  // 标记完成，供渲染脚本判定
  document.fonts.ready.then(() => { window.__POSTER_READY__ = true; });
})();
