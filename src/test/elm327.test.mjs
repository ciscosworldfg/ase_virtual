import test from "node:test";
import assert from "node:assert/strict";
import { decodeMeasurement } from "../../public/engine-lab/obd-data.js";
import { decodeDtcResponse, ElmWifi, relatedParts } from "../../public/engine-lab/elm327.js";

test("decodes standard stored DTC responses", () => {
  assert.deepEqual(decodeDtcResponse("43 01 01", "03"), ["P0101"]);
});

test("decodes pending DTC responses", () => {
  assert.deepEqual(decodeDtcResponse("47 01 01", "07"), ["P0101"]);
});

test("treats an empty pending-code response as an empty list", () => {
  assert.deepEqual(decodeDtcResponse("NO DATA", "07"), []);
});

test("does not treat an empty stored-code response as a confirmed clean scan", () => {
  assert.throws(() => decodeDtcResponse("NO DATA", "03"), /previous scan was kept/i);
});

test("rejects adapter errors instead of inventing DTC values", () => {
  assert.throws(() => decodeDtcResponse("UNABLE TO CONNECT", "03"), /could not read/i);
});

test("decodes engine RPM from Mode 01 PID 0C", () => {
  assert.equal(decodeMeasurement("41 0C 1A F8", "010C"), 1726);
});

test("decodes coolant temperature from Mode 01 PID 05", () => {
  assert.equal(decodeMeasurement("41 05 7B", "0105"), 83);
});

test("decodes short-term fuel trim as a signed percentage", () => {
  assert.equal(decodeMeasurement("41 06 90", "0106"), 12.5);
});

test("returns null for unavailable or malformed sensor responses", () => {
  assert.equal(decodeMeasurement("NO DATA", "010C"), null);
  assert.equal(decodeMeasurement("41 0C GG HH", "010C"), null);
});

test("decodes adapter voltage separately from ECU PIDs", () => {
  assert.equal(decodeMeasurement("12.6V", "ATRV"), 12.6);
});

test("maps only DTCs explicitly listed on a component", () => {
  const parts = [
    { id: "maf", codes: ["P0101"] },
    { id: "coil", codes: ["P0301"] },
  ];
  assert.deepEqual(relatedParts("P0101", parts).map((part) => part.id), ["maf"]);
});

test("blocks commands outside the read-only allowlist", async () => {
  const adapter = new ElmWifi();
  await assert.rejects(adapter.send("04"), /read-only scanner commands/i);
  await assert.rejects(adapter.send("ATWS"), /read-only scanner commands/i);
});
