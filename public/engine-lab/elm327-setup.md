# AISE Virtual — ELM327 Wi-Fi setup

The dashboard reads stored and pending engine/emissions codes, MIL status, RPM, coolant temperature, adapter voltage, speed, calculated load, throttle position, manifold pressure, intake temperature and bank-1 short/long fuel trims. Measurements depend on vehicle support; unavailable replies show no value, never a simulated substitute. Trends remain in memory only. Pause freezes monitoring; resume starts fresh reads. DTCs refresh automatically about every 15 seconds between polling sweeps, or with Sync DTCs. Actual refresh speed depends on the adapter. Re-download the updated bridge to allow these additional read-only measurements.

It never erases ECU codes. “Clear scan” clears only the screen. The current generic bridge reads standard powertrain/emissions codes (Modes 03/07) and supported Mode 01 PIDs only. It does not scan ABS/brake, airbag/SRS, chassis/body, or dedicated transmission-control modules. Some transmission-related P-codes may appear only when the vehicle PCM exposes them through standard OBD-II. A full transmission or ABS scan requires vehicle-specific enhanced diagnostics and is not implemented here. Permanent codes and readiness are not read.

## Local computer bridge

1. Park safely, plug the ELM327 into the vehicle, and switch the ignition on. Do not operate the lab while driving. Run the engine only with adequate ventilation.
2. Join the adapter’s Wi-Fi on the computer running the bridge. Its default TCP address is often `192.168.0.10:35000`; check your adapter documentation. Maintain internet access on another connection, or load the lab before switching Wi-Fi.
3. Install Node.js (20 or newer). Download [elm327-bridge.mjs](elm327-bridge.mjs) into a new folder on that computer.
4. Open a terminal in that folder:

```sh
npm init -y
npm install ws
node elm327-bridge.mjs 192.168.0.10 35000 35001
```

5. In the lab, enter `ws://localhost:35001` and choose **Connect Wi-Fi**. Allow local-network access if your browser asks. A stored/pending scan runs immediately; **Sync DTCs** refreshes it. Select a code to highlight related parts in the generic model. Numbering and locations may differ from your vehicle.

Browsers cannot talk directly to the adapter’s raw TCP address. The bridge must run on your computer, not on the website. `localhost` on a phone means the phone itself, not your laptop.

## Secure pages and phones

Some browsers block plain `ws://` connections even to localhost when the lab is HTTPS. A phone connecting to a laptop requires a trusted `wss://` bridge. Do not disable browser security. Supply a TLS certificate trusted by that device and matching the laptop’s hostname:

```sh
ELM_TLS_CERT=/path/cert.pem ELM_TLS_KEY=/path/key.pem ELM_BIND=0.0.0.0 node elm327-bridge.mjs 192.168.0.10 35000 35001
```

Then use `wss://your-certificate-hostname:35001`. Keep it on a private network; never expose it to the internet. Plain mode binds to loopback only. The default allowed website origins include the original Garage Lovable app, the current AISE integration preview (https://francisco-garcia-git-integration-afe1f3-ciscosworld-s-projects.vercel.app), and localhost:8080. Production domains must be added explicitly with ELM_ALLOWED_ORIGINS after the final domain is confirmed. For a different website address, set `ELM_ALLOWED_ORIGINS` to a comma-separated list of exact trusted origins; never use a wildcard. TLS key files stay on your own computer.

## Interpretation

A code points to a circuit or system, not proof of a failed part. Unknown codes remain visible without an invented part match. “No codes” does not prove a vehicle is healthy or emissions-ready. Disconnection removes vehicle data and highlights. Simulated faults are disabled while the adapter is active.