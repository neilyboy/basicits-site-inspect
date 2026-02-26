# Site Inspect - Verkada Installation Survey Tool

A mobile-first Progressive Web App for documenting site inspections for Verkada security hardware installations.

## Features

- **Mobile-First Design** — Optimized for in-the-field use on phones and tablets
- **Photo Capture & Annotation** — Take photos, add text labels and device markers
- **Voice-to-Text Notes** — Quickly dictate notes hands-free
- **Verkada Product Categories** — Cameras, Access Control, Intercoms, Alarms, Sensors, IDF/MDF, and more
- **PDF Export** — Generate professional reports to share with the team
- **Offline Support** — Works without cell service, syncs when reconnected
- **Desktop Review** — Clean desktop view for back-at-the-office reference

## Quick Start with Docker

```bash
docker-compose up -d --build
```

Access the app at `http://your-server-ip:3456`

## Development

### Prerequisites
- Node.js 20+
- npm

### Server
```bash
cd server
npm install
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

## Architecture

- **Frontend**: React + Vite + TailwindCSS (PWA)
- **Backend**: Node.js + Express
- **Database**: SQLite (via better-sqlite3)
- **Container**: Docker with docker-compose

## Verkada Product Categories

| Category | Examples |
|----------|----------|
| Cameras | Dome, Bullet, Fisheye, PTZ, Mini, Multisensor |
| Access Control | Door Controllers, Card Readers, Smart Locks, REX |
| Intercoms | Video Intercom, SIP Intercom |
| Alarms | Panels, Door/Motion/Glass Break Sensors, Panic Buttons |
| Environmental | Air Quality, Temperature/Humidity Sensors |
| Network/IDF/MDF | IDF Closets, MDF Closets, Network Switches |
| Viewing Station | Verkada Viewing Station |
| Guest Management | Visitor Kiosks |
