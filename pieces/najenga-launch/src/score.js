  // =====================================================================
  //  SCORE — Najenga launch (inside buildScore(); see kit/score-head.js). C major, 120 BPM, under the voice.
  //  Thin and quiet in the mess -> an 8th-note groove while things are filed -> fullest when the roof goes on
  //  -> a dry stop and silence on the finished house -> the loudest hit on the slam into the real dashboard
  //  -> a flat warm chord under "one calm place" -> the opening pad and the house motif on "Najenga".
  //  The house's motif: a rising fifth (C4 -> G4), played each time a floor lands.
  // =====================================================================
  const T = TIMELINE, q = T.cues, R = RNG('score');
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };
  const FIG = [['C4', 'G4', 'E4', 'G4', 'C5', 'G4', 'E4', 'G4'], ['A3', 'E4', 'C4', 'E4', 'A4', 'E4', 'C4', 'E4'],
    ['F3', 'C4', 'A3', 'C4', 'F4', 'C4', 'A3', 'C4'], ['G3', 'D4', 'B3', 'D4', 'G4', 'D4', 'B3', 'D4']];
  const ROOT = ['C2', 'A1', 'F1', 'G1'];
  const bar = (t) => Math.floor(t / (BEAT * 4)) % 4;      // C - Am - F - G, one chord a bar
  const motif = (t, vel = 0.11) => { pluck(t, nz('C4'), vel, -0.1, 0.6, 2600, 0.35); pluck(t + E8, nz('G4'), vel, 0.1, 0.7, 2600, 0.35); };
  const grid = (t) => Math.ceil(t / E8 - 1e-6) * E8;
  const dryStop = q.pull + 0.3;                           // everything ends before the silence

  // ================= MUSIC =================
  to = 'm';
  // the mess: a soft pad, then quarter-note plucks that grow busier as the clutter piles up
  pad(0.0, q.money + 0.1, ['C3', 'G3', 'E4'], 0.03, { type: 'triangle', cut: 900, att: 0.6, rel: 0.3, send: 0.4 });
  each(grid(q.receipts), q.money, BEAT, (t, k) => pluck(t, nz(FIG[bar(t)][(k * 2) % 8]), 0.045 + k * 0.001, Math.sin(k) * 0.3, 0.4, 2400, 0.25));
  each(grid(q.sheet), q.money, E8, (t, k) => { if (k % 2) pluck(t, nz(FIG[bar(t)][(k * 3) % 8]), 0.03, -0.25, 0.3, 2800, 0.2); });
  // the filing: an 8th-note groove with a bass on the beat
  pad(q.money, q.team + 0.05, ['C3', 'G3', 'E4', 'G4'], 0.03, { cut: 1100, att: 0.4, rel: 0.1, send: 0.3 });
  each(grid(q.money), q.team, E8, (t, k) => {
    pluck(t, nz(FIG[bar(t)][k % 8]), 0.05 * (k % 2 ? 0.75 : 1), Math.sin(k * 0.9) * 0.3, 0.32, 3000, 0.2);
    if (k % 2 === 0) bass(t, nz(ROOT[bar(t)]) * 2, 0.15);
  });
  // the roof: the fullest (16ths, sub, hats); dry in the last beat, dead stop before the silence
  pad(q.team, dryStop, ['C3', 'G3', 'E4', 'G4', 'C5'], 0.03, { cut: 1500, att: 0.08, rel: 0.02, send: 0.08 });
  each(grid(q.team), dryStop - 0.02, E16, (t, k) => {
    const fig = FIG[bar(t)], acc = k % 4 === 0 ? 1.3 : 0.85, dry = t > dryStop - BEAT ? 0.02 : 0.12;
    pluck(t, nz(fig[k % 8]), 0.058 * acc, Math.sin(k * 0.9) * 0.4, t > dryStop - E8 ? 0.15 : 0.26, 5200, dry);
    if (k % 2 === 0) bass(t, nz(ROOT[bar(t)]) * 2, 0.15);
    if (k % 4 === 0) sub(t, 0.07);
    noiseHit(t, 0.016, 'highpass', 8500, 0.7, k % 2 ? 0.016 : 0.028, k % 2 ? 0.3 : -0.3);
  });
  riser(q.roof - 0.3, dryStop - 0.05, 0.012);
  // the house motif on each floor landing (the score grows with the house)
  [q.filed1, q.filed2, q.filed3, q.roof].forEach((t, i) => motif(t + 0.05, 0.1 + i * 0.012));

  // the slam: a short chord stab and a sub on the hit (the loudest moment), then a flat warm chord
  ['C3', 'G3', 'C4', 'E4', 'G4', 'C5'].forEach((n, i) => pluck(q.slam + i * 0.006, nz(n), 0.36, (i - 2.5) * 0.15, 0.7, 5200, 0.4));
  pad(q.slam, q.slam + 0.4, ['C3', 'G3', 'C4', 'E4', 'G4', 'C5'], 0.5, { cut: 3600, att: 0.008, rel: 0.35, send: 0.3 });
  pad(q.slam + 0.5, q.logo + 0.3, ['C3', 'G3', 'C4', 'E4', 'G4'], 0.045, { cut: 1300, att: 0.3, rel: 0.4, send: 0.5 });
  drone(q.slam + 0.5, q.logo + 0.3, nz('C2'), 0.06, { att: 0.2, rel: 0.4 });
  each(grid(q.slam + 1.5), q.logo, BEAT, (t, k) => { if (k % 2 === 0) pluck(t, nz(['E4', 'G4', 'C5', 'G4'][(k / 2) % 4]), 0.035, (k % 4 ? 0.2 : -0.2), 0.6, 2800, 0.4); });
  // the name: back to the opening pad; the house motif on "Najenga", then up to the octave
  pad(q.logo, T.duration, ['C3', 'G3', 'E4'], 0.032, { type: 'triangle', cut: 900, att: 0.3, rel: 0.6, send: 0.5 });
  motif(q.logo + 0.2, 0.14);
  pluck(q.logo + 0.2 + BEAT, nz('C5'), 0.1, 0, 1.2, 2600, 0.45);

  // ================= SFX =================
  to = 's';
  // the mess: receipts landing, the phone buzzing, the plan and the laptop dropping
  for (let i = 0; i < 6; i++) blip(q.receipts + i * 0.1 + 0.08, 1400 - i * 60, 900, 0.03, 0.022, (i % 2 ? 0.25 : -0.25));
  [q.chat + 0.2, q.chat + 1.4].forEach((t) => { for (let k = 0; k < 3; k++) noiseHit(t + k * 0.07, 0.05, 'lowpass', 180, 1, 0.05, -0.3); });
  noiseHit(q.plan + 0.12, 0.12, 'bandpass', 600, 1.2, 0.04, -0.3);
  blip(q.sheet + 0.1, 700, 500, 0.06, 0.04, 0.3);
  // money: the receipt arrives (a chat pop), the scan line reads it, it's filed
  blip(q.money + 0.3, 900, 1500, 0.05, 0.04, -0.3);
  sweep(q.scan, q.scan + 0.7, 0.006, 900, 3200, -0.2);
  blip(q.scan + 0.72, 1800, 2400, 0.04, 0.035, -0.2);
  // floors landing: a soft thud each
  [q.filed1, q.filed2, q.filed3, q.roof].forEach((t) => { noiseHit(t + 0.12, 0.14, 'lowpass', 220, 0.9, 0.09, 0); sub(t + 0.12, 0.05); });
  // site photos: a shutter click as each photo pops into its window
  for (let i = 0; i < 4; i++) { const t = q.filed2 + 0.25 + i * 0.16; noiseHit(t, 0.012, 'highpass', 6000, 0.8, 0.05, 0.2); noiseHit(t + 0.03, 0.02, 'bandpass', 2400, 1.5, 0.03, 0.2); }
  // files: paper sliding into folders
  for (let i = 0; i < 3; i++) noiseHit(q.files + 0.2 + i * 0.25, 0.22, 'bandpass', 2200 + R.n(400), 1.2, 0.022, -0.2, 0, 1200);
  // the team: a pop per person as they land
  for (let i = 0; i < 3; i++) blip(q.team + 0.15 + i * 0.22 + 0.12, 600 + i * 150, 900 + i * 150, 0.05, 0.035, (i - 1) * 0.3);
  // the card landing in the laptop, the screen swap
  noiseHit(q.back + 0.3, 0.16, 'lowpass', 400, 0.9, 0.04, -0.3);
  noiseHit(q.screen2, 0.08, 'bandpass', 3000, 1, 0.012, 0, 0, 6000);
