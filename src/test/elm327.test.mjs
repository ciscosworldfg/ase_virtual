import test from "node:test";
import assert from "node:assert/strict";
import { celsiusToFahrenheit, decodeMeasurement, kmhToMph } from "../../public/engine-lab/obd-data.js";
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

test("decodes the specified RPM example", () => {
  assert.equal(decodeMeasurement("41 0C 1A F0", "010C"), 1724);
});

test("decodes coolant temperature and converts Celsius to Fahrenheit", () => {
  const celsius = decodeMeasurement("41 05 7B", "0105");
  assert.equal(celsius, 83);
  assert.equal(Number(celsiusToFahrenheit(celsius).toFixed(1)), 181.4);
});
test("decodes vehicle speed and converts km/h to mph", () => {
  const kmh = decodeMeasurement("41 0D 3C", "010D");
  assert.equal(kmh, 60);
  assert.equal(Number(kmhToMph(kmh).toFixed(1)), 37.3);
});

test("decodes positive short-term fuel trim", () => {
  assert.equal(decodeMeasurement("41 06 90", "0106"), 12.5);
});
test("decodes negative long-term fuel trim", () => {
  assert.equal(decodeMeasurement("41 07 70", "0107"), -12.5);
});

test("returns null for unavailable or malformed sensor responses", () => {
  assert.equal(decodeMeasurement("NO DATA", "010C"), null);
  assert.equal(decodeMeasurement("NO DATA", "010D"), null);
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
