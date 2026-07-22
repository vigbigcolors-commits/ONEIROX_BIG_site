/**
 * Deterministic mock-EEG SVG from chart_seed + frequency band.
 */

import { mulberry32 } from "./seed.mjs";

const BAND_COLOR = {
  delta: "#1a2848",
  theta: "#2a4070",
  alpha: "#266799",
  sigma: "#268571",
  beta: "#3189cc",
  gamma: "#6090c8",
  mixed: "#566e58",
};

export function buildEegSvg(entry, width = 640, height = 180) {
  const rng = mulberry32(entry.chart_seed >>> 0);
  const { min, max, band } = entry.eeg_frequency_hz_range;
  const mid = (min + max) / 2;
  const ampBase =
    band === "delta" ? 42 : band === "theta" ? 34 : band === "sigma" ? 28 : 24;
  const noise =
    entry.utility_type === "phase_disruption"
      ? 0.55
      : entry.utility_type === "atonia_risk"
        ? 0.4
        : 0.22;

  const points = [];
  const n = 160;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * (width - 24) + 12;
    const t = i / n;
    const freqFactor = mid / 10;
    const wave =
      Math.sin(t * Math.PI * 2 * (6 + freqFactor * 3) + rng() * 0.4) *
      ampBase;
    const burst =
      entry.atonia_state === "partial_failure" && rng() > 0.92
        ? (rng() - 0.5) * ampBase * 1.8
        : 0;
    const jitter = (rng() - 0.5) * ampBase * noise;
    const y = height / 2 - (wave + burst + jitter);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  const stroke = BAND_COLOR[band] || BAND_COLOR.mixed;
  const baseline = height / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Mock EEG trace ${min}–${max} Hz ${band}">
  <rect width="${width}" height="${height}" fill="#f8faf5"/>
  <line x1="12" y1="${baseline}" x2="${width - 12}" y2="${baseline}" stroke="#9aaa90" stroke-width="1" stroke-dasharray="4 4"/>
  <polyline fill="none" stroke="${stroke}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="${points.join(" ")}"/>
  <text x="16" y="22" fill="#3a4435" font-family="Work Sans, sans-serif" font-size="12">${min}–${max} Hz · ${band}</text>
  <text x="16" y="${height - 10}" fill="#9aaa90" font-family="Work Sans, sans-serif" font-size="11">seed ${entry.chart_seed} · ${entry.utility_type}</text>
</svg>`;
}
