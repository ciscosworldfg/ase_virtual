import test from "node:test";
import assert from "node:assert/strict";
import { sliderCrankPosition, valveLift, fourStrokePhase, engineCylinderTiming } from "../../public/engine-lab/engine-kinematics.js";

test("slider-crank piston reaches top and bottom dead centre", () => {
  const top = sliderCrankPosition(0, 0.17, 0.92);
  const bottom = sliderCrankPosition(180, 0.17, 0.92);
  assert.ok(top > bottom);
  assert.ok(Math.abs(top - 1.09) < 0.0001);
  assert.ok(Math.abs(bottom - 0.75) < 0.0001);
});

test("slider-crank travel repeats every 360 crank degrees", () => {
  assert.ok(Math.abs(sliderCrankPosition(30) - sliderCrankPosition(390)) < 1e-10);
});

test("intake valve opens only during the intake stroke", () => {
  assert.equal(valveLift(0, "intake"), 0);
  assert.ok(valveLift(90, "intake") > 0.1);
  assert.equal(valveLift(270, "intake"), 0);
});

test("exhaust valve opens only during the exhaust stroke", () => {
  assert.equal(valveLift(360, "exhaust"), 0);
  assert.ok(valveLift(630, "exhaust") > 0.1);
  assert.equal(valveLift(90, "exhaust"), 0);
});

test("four-stroke cycle labels cover all four 180-degree strokes", () => {
  assert.deepEqual([0, 180, 360, 540].map(fourStrokePhase), ["Intake", "Compression", "Power", "Exhaust"]);
});

test("four-stroke cycle wraps after 720 crank degrees", () => {
  assert.equal(fourStrokePhase(720), "Intake");
});

test("inline-four piston and valve cycle phases are correctly paired", () => {
  assert.deepEqual(engineCylinderTiming({ n: 4, v: 0 }), [
    { pistonOffset: 0, cycleOffset: 0 },
    { pistonOffset: 180, cycleOffset: 180 },
    { pistonOffset: 180, cycleOffset: 540 },
    { pistonOffset: 0, cycleOffset: 360 },
  ]);
});

test("V6 firing phases are evenly spaced by 120 crank degrees", () => {
  assert.deepEqual(engineCylinderTiming({ n: 6, v: 1 }).map((c) => c.cycleOffset), [0, 240, 480, 120, 360, 600]);
});
