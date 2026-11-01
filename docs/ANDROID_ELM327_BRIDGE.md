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

The TypeScript request validator is `parseElmBridgeRequest` in `src/lib/obd/bridgeProtocol.ts`. It rejects public IP destinations, malformed ports, unknown message types, arbitrary ELM AT commands, and commands outside the read-only allowlist. The initial allowlist includes Mode 01 supported-PID and monitor-status requests (`0100`, `0101`), selected standard live PIDs, and generic DTC read services `03`, `07`, and `0A`; service `04` is explicitly excluded. Android must independently enforce the same policy—web validation is not a security boundary.

## Initial protocol
1. Open TCP socket with bounded connect/read timeouts.
2. Initialize the adapter from native code only. Send `ATZ`, wait 1–1.5 seconds for the reset banner, then send `ATE0`, `ATL0`, `ATS0`, `ATH0`, `ATAT1`, `ATST32`, and `ATSP0`. Use `ATSP6` only when the vehicle's ISO 15765-4 CAN 11-bit/500 kbit protocol is known; otherwise retain automatic protocol search. Parse each prompt/response before sending the next command.
3. Query supported Mode 01 PIDs with `0100`; query `0101` for MIL status and DTC count. Request individual live PIDs only when the ECU's supported-PID bitmap indicates support.
4. Read stored, pending, and permanent generic emissions DTCs with `03`, `07`, and `0A` respectively. Permanent DTC support depends on vehicle/ECU capability. Never issue service `04` (clear DTCs).
5. Parse ELM prompts and ISO 15765-4 CAN responses defensively; report unsupported, timeout, malformed, and disconnected states distinctly.
6. Label vehicle-provided data as live and all simulator values as simulated. Never silently fall back between them.


## Implementation review: important corrections before vehicle testing

The supplied Kotlin sketch is a useful outline, not production-ready socket code. Apply these requirements before using it with a vehicle:

- Do not parse ELM output with `BufferedReader.readLine()` while `ATL0` is active. Read bytes until the ELM prompt byte `>` is received, with a bounded deadline and maximum response size. Preserve the reset banner even if it arrives without line endings.
- Serialize every adapter operation through one coroutine `Mutex` or single-consumer command queue. Never allow concurrent reads/writes on the same ELM socket.
- Use suspend functions end-to-end; do not use `runBlocking` on UI or service request paths.
- Treat every initialization command as a checked transaction. Require a valid reset banner after `ATZ`; verify expected acknowledgements for setup commands; fail and close the socket on initialization errors. Do not report `connected: true` until initialization and protocol setup are complete.
- Include `ATST32` in the actual initialization sequence. `ATST32` is an adapter timeout setting, not a guarantee that all vehicle replies complete within 200 ms. Use a longer bounded deadline for the initial `0100` automatic protocol search and tune later per vehicle.
- Append exactly one carriage return byte (`0x0D`) to each adapter command. Strip the ELM prompt and normalize whitespace/case before parsing; account for `SEARCHING...`, `BUS INIT...`, `NO DATA`, `?`, and adapter error text.
- Use Android's selected Wi-Fi `Network.socketFactory` for the adapter TCP socket where the adapter network has no internet, so the WebView can retain its internet route.
- The Android process must independently validate host/port and enforce the read-only OBD command allowlist. Never trust validation performed only in TypeScript.
- Keep the adapter connection lifecycle separate from WebSocket/WebView lifecycle. A WebSocket ping/pong heartbeat can detect a dead browser connection; it is not an OBD command and should not be sent to the ECU.
- If using a localhost WebSocket server, account for HTTPS-to-WS mixed-content restrictions, origin validation, authentication, and server binding. Do not bind an unauthenticated control server to `0.0.0.0`. The current preferred first implementation remains the narrowly scoped Android WebView JavaScript bridge, avoiding an unnecessary local network listener; the JSON message contract remains transport-independent.

### Read-only first-connection sequence

1. Connect TCP and validate the ELM reset banner.
2. Apply adapter setup sequentially: `ATE0`, `ATL0`, `ATS0`, `ATH0`, `ATAT1`, `ATST32`, `ATSP0`.
3. Query `0100` and parse the supported-PID bitmap before requesting individual live PIDs.
4. Query `0101`, `03`, `07`, and `0A` sequentially. Mark permanent DTC support as unsupported/unknown when the ECU does not support it; never interpret `NO DATA` as proof that no permanent DTCs exist.
5. Publish status and readings only after parsing actual adapter responses. On any socket loss, publish disconnected and discard stale live readings.

## Safety and privacy
- Read-only by design. Block service 04, actuator tests, coding, adaptation, and arbitrary command passthrough from web content.
- User initiates every connection. Show adapter endpoint and connection state.
- Do not upload vehicle data. Keep telemetry local to the phone and current session unless the user explicitly chooses otherwise.
- Do not claim a successful connection until TCP connect and ELM initialization both succeed.

## Current implementation status
- [x] Remove the false Link established claim from the simulator scan tool.
- [ ] Implement Android companion project and native Wi-Fi socket client.\n- [x] Define and validate the native-to-web JSON message contract; decode the sample RPM response.\n- [x] Define and validate the web-to-native connect, command, disconnect, and status requests.\n- [x] Add read-only requests for supported-PID bitmap, MIL/DTC status, stored, pending, and permanent DTCs.\n- [x] Document the native-only ELM initialization sequence and protocol selection guidance.
- [ ] Add a restricted JavaScript bridge and real-data UI mode.
- [ ] Test against the user's specific ELM327 adapter and vehicle.
- [ ] Verify supported PIDs, DTC parsing, reconnect behavior, and browser/app lifecycle.
- [ ] Build, sign, install, and test the Android package.

## Important compatibility note
ELM327 clones differ in firmware, IP address, port, supported protocols, and response formatting. The defaults are starting values, not proof of compatibility. The vehicle and adapter must be tested before declaring the bridge operational.
