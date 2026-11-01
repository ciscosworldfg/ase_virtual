# AISE Virtual Android ELM327 Bridge

## Purpose
Provide a native Android companion that hosts the AISE Virtual web experience and gives its trusted web UI a narrowly scoped, read-only ELM327 Wi-Fi API. The existing browser simulator remains available and is never represented as live vehicle data.

## Architecture
- Android app hosts AISE Virtual in a WebView.
- A native Kotlin client opens a TCP socket to the Wi-Fi ELM327 (default endpoint commonly used by this project: 192.168.0.10:35000; user-configurable because adapter firmware varies).
- The socket is created through the Android Wi-Fi Network socket factory so adapter traffic does not require routing WebView internet traffic through a Wi-Fi network with no internet.
- A JavaScript bridge exposes only connection status, supported live PID reads, DTC reads, and disconnect. No actuator commands, ECU writes, code clearing, adaptations, or programming.
- Validate the loaded origin before enabling the JavaScript interface. Never expose the bridge to arbitrary remote pages.

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
- [ ] Implement Android companion project and native Wi-Fi socket client.
- [ ] Add a restricted JavaScript bridge and real-data UI mode.
- [ ] Test against the user's specific ELM327 adapter and vehicle.
- [ ] Verify supported PIDs, DTC parsing, reconnect behavior, and browser/app lifecycle.
- [ ] Build, sign, install, and test the Android package.

## Important compatibility note
ELM327 clones differ in firmware, IP address, port, supported protocols, and response formatting. The defaults are starting values, not proof of compatibility. The vehicle and adapter must be tested before declaring the bridge operational.
