# AISE Virtual Android ELM327 Bridge

## Purpose
Provide a native Android companion that hosts the AISE Virtual web experience and gives its trusted web UI a narrowly scoped, read-only ELM327 Wi-Fi API. The existing browser simulator remains available and is never represented as live vehicle data.

## Architecture
- Android app hosts AISE Virtual in a WebView.
- A native Kotlin client opens a TCP socket to the Wi-Fi ELM327 (default endpoint commonly used by this project: 192.168.0.10:35000; user-configurable because adapter firmware varies).
- The socket is created through the Android Wi-Fi Network socket factory so adapter traffic does not require routing WebView internet traffic through a Wi-Fi network with no internet.
- A JavaScript bridge exposes only connection status, supported live PID reads, DTC reads, and disconnect. No actuator commands, ECU writes, code clearing, adaptations, or programming.
- Validate the loaded origin before enabling the JavaScript interface. Never expose the bridge to arbitrary remote pages.

## Native-to-web message contract

The native bridge sends one JSON object per message using these discriminators:

- `status`: `connected` plus optional `elmVersion`, `protocol`, and `voltage`.
- `response`: request correlation `id`, OBD command `cmd`, raw adapter payload `raw`, and boolean `success`.
- `error`: optional request `id` and a constrained `message`: `NO DATA`, `UNABLE TO CONNECT`, `BUS ERROR`, or `timeout`.
- `event`: asynchronous `disconnected`, `searching`, or `protocolFound` event.

Example RPM response: `{"type":"response","id":"req-123","cmd":"010C","raw":"41 0C 1A F8","success":true}`.
The payload decodes to 1,726 RPM: (0x1AF8 / 4). The web parser lives at `src/lib/obd/bridgeProtocol.ts`; malformed or unknown messages are rejected.

## Web-to-native request contract

The web UI sends these requests to the Android host:

- `connect`: private IPv4 adapter host and TCP port (the supplied example is `192.168.0.10:35000`).
- `command`: request ID and a read-only OBD command.
- `disconnect`: close the adapter session.
- `status`: return the current connection status.

The TypeScript request validator is `parseElmBridgeRequest` in `src/lib/obd/bridgeProtocol.ts`. It rejects public IP destinations, malformed ports, unknown message types, arbitrary ELM AT commands, and commands outside the read-only allowlist. The initial allowlist includes supported standard Mode 01 PIDs and generic DTC read services `03` and `07`; service `04` is explicitly excluded. Android must independently enforce the same policy—web validation is not a security boundary.

## Initial protocol
1. Open TCP socket with bounded connect/read timeouts.
2. Initialize with ATZ, ATE0, ATL0, ATS0, ATH0, ATSP0.
3. Read supported PIDs (0100) and request standard live PIDs only when supported by the ECU.
4. Read stored and pending generic emissions DTCs with services 03 and 07; never issue service 04 (clear DTCs).
5. Parse ELM prompts and ISO 15765-4 CAN responses defensively; report unsupported, timeout, malformed, and disconnected states distinctly.
6. Label vehicle-provided data as live and all simulator values as simulated. Never silently fall back between them.

## Safety and privacy
- Read-only by design. Block service 04, actuator tests, coding, adaptation, and arbitrary command passthrough from web content.
- User initiates every connection. Show adapter endpoint and connection state.
- Do not upload vehicle data. Keep telemetry local to the phone and current session unless the user explicitly chooses otherwise.
- Do not claim a successful connection until TCP connect and ELM initialization both succeed.

## Current implementation status
- [x] Remove the false Link established claim from the simulator scan tool.
- [ ] Implement Android companion project and native Wi-Fi socket client.\n- [x] Define and validate the native-to-web JSON message contract; decode the sample RPM response.\n- [x] Define and validate the web-to-native connect, command, disconnect, and status requests.
- [ ] Add a restricted JavaScript bridge and real-data UI mode.
- [ ] Test against the user's specific ELM327 adapter and vehicle.
- [ ] Verify supported PIDs, DTC parsing, reconnect behavior, and browser/app lifecycle.
- [ ] Build, sign, install, and test the Android package.

## Important compatibility note
ELM327 clones differ in firmware, IP address, port, supported protocols, and response formatting. The defaults are starting values, not proof of compatibility. The vehicle and adapter must be tested before declaring the bridge operational.
