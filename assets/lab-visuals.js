/* Themen-Visuals für die Lab-Seiten – reine Grafik, ohne Schrift. Farben: BVDW-Blau, Orange, Schwarz, Weiß */
(function () {
  "use strict";
  const B = "#0045C3", O = "#FF5833", K = "#000", W = "#fff";
  const funke = (x, y, r, f = O) => `<path d="M${x} ${y - r} L${x + r * .28} ${y - r * .28} L${x + r} ${y} L${x + r * .28} ${y + r * .28} L${x} ${y + r} L${x - r * .28} ${y + r * .28} L${x - r} ${y} L${x - r * .28} ${y - r * .28} Z" fill="${f}"/>`;

  const MOTIVE = {
    "ai-value-chain": () => `
      <polyline points="200,340 270,280 320,300 400,190" fill="none" stroke="${O}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M400 190 l-34 6 l26 24 Z" fill="${O}"/>
      ${[[240, 250, B], [300, 215, K], [360, 180, B]].map(([x, y, f]) => `<rect x="${x - 36}" y="${y - 22}" width="72" height="44" rx="22" fill="none" stroke="${f}" stroke-width="11" transform="rotate(-32 ${x} ${y})"/>`).join("")}
      ${funke(402, 150, 16, K)}`,
    "ai-technology": () => `
      ${[0, 1, 2, 3, 4].map((i) => `<line x1="${250 + i * 25}" y1="150" x2="${250 + i * 25}" y2="310" stroke="${K}" stroke-width="5"/><line x1="220" y1="${180 + i * 25}" x2="380" y2="${180 + i * 25}" stroke="${K}" stroke-width="5"/>`).join("")}
      <rect x="240" y="170" width="120" height="120" rx="16" fill="${K}"/>
      <rect x="266" y="196" width="68" height="68" rx="8" fill="${O}"/>
      <circle cx="300" cy="230" r="12" fill="${W}"/>
      <path d="M360 200 H410 V150" fill="none" stroke="${O}" stroke-width="5"/><circle cx="410" cy="146" r="9" fill="${O}"/>
      <path d="M240 260 H190 V320" fill="none" stroke="${B}" stroke-width="5"/><circle cx="190" cy="324" r="9" fill="${B}"/>`,
    "ag-data-future-tech": () => `
      ${[[300, 285, K], [300, 245, B], [300, 205, O]].map(([x, y, f], i) => `<path d="M${x} ${y - 36} L${x + 80} ${y} L${x} ${y + 36} L${x - 80} ${y} Z" fill="${f}" stroke="${W}" stroke-width="4" opacity="${1 - i * 0.05}"/>`).join("")}
      <ellipse cx="300" cy="200" rx="128" ry="40" fill="none" stroke="${K}" stroke-width="3" stroke-dasharray="6 8" transform="rotate(-10 300 200)"/>
      <circle cx="420" cy="178" r="11" fill="${O}"/>${funke(190, 150, 14, B)}`,
    "ag-data-driven-markets": () => `
      ${[[230, 70], [262, 110], [294, 90], [326, 140]].map(([x, h]) => `<rect x="${x + 70}" y="${240 - h}" width="22" height="${h}" rx="4" fill="${O}" opacity=".9"/>`).join("")}
      <path d="M210 190 L300 140 L390 190 Z" fill="${K}"/>
      <rect x="215" y="196" width="170" height="10" fill="${K}"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="${226 + i * 42}" y="214" width="20" height="76" rx="3" fill="${B}"/>`).join("")}
      <rect x="205" y="296" width="190" height="14" rx="3" fill="${K}"/>`,
    "ovk-publisher": () => `
      <rect x="215" y="150" width="150" height="180" rx="10" fill="${W}" stroke="${K}" stroke-width="5"/>
      <rect x="235" y="172" width="110" height="22" rx="4" fill="${K}"/>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="235" y="${210 + i * 20}" width="${i % 2 ? 80 : 110}" height="8" rx="4" fill="${B}" opacity=".7"/>`).join("")}
      <circle cx="372" cy="300" r="46" fill="${O}" stroke="${W}" stroke-width="5"/>
      <rect x="347" y="292" width="50" height="16" rx="8" fill="${W}"/>`,
    "ki-search": () => `
      <circle cx="285" cy="215" r="78" fill="${W}" stroke="${K}" stroke-width="16"/>
      <line x1="342" y1="272" x2="405" y2="335" stroke="${K}" stroke-width="22" stroke-linecap="round"/>
      <path d="M245 190 h80 a14 14 0 0 1 14 14 v34 a14 14 0 0 1 -14 14 h-46 l-22 18 v-18 h-12 a14 14 0 0 1 -14 -14 v-34 a14 14 0 0 1 14 -14 Z" fill="${O}"/>
      ${[265, 285, 305].map((x) => `<circle cx="${x}" cy="221" r="5" fill="${W}"/>`).join("")}
      ${funke(390, 140, 18, K)}`,
    "audio": () => `
      <path d="M215 250 V225 a85 85 0 0 1 170 0 V250" fill="none" stroke="${K}" stroke-width="14"/>
      <rect x="196" y="240" width="40" height="76" rx="18" fill="${B}" stroke="${W}" stroke-width="4"/>
      <rect x="364" y="240" width="40" height="76" rx="18" fill="${B}" stroke="${W}" stroke-width="4"/>
      ${[26, 56, 84, 40, 70, 30, 58].map((h, i) => `<rect x="${252 + i * 15}" y="${278 - h / 2}" width="9" height="${h}" rx="4.5" fill="${O}"/>`).join("")}`,
    "retail-media-ki": () => `
      ${[64, 44, 24].map((r, i) => `<circle cx="365" cy="190" r="${r}" fill="${i === 2 ? O : "none"}" stroke="${O}" stroke-width="8"/>`).join("")}
      <path d="M222 200 H338 L352 320 H208 Z" fill="${B}" stroke="${W}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M252 200 V182 a28 28 0 0 1 56 0 V200" fill="none" stroke="${K}" stroke-width="9"/>
      <line x1="300" y1="250" x2="365" y2="190" stroke="${K}" stroke-width="5" stroke-dasharray="4 7"/>`,
    "ai-commerce": () => `
      <path d="M190 170 H222 L250 280 H370 L392 200 H236" fill="none" stroke="${K}" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="262" cy="312" r="15" fill="${B}"/><circle cx="356" cy="312" r="15" fill="${B}"/>
      <rect x="262" y="214" width="34" height="46" rx="6" fill="${O}"/><rect x="306" y="226" width="34" height="34" rx="6" fill="${B}"/>
      <circle cx="400" cy="140" r="26" fill="${O}"/>${funke(400, 140, 13, W)}
      <path d="M380 156 Q350 190 330 214" fill="none" stroke="${O}" stroke-width="4" stroke-dasharray="3 7"/>`,
    "arbeitsmarkt-leadership": () => `
      <path d="M200 320 H260 V280 H320 V240 H380 V200 H410" fill="none" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
      ${[[230, 280, B], [290, 240, O], [350, 200, B]].map(([x, y, f]) => `<circle cx="${x}" cy="${y - 62}" r="17" fill="${f}"/><path d="M${x - 24} ${y - 4} v-14 a24 24 0 0 1 48 0 v14 Z" fill="${f}"/>`).join("")}
      <path d="M395 150 l20 -24 l20 24" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
    "responsible-ai": () => `
      <line x1="300" y1="150" x2="300" y2="310" stroke="${K}" stroke-width="10"/>
      <rect x="250" y="306" width="100" height="14" rx="7" fill="${K}"/>
      <line x1="200" y1="178" x2="400" y2="178" stroke="${K}" stroke-width="9" stroke-linecap="round"/>
      <circle cx="300" cy="160" r="14" fill="${O}"/>
      <path d="M215 182 L190 250 M215 182 L240 250 M385 182 L360 250 M385 182 L410 250" stroke="${K}" stroke-width="3"/>
      <path d="M180 250 a35 22 0 0 0 70 0 Z" fill="${B}"/><path d="M350 250 a35 22 0 0 0 70 0 Z" fill="${O}"/>`,
    "content-creator": () => `
      <rect x="215" y="160" width="150" height="120" rx="24" fill="${O}"/>
      <path d="M280 190 L322 220 L280 250 Z" fill="${W}"/>
      <path d="M350 330 L410 270 L428 288 L368 348 L344 354 Z" fill="${K}"/><path d="M410 270 l10 -10 l18 18 l-10 10 Z" fill="${B}"/>
      ${funke(200, 150, 18, B)}${funke(395, 175, 12, K)}
      <circle cx="235" cy="315" r="12" fill="${B}"/>`,
    "affiliate-ki": () => {
      const n = [[210, 170], [390, 160], [410, 290], [215, 300], [300, 335], [300, 125]];
      return `${n.map(([x, y]) => `<line x1="300" y1="230" x2="${x}" y2="${y}" stroke="${K}" stroke-width="4"/>`).join("")}
        <path d="M210 170 Q300 110 390 160" fill="none" stroke="${O}" stroke-width="4" stroke-dasharray="4 8"/>
        ${n.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 16 : 20}" fill="${i % 3 === 1 ? O : W}" stroke="${K}" stroke-width="4"/>`).join("")}
        <circle cx="300" cy="230" r="40" fill="${B}" stroke="${W}" stroke-width="5"/>
        <path d="M282 230 a10 10 0 0 1 10 -10 h16 a10 10 0 0 1 0 20 h-6 M318 230 a10 10 0 0 1 -10 10 h-16 a10 10 0 0 1 0 -20 h6" fill="none" stroke="${W}" stroke-width="5" stroke-linecap="round"/>`;
    },
    "agentic-media-buying": () => `
      ${[50, 80, 64, 110, 140].map((h, i) => `<rect x="${215 + i * 34}" y="${320 - h}" width="24" height="${h}" rx="5" fill="${i === 4 ? O : B}"/>`).join("")}
      <path d="M220 230 L290 200 L330 222 L392 160" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <polygon points="392,118 418,133 418,163 392,178 366,163 366,133" fill="${O}" stroke="${W}" stroke-width="4"/>
      <circle cx="384" cy="146" r="5" fill="${W}"/><circle cx="400" cy="146" r="5" fill="${W}"/>
      <path d="M244 136 L244 176 L254 166 L262 184 L270 180 L262 162 L276 162 Z" fill="${K}" stroke="${W}" stroke-width="2"/>`,
    "email-ki": () => `
      <rect x="210" y="170" width="170" height="118" rx="12" fill="${W}" stroke="${K}" stroke-width="6"/>
      <path d="M214 176 L295 236 L376 176" fill="none" stroke="${B}" stroke-width="8" stroke-linejoin="round"/>
      <path d="M392 248 a60 60 0 0 1 -40 72" fill="none" stroke="${O}" stroke-width="8" stroke-linecap="round"/><path d="M340 312 l16 18 l6 -24 Z" fill="${O}"/>
      <path d="M200 160 a60 60 0 0 1 48 -40" fill="none" stroke="${O}" stroke-width="8" stroke-linecap="round"/><path d="M258 112 l-22 -2 l10 22 Z" fill="${O}"/>
      ${funke(405, 150, 16, B)}`,
    "ai-law": () => `
      <rect x="205" y="150" width="120" height="160" rx="8" fill="${W}" stroke="${K}" stroke-width="5"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="222" y="${172 + i * 20}" width="${i === 0 ? 60 : 86}" height="7" rx="3.5" fill="${i === 0 ? O : B}" opacity="${i === 0 ? 1 : 0.6}"/>`).join("")}
      <g transform="rotate(-38 360 230)"><rect x="320" y="190" width="84" height="40" rx="8" fill="${K}"/><rect x="354" y="230" width="16" height="110" rx="6" fill="${O}"/></g>
      <rect x="320" y="322" width="96" height="16" rx="5" fill="${B}"/>`,
    "digitalagenturen": () => `
      <path d="M300 150 a58 58 0 0 1 34 105 v22 h-68 v-22 a58 58 0 0 1 34 -105 Z" fill="${O}"/>
      <rect x="268" y="283" width="64" height="12" rx="6" fill="${K}"/><rect x="276" y="300" width="48" height="12" rx="6" fill="${K}"/>
      <path d="M276 190 a30 30 0 0 1 24 -18" fill="none" stroke="${W}" stroke-width="7" stroke-linecap="round"/>
      ${[[-1, 0], [1, 0]].map(([dx]) => [0, 1, 2].map((i) => { const a = (-150 + i * 30) * Math.PI / 180; const x1 = 300 + dx * Math.cos(a) * 82, y1 = 205 + Math.sin(a) * 82, x2 = 300 + dx * Math.cos(a) * 108, y2 = 205 + Math.sin(a) * 108; return `<line x1="${x1.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" stroke="${B}" stroke-width="7" stroke-linecap="round"/>`; }).join("")).join("")}
      ${funke(400, 300, 15, K)}`,
    "fit-expert-group": () => `
      <rect x="200" y="300" width="110" height="20" rx="6" fill="${K}"/>
      <circle cx="255" cy="290" r="20" fill="${B}"/>
      <rect x="243" y="190" width="24" height="100" rx="12" fill="${B}" transform="rotate(18 255 290)"/>
      <circle cx="285" cy="198" r="17" fill="${K}"/>
      <rect x="282" y="176" width="22" height="96" rx="11" fill="${O}" transform="rotate(-68 285 198)"/>
      <circle cx="372" cy="232" r="13" fill="${K}"/>
      <path d="M380 228 l26 -16 M380 240 l26 14" stroke="${K}" stroke-width="8" stroke-linecap="round"/>
      ${funke(410, 160, 15, B)}<circle cx="200" cy="170" r="9" fill="${O}"/>`,
  };

  window.labVisual = function (id) {
    const motiv = MOTIVE[id];
    if (!motiv) return "";
    return `<svg class="hero-netz lab-visual" viewBox="0 0 460 500" aria-hidden="true" focusable="false">
      <path d="M150 0 H450 V294 a36 36 0 0 1 -36 36 H186 a36 36 0 0 1 -36 -36 Z" fill="${B}"/>
      <circle cx="300" cy="235" r="150" fill="${W}" stroke="${K}" stroke-width="3"/>
      <circle cx="300" cy="235" r="158" fill="none" stroke="${O}" stroke-width="2" stroke-dasharray="3 9"/>
      ${motiv()}
    </svg>`;
  };
})();
