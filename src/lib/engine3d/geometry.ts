// Procedural recognition models, not vehicle CAD. All geometry is generic.
// Ported from the Garage source: public/engine-lab/component-geometry.js
import * as THREE from "three";

export type PaletteKey = "metal" | "darkMetal" | "plastic" | "rubber" | "ceramic" | "brass" | "cast";

/** Material colors for the 3D scene (scene materials, not UI theme tokens). */
export const PALETTE: Record<PaletteKey, string> = {
  metal: "#a4adb8",
  darkMetal: "#4b535d",
  plastic: "#23272d",
  rubber: "#16191d",
  ceramic: "#ebe8e0",
  brass: "#b8913f",
  cast: "#6f5b4b",
};

type Axis = "x" | "y" | "z";
type V3 = [number, number, number];

export function createComponentGeometry(palette: Record<PaletteKey, string> = PALETTE) {
  const material = (key: PaletteKey) =>
    new THREE.MeshStandardMaterial({
      color: palette[key],
      metalness: key === "rubber" || key === "plastic" ? 0 : 0.72,
      roughness: key === "rubber" ? 0.86 : 0.38,
    });
  const box = (x: number, y: number, z: number, key: PaletteKey, px = 0, py = 0, pz = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x, y, z), material(key));
    m.position.set(px, py, pz);
    return m;
  };
  const cyl = (r: number, h: number, key: PaletteKey, x = 0, y = 0, z = 0, axis: Axis = "y", segments = 32) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segments), material(key));
    m.position.set(x, y, z);
    if (axis === "x") m.rotation.z = Math.PI / 2;
    if (axis === "z") m.rotation.x = Math.PI / 2;
    return m;
  };
  const ring = (r: number, t: number, key: PaletteKey, x = 0, y = 0, z = 0, axis: Axis = "y") => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 36), material(key));
    m.position.set(x, y, z);
    if (axis === "y") m.rotation.x = Math.PI / 2;
    if (axis === "x") m.rotation.y = Math.PI / 2;
    return m;
  };
  const tube = (points: V3[], r: number, key: PaletteKey) =>
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 24, r, 10, false),
      material(key),
    );
  const group = (...meshes: THREE.Object3D[]) => {
    const g = new THREE.Group();
    g.add(...meshes);
    return g;
  };
  const bolts = (g: THREE.Group, length: number, width: number, y: number) => {
    for (const x of [-length / 2 + 0.12, length / 2 - 0.12])
      for (const z of [-width / 2 + 0.1, width / 2 - 0.1]) g.add(cyl(0.045, 0.045, "metal", x, y, z, "y", 6));
  };
  const socket = (x: number, y: number, z: number) =>
    group(box(0.17, 0.13, 0.16, "plastic", x, y, z), box(0.09, 0.04, 0.18, "rubber", x, y + 0.08, z));

  return function refine(id: string, original: THREE.Group): THREE.Group {
    original.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(original);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const type = id.replace(/\d+$/, "");
    let g: THREE.Group;
    if (type === "alt") {
      g = group(
        cyl(0.27, 0.48, "brass", 0, 0, 0, "x"),
        ring(0.33, 0.055, "metal", -0.28, 0, 0, "x"),
        ring(0.33, 0.055, "metal", 0.28, 0, 0, "x"),
        cyl(0.16, 0.12, "rubber", 0.4, 0, 0, "x"),
        cyl(0.06, 0.14, "metal", 0.45, 0, 0, "x", 6),
        socket(-0.24, 0.29, 0),
      );
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        const rib = box(0.48, 0.035, 0.065, "metal", 0, Math.sin(a) * 0.32, Math.cos(a) * 0.32);
        rib.rotation.x = -a;
        g.add(rib, cyl(0.018, 0.58, "metal", 0, Math.sin(a) * 0.28, Math.cos(a) * 0.28, "x"));
      }
      for (const x of [-0.21, 0.21]) g.add(box(0.13, 0.17, 0.17, "metal", x, -0.4, 0), cyl(0.04, 0.19, "darkMetal", x, -0.43, 0, "z"));
      for (let i = 0; i < 3; i++) g.add(ring(0.16, 0.012, "metal", 0.35 + i * 0.04, 0, 0, "x"));
    } else if (type === "int") {
      const length = size.x;
      g = group(cyl(0.23, length * 0.93, "metal", 0, 0.15, 0, "x"), box(length, 0.09, 0.86, "darkMetal", 0, -0.24, 0));
      for (let j = 0; j < 3; j++)
        for (const side of [-1, 1]) {
          const x = ((j - 1) * length) / 3;
          g.add(tube([[x, 0.15, 0], [x, 0.17, side * 0.23], [x, -0.05, side * 0.42], [x, -0.26, side * 0.43]], 0.105, "metal"));
          g.add(box(0.28, 0.07, 0.23, "metal", x, -0.25, side * 0.44));
        }
      for (let j = 0; j < 5; j++) g.add(box(length * 0.8, 0.025, 0.018, "metal", 0, 0.37, j * 0.055 - 0.11));
      g.add(ring(0.21, 0.035, "metal", -length / 2, 0.15, 0, "x"));
      bolts(g, length, 0.86, -0.18);
    } else if (type === "thr" || type === "maf") {
      const thr = type === "thr";
      const radius = thr ? 0.24 : 0.19;
      const length = thr ? 0.43 : 0.58;
      g = group(
        ring(radius, 0.035, thr ? "metal" : "rubber", -length / 2, 0, 0, "x"),
        ring(radius, 0.035, thr ? "metal" : "rubber", length / 2, 0, 0, "x"),
      );
      for (let j = 0; j < 24; j++) {
        const a = (j * Math.PI) / 12;
        const wall = box(length, 0.055, 0.045, thr ? "metal" : "plastic", 0, Math.sin(a) * radius, Math.cos(a) * radius);
        wall.rotation.x = a;
        g.add(wall);
      }
      if (thr) {
        const plate = cyl(radius * 0.9, 0.016, "brass", 0, 0, 0, "x");
        plate.rotation.y = 0.55;
        g.add(plate, cyl(0.018, 0.5, "metal", 0, 0, 0, "z"), box(0.3, 0.29, 0.16, "plastic", 0, 0, 0.3));
      } else g.add(box(0.23, 0.13, 0.22, "plastic", 0, 0.23, 0), box(0.016, 0.17, 0.03, "metal", 0, 0.08, 0));
      g.add(socket(0, 0.2, 0.2));
    } else if (type === "coil") {
      g = group(cyl(0.075, 0.36, "rubber", 0, -0.1, 0), box(0.26, 0.14, 0.22, "plastic", 0, 0.15, 0), socket(0.16, 0.15, 0), box(0.13, 0.045, 0.12, "metal", -0.16, 0.12, 0), cyl(0.028, 0.05, "darkMetal", -0.17, 0.15, 0));
    } else if (type === "plug") {
      g = group(cyl(0.033, 0.18, "ceramic", 0, 0.07, 0), cyl(0.065, 0.065, "metal", 0, -0.06, 0, "y", 6), cyl(0.04, 0.13, "metal", 0, -0.14, 0), cyl(0.022, 0.06, "metal", 0, 0.18, 0), cyl(0.008, 0.035, "metal", 0, -0.22, 0), tube([[0.032, -0.2, 0], [0.032, -0.235, 0], [0.009, -0.235, 0]], 0.007, "metal"));
      for (let j = 0; j < 5; j++) g.add(ring(0.034, 0.006, "ceramic", 0, 0.025 + j * 0.025, 0));
      for (let j = 0; j < 6; j++) g.add(ring(0.04, 0.003, "darkMetal", 0, -0.105 - j * 0.017, 0));
    } else if (type === "inj") {
      g = group(cyl(0.055, 0.3, "metal"), cyl(0.033, 0.11, "metal", 0, -0.2, 0), cyl(0.035, 0.09, "metal", 0, 0.19, 0), box(0.12, 0.15, 0.12, "plastic", 0.06, 0.07, 0), socket(0.13, 0.08, 0), ring(0.055, 0.016, "rubber", 0, -0.11, 0), ring(0.039, 0.013, "rubber", 0, 0.2, 0));
    } else if (["crk", "cam", "map", "oilp", "knk", "vvt"].includes(type)) {
      if (type === "knk") g = group(ring(0.085, 0.032, "metal"), cyl(0.035, 0.1, "darkMetal"), socket(0.09, 0.03, 0));
      else if (type === "oilp") g = group(cyl(0.06, 0.14, "brass", 0, -0.08, 0), cyl(0.09, 0.07, "metal", 0, 0, 0, "y", 6), cyl(0.09, 0.13, "plastic", 0, 0.08, 0), socket(0, 0.18, 0));
      else if (type === "vvt") g = group(cyl(0.065, 0.32, "metal", -0.06, 0, 0, "x"), cyl(0.1, 0.14, "plastic", 0.17, 0, 0, "x"), socket(0.17, 0.11, 0), box(0.14, 0.035, 0.18, "metal"));
      else g = group(cyl(0.06, 0.2, "plastic", 0, -0.055, 0), box(0.18, 0.11, 0.14, "plastic", 0, 0.08, 0), socket(0.14, 0.08, 0), box(0.12, 0.035, 0.14, "metal", -0.13, 0.01, 0), cyl(0.025, 0.04, "darkMetal", -0.13, 0.04, 0));
    } else if (type === "ect") {
      g = group(cyl(0.21, 0.22, "metal"), cyl(0.12, 0.4, "metal", 0.15, 0, 0, "x"), ring(0.12, 0.024, "darkMetal", 0.36, 0, 0, "x"), cyl(0.055, 0.13, "brass", -0.08, 0.18, 0), socket(-0.08, 0.27, 0));
      bolts(g, 0.38, 0.34, 0.14);
    } else if (type === "egr") {
      g = group(box(0.3, 0.065, 0.3, "metal", 0, -0.18, 0), cyl(0.13, 0.2, "metal", 0, -0.06, 0), cyl(0.14, 0.2, "plastic", 0, 0.14, 0), socket(0.13, 0.18, 0), tube([[0, -0.05, 0], [0.18, -0.03, 0], [0.26, -0.16, 0]], 0.065, "metal"));
      bolts(g, 0.3, 0.3, -0.14);
    } else if (type === "cov" || type === "head" || type === "block" || type === "pan") {
      const x = size.x, y = size.y, z = size.z;
      g = group(box(x * 0.93, y * 0.8, z * 0.9, type === "pan" ? "darkMetal" : "metal"), box(x, 0.045, z, "darkMetal", 0, -y * 0.42, 0));
      for (let j = 0; j < 6; j++) g.add(box(x * 0.83, 0.025, 0.025, "metal", 0, y * 0.41, ((j - 2.5) * z) / 8));
      bolts(g, x, z, y * 0.44);
      if (type === "cov") for (let j = 0; j < 3; j++) g.add(ring(0.11, 0.025, "darkMetal", ((j - 1) * x) / 3, y * 0.4, 0));
      if (type === "cov" && id === "cov0") g.add(cyl(0.13, 0.08, "plastic", x * 0.31, y * 0.48, z * 0.23), box(0.15, 0.055, 0.035, "darkMetal", x * 0.31, y * 0.54, z * 0.23));
      if (type === "head") for (let j = 0; j < 3; j++) for (const side of [-1, 1]) g.add(ring(0.12, 0.026, "darkMetal", ((j - 1) * x) / 3, 0, side * z * 0.46, "z"));
      if (type === "pan") g.add(cyl(0.055, 0.09, "metal", x * 0.32, -y * 0.43, z * 0.25, "y", 6));
    } else if (type === "exh") {
      g = group(box(size.x, 0.1, 0.09, "metal", 0, 0.14, 0), cyl(0.105, size.x * 0.9, "cast", 0, -0.08, 0, "x"));
      for (let j = 0; j < 3; j++) {
        const x = ((j - 1) * size.x) / 3;
        g.add(tube([[x, 0.15, 0], [x, 0.12, 0.18], [x * 0.7, -0.08, 0.22], [x * 0.65, -0.08, 0]], 0.07, "cast"));
      }
      g.add(ring(0.1, 0.03, "metal", size.x * 0.48, -0.08, 0, "x"));
    } else if (type === "rail") {
      g = group(cyl(0.05, size.x, "metal", 0, 0, 0, "x"));
      for (let j = 0; j < 3; j++) g.add(cyl(0.035, 0.15, "metal", ((j - 1) * size.x) / 3, -0.07, 0), box(0.15, 0.035, 0.22, "metal", ((j - 1) * size.x) / 3, 0.05, 0));
      g.add(cyl(0.065, 0.1, "brass", size.x / 2, 0, 0, "x"));
    } else if (type === "pulley") {
      g = group(cyl(0.4, 0.15, "darkMetal", 0, 0, 0, "x"), cyl(0.22, 0.19, "metal", 0.03, 0, 0, "x"), cyl(0.055, 0.08, "metal", 0.16, 0, 0, "x", 6));
      for (let j = 0; j < 4; j++) g.add(ring(0.4, 0.012, "rubber", -0.07 + j * 0.04, 0, 0, "x"));
    } else return original;
    g.position.copy(center);
    return group(g);
  };
}