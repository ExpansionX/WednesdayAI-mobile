# Backend and Transport Architecture

## Rule

Backend identity and transport identity are separate.

Backend identity answers: what product/runtime is this?

Transport identity answers: how do we connect to it?

WednesdayAI Mobile must not implement WednesdayAI as another transport mode. `wednesdayai` is the
primary backend identity. Transports remain connection routes.

WednesdayAI is a Hard fork of OpenClaw at v2026.3.2. Compatibility with OpenClaw-derived protocol
behaviour is useful for migration and interop, but WednesdayAI remains the primary product identity.

## Backend identities

The primary backend identity is `wednesdayai`.

Compatibility descriptors may exist for OpenClaw-derived behaviour where they help users migrate,
debug, or interoperate. They should be explicit descriptors, not hidden assumptions in screen code.

Backend descriptors should define:

- product label;
- capability matrix;
- supported management operations;
- supported plugin/skill affordances;
- compatibility surfaces;
- unsupported actions.

## Transport identities

The transport identities are:

- `local`;
- `relay`;
- `tailscale`;
- `cloudflare`;
- `custom`.

These are routes, not products. `relay` means the app connects through relay infrastructure.
`local` means the app connects directly to a reachable gateway. `tailscale`, `cloudflare`, and
`custom` are network access routes.

## Capability registry

Screens should consume backend capability metadata and backend operation helpers rather than
scattered conditionals.

The capability registry should answer:

- whether a screen should be shown;
- whether an action is enabled;
- what copy describes the unsupported state;
- what transport routes are valid;
- what permissions may be requested;
- what compatibility behaviour is retained.

Backend-specific request semantics belong in service helpers, not in view components.

## Direct gateway management

Direct gateway management is the default WednesdayAI Mobile product path.

Required management areas:

- local discovery;
- manual URL;
- QR pairing;
- Tailscale/cloud/relay options;
- status;
- doctor;
- logs;
- reset;
- service lifecycle where supported;
- models and providers;
- skills and plugins;
- agents and runs;
- approvals and files.

The app should show whether a route is local, remote, or relayed before the user runs a sensitive
action.

## Optional relay and helper paths

Relay and helper paths remain optional routes for remote access, difficult networks, NAT traversal,
and migration.

Reference docs show the current relay model:

- registry issues pairing credentials;
- client claims an access code;
- relay verifies `relaySecret` or `clientToken`;
- WebSocket rooms forward gateway/client payloads;
- telemetry must not log tokens or user-correlatable identifiers.

Hermes relay docs also show why product/runtime identity should not be collapsed into an existing
transport: isolated routes, KV keys, Durable Object classes, IDs, and config files reduce regression
risk. WednesdayAI should use the same discipline when adding compatibility paths.

Bridge docs show lifecycle expectations:

- command parsing stays in the CLI;
- reusable transport logic stays in packages;
- `pair`, `install`, `restart`, `stop`, `reset`, and `uninstall` converge stale processes;
- runtime logs remain machine-parsable;
- the local gateway socket is demand-driven.

## Compatibility with OpenClaw-derived behaviour

OpenClaw-derived protocol compatibility must be named, not assumed.

Compatibility surfaces include:

- retained pairing payload fields such as gateway IDs, access codes, relay URLs, client tokens, and
  display names;
- gateway request/response semantics inherited from OpenClaw-derived gateways;
- relay compatibility for register, access-code, claim, verify, and WebSocket connect paths where
  retained;
- auth and token handling, including bearer tokens and token redaction in telemetry;
- migration fallbacks for older setup codes, QR payloads, stored configs, and relay records.

Compatibility is preserved where it helps WednesdayAI migration and interop. It must not stop
WednesdayAI from using `wednesdayai` as the primary backend identity.

## Screen and service rules

- Screens read descriptors and operation bundles.
- Screens do not decide backend behaviour with scattered checks.
- Unsupported actions are hidden or disabled through capability metadata.
- Backend operation helpers own request semantics.
- Transport helpers own connection, caching, relay, and reconnect behaviour.
- User-facing copy should say WednesdayAI unless a flow is explicitly compatibility-only.

## Verification expectations

When implementation begins, verify:

- `wednesdayai` is represented as backend identity, not transport;
- `local`, `relay`, `tailscale`, `cloudflare`, and `custom` remain transport identities;
- direct management exposes status, doctor, logs, reset, and service lifecycle where supported;
- OpenClaw-derived protocol compatibility is documented in descriptors or adapters;
- auth, token, and relay compatibility paths do not log secrets;
- no screen introduces a new backend-specific branch when a capability check or helper should own it.
