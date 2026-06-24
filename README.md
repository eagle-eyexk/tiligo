# TiliGo 🛵 — Dërgesa #1 në Kosovë

Multi-sided delivery platform (Customer / Business / Courier) inspired by Wolt. Dark neon-green theme, full Albanian localization, iOS-grade glassmorphism, live order tracking, Apple Smart App Banner.

**Selia:** VICIANA 4, Vushtrri, Kosovë 🇽🇰
**Web:** https://tili-go.com · **Facebook:** https://www.facebook.com/tiligoo
**iOS App Store ID:** `6740427580`

## Stack
- React + Vite + Tailwind CSS + shadcn/ui
- Base44 BaaS (auth, entities, realtime, integrations)
- Leaflet (live courier map) + Apple Maps deep-links
- iOS/PWA ready — same codebase publishes to App Store

## Roles & auth (fully separated)
| Role | Register | Login | Dashboard |
|---|---|---|---|
| Customer | `/register` | `/login` | `/orders`, `/profile` |
| Business | `/business/register` | `/business/login` | `/business-dashboard` (role-guarded) |
| Courier | `/courier/register` | `/courier/login` | `/courier-dashboard` (role-guarded) |
| Admin | hidden | obfuscated `/x-9f3a-c0ntr0l-console` | console |

Guests can browse & order without an account.

## Entities
`Business`, `Product`, `Combo`, `Coupon`, `Order`, `CourierProfile`, `Address`, `Review`

## iOS signing
See [`ios-signing/`](./ios-signing) for the complete App Store certificate / provisioning / App Store Connect API credential list and publishing steps.

## Develop
```bash
npm install
npm run dev
```

© 2026 TiliGo Delivery L.L.C. — ARBK 812426957 — Vushtrri, Republika e Kosovës.