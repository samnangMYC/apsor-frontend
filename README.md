# Apsor Frontend

Frontend application for Apsor, built with React, Vite, Tailwind CSS, and React Router.

## Prerequisites

- Node.js 20+
- npm 10+

## Development

```bash
npm install
npm run dev
```

## Development on Local Network

Run the Vite dev server so other devices on the same Wi-Fi/LAN can open it:

```bash
npm run dev:lan
```

Then open:

```text
http://172.20.10.2:5173
```

Notes:
- Your phone or laptop must be on the same local network as this machine.
- If the frontend talks to a backend, `VITE_BACKEND_URL` must also be reachable from other devices. Do not use `localhost` there unless the backend is running on the same device as the browser.
- If your firewall blocks inbound connections, allow port `5173`.

## Build and Preview

```bash
npm run build
npm run preview
```

To preview the production build on the local network:

```bash
npm run build
npm run preview:lan
```

Then open:

```text
http://172.20.10.2:4173
```

## Lint

```bash
npm run lint
```
