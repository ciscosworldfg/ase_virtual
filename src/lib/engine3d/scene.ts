// Imperative three.js scene for the Engine Lab, ported from the Garage source (index.html).
// Browser-only: import dynamically after mount.
import * as THREE from "three";
import { createComponentGeometry } from "./geometry";
import { ENGINE_FAMILIES, LABEL_NAMES, pc, type EngineFamily } from "./engine-data";

export interface PartInfo {
  id: string;
  name: string;
  desc: string;
  codes: string[];
  fixed: boolean;
  removed: boolean;
}
export interface LabelPos { id: string; text: string; x: number; y: number; active: boolean }

interface Part extends PartInfo {
  g: THREE.Group;
  dir: THREE.Vector3;
  dist: number;
  t: number;
  parent?: THREE.Object3D;
  anchor: THREE.Vector3;
}

export interface SceneOptions {
  reducedMotion: boolean;
  onSelect: (id: string | null) => void;
  onParts: (parts: PartInfo[]) => void;
  onLabels: (labels: LabelPos[]) => void;
}

export interface EngineTelemetry {
  rpm: number;
  running: boolean;
}

export function createEngineScene(canvas: HTMLCanvasElement, opts: SceneOptions) {
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  R.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const S = new THREE.Scene();
  const C = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  S.add(new THREE.HemisphereLight(0xffffff, 0x445566, 0.95));
  const dl = new THREE.DirectionalLight(0xffffff, 0.9);
  dl.position.set(4, 7, 5);
  S.add(dl);
  const refine = createComponentGeometry();
  const MT = (c: number) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.45, roughness: 0.5 });
  const bx = (w: number, h: number, d: number, c: number, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), MT(c)); m.position.set(x, y, z); return m;
  };
  const cy = (r: number, h: number, c: number, x = 0, y = 0, z = 0, ax = "y") => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), MT(c)); m.position.set(x, y, z);
    if (ax === "x") m.rotation.z = Math.PI / 2; if (ax === "z") m.rotation.x = Math.PI / 2; return m;
  };
  const grp = (...a: THREE.Object3D[]) => { const g = new THREE.Group(); a.forEach((m) => g.add(m)); return g; };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();

  let root: THREE.Group | null = null;
  let parts: Part[] = [];
  let meshes: THREE.Mesh[] = [];
  let sel: Part | null = null;
  let hov: Part | null = null;
  let explode = 0, exS = 0, autoRotate = !opts.reducedMotion, showLabels = true;
  let engineRpm = 0, engineAngle = 0;
  let activeFaultCodes = new Set<string>();
  let crankshaft: THREE.Mesh | null = null;
  let pistonAssemblies: { piston: THREE.Mesh; rod: THREE.Mesh; phase: number; x: number; z: number }[] = [];

  const emitParts = () => opts.onParts(parts.map(({ id, name, desc, codes, fixed, removed }) => ({ id, name, desc, codes, fixed, removed })));

  function disposeRoot() {
    if (!root) return;
    S.remove(root);
    root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as THREE.Material).dispose(); } });
  }

  function build(E: EngineFamily) {
    disposeRoot();
    root = new THREE.Group(); S.add(root); parts = []; sel = null; hov = null;
    crankshaft = null;
    pistonAssemblies = [];
    const r = root;
    type PIn = { id: string; name: string; desc: string; codes: string[]; dir: THREE.Vector3; dist: number; g: THREE.Group; fixed?: boolean; parent?: THREE.Object3D };
    const part = (o: PIn) => {
      const g = refine(o.id, o.g);
      const p: Part = { ...o, g, fixed: !!o.fixed, removed: false, t: 0, anchor: new THREE.Vector3() };
      g.userData.o = p; parts.push(p); (o.parent ?? r).add(g); return p;
    };
    const n = E.n, nb = E.v ? 2 : 1, per = n / nb, L = per, xF = L / 2 + 0.35, sc = E.fuel !== "port", intZ = E.v ? 0 : 1.05, intY = E.v ? 1.85 : 1.75;
    const frames = [...Array(nb)].map((_, b) => { const f = new THREE.Group(); f.rotation.x = E.v ? ((b ? -1 : 1) * Math.PI) / 6 : 0; r.add(f); return f; });
    const blk = part({ id: "block", name: "Engine block & crankcase", fixed: true, codes: ["P0300"], dist: 0, dir: V(0, 1, 0),
      desc: "The structural core: cylinders, crankcase and main bearings. No dedicated sensor, but loss of compression from worn rings or valves shows up as misfires. Fixed in this model.", g: grp(bx(L + 0.4, 1.0, 1.25, 0x59616d, 0, -0.1, 0)) });
    frames.forEach((f) => f.add(refine("block", grp(bx(L + 0.1, 1.3, 1.15, 0x59616d, 0, 0.75, 0)))));
    part({ id: "pan", name: "Oil pan", codes: ["P0520", "P0521", "P0522", "P0523"], dir: V(0, -1, 0), dist: 2,
      desc: "Sump holding the engine oil. Oil pressure and level problems are reported through the oil pressure sensor circuit, not the pan itself. Look here for leaks and metal debris.", g: grp(bx(L + 0.4, 0.7, 1.15, 0x3b4552, 0, -0.95, 0)) });
    part({ id: "pulley", name: "Crank pulley / damper", codes: ["P0562"], dir: V(1, 0, 0), dist: 2,
      desc: "Drives the accessory belt and damps crankshaft vibration. No direct code; a slipping belt can show indirectly as low charging voltage.", g: grp(cy(0.45, 0.22, 0x2c3440, xF, 0, 0, "x"), cy(0.3, 0.12, 0x59616d, xF + 0.15, 0, 0, "x")) });
    part({ id: "crk", name: "Crankshaft position sensor", codes: ["P0335", "P0336"], dir: V(0, 0, -1), dist: 1.6,
      desc: "Reads a toothed wheel on the crank to tell the ECU engine speed and piston position. Failure typically causes no-start or stalling; also check the wheel and wiring.", g: grp(bx(0.18, 0.18, 0.3, 0xe74c3c, xF - 0.45, -0.2, -0.75)) });
    part({ id: "alt", name: "Alternator", codes: ["P0562", "P0563"], dir: V(0, 0, 1), dist: 2,
      desc: "Belt-driven generator that charges the battery and powers the vehicle. Voltage codes point to the charging circuit: test battery, belt, grounds and alternator output before replacing.", g: grp(cy(0.38, 0.55, 0x9aa5b1, xF - 0.1, 0.1, 1.0, "x")) });
    part({ id: "ect", name: "Thermostat housing & coolant temp sensor", codes: ["P0128", "P0117", "P0118"], dir: V(0, 1, 0), dist: 1.8,
      desc: "Regulates coolant flow and hosts the temperature sensor. P0128 usually means the engine is slow to warm (stuck-open thermostat) but confirm with live data.", g: grp(bx(0.4, 0.32, 0.4, 0xe8d44d, L / 2 + 0.3, 0.95, 0)) });
    part({ id: "oilp", name: "Oil pressure sensor", codes: ["P0520", "P0521", "P0522", "P0523"], dir: V(0, 0, 1), dist: 1.5,
      desc: "Sends oil pressure to the ECU/gauge. A code can mean a sensor or wiring fault or a real pressure problem; verify with a mechanical gauge.", g: grp(cy(0.08, 0.26, 0xd4a017, -L * 0.2, -0.1, 0.7, "z")) });
    const xT = -L / 2 - 0.4, xM = -L / 2 - 1.15;
    part({ id: "int", name: "Intake manifold / plenum", codes: E.fuel === "diesel" ? ["P0299"] : E.v ? ["P0171", "P0174"] : ["P0171"], dir: V(0, 1, E.v ? 0 : 0.5), dist: 2.8,
      desc: "Distributes intake air to the cylinders. Vacuum or boost leaks and cracked gaskets cause lean codes (gas) or underboost (diesel). Smoke-test before replacing sensors.",
      g: grp(E.v ? bx(L * 0.9, 0.45, 0.9, 0x4a90d9, 0, intY, 0) : bx(L * 0.9, 0.5, 0.55, 0x4a90d9, 0, intY, intZ)) });
    part({ id: "map", name: E.fuel === "diesel" ? "Boost pressure sensor" : "MAP / boost sensor", codes: E.turbo ? ["P0236", "P0106"] : ["P0106", "P0107", "P0108"], dir: V(0, 1, 0), dist: 1.4,
      desc: "Measures manifold pressure so the ECU can calculate load and airflow. Compare with barometric pressure at key-on and check hoses for leaks.", g: grp(bx(0.2, 0.25, 0.2, 0x2ecc71, -L * 0.25, intY + 0.4, intZ)) });
    part({ id: "maf", name: "Mass air flow sensor", codes: ["P0101", "P0102", "P0103"], dir: V(-1, 0.5, 0), dist: 1.8,
      desc: "Measures air entering the engine. A dirty or skewed MAF causes wrong fuel trims. Check for intake leaks after the sensor before condemning it.", g: grp(cy(0.17, 0.6, 0x2c3440, xM, intY, intZ, "x"), bx(0.2, 0.22, 0.2, 0xe67e22, xM, intY + 0.25, intZ)) });
    if (E.thr) part({ id: "thr", name: "Throttle body", codes: ["P0121", "P0122", "P0123", "P2135"], dir: V(-1, 0, 0), dist: 1.6,
      desc: "Electronically controlled valve that meters air at idle and under load. Carbon build-up or a failing position sensor causes rough idle and reduced-power mode.", g: grp(cy(0.24, 0.5, 0x9aa5b1, xT, intY, intZ, "x")) });
    if (E.egr) part({ id: "egr", name: "EGR valve", codes: ["P0401", "P0402"], dir: V(0, 1, 0), dist: 1.6,
      desc: "Recirculates exhaust into the intake to cut combustion temperature and NOx. Sticking valves or clogged passages cause flow codes and rough running.", g: grp(bx(0.38, 0.3, 0.38, 0xcc5522, L * 0.3, intY + 0.4, intZ)) });
    if (E.turbo) part({ id: "turbo", name: "Turbocharger", codes: ["P0299", "P0234", "P0236"], dir: V(0, 0.3, -1), dist: 2.4,
      desc: "Exhaust-driven compressor that raises intake pressure. Underboost or overboost codes point to leaks, a sticking wastegate/vane actuator, or turbo wear; check the air path first.",
      g: grp(cy(0.34, 0.45, 0x8e5a3c, L * 0.25, 1.15, -1.6, "x"), cy(0.28, 0.35, 0x9aa5b1, L * 0.25 + 0.42, 1.15, -1.6, "x"), cy(0.09, 0.9, 0x7a4a2e, L * 0.25, 1.3, -1.1, "z")) });
    if (E.dpf) part({ id: "dpf", name: "Diesel particulate filter", codes: ["P2002"], dir: V(0, 0, -1), dist: 2.2,
      desc: "Traps soot and periodically burns it off (regeneration). Efficiency codes can come from a failed filter, but also from upstream faults; check differential pressure and regen history.", g: grp(cy(0.32, 1.5, 0x6b6f75, 0, 0.9, -2.3, "x")) });
    if (E.fuel === "gdi") part({ id: "hpp", name: "High-pressure fuel pump", codes: ["P0087"], dir: V(0, 1, 0.5), dist: 1.8,
      desc: "Camshaft-driven pump that feeds the direct-injection rail at very high pressure. Low-pressure codes can also be low-pressure supply, filter, or regulator problems.", g: grp(cy(0.18, 0.45, 0xc9a24a, L * 0.35, 1.95, 0.85)) });
    frames.forEach((f, b) => {
      const iz = E.v ? (b ? 1 : -1) : 1, es = -iz, bn = b + 1, bank = nb > 1 ? " – bank " + bn : "";
      const add = (o: PIn) => part({ ...o, parent: f });
      add({ id: "head" + b, name: `Cylinder head${bank}`, codes: ["P0300", "P0016"], dir: V(0, 1, 0), dist: 3.4,
        desc: "Holds valves, cams and combustion chambers. Head gasket or valve problems cause misfires, coolant/oil loss, and correlation codes. Needs compression/leak-down tests, not guesswork.", g: grp(bx(L + 0.1, 0.5, 1.15, 0x8a93a0, 0, 1.6, 0)) });
      add({ id: "cov" + b, name: `Valve cover${bank}`, codes: E.fuel === "diesel" ? [] : ["P0171"], dir: V(0, 1, 0), dist: 2.3,
        desc: "Seals the top of the head and often carries the PCV (crankcase ventilation) path. Remove it to see plugs, injectors or glow plugs underneath. A PCV leak can cause lean codes.", g: grp(bx(L - 0.1, 0.28, 0.95, 0x2f6fb3, 0, 2, 0)) });
      add({ id: "cam" + b, name: `Camshaft position sensor${bank}`, codes: b ? ["P0345"] : ["P0340", "P0341"], dir: V(1, 0, 0), dist: 1.4,
        desc: "Tells the ECU cam position for injection and ignition timing. Intermittent signals can stall the engine; check wiring and cam/crank correlation.", g: grp(bx(0.18, 0.18, 0.25, 0x9b59b6, L / 2 + 0.15, 1.75, 0)) });
      add({ id: "exh" + b, name: `Exhaust manifold${bank}`, codes: E.fuel === "diesel" ? [] : [b ? "P0430" : "P0420"], dir: V(0, 0.2, es), dist: 2,
        desc: "Collects exhaust from the cylinders. Cracks leak exhaust and upset sensors; catalyst-efficiency codes are related, but misfires or fuel faults must be ruled out first.", g: grp(bx(L * 0.95, 0.3, 0.3, 0x7a4a2e, 0, 1.45, es * 0.75)) });
      if (E.knock) add({ id: "knk" + b, name: `Knock sensor${bank}`, codes: b ? ["P0330"] : ["P0325", "P0327"], dir: V(0, 0, es), dist: 1.4,
        desc: "Listens for detonation through the block so the ECU can retard timing. Failure can reduce power; check torque, connector and wiring.", g: grp(cy(0.08, 0.2, 0xd4a017, 0, 0.55, es * 0.65, "z")) });
      if (E.vvt) add({ id: "vvt" + b, name: `VVT solenoid${bank}`, codes: b ? ["P0020", "P0021"] : ["P0010", "P0011"], dir: V(-1, 0, 0), dist: 1.5,
        desc: "Oil-controlled actuator that shifts cam timing. Timing codes can be caused by dirty or low oil, a stuck solenoid, or a worn phaser, so check oil first.", g: grp(cy(0.12, 0.3, 0x2ecc71, -L / 2 - 0.2, 1.75, 0, "x")) });
      if (E.fuel === "port") add({ id: "rail" + b, name: `Fuel rail${bank}`, codes: ["P0171"], dir: V(0, 1, iz * 0.4), dist: 1.6,
        desc: "Feeds fuel to the port injectors. Pressure faults appear as lean codes or hard starts; test pressure and volume before replacing parts.", g: grp(cy(0.045, L, 0xb08d57, 0, 1.98, iz * 0.7, "x")) });
      if (E.fuel === "gdi") add({ id: "rail" + b, name: "High-pressure fuel rail", codes: ["P0087", "P0190", "P0191"], dir: V(0, 1, 0.4), dist: 1.6,
        desc: "Holds fuel at injection pressure for direct injection, with a pressure sensor. Check low-pressure supply first when pressure is low.", g: grp(cy(0.05, L, 0xb08d57, 0, 2.1, 0.7, "x")) });
      if (E.fuel === "diesel") add({ id: "rail" + b, name: "Common rail", codes: ["P0087", "P0190", "P0191"], dir: V(0, 1, 0.4), dist: 1.6,
        desc: "Stores very high-pressure diesel for all injectors. Rail pressure codes can come from the pump, regulator, leaking injectors or a supply restriction.", g: grp(cy(0.07, L, 0x777e88, 0, 2.1, 0.7, "x")) });
      for (let j = 0; j < per; j++) {
        const num = b * per + j + 1, x = j - (per - 1) / 2, nm = `Cyl ${num}`;
        const cd = (id: string, name: string, desc: string, g: THREE.Group, dir: THREE.Vector3, dist: number, codes: string[]) =>
          add({ id: id + num, name: `${name} – ${nm}`, codes, desc, dir, dist, g });
        if (E.fuel !== "diesel") cd("coil", "Ignition coil", "Coil-on-plug unit that makes the spark. Misfire plus a coil circuit code points here, but swap coils between cylinders to see if the misfire follows. Numbering varies by manufacturer.",
          grp(cy(0.1, 0.55, 0x222831, x, 2.45, 0), cy(0.13, 0.12, 0xc0392b, x, 2.15, 0)), V(0, 1, 0), 1.7, [pc(350, num), pc(300, num)]);
        if (E.fuel !== "diesel") cd("plug", "Spark plug", "Ignites the air-fuel mix. Worn or fouled plugs cause misfires and poor economy; inspect the electrode, gap and deposits. Hidden under the valve cover.",
          grp(cy(0.05, 0.36, 0xd8dde3, x, 1.93, 0)), V(0, 1, 0), 1.2, [pc(300, num)]);
        if (E.fuel === "port") cd("inj", "Fuel injector", "Sprays fuel into the intake port. Circuit codes mean electrical faults; clogged or leaking injectors need a balance or flow test.",
          grp(cy(0.05, 0.36, 0xe0b020, x, 1.75, iz * 0.62)), V(0, 1, iz * 0.6), 1.2, [pc(200, num), pc(300, num)]);
        if (sc) cd("inj", E.fuel === "diesel" ? "Common-rail injector" : "Direct injector", "Injects fuel directly into the cylinder at very high pressure, under the valve cover. Circuit codes mean electrical faults; mechanical faults need balance-rate or return-flow tests.",
          grp(cy(0.07, 0.5, 0xe0b020, x, 1.95, 0)), V(0, 1, 0), 1.2, [pc(200, num), pc(300, num)]);
        if (E.fuel === "diesel") cd("glow", "Glow plug", "Heats the combustion chamber for cold starts. Check resistance and the control module; one failed plug usually causes a cold-start rough run, not a no-start.",
          grp(cy(0.04, 0.4, 0xff7a1a, x, 1.9, 0.3)), V(0, 1, 0), 1.2, [pc(670, num), "P0670"]);
      }
    });

    // Educational cutaway mechanism: visible pistons and connecting rods are
    // animated from crankshaft speed. This is a teaching visualization, not CAD.
    const cylinderCount = Math.max(1, E.n);
    crankshaft = cy(0.085, Math.max(2.2, cylinderCount * 0.58), 0x77818c, 0, -0.28, 1.28, "x");
    r.add(crankshaft);
    for (let i = 0; i < cylinderCount; i += 1) {
      const x = (i - (cylinderCount - 1) / 2) * 0.58;
      const piston = cy(0.17, 0.22, 0xc4ccd5, x, 0.62, 1.28, "y");
      const rod = bx(0.075, 0.48, 0.075, 0xb8913f, x, 0.18, 1.28);
      r.add(piston, rod);
      pistonAssemblies.push({ piston, rod, phase: (i * Math.PI * 4) / cylinderCount, x, z: 1.28 });
    }

    meshes = [];
    r.updateMatrixWorld(true);
    r.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.material = (m.material as THREE.Material).clone();
      meshes.push(m);
      let p: THREE.Object3D | null = m.parent;
      while (p && !p.userData.o) p = p.parent;
      m.userData.part = p ? p.userData.o : blk;
    });
    for (const p of parts) { p.anchor = new THREE.Box3().setFromObject(p.g).getCenter(new THREE.Vector3()); p.g.worldToLocal(p.anchor); }
    paint(); emitParts(); opts.onSelect(null);
  }

  function paint() {
    for (const m of meshes) {
      const p = m.userData.part as Part;
      const hasFault = p.codes.some((code) => activeFaultCodes.has(code));
      const emissive = hasFault ? 0x7a1010 : p === sel ? 0x7a4300 : p === hov ? 0x2a1c00 : 0;
      (m.material as THREE.MeshStandardMaterial).emissive.setHex(emissive);
    }
  }
  const byId = (id: string | null) => parts.find((p) => p.id === id) ?? null;
  function select(id: string | null) { sel = byId(id); paint(); opts.onSelect(sel?.id ?? null); }

  // orbit camera
  const CAM0 = { az: 0.6, el: 0.35, r: 9.5 };
  const rot = { ...CAM0 }, tgt = new THREE.Vector3(0, 0.7, 0), pts = new Map<number, [number, number]>();
  const ray = new THREE.Raycaster(), nd = new THREE.Vector2();
  let moved = 0, panMode = false;
  function doPan(dx: number, dy: number) {
    const f = rot.r * 0.0016, right = new THREE.Vector3().setFromMatrixColumn(C.matrix, 0), upv = new THREE.Vector3().setFromMatrixColumn(C.matrix, 1);
    tgt.addScaledVector(right, -dx * f).addScaledVector(upv, dy * f); tgt.clampLength(0, 6);
  }
  function hit(e: PointerEvent): Part | null {
    const r = canvas.getBoundingClientRect();
    nd.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(nd, C);
    const vis = meshes.filter((m) => { let o: THREE.Object3D | null = m; while (o) { if (!o.visible) return false; o = o.parent; } return true; });
    const h = ray.intersectObjects(vis, false)[0];
    return h ? (h.object.userData.part as Part) : null;
  }
  const onDown = (e: PointerEvent) => { canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); moved = 0; panMode = e.button === 2 || e.shiftKey; autoRotate = false; };
  const onMove = (e: PointerEvent) => {
    const o = pts.get(e.pointerId);
    if (o) {
      const dx = e.clientX - o[0], dy = e.clientY - o[1];
      if (pts.size === 1 && panMode) { doPan(dx, dy); moved += Math.abs(dx) + Math.abs(dy); }
      else if (pts.size === 1) { rot.az -= dx * 0.008; rot.el = Math.max(-1.45, Math.min(1.45, rot.el + dy * 0.008)); moved += Math.abs(dx) + Math.abs(dy); }
      else if (pts.size === 2) {
        const q = [...pts.entries()].find(([id]) => id !== e.pointerId)?.[1];
        if (q) { const d0 = Math.hypot(o[0] - q[0], o[1] - q[1]), d1 = Math.hypot(e.clientX - q[0], e.clientY - q[1]) || 1; rot.r = Math.max(3, Math.min(20, (rot.r * d0) / d1)); doPan(dx / 2, dy / 2); moved += 9; }
      }
      pts.set(e.pointerId, [e.clientX, e.clientY]);
    } else if (e.pointerType === "mouse") {
      const p = hit(e); if (p !== hov) { hov = p; paint(); canvas.style.cursor = p ? "pointer" : "grab"; }
    }
  };
  const onUp = (e: PointerEvent) => {
    if (pts.has(e.pointerId) && moved < 6 && pts.size === 1) { const p = hit(e); select(p ? p.id : null); }
    pts.delete(e.pointerId);
  };
  const onCancel = (e: PointerEvent) => pts.delete(e.pointerId);
  const onWheel = (e: WheelEvent) => { e.preventDefault(); rot.r = Math.max(3, Math.min(20, rot.r * (1 + e.deltaY * 0.001))); };
  const noMenu = (e: Event) => e.preventDefault();
  canvas.addEventListener("pointerdown", onDown); canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp); canvas.addEventListener("pointercancel", onCancel);
  canvas.addEventListener("wheel", onWheel, { passive: false }); canvas.addEventListener("contextmenu", noMenu);

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    R.setSize(w, h, false);
    C.aspect = w / h;
    C.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  function updateLabels() {
    const w = canvas.clientWidth, h = canvas.clientHeight, placed: { x: number; y: number; r: number; b: number }[] = [], out: LabelPos[] = [];
    if (!showLabels) { opts.onLabels(out); return; }
    const rank = (p: Part) => (p === sel ? 100 : p === hov ? 90 : 0);
    const cands = [...parts].sort((a, b) => rank(b) - rank(a));
    for (const p of cands) {
      if (out.length >= (w < 600 ? 5 : 9)) break;
      if (p.removed || !p.g.visible || (!LABEL_NAMES[p.id] && p !== sel && p !== hov)) continue;
      const pr = p.g.localToWorld(p.anchor.clone()).project(C);
      if (pr.z > 1 || pr.z < -1) continue;
      const text = LABEL_NAMES[p.id] ?? p.name.replace(" – ", " · ");
      const lw = Math.min(w < 600 ? 116 : 160, text.length * 6 + 18), lh = 30, px = ((pr.x + 1) * w) / 2, py = ((1 - pr.y) * h) / 2;
      for (const dy of [-38, 8, -75, 44]) {
        const x = Math.max(8, Math.min(w - lw - 8, px - lw / 2)), y = Math.max(44, Math.min(h - lh - 38, py + dy));
        const rect = { x, y, r: x + lw, b: y + lh };
        if (!placed.some((q) => rect.x < q.r + 5 && rect.r > q.x - 5 && rect.y < q.b + 5 && rect.b > q.y - 5)) {
          placed.push(rect); out.push({ id: p.id, text, x, y, active: p === sel }); break;
        }
      }
    }
    opts.onLabels(out);
  }

  const clock = new THREE.Clock();
  let lastFrame = 0, lastLabels = 0;
  function loop(now: number) {
    if (document.hidden || now - lastFrame < 33) return;
    lastFrame = now;
    const dt = Math.min(clock.getDelta(), 0.05), ex = explode / 100;
    const k = opts.reducedMotion ? 1 : Math.min(1, dt * 6);
    if (engineRpm > 0) engineAngle += (engineRpm * Math.PI * 2 * dt) / 60;
    if (crankshaft) crankshaft.rotation.x = engineAngle;
    for (const assembly of pistonAssemblies) {
      const phase = engineAngle + assembly.phase;
      const y = 0.62 + Math.cos(phase) * 0.2;
      assembly.piston.position.set(assembly.x, y, assembly.z);
      assembly.rod.position.set(assembly.x + Math.sin(phase) * 0.055, (y + 0.18) / 2, assembly.z);
      assembly.rod.rotation.z = -Math.sin(phase) * 0.28;
    }
    if (autoRotate && !opts.reducedMotion) rot.az += dt * 0.25;
    exS += (ex - exS) * k;
    const fit = (1 + exS * 0.75) * (C.aspect < 1 ? Math.min(1.9, (1 / C.aspect) * 0.85 + 0.15) : 1), rr = rot.r * fit, ty = tgt.y + exS * 0.6;
    C.position.set(tgt.x + rr * Math.sin(rot.az) * Math.cos(rot.el), ty + rr * Math.sin(rot.el), tgt.z + rr * Math.cos(rot.az) * Math.cos(rot.el));
    C.lookAt(tgt.x, ty, tgt.z);
    const kr = opts.reducedMotion ? 1 : Math.min(1, dt * 8);
    for (const p of parts) {
      p.t += ((p.removed ? 1 : 0) - p.t) * kr;
      if (p.fixed) continue;
      p.g.position.copy(p.dir).multiplyScalar(p.t * (p.dist + 3) + ex * p.dist * 0.8);
      p.g.visible = p.t < 0.97;
    }
    root?.updateMatrixWorld(true); C.updateMatrixWorld(true);
    if (now - lastLabels > 100) { updateLabels(); lastLabels = now; }
    R.render(S, C);
  }
  R.setAnimationLoop(loop);

  return {
    setFamily(id: string) { const f = ENGINE_FAMILIES.find((e) => e.id === id); if (f) build(f); },
    select,
    setExplode(v: number) { explode = v; },
    setTelemetry(value: EngineTelemetry) {
      const rpm = Number.isFinite(value.rpm) ? Math.max(0, Math.min(8000, value.rpm)) : 0;
      engineRpm = value.running ? rpm : 0;
    },
    setFaultCodes(codes: string[]) {
      activeFaultCodes = new Set(codes.map((code) => code.trim().toUpperCase()).filter((code) => /^P[0-9A-F]{4}$/.test(code)));
      paint();
    },
    setAutoRotate(v: boolean) { autoRotate = v; },
    setShowLabels(v: boolean) { showLabels = v; },
    toggleRemove(id: string) { const p = byId(id); if (!p || p.fixed) return; p.removed = !p.removed; if (p.removed && sel === p) select(null); emitParts(); },
    isolate(id: string) { for (const p of parts) p.removed = !p.fixed && p.id !== id; emitParts(); },
    restoreAll() { for (const p of parts) p.removed = false; emitParts(); },
    resetCamera() { Object.assign(rot, CAM0); tgt.set(0, 0.7, 0); },
    reset() { for (const p of parts) p.removed = false; explode = 0; select(null); emitParts(); },
    dispose() {
      R.setAnimationLoop(null); ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown); canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp); canvas.removeEventListener("pointercancel", onCancel);
      canvas.removeEventListener("wheel", onWheel); canvas.removeEventListener("contextmenu", noMenu);
      disposeRoot(); R.dispose();
    },
  };
}

export type EngineSceneController = ReturnType<typeof createEngineScene>;