// Generic educational slider-crank and four-stroke valve-motion model.
// This is an explanatory animation, not OEM timing data or a mechanically validated CAD model.
export function sliderCrankPosition(angleDeg, crankRadius = 0.17, rodLength = 0.92) {
  const angle = angleDeg * Math.PI / 180;
  const sin = Math.sin(angle);
  return crankRadius * Math.cos(angle) +
    Math.sqrt(Math.max(0, rodLength * rodLength - crankRadius * crankRadius * sin * sin));
}

export function valveLift(cycleDeg, phase = "intake") {
  const cycle = ((cycleDeg % 720) + 720) % 720;
  const start = phase === "intake" ? 0 : 540;
  const end = phase === "intake" ? 180 : 720;
  if (cycle < start || cycle > end) return 0;
  return 0.11 * Math.sin(((cycle - start) / (end - start)) * Math.PI);
}

export function fourStrokePhase(cycleDeg) {
  const phase = ((cycleDeg % 720) + 720) % 720;
  if (phase < 180) return "Intake";
  if (phase < 360) return "Compression";
  if (phase < 540) return "Power";
  return "Exhaust";
}

export function createEngineMotion(THREE, frames, engine) {
  const material = {
    steel: new THREE.MeshStandardMaterial({ color: 0x9aa5b1, metalness: 0.82, roughness: 0.28 }),
    piston: new THREE.MeshStandardMaterial({ color: 0xb8c2cc, metalness: 0.88, roughness: 0.24 }),
    rod: new THREE.MeshStandardMaterial({ color: 0x8794a2, metalness: 0.9, roughness: 0.3 }),
    valve: new THREE.MeshStandardMaterial({ color: 0xc7a66a, metalness: 0.82, roughness: 0.24 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x394655, metalness: 0.75, roughness: 0.35 }),
  };
  const perBank = engine.n / frames.length;
  const cylinders = [];
  const camshafts = [];
  const crankRadius = 0.17;
  const rodLength = 0.92;
  const crankY = -0.32;

  const makeCylinder = (radius, length, mat, axis = "y") => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 20), mat);
    if (axis === "x") mesh.rotation.z = Math.PI / 2;
    return mesh;
  };
  const makeRod = () => new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 1, 12), material.rod);

  frames.forEach((frame, bank) => {
    const crank = new THREE.Group();
    crank.position.set(0, crankY, 0);
    frame.add(crank);
    crank.add(makeCylinder(0.075, engine.n / frames.length + 1.0, material.steel, "x"));

    const intakeCam = new THREE.Group();
    intakeCam.position.set(0, 1.82, -0.22);
    intakeCam.add(makeCylinder(0.045, engine.n / frames.length + 0.8, material.dark, "x"));
    const exhaustCam = new THREE.Group();
    exhaustCam.position.set(0, 1.82, 0.22);
    exhaustCam.add(makeCylinder(0.045, engine.n / frames.length + 0.8, material.dark, "x"));
    frame.add(intakeCam, exhaustCam);
    camshafts.push({ intakeCam, exhaustCam });

    for (let j = 0; j < perBank; j++) {
      const x = j - (perBank - 1) / 2;
      const cylinderIndex = bank * perBank + j;
      const pistonOffset = engine.v
        ? (bank * 120 + j * 240)
        : ([0, 180, 180, 0][j] ?? j * 180);
      const cycleOffset = engine.v
        ? pistonOffset
        : ([0, 360, 180, 540][j] ?? j * (720 / engine.n));

      const liner = new THREE.Mesh(
        new THREE.CylinderGeometry(0.205, 0.205, 0.92, 24, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x687583, metalness: 0.72, roughness: 0.34, side: THREE.DoubleSide, transparent: true, opacity: 0.2 }),
      );
      liner.position.set(x, 0.83, 0);
      frame.add(liner);

      const piston = new THREE.Group();
      piston.add(makeCylinder(0.17, 0.19, material.piston));
      for (let ringIndex = 0; ringIndex < 3; ringIndex++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.171, 0.009, 6, 24), material.dark);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.055 - ringIndex * 0.045;
        piston.add(ring);
      }
      frame.add(piston);

      const rod = makeRod();
      frame.add(rod);
      const crankWebs = new THREE.Group();
      const webA = makeCylinder(0.19, 0.09, material.dark, "x");
      webA.position.set(-0.13, 0, 0);
      const webB = makeCylinder(0.19, 0.09, material.dark, "x");
      webB.position.set(0.13, 0, 0);
      const crankPin = makeCylinder(0.055, 0.32, material.steel, "x");
      crankPin.position.z = crankRadius;
      crankWebs.add(webA, webB, crankPin);
      crankWebs.position.set(x, 0, 0);
      crank.add(crankWebs);

      const intakeValve = makeCylinder(0.035, 0.2, material.valve);
      const exhaustValve = makeCylinder(0.035, 0.2, material.valve);
      intakeValve.position.set(x - 0.105, 1.35, -0.1);
      exhaustValve.position.set(x + 0.105, 1.35, 0.1);
      frame.add(intakeValve, exhaustValve);

      const intakeLobe = makeCylinder(0.09, 0.075, material.valve, "x");
      intakeLobe.position.set(x, 0.055, 0);
      intakeCam.add(intakeLobe);
      const exhaustLobe = makeCylinder(0.09, 0.075, material.valve, "x");
      exhaustLobe.position.set(x, 0.055, 0);
      exhaustCam.add(exhaustLobe);

      cylinders.push({
        x, piston, rod, crankWebs, intakeValve, exhaustValve,
        pistonOffset, cycleOffset, cylinderIndex,
      });
    }
  });

  let crankAngle = 0;
  function update(deltaSeconds, rpm) {
    crankAngle = (crankAngle + Math.max(0, rpm) * 6 * deltaSeconds) % 720;
    for (const cylinder of cylinders) {
      const crankPhase = crankAngle + cylinder.pistonOffset;
      const radians = crankPhase * Math.PI / 180;
      const y = crankY + sliderCrankPosition(crankPhase, crankRadius, rodLength);
      const pinY = crankY + crankRadius * Math.cos(radians);
      const pinZ = crankRadius * Math.sin(radians);
      const pistonPin = new THREE.Vector3(cylinder.x, y - 0.08, 0);
      const crankPin = new THREE.Vector3(cylinder.x, pinY, pinZ);
      const vector = pistonPin.clone().sub(crankPin);
      cylinder.piston.position.set(cylinder.x, y, 0);
      cylinder.rod.position.copy(crankPin).add(pistonPin).multiplyScalar(0.5);
      cylinder.rod.scale.y = vector.length();
      cylinder.rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vector.normalize());
      cylinder.crankWebs.rotation.x = radians;

      const cycle = crankAngle + cylinder.cycleOffset;
      cylinder.intakeValve.position.y = 1.35 - valveLift(cycle, "intake");
      cylinder.exhaustValve.position.y = 1.35 - valveLift(cycle, "exhaust");
    }
    for (const { intakeCam, exhaustCam } of camshafts) {
      intakeCam.rotation.x = -crankAngle * Math.PI / 360;
      exhaustCam.rotation.x = -crankAngle * Math.PI / 360;
    }
  }

  return {
    update,
    get crankAngle() { return crankAngle; },
    get cylinders() { return cylinders.length; },
  };
}
