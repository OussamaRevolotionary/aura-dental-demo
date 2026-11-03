import { useId } from "react";

/**
 * Procedural Digital-Smile-Design render: an anterior upper/lower dental model drawn in SVG,
 * styled like scan software. Used for cases where no photographic pair exists yet.
 */

type Tooth = { w: number; h: number; edge: number; cusp?: boolean };

// Patient's right premolar → left premolar (as viewed)
const UPPER: Tooth[] = [
  { w: 66, h: 112, edge: 336 },
  { w: 80, h: 140, edge: 352, cusp: true },
  { w: 78, h: 124, edge: 350 },
  { w: 100, h: 150, edge: 362 },
  { w: 100, h: 150, edge: 362 },
  { w: 78, h: 124, edge: 350 },
  { w: 80, h: 140, edge: 352, cusp: true },
  { w: 66, h: 112, edge: 336 },
];

type Offset = { r: number; dx: number; dy: number };

const CROWDED: Offset[] = [
  { r: 0, dx: 6, dy: -4 },
  { r: -6, dx: 14, dy: -22 },
  { r: 9, dx: 10, dy: -8 },
  { r: -4, dx: 6, dy: 4 },
  { r: 7, dx: -12, dy: 8 },
  { r: -11, dx: -18, dy: -6 },
  { r: 4, dx: -6, dy: -16 },
  { r: 0, dx: -8, dy: -2 },
];
// Draw order for the crowded arch so overlapping teeth stack believably
const CROWDED_ORDER = [0, 7, 1, 6, 2, 5, 4, 3];

const GAP = 3;
const START_X = 500 - (UPPER.reduce((s, t) => s + t.w, 0) + GAP * (UPPER.length - 1)) / 2;
const LOWER_W = 56;
const LOWER_START = 500 - (LOWER_W * 8 + GAP * 7) / 2;

function toothPath(x: number, t: Tooth) {
  const { w, h, edge: b } = t;
  const top = b - h - 60;
  const r = t.cusp ? 26 : 16;
  const incisal = t.cusp ? `L ${x + w * 0.62} ${b - 4} Q ${x + w * 0.5} ${b + 10} ${x + w * 0.38} ${b - 4}` : "";
  return [
    `M ${x + w * 0.1} ${top}`,
    `L ${x + w * 0.9} ${top}`,
    `Q ${x + w} ${top} ${x + w * 0.985} ${top + h * 0.35}`,
    `L ${x + w * 0.965} ${b - r}`,
    `Q ${x + w * 0.95} ${b} ${x + w * 0.78} ${b}`,
    incisal,
    `L ${x + w * 0.22} ${b}`,
    `Q ${x + w * 0.05} ${b} ${x + w * 0.035} ${b - r}`,
    `L ${x + w * 0.015} ${top + h * 0.35}`,
    `Q ${x} ${top} ${x + w * 0.1} ${top}`,
    "Z",
  ].join(" ");
}

function layout() {
  let x = START_X;
  return UPPER.map((t) => {
    const pos = { x, t };
    x += t.w + GAP;
    return pos;
  });
}

function gumPath(zeniths: number[], papillaDrop: number) {
  const teeth = layout();
  const lastI = teeth.length - 1;
  const rightEdge = teeth[lastI].x + teeth[lastI].t.w + 22;
  const leftEdge = teeth[0].x - 22;
  // Model base: a soft arched top edge, like a printed dental model
  const parts: string[] = [
    `M ${leftEdge} ${zeniths[0] + 10}`,
    `C ${leftEdge - 14} 150, 330 64, 500 64`,
    `C 670 64, ${rightEdge + 14} 150, ${rightEdge} ${zeniths[lastI] + 10}`,
  ];
  for (let i = lastI; i >= 0; i--) {
    const { x, t } = teeth[i];
    const right = i === lastI ? rightEdge : x + t.w + GAP / 2;
    const left = i === 0 ? leftEdge : x - GAP / 2;
    const z = zeniths[i];
    const pR = i === lastI ? z + 10 : Math.min(z, zeniths[i + 1]) + papillaDrop;
    const pL = i === 0 ? z + 10 : Math.min(z, zeniths[i - 1]) + papillaDrop;
    parts.push(`L ${right} ${pR}`);
    const cx = x + t.w * 0.47;
    parts.push(`C ${right - t.w * 0.12} ${z - 4}, ${cx + t.w * 0.25} ${z}, ${cx} ${z}`);
    parts.push(`C ${cx - t.w * 0.25} ${z}, ${left + t.w * 0.12} ${z - 4}, ${left} ${pL}`);
  }
  parts.push("Z");
  return parts.join(" ");
}

function lowerToothPath(x: number, w: number, top: number) {
  const h = 170;
  return `M ${x + w * 0.04} ${top + h} L ${x + w * 0.02} ${top + 18} Q ${x + w * 0.04} ${top} ${x + w * 0.24} ${top} L ${x + w * 0.76} ${top} Q ${x + w * 0.96} ${top} ${x + w * 0.98} ${top + 18} L ${x + w * 0.96} ${top + h} Z`;
}

export type SimLabels = { initial: string; target: string; midline: string; gingival: string };

export default function SmileSimulation({
  crowded = false,
  gummy = false,
  stage,
  labels,
}: {
  crowded?: boolean;
  gummy?: boolean;
  stage: "before" | "after";
  labels: SimLabels;
}) {
  const uid = useId().replace(/:/g, "");
  const teeth = layout();
  const order = crowded ? CROWDED_ORDER : teeth.map((_, i) => i);

  // Gum zeniths: ideal exposes the full crown; gummy covers ~45% unevenly.
  const zeniths = teeth.map(({ t }, i) => {
    const ideal = t.edge - t.h;
    if (!gummy) return ideal + (i === 3 || i === 4 ? -2 : i === 1 || i === 6 ? -4 : 6);
    const uneven = [8, -6, 14, 2, 10, 20, -2, 6][i];
    return ideal + t.h * 0.42 + uneven;
  });
  const gum = gumPath(zeniths, gummy ? 34 : 46);
  const accent = stage === "before" ? "#E9B872" : "#38BDF8";
  const before = stage === "before";

  return (
    <svg viewBox="0 0 1000 558" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#1A2433" />
          <stop offset="60%" stopColor="#0E141F" />
          <stop offset="100%" stopColor="#080B12" />
        </radialGradient>
        <linearGradient id={`enamel-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E6D6B4" />
          <stop offset="45%" stopColor="#F4EFE4" />
          <stop offset="85%" stopColor="#F7F5EF" />
          <stop offset="100%" stopColor="#D6E1E7" />
        </linearGradient>
        <linearGradient id={`enamelL-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F1ECE1" />
          <stop offset="100%" stopColor="#CFC7B6" />
        </linearGradient>
        <linearGradient id={`gum-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7E3E4A" />
          <stop offset="70%" stopColor="#B86B76" />
          <stop offset="100%" stopColor="#D58D95" />
        </linearGradient>
        <linearGradient id={`gumL-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#6E3440" />
          <stop offset="100%" stopColor="#B4666F" />
        </linearGradient>
        <radialGradient id={`gloss-${uid}`} cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`grid-${uid}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" className="stroke-cyan-glow" strokeOpacity="0.06" strokeWidth="1" />
        </pattern>
        <filter id={`soft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`shadow-${uid}`} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>

      <rect width="1000" height="558" fill={`url(#bg-${uid})`} />
      <rect width="1000" height="558" fill={`url(#grid-${uid})`} />

      {/* lower arch (behind) */}
      <g filter={`url(#shadow-${uid})`}>
        {Array.from({ length: 8 }).map((_, i) => {
          const x = LOWER_START + i * (LOWER_W + GAP);
          const top = 332 + Math.abs(i - 3.5) * 4;
          const cr = crowded ? [0, 5, -7, 6, -5, 8, -4, 0][i] : 0;
          return (
            <path
              key={i}
              d={lowerToothPath(x, LOWER_W, top)}
              fill={`url(#enamelL-${uid})`}
              stroke="#0B0F17"
              strokeOpacity="0.2"
              transform={`rotate(${cr} ${x + LOWER_W / 2} ${top + 80})`}
            />
          );
        })}
        <path
          d={`M ${LOWER_START - 24} 420 ${Array.from({ length: 8 })
            .map((_, i) => {
              const x = LOWER_START + i * (LOWER_W + GAP);
              return `Q ${x + LOWER_W / 2} 452 ${x + LOWER_W + GAP / 2} 414`;
            })
            .join(" ")} L ${LOWER_START + 8 * (LOWER_W + GAP) + 24} 420 C ${LOWER_START + 8 * (LOWER_W + GAP) + 40} 490, 640 506, 500 506 C 360 506, ${LOWER_START - 40} 490, ${LOWER_START - 24} 420 Z`}
          fill={`url(#gumL-${uid})`}
        />
      </g>

      {/* upper arch */}
      <g filter={`url(#shadow-${uid})`}>
        {order.map((i) => {
          const { x, t } = teeth[i];
          const o = crowded ? CROWDED[i] : { r: 0, dx: 0, dy: 0 };
          const cx = x + t.w / 2;
          return (
            <g key={i} transform={`translate(${o.dx} ${o.dy}) rotate(${o.r} ${cx} ${t.edge - t.h / 2})`}>
              <path d={toothPath(x, t)} fill={`url(#enamel-${uid})`} stroke="#0B0F17" strokeOpacity="0.25" strokeWidth="1.2" />
              <ellipse cx={cx - t.w * 0.08} cy={t.edge - t.h * 0.45} rx={t.w * 0.18} ry={t.h * 0.28} fill={`url(#gloss-${uid})`} opacity="0.55" />
              <path
                d={`M ${x + t.w * 0.2} ${t.edge - 10} Q ${cx} ${t.edge - 4} ${x + t.w * 0.8} ${t.edge - 10}`}
                stroke="#BFD3DE"
                strokeOpacity="0.55"
                strokeWidth="5"
                fill="none"
                filter={`url(#soft-${uid})`}
              />
            </g>
          );
        })}
        <path d={gum} fill={`url(#gum-${uid})`} />
        <path d={gum} fill="none" stroke="#F0B3B9" strokeOpacity="0.35" strokeWidth="1.5" />
      </g>

      {/* DSD annotations */}
      <g fontFamily="JetBrains Mono, IBM Plex Sans Arabic, monospace" fontSize="11">
        <line x1={before && crowded ? 512 : 500} y1="70" x2={before && crowded ? 506 : 500} y2="500" stroke={accent} strokeOpacity="0.7" strokeDasharray="4 6" />
        <path
          d={before && crowded ? "M 160 330 Q 330 372 500 352 T 840 340" : "M 160 330 Q 500 400 840 330"}
          fill="none"
          stroke={accent}
          strokeOpacity="0.75"
          strokeDasharray="2 5"
          strokeWidth="1.4"
        />
        {gummy && (
          <>
            <line x1="150" y1={zeniths[3]} x2="850" y2={zeniths[3]} stroke={accent} strokeOpacity="0.5" strokeDasharray="1 4" />
            <text x="856" y={zeniths[3] + 4} fill={accent}>
              {before ? "4.6mm" : "0.8mm"}
            </text>
          </>
        )}
        <g transform="translate(724 470)">
          <rect width="200" height="58" rx="10" fill="#000" fillOpacity="0.35" stroke={accent} strokeOpacity="0.35" />
          <text x="14" y="24" fill={accent}>
            {before ? labels.initial : labels.target}
          </text>
          <text x="14" y="44" fill="#fff" fillOpacity="0.75">
            {gummy ? `${labels.gingival} ${before ? "4.6mm" : "0.8mm"}` : `${labels.midline} ${before ? "+1.8mm" : "0.0mm"}`}
          </text>
        </g>
      </g>
    </svg>
  );
}
