# Chat — Native AI Orchestrator (KAT-Orchestrator v2.5)

A production-ready native AI-orchestration app: a React Native (Expo) frontend,
an AI API Gateway, and real tool integrations for local CLI / external API /
custom SDK access.

Chat history is routed to **Kwaipilot KAT-Coder-Air V2.5** through OpenRouter's
OpenAI-compatible layer. The model processes automated tool calls, executes
local CLI / network / SDK tasks on the gateway host, and streams JSON results
back to the phone, where **generative-UI tool cards** render live status for
every invocation.

```
┌─────────────────────┐   UIMessage stream (SSE)   ┌──────────────────────┐
│  app/               │ ─────────────────────────▶ │  server/             │
│  Expo + React Native│                            │  Hono gateway        │
│  @ai-sdk/react      │ ◀───────────────────────── │  Vercel AI SDK v7    │
│  useChat + cards    │   text + tool-* parts      │  ├─ executeCliCommand│
└─────────────────────┘                            │  ├─ fetchExternalApi │
                                                   │  └─ triggerSdkMethod │
                                                   └──────────┬───────────┘
                                                              ▼
                                              OpenRouter (kwaipilot/kat-coder-air-v2.5)
```

## Repository layout

| Path | Description |
| --- | --- |
| `app/` | Expo (SDK 57) TypeScript app — dark-themed chat UI with generative tool cards |
| `server/` | Node.js AI gateway — streams responses and executes tools on the host |

## 1. Run the gateway

```bash
cd server
cp .env.example .env       # then paste your OPENROUTER_API_KEY
npm install
npm run dev                # listens on http://0.0.0.0:8081
```

Check `GET /api/health` to confirm model + auth configuration.

> The chat handler is a serverless-compatible `POST(req: Request) => Response`
> function (`server/src/chat.ts`), so it can also be dropped into a Next.js /
> Vercel route as-is.

## 2. Run the mobile app

```bash
cd app
npm install
npx expo start             # scan the QR code, or press i / a
```

The app points at `http://localhost:8081/api/chat` by default
(`http://10.0.2.2:8081/api/chat` on Android emulators). Override with Expo
public env vars:

```bash
# Physical device: use your machine's LAN IP
EXPO_PUBLIC_CHAT_API_URL=http://192.168.1.20:8081/api/chat npx expo start
# If the gateway has ORCHESTRATOR_API_TOKEN set:
EXPO_PUBLIC_API_TOKEN=<token> npx expo start
```

> `react-native-get-random-values` and `lucide-react-native` are native modules.
> They work in Expo Go where the module is bundled; otherwise run a development
> build (`npx expo run:ios` / `npx expo run:android`).

## The tools

| Tool | What it does | Guardrails |
| --- | --- | --- |
| `executeCliCommand` | Runs shell commands on the gateway host | Blocklist of catastrophic patterns, optional `CLI_ALLOWLIST` prefix allowlist, 30 s timeout, 1 MB buffer, disable with `ENABLE_CLI_TOOL=false` |
| `fetchExternalApi` | Dispatches REST calls (`GET/POST/PUT/DELETE`) | SSRF guard blocks localhost / private / metadata hosts unless `ALLOW_INTERNAL_NETWORKS=true` |
| `triggerSdkMethod` | Bridge for internal SDK clients (`service` + `action` + `payload`) | Extensible handler registry via `registerSdkHandler(service, handler)`; unregistered services fall back to a mock |

## Configuration (server/.env)

| Variable | Default | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | — | **Required.** OpenRouter key |
| `CHAT_MODEL` | `kwaipilot/kat-coder-air-v2.5` | Any OpenRouter model id |
| `MAX_TOOL_STEPS` | `6` | Model ↔ tool round trips per turn |
| `PORT` / `HOST` | `8081` / `0.0.0.0` | Gateway binding |
| `ORCHESTRATOR_API_TOKEN` | empty | Bearer-token guard for `/api/chat` (open when empty!) |
| `CLI_ALLOWLIST` | empty | e.g. `git ,docker ,npm run` |
| `CLI_TIMEOUT_MS` | `30000` | Per-command timeout |
| `ALLOW_INTERNAL_NETWORKS` | `false` | Let `fetchExternalApi` reach private ranges |

## Security notes

The gateway executes real commands on the machine that runs it — that is the
point of the app, and the risk. The bundled guards (keyword blocklist, optional
allowlist, SSRF filter, optional bearer token) are sensible defaults for
**local development**, not a hardened sandbox. Before exposing the gateway
beyond your machine:

1. Set `ORCHESTRATOR_API_TOKEN` (and mirror it as `EXPO_PUBLIC_API_TOKEN`).
2. Populate `CLI_ALLOWLIST` with the command prefixes you actually need.
3. Keep `ALLOW_INTERNAL_NETWORKS=false`.
4. Run the gateway in a container / VM if you want real isolation.

## Roadmap / next steps

- [ ] Wire a live AWS or Firebase SDK into `triggerSdkMethod` via `registerSdkHandler`
- [ ] Integrate NativeWind (Tailwind CSS) styling in the app
- [ ] Replace the bearer-token guard with real auth middleware (JWT/session)
