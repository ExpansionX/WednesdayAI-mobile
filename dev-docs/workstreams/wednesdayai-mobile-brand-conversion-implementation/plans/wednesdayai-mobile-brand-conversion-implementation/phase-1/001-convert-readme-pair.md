---
id: "001"
phase: 1
title: Convert paired README product framing
status: passed
depends_on: ["000"]
parallel: false
conflicts_with: []
files:
  - README.md
  - README.zh-CN.md
irreversible: false
scope_test: "N/A"
allowed_change: edit
covers_criteria: [SC1, SC2]
---
## Failing test (write first)
N/A - paired documentation edit with manual verification.

## Change
- **File:** `README.md`
- **Anchor:** opening product identity block from the hero image through the App Store paragraph.
- **Before:**
```markdown
<p align="center">
  <img src="./assets/clawket-hero.png" alt="Clawket" />
</p>

# Clawket

[![npm version](https://img.shields.io/npm/v/@p697/clawket)](https://www.npmjs.com/package/@p697/clawket)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[Follow on X](https://x.com/cavano697)

[中文说明](./README.zh-CN.md)

Clawket is an open-source mobile app for managing your AI agents on the go. It currently supports [OpenClaw](https://github.com/openclaw/openclaw) and [Hermes](https://github.com/NousResearch/hermes-agent), and is available on iOS and Android.

<p align="center">
  <a href="https://apps.apple.com/app/id6759597015">
    <img src="./assets/clawket-app-store.png" alt="Scan to download Clawket on the App Store" width="180" />
  </a>
</p>
<p align="center">
  <strong>Scan to open the <a href="https://apps.apple.com/app/id6759597015">App Store</a> on your iPhone.</strong>
</p>
```
- **After:**
```markdown
<p align="center">
  <img src="./assets/clawket-hero.png" alt="WednesdayAI Mobile" />
</p>

# WednesdayAI Mobile

[![npm version](https://img.shields.io/npm/v/@p697/clawket)](https://www.npmjs.com/package/@p697/clawket)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[Follow on X](https://x.com/cavano697)

[中文说明](./README.zh-CN.md)

WednesdayAI Mobile is an open-source mobile app for managing WednesdayAI and compatible AI-agent backends on the go. This repository is a hard fork of Clawket, preserving OpenClaw heritage while making WednesdayAI Mobile the primary product direction. It currently supports [OpenClaw](https://github.com/openclaw/openclaw) and [Hermes](https://github.com/NousResearch/hermes-agent), and is available on iOS and Android.

<p align="center">
  <a href="https://apps.apple.com/app/id6759597015">
    <img src="./assets/clawket-app-store.png" alt="Scan to open the WednesdayAI Mobile App Store page" width="180" />
  </a>
</p>
<p align="center">
  <strong>Scan to open the <a href="https://apps.apple.com/app/id6759597015">App Store</a> on your iPhone.</strong>
</p>
```

- **File:** `README.md`
- **Anchor:** `## Key Features` bullet list.
- **Before:**
```markdown
- **📱 Mobile control for OpenClaw** — Chat, manage agents, configure models, schedule cron jobs, and monitor sessions — all from your phone
```
- **After:**
```markdown
- **📱 Mobile control for WednesdayAI and compatible backends** — Chat, manage agents, configure models, schedule cron jobs, and monitor sessions — all from your phone
```

- **File:** `README.md`
- **Anchor:** connection-path introduction under the architecture diagram.
- **Before:**
```markdown
Clawket supports two connection paths:
```
- **After:**
```markdown
WednesdayAI Mobile currently inherits Clawket's two connection paths:
```

- **File:** `README.md`
- **Anchor:** `## How It Works` numbered list and current pairing behaviour intro.
- **Before:**
```markdown
3. Scan the QR with the Clawket mobile app to trust that machine.
```
- **After:**
```markdown
3. Scan the QR with the WednesdayAI Mobile app to trust that machine.
```

- **File:** `README.md`
- **Anchor:** current pairing behaviour bullet.
- **Before:**
```markdown
- If the machine has both OpenClaw and Hermes, Clawket prints one QR per backend and clearly labels them.
```
- **After:**
```markdown
- If the machine has both OpenClaw and Hermes, the bridge prints one QR per backend and clearly labels them.
```

- **File:** `README.md`
- **Anchor:** `## Self-Hosting` opening paragraph.
- **Before:**
```markdown
Clawket is designed so the public repository can be cloned and run without depending on an official hosted backend. You can use either a relay-backed setup that you operate yourself, or a pure local/direct setup over LAN, Tailscale, or another custom gateway URL.
```
- **After:**
```markdown
WednesdayAI Mobile is designed so the public repository can be cloned and run without depending on an official hosted backend. During the hard-fork transition, the repository intentionally keeps current Clawket package names, commands, and relay defaults until a scoped compatibility migration changes them. You can use either a relay-backed setup that you operate yourself, or a pure local/direct setup over LAN, Tailscale, or another custom gateway URL.
```

- **File:** `README.zh-CN.md`
- **Anchor:** opening product identity block from the hero image through the App Store paragraph.
- **Before:**
```markdown
<p align="center">
  <img src="./assets/clawket-hero.png" alt="Clawket" />
</p>

# Clawket

[![npm version](https://img.shields.io/npm/v/@p697/clawket)](https://www.npmjs.com/package/@p697/clawket)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[Follow on X](https://x.com/cavano697)

[English README](./README.md)

Clawket 是一个开源的移动端应用，用来随时随地管理你的 AI Agent。目前同时支持 [OpenClaw](https://github.com/openclaw/openclaw) 和 [Hermes](https://github.com/NousResearch/hermes-agent)，支持 iOS 和 Android。

<p align="center">
  <a href="https://apps.apple.com/app/id6759597015">
    <img src="./assets/clawket-app-store.png" alt="扫码前往 Clawket App Store 下载页" width="180" />
  </a>
</p>
<p align="center">
  <strong>扫码即可在 iPhone 上打开 <a href="https://apps.apple.com/app/id6759597015">App Store</a>。</strong>
</p>
```
- **After:**
```markdown
<p align="center">
  <img src="./assets/clawket-hero.png" alt="WednesdayAI Mobile" />
</p>

# WednesdayAI Mobile

[![npm version](https://img.shields.io/npm/v/@p697/clawket)](https://www.npmjs.com/package/@p697/clawket)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[Follow on X](https://x.com/cavano697)

[English README](./README.md)

WednesdayAI Mobile 是一个开源的移动端应用，用来随时随地管理 WednesdayAI 以及兼容的 AI Agent 后端。本仓库是 Clawket 的 hard fork，保留 OpenClaw 传承，同时将 WednesdayAI Mobile 作为主要产品方向。目前同时支持 [OpenClaw](https://github.com/openclaw/openclaw) 和 [Hermes](https://github.com/NousResearch/hermes-agent)，支持 iOS 和 Android。

<p align="center">
  <a href="https://apps.apple.com/app/id6759597015">
    <img src="./assets/clawket-app-store.png" alt="扫码打开 WednesdayAI Mobile App Store 页面" width="180" />
  </a>
</p>
<p align="center">
  <strong>扫码即可在 iPhone 上打开 <a href="https://apps.apple.com/app/id6759597015">App Store</a>。</strong>
</p>
```

- **File:** `README.zh-CN.md`
- **Anchor:** `## 核心特性` bullet list.
- **Before:**
```markdown
- **📱 OpenClaw 移动端** — 聊天、管理 Agent、配置模型、设置定时任务、监控 Session，全部在手机上完成
```
- **After:**
```markdown
- **📱 WednesdayAI 与兼容后端的移动控制台** — 聊天、管理 Agent、配置模型、设置定时任务、监控 Session，全部在手机上完成
```

- **File:** `README.zh-CN.md`
- **Anchor:** connection-path introduction under the architecture diagram.
- **Before:**
```markdown
Clawket 支持两种连接方式：
```
- **After:**
```markdown
WednesdayAI Mobile 当前继承 Clawket 的两种连接方式：
```

- **File:** `README.zh-CN.md`
- **Anchor:** `## 工作方式` numbered list and current pairing behaviour intro.
- **Before:**
```markdown
3. 用 Clawket App 扫描二维码，信任该设备。
```
- **After:**
```markdown
3. 用 WednesdayAI Mobile App 扫描二维码，信任该设备。
```

- **File:** `README.zh-CN.md`
- **Anchor:** current pairing behaviour bullet.
- **Before:**
```markdown
- 如果机器上同时有 OpenClaw 和 Hermes，Clawket 会分别输出两个二维码，并明确标注对应后端。
```
- **After:**
```markdown
- 如果机器上同时有 OpenClaw 和 Hermes，bridge 会分别输出两个二维码，并明确标注对应后端。
```

- **File:** `README.zh-CN.md`
- **Anchor:** `## 自托管` opening paragraph.
- **Before:**
```markdown
Clawket 的公共仓库默认就可以 clone 下来自行运行，不依赖官方托管后端。你既可以使用自己运营的 Relay 模式，也可以直接使用 LAN、Tailscale 或自定义 URL 的直连模式。
```
- **After:**
```markdown
WednesdayAI Mobile 的公共仓库默认就可以 clone 下来自行运行，不依赖官方托管后端。在 hard-fork 过渡期间，仓库会有意保留当前 Clawket 包名、命令和 Relay 默认值，直到后续通过范围明确的兼容性迁移来调整。你既可以使用自己运营的 Relay 模式，也可以直接使用 LAN、Tailscale 或自定义 URL 的直连模式。
```

## Allowed moves
- Edit only the exact README anchors listed above.
- Keep `@p697/clawket`, `clawket pair`, `CLAWKET_REGISTRY_URL`, relay examples, proprietary module path, asset filenames, and App Store URL unchanged.
- Keep OpenClaw, Hermes, and YouMind names where they describe compatibility, setup, pairing, or heritage.
- Follow the naming rule from task 000: README/repository docs use `WednesdayAI Mobile`.
- Do not edit package metadata, app config, source code, release files, or external repositories.

## STOP triggers
- The edit would change public package names, CLI commands, registry environment variables, relay domains, native IDs, or App Store listing IDs.
- A README change is made in only one language file.
- A remaining Clawket/OpenClaw/Hermes/YouMind hit cannot be classified as attribution, compatibility, current package/command/path, persisted data, or pending follow-up.
- The task requires renaming or replacing image assets.

## Manual verification (record in decisions-ledger)
- `git diff --name-only -- README.md README.zh-CN.md` prints exactly `README.md` and `README.zh-CN.md`.
- `rg -n "WednesdayAI Mobile|hard fork|OpenClaw|Hermes|@p697/clawket|clawket pair|CLAWKET_REGISTRY_URL" README.md README.zh-CN.md` returns matches.
- `rg -n "Clawket|OpenClaw|Hermes|YouMind" README.md README.zh-CN.md` is reviewed and every remaining hit is classified in the decisions ledger.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-brand-conversion-implementation 001` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-brand-conversion-implementation/decisions-ledger.md`.
