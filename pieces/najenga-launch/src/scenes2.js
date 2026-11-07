// =====================================================================
//  SCENES part 2 — what each floor carries, the team, the two eras, the camera.
// =====================================================================
// floor 1, money: ledger windows (each a receipt's lines, the total in red) and the front door
function faceMoney(fl, fr) {
  for (let i = 0; i < 4; i++) {
    const u = 16 + i * 56;
    faceRR(fl, u, 14, 44, 44, 4);
    for (let r = 0; r < 2; r++) faceLine(fl, [[u + 7, 24 + r * 9], [u + (r ? 26 : 34), 24 + r * 9]]);
    faceLine(fl, [[u + 7, 46], [u + 37, 46]], PAL.accent, 3.5);
  }
  faceRR(fr, 26, 14, 40, 58, 4, { stroke: PAL.edge });   // the door
  faceRR(fr, 96, 14, 44, 34, 4);
  faceLine(fr, [[118, 14], [118, 48]]);
}
// floor 2, site: the windows are dated photos that pop in one by one; the dates run along the side
function faceSite(fl, fr) {
  for (let i = 0; i < 4; i++) {
    const u = 16 + i * 56, s = clamp(spring(TT, cu.filed2 + 0.25 + i * 0.16, { k: 220, damp: 0.65 }));
    faceRR(fl, u, 12, 44, 40, 3, { stroke: s > 0.5 ? PAL.edge : PAL.inner });
    if (s > 0.05) {   // a tiny site photo: the ground, a crane, the sun
      faceLine(fl, [[u + 5, 12 + 34], [u + 18 * s, 12 + 20], [u + 30 * s, 12 + 28], [u + 39, 12 + 18]]);
      faceEll(fl, u + 34, 20, 3 * s, 3 * s, { stroke: PAL.inner });
    }
    if (s > 0.6) isoText(fl, 'W' + (12 + i), u + 8, 66, 13, { color: PAL.textD });
  }
  faceRR(fr, 22, 14, 58, 40, 4); faceRR(fr, 100, 14, 58, 40, 4);
}
// floor 3, files: folder windows with tabs; a plan grid on the side
function faceFiles(fl, fr) {
  const tab = (u, v, w, h) => facePath(fl, [[u, v + 8], [u, v + h], [u + w, v + h], [u + w, v + 8], [u + w * 0.5, v + 8], [u + w * 0.42, v], [u + 4, v], [u, v + 4]], true);
  for (let i = 0; i < 4; i++) { tab(16 + i * 56, 16, 44, 40); hair(i === 1 ? PAL.edge : PAL.inner); ctx.stroke(); }
  for (let c = 0; c < 4; c++) faceLine(fr, [[24 + c * 36, 14], [24 + c * 36, 56]]);
  faceRR(fr, 20, 14, 144, 42, 2);
  faceLine(fr, [[20, 35], [164, 35]]);
}
// cards that land on the desk where the receipts were, then fly up into the house as their floor is filed
function flyCards(times, liftAt, k, draw) {
  times.forEach((t0, i) => {
    if (TT < t0) return;
    const up = spring(TT, liftAt - 0.25 + i * 0.06, { k: 70, damp: 0.8 });
    if (up > 0.97) return;
    const x = 60 + i * 64, y = 90 + (i % 2) * 54;
    const z = PZ + dropIn(t0, 240, { k: 170, damp: 0.5 }) + up * (floorZ(k) - PZ + 40);
    const xx = lerp(x, HS.x + 40 + i * 50, up), yy = lerp(y, HS.y + HS.d - 30, up);
    draw(xx, yy, z, i);
  });
}
function photoCard(x, y, z) {
  isoBox(x, y, z, 70, 56, 3, { r: 3, seg: 2 });
  const fp = faceOf([x, y, z + 3], [1, 0, 0], [0, 1, 0]);
  faceRR(fp, 6, 6, 58, 44, 2);
  faceLine(fp, [[10, 44], [26, 26], [40, 36], [60, 18]]);
}
function folderCard(x, y, z) {
  isoBox(x, y, z, 72, 58, 6, { r: 3, seg: 2 });
  const fp = faceOf([x, y, z + 6], [1, 0, 0], [0, 1, 0]);
  facePath(fp, [[6, 4], [30, 4], [36, 10], [66, 10]], false); hair(PAL.edge); ctx.stroke();
  faceLine(fp, [[10, 30], [50, 30]]); faceLine(fp, [[10, 40], [40, 40]]);
}
// smoke from the chimney once the roof is on: the house is lived in
function smoke(t0) {
  if (TT < t0 + 0.6) return;
  const x = HS.x + 57, y = HS.y + 41, z = floorZ(3) + 30 + HS.rh + 6;
  for (let i = 0; i < 2; i++) {
    const P = []; for (let k = 0; k <= 14; k++) { const q = k / 14; P.push([x - 6 + i * 12 + Math.sin(q * 5 + TT * 2.4 + i * 2) * 9 * q, y - 6 + i * 12, z + 10 + q * 64]); }
    line3(P, PAL.inner);
  }
}
function house(o = {}) {
  foundation();
  const f = o.settled ? [-9, -9, -9] : [cu.filed1, cu.filed2, cu.filed3];
  [faceMoney, faceSite, faceFiles].forEach((fn, k) => { if (TT >= f[k]) houseFloor(k, f[k], fn); });
  roof(o.settled ? -9 : cu.roof);
  smoke(o.settled ? -9 : cu.roof);
}

// ---- the team: three people with the say each one has, set into the desk in front of them
const TEAM = [[26, 96, 'owner'], [134, 150, 'editor'], [226, 76, 'viewer']];
function person(x, y, z, s, t0) {
  const hop = kick(TT, t0 + 0.3, { k: 200, damp: 0.35 }) * 6;
  isoCyl(x, y, z, s * 0.34, s * 0.95 + hop);
  const hp = isoP([x, y, z + s * 0.95 + hop + s * 0.36]);
  ctx.beginPath(); ctx.arc(hp[0], hp[1], s * 0.3 * ISO.u, 0, TAU); ctx.fillStyle = PAL.face; ctx.fill(); hair(PAL.edge); ctx.stroke();
}
function team() {
  if (TT < cu.team) return;
  const dt = deskTop();
  TEAM.forEach(([x, y, role], i) => {
    const t0 = cu.team + 0.15 + i * 0.22;
    if (TT < t0) return;
    const z = PZ + dropIn(t0, 220, { k: 170, damp: 0.5 });
    faceRR(dt, x - 48, y + 22, 96, 32, 16, { stroke: PAL.edge });
    isoText(dt, role, x, y + 45, 22, { align: 'center', color: PAL.text, count: Math.floor((TT - t0 - 0.2) * 24) });
    person(x, y, z, 52, t0);
  });
}

// ---- era 1: the real dashboard. A flat printed card (the real screenshot) lands into the laptop lid on the desk.
// the laptop sits left of the house, its lid standing along y and facing +x (lower right), so it hides nothing
const LB = { x: -268, y: -40, w: 240, d: 130, h: 10, lid: 150 };
const LIDT = 8 * DEG;
const lidGeomB = () => ({ o: [LB.x + 6, LB.y + LB.w, PZ + LB.h], a: [0, -1, 0], b: [-Math.sin(LIDT), 0, Math.cos(LIDT)], n: [Math.cos(LIDT), 0, Math.sin(LIDT)] });
const lidPt = (g, u, v) => isoP(vadd(vadd(g.o, vsc(g.a, u)), vsc(g.b, LB.lid - v)));
function laptopB() {
  isoBox(LB.x, LB.y, PZ, LB.d, LB.w, LB.h, { r: 12 });
  const top = faceOf([LB.x, LB.y, PZ + LB.h], [1, 0, 0], [0, 1, 0]);
  isoGrid(4, 14, (i, j) => faceRR(top, 40 + i * 15.5, 14 + j * 15.5, 12, 12, 2));
  const g = lidGeomB();
  isoSlab(vsub(g.o, vsc(g.n, 7)), g.a, g.b, g.n, LB.w, LB.lid, 7, { r: 12 });
}
// the card: screen-space parallelogram from a centred rectangle to the lid's screen face (affine: three corners)
function dashCard() {
  const g = lidGeomB();
  const q = clamp(spring(TT, cu.back, { k: 70, damp: 0.82 }), 0, 1.05);
  const cw = WIDE ? W * 0.62 : W - 130, ch = cw * 0.625;
  const fx = WIDE ? LX(0.40) : W / 2, fy = WIDE ? LY(0.47) : LY(0.45);
  const flat = [[fx - cw / 2, fy - ch / 2], [fx + cw / 2, fy - ch / 2], [fx - cw / 2, fy + ch / 2]];
  const m = 8, lid = [lidPt(g, m, m), lidPt(g, LB.w - m, m), lidPt(g, m, LB.lid - m)];
  const P = flat.map((p, i) => [lerp(p[0], lid[i][0], q), lerp(p[1], lid[i][1], q)]);
  const p3 = [P[1][0] + P[2][0] - P[0][0], P[1][1] + P[2][1] - P[0][1]];
  const outline = [P[0], P[1], p3, P[2]];
  // a printed card: a thickness line under a hairline rim (as the style's windows)
  polyPath(outline.map(([x, y]) => [x, y + 12 * (1 - q)]), true); ctx.fillStyle = PAL.face; ctx.fill(); hair(PAL.inner); ctx.stroke();
  const img = asset(TT < cu.screen2 ? 'expenses.webp' : 'analytics.webp');
  ctx.save();
  polyPath(outline, true); ctx.clip();
  ctx.transform((P[1][0] - P[0][0]) / 1200, (P[1][1] - P[0][1]) / 1200, (P[2][0] - P[0][0]) / 750, (P[2][1] - P[0][1]) / 750, P[0][0], P[0][1]);
  if (img) ctx.drawImage(img, 0, 0, 1200, 750); else { ctx.fillStyle = '#141516'; ctx.fillRect(0, 0, 1200, 750); }
  // the swap to the overview: a wipe from the left on the hit of "paperwork"
  const wipe = seg(TT, cu.screen2, cu.screen2 + 0.35);
  if (wipe > 0 && wipe < 1) { const o2 = asset('expenses.webp'); if (o2) { ctx.beginPath(); ctx.rect(1200 * EZ.io(wipe), 0, 1200, 750); ctx.clip(); ctx.drawImage(o2, 0, 0, 1200, 750); } }
  ctx.restore();
  polyPath(outline, true); hair(PAL.edge); ctx.stroke();
}

// ---- the camera: a slow push onto the house while it is filed, a pull back for the hold (springs, no shake)
const HOUSE_C = () => { const keep = ISO; setIso(ISO_DESK); const p = isoP([HS.x + HS.w / 2, HS.y + HS.d / 2, floorZ(1.2)]); ISO = keep; return p; };
function pieceCam(era, t) {
  // a slow, continuous push (a few percent, as the style allows) so held beats still move; a spring pull back for the hold
  if (era === 1) { const p = HOUSE_C(); return t > cu.logo ? camOf({ z: 1 + 0.035 * EZ.io(seg(t, cu.logo, DURATION)), p, to: p }) : null; }
  const drift = 0.035 * EZ.io(seg(t, 0.4, cu.money)) + 0.03 * seg(t, cu.money, cu.team) + 0.005 * EZ.io(seg(t, cu.team, cu.pull));
  const z = 1 + drift + (0.97 - 1.07) * springEase(t - cu.pull, SPRING.heavy.k, SPRING.heavy.d);
  const p = HOUSE_C();
  return camOf({ z, p, to: p });
}

// ---- era 0: the desk, the mess, the filing
function sceneDesk() {
  setIso(ISO_DESK);
  desk();
  planRoll();
  laptop();
  house();
  phone();
  receipts();
  flyCards([cu.photos, cu.photos + 0.15, cu.photos + 0.3], cu.filed2, 1, photoCard);
  flyCards([cu.plans, cu.permits, cu.permits + 0.2], cu.filed3, 2, folderCard);
  team();
  cap('Building is never\njust bricks.', cu.house + 0.4, cu.receipts - 0.1);
  cap('Receipts. Chats.\nPlans. Spreadsheets.', cu.receipts + 0.2, cu.money);
  cap('Receipts, read\nand filed.', cu.money + 0.4, cu.site);
  cap('Site photos,\ndated and kept.', cu.site + 0.2, cu.files);
  cap('Plans and permits,\nin folders.', cu.files + 0.2, cu.team);
  cap('Everyone gets\nthe right say.', cu.team + 0.2, cu.pull + 0.4);
}
// ---- era 1: the tidy desk; the real dashboard lands in the laptop; the Najenga name
function sceneCalm() {
  setIso(ISO_DESK);
  desk();
  laptopB();
  house({ settled: true });
  dashCard();
  cap('One calm place.', cu.back + 0.3, cu.logo);
  if (TT >= cu.logo) {
    const a = clamp(spring(TT, cu.logo, { k: 90, damp: 0.8 }));
    const f = () => {
      const lw = (WIDE ? 400 : 430) * (0.92 + 0.08 * a), lh = lw * 362 / 640;
      const lx = WIDE ? LAY.capX : CX - lw / 2, ly = WIDE ? LAY.capY - lh - 100 : 240;
      ctx.save(); ctx.globalAlpha = a; drawAsset('logo.webp', lx, ly + (1 - a) * 20, lw, lh, { fit: 'contain' }); ctx.restore();
    };
    DEFER.push(f);
    cap('“I’m building.”', cu.logo + 0.35, null, { weight: 400 });
  }
}
