// =====================================================================
//  SCENES — Najenga launch. World units ~ px at u = 1; z up. Painter's order: back to front.
//  The constant: the house on the desk. Red (PAL.accent) marks only what Najenga has filed.
// =====================================================================
const cu = CUE;
// layout per format: where the desk's origin sits on screen, its scale, and where the caption goes
const LAY = WIDE
  ? { ox: LX(0.37), oy: LY(0.60), u: 0.86, capX: LX(0.745), capY: LY(0.53), capW: LX(0.38), capAlign: 'left' }
  : { ox: CX + 30, oy: LY(0.56), u: 0.87, capX: CX, capY: 1420, capW: 840, capAlign: 'center' };
const ISO_DESK = { ox: LAY.ox, oy: LAY.oy, u: LAY.u };

// ---- the desk and the house (world units)
const DK = { x: -270, y: -235, w: 540, d: 470 };
const PZ = 16 + 6 + 14 + 6 + 20;                       // desk top
const HS = { x: -112, y: -172, w: 218, d: 176, f: 16, fh: 68, rh: 88, e: 14 };   // house footprint, foundation, floor height, roof height, eave
const floorZ = (k) => PZ + HS.f + k * HS.fh;           // base of floor k (0..2)
const dropIn = (t0, h = 320, o = { k: 120, damp: 0.62 }) => (1 - spring(TT, t0, o)) * h;
const gone = (t0) => TT >= t0;

function desk() {
  const dz = (i) => (1 - spring(TT, cu.plates + i * 0.08, { k: 160, damp: 0.6 })) * 220;
  isoPlates(DK.x, DK.y, 0, DK.w, DK.d, [{ h: 16, r: 48, dz: dz(0) }, { h: 14, gap: 6, inset: 12, r: 40, dz: dz(1) - dz(0) }, { h: 20, gap: 6, inset: 24, r: 34, dz: dz(2) - dz(1) }]);
}
const deskTop = () => faceOf([0, 0, PZ], [1, 0, 0], [0, 1, 0]);

// a floor of the house: a box whose faces carry what was filed into it. filedAt = when it dropped in (red edge).
function houseFloor(k, filedAt, faceFn) {
  const z = floorZ(k) + dropIn(filedAt, 360);
  const red = PAL.accent;
  isoBox(HS.x, HS.y, z, HS.w, HS.d, HS.fh, { r: 6, seg: 3, edge: red, creaseC: red });
  const fl = faceOf([HS.x, HS.y + HS.d, z + HS.fh], [1, 0, 0], [0, 0, -1]);          // front-left face (w x fh)
  const fr = faceOf([HS.x + HS.w, HS.y + HS.d, z + HS.fh], [0, -1, 0], [0, 0, -1]);  // front-right face (d x fh)
  faceFn && faceFn(fl, fr, z);
}
function foundation() {
  const z = PZ + dropIn(cu.house, 260, { k: 150, damp: 0.6 });
  if (TT < cu.house) return;
  isoBox(HS.x - 14, HS.y - 14, z, HS.w + 28, HS.d + 28, HS.f, { r: 8 });
  // starter bars sticking up at the corners: an unbuilt house
  if (TT < cu.filed1) for (const [px, py] of [[HS.x + 10, HS.y + 10], [HS.x + HS.w - 10, HS.y + 10], [HS.x + 10, HS.y + HS.d - 10], [HS.x + HS.w - 10, HS.y + HS.d - 10]]) line3([[px, py, z + HS.f], [px, py, z + HS.f + 46]], PAL.edge);
}
// the roof: a gable along x with a chimney, like the Najenga logo. Red: filed.
function roof(t0) {
  if (TT < t0) return;
  const z = floorZ(3) + dropIn(t0, 380, { k: 110, damp: 0.6 }), e = HS.e, red = PAL.accent;
  const x0 = HS.x, x1 = HS.x + HS.w, y0 = HS.y - e, y1 = HS.y + HS.d + e, ym = HS.y + HS.d / 2, zr = z + HS.rh;
  const poly = (P, fill, edge) => { polyPath(P.map(isoP), true); ctx.fillStyle = fill; ctx.fill(); hair(edge); ctx.stroke(); };
  poly([[x0, y0, z], [x1, y0, z], [x1, ym, zr], [x0, ym, zr]], PAL.face, red);                  // back slope
  isoBox(HS.x + 40, HS.y + 26, z + 30, 34, 30, HS.rh + 6, { r: 3, seg: 2, edge: red, creaseC: red });   // chimney
  poly([[x1, y0, z], [x1, y1, z], [x1, ym, zr]], PAL.face, red);  // gable end (out to the eaves)
  const gf = faceOf([HS.x + HS.w, HS.y + HS.d, z], [0, -1, 0], [0, 0, 1]);
  faceRR(gf, HS.d / 2 - 14, 22, 28, 28, 3);                                                 // a gable window
  faceLine(gf, [[HS.d / 2, 22], [HS.d / 2, 50]]); faceLine(gf, [[HS.d / 2 - 14, 36], [HS.d / 2 + 14, 36]]);
  poly([[x0, y1, z], [x1, y1, z], [x1, ym, zr], [x0, ym, zr]], PAL.face, red);                  // front slope
  for (let i = 1; i < 5; i++) { const q = i / 5; line3([[x0 + 6, lerp(y1, ym, q), lerp(z, zr, q)], [x1 - 6, lerp(y1, ym, q), lerp(z, zr, q)]], PAL.inner); }   // tile rows
}

// ---- the mess (before Najenga): receipts, a phone with chats, a rolled plan, a laptop with a spreadsheet
const SLIPS = [[66, 52, 0], [168, 70, 1], [112, 128, 2], [190, 150, 3], [40, 150, 4], [150, 196, 5]];   // x, y, i
function slip(x, y, z, i, red) {
  const S = isoBox(x, y, z, 74, 100, 2, { r: 3, seg: 2 });
  const fp = faceOf([x, y, z + 2], [1, 0, 0], [0, 1, 0]);
  for (let r = 0; r < 5; r++) faceLine(fp, [[10, 16 + r * 13], [10 + (r % 2 ? 36 : 52), 16 + r * 13]]);
  faceLine(fp, [[10, 84], [62, 84]], red ? PAL.accent : PAL.edge, red ? 4 : HAIR);   // the total
  return S;
}
function receipts() {
  for (const [x, y, i] of SLIPS) {
    const t0 = cu.receipts + i * 0.1;
    if (TT < t0) continue;
    // at the money beat the slips lift off and fly into the phone's chat
    const up = spring(TT, cu.money + i * 0.08, { k: 60, damp: 0.8 });
    if (up > 0.97) continue;
    const z = PZ + dropIn(t0, 240, { k: 170, damp: 0.5 }) + up * 260;
    slip(lerp(x, PHONE.x + 40, up), lerp(y, PHONE.y + 40, up), z, i, false);
  }
}
const PHONE = { x: -258, y: 18, w: 150, d: 200, h: 12 };
function phone() {
  if (TT < cu.chat) return;
  const buzz = TT < cu.money ? kick(TT, cu.chat + 0.2, { k: 900, damp: 0.15 }) * 6 + kick(TT, cu.chat + 1.4, { k: 900, damp: 0.15 }) * 6 : 0;
  const z = PZ + dropIn(cu.chat, 260, { k: 170, damp: 0.55 });
  const x = PHONE.x + buzz;
  isoBox(x, PHONE.y, z, PHONE.w, PHONE.d, PHONE.h, { r: 18 });
  const sc = faceOf([x, PHONE.y, z + PHONE.h], [1, 0, 0], [0, 1, 0]);
  faceRR(sc, 8, 10, PHONE.w - 16, PHONE.d - 20, 10);
  faceRR(sc, PHONE.w / 2 - 14, 16, 28, 6, 3, { stroke: PAL.edge });   // speaker slot
  chatOn(sc);
}
// the chat on the phone: grey bubbles in the mess; at the money beat a receipt arrives, is read, its total turns red
function chatOn(sc) {
  const bub = (y, w, right, t0) => { const s = clamp(spring(TT, t0, { k: 220, damp: 0.7 })); if (s > 0.02) faceRR(sc, right ? PHONE.w - 16 - w * s : 16, y, w * s, 18, 9, { stroke: PAL.edge }); };
  bub(32, 80, false, cu.chat + 0.1); bub(56, 60, true, cu.chat + 0.5); bub(80, 92, false, cu.chat + 1.2);
  if (TT < cu.money + 0.3) return;
  // the receipt photo in a bubble
  const s = clamp(spring(TT, cu.money + 0.3, { k: 160, damp: 0.7 }));
  faceRR(sc, 16, 106, 96 * s, 72 * s, 6, { stroke: PAL.edge });
  if (s < 0.9) return;
  for (let r = 0; r < 3; r++) faceLine(sc, [[26, 120 + r * 11], [26 + (r % 2 ? 40 : 60), 120 + r * 11]]);
  const read = seg(TT, cu.scan, cu.scan + 0.7);
  if (read > 0 && read < 1) faceLine(sc, [[18, 110 + read * 64], [110, 110 + read * 64]], PAL.edge, 3);   // the scan line
  faceLine(sc, [[26, 164], [92, 164]], read >= 1 ? PAL.accent : PAL.edge, read >= 1 ? 5 : HAIR);
}
// the rolled plan: a cylinder lying along y, tied in the middle
const PLAN = { x: -252, y: -215, l: 175, r: 18 };
function planRoll() {
  if (TT < cu.plan) return;
  const lift = spring(TT, cu.files, { k: 60, damp: 0.8 });
  if (lift > 0.97) return;
  const z = PZ + dropIn(cu.plan, 240, { k: 170, damp: 0.55 }) + lift * 300;
  isoSlab([PLAN.x, PLAN.y, z], [1, 0, 0], [0, 0, 1], [0, 1, 0], PLAN.r * 2, PLAN.r * 2, PLAN.l, { r: PLAN.r, seg: 8, crease: false });
  line3([[PLAN.x, PLAN.y + PLAN.l / 2, z + PLAN.r * 2], [PLAN.x + PLAN.r * 2, PLAN.y + PLAN.l / 2, z + PLAN.r * 2]], PAL.inner);
}
// a small laptop with a spreadsheet nobody trusts (cells, one crossed out); it closes when the house is done
const LT = { x: 118, y: -226, w: 146, d: 112, h: 8, lid: 104 };
function laptop() {
  if (TT < cu.sheet) return;
  const z = PZ + dropIn(cu.sheet, 240, { k: 170, damp: 0.55 });
  const al = 100 * DEG * (spring(TT, cu.sheet + 0.2, { k: 90, damp: 0.6 }) - spring(TT, cu.team, { k: 90, damp: 0.7 }));
  isoBox(LT.x, LT.y, z, LT.w, LT.d, LT.h, { r: 10 });
  const top = faceOf([LT.x, LT.y, z + LT.h], [1, 0, 0], [0, 1, 0]);
  isoGrid(10, 3, (i, j) => faceRR(top, 10 + i * 13, 12 + j * 13, 10, 10, 2));
  const g = { o: [LT.x, LT.y, z + LT.h], a: [1, 0, 0], b: [0, Math.cos(al), Math.sin(al)], n: [0, -Math.sin(al), Math.cos(al)] };
  const S = isoSlab(g.o, g.a, g.b, g.n, LT.w, LT.lid, 6, { r: 10 });
  if (S.front === 0 && al > 40 * DEG) {
    const fp = (u, v) => vadd(vadd(g.o, vsc(g.a, u)), vsc(g.b, LT.lid - v));
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) faceRR(fp, 12 + c * 32, 12 + r * 16, 30, 14, 1, { seg: 1 });
    faceLine(fp, [[44, 46], [74, 58]], PAL.edge, 3);   // a cell nobody trusts, crossed out
    faceLine(fp, [[44, 58], [74, 46]], PAL.edge, 3);
  }
}

// ---- captions: one short line per beat (the voice says it; the caption serves sound-off viewers)
function capNow(str, t0, t1, o = {}) {
  const a = clamp(spring(TT, t0, { k: 120, damp: 0.8 })) * (t1 == null ? 1 : 1 - seg(TT, t1 - 0.2, t1));
  if (a <= 0.001 || TT < t0) return;
  const sz = o.size ?? (WIDE ? 58 : 54);
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = `${o.weight ?? 500} ${sz}px ${SANS}`; ctx.fillStyle = PAL.text; ctx.textAlign = LAY.capAlign; ctx.textBaseline = 'alphabetic';
  const lines = String(str).split('\n'), y0 = LAY.capY + (1 - a) * 16;
  lines.forEach((l, i) => ctx.fillText(l, LAY.capX, y0 + i * sz * 1.22));
  const rx = LAY.capAlign === 'left' ? LAY.capX : LAY.capX - 24;
  polyPath([[rx, y0 - sz * 1.3], [rx + 48, y0 - sz * 1.3]], false); hair(o.rule ?? PAL.edge, 3); ctx.stroke();
  ctx.restore();
}
const cap = (str, t0, t1, o) => { const f = () => capNow(str, t0, t1, o); if (DEFER) DEFER.push(f); else f(); };
