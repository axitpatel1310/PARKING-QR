# 🚗 QR-Based Parking

Stateless, **geofenced QR check-in/out** system built on **Next.js (App Router)**.  
Scan a QR at the gate → phone shares location → server verifies signed token + geofence → records entry.

---

## ✨ Features

- 🔒 **Signed tokens** (JWT HS256) with short TTL & unique `jti`
- 📍 **Geofence verification** with accuracy-aware rule
- 📱 **Mobile-first** flow (user gesture + in-app browser fallback)
- 🛰️ **Debug pages** and rich error UI (`/sorry`)
- 🗺️ **Configurable** lot center & radius from DB or token
- 🔐 **Admin routes** guarded by middleware (`cookie isAdmin=true`)

---

## 🧰 Tech Stack

- **Next.js** (App Router) – Node runtime for JWT signing  
- **TypeScript**  
- **Prisma** (Settings table for lot center & radius)  
- **jsonwebtoken** (or `jose` if running on edge)  
- **qrcode** (for QR image generation)

---

## 🚀 Quick Start

### 1️⃣ Clone & Install

```bash
pnpm i   # or npm i / yarn
