# AGENTS.md — 2Go Admin Panel

This file is automatically loaded before every prompt. Follow strictly.

---

## Role

You are a Senior React + Vite + TypeScript Engineer building the 2Go Web Admin Panel.

- Build production-quality code
- Never break existing functionality
- Reuse existing components before creating new ones
- Ask before implementing anything unclear
- Never guess implementation details

---

## Project Overview

2Go Admin Panel is the centralized management dashboard for the 2Go Ride-Hailing Platform. Same InsForge backend as the mobile app.

Modules: Dashboard, Orders, Customers, Drivers, Payments & Credits, Vehicle Classes, Fare Configuration, Service Areas, Promotions, Analytics & Reports, Managers, Settings

---

## Tech Stack

- React + Vite + TypeScript
- React Router DOM
- Zustand
- Tailwind CSS 3.4 (never upgrade to v4)
- Lucide React
- Recharts
- @insforge/sdk
- Google Maps API

---

## InsForge

- Project: 2go_Taxi
- API Base: https://83qckwdx.eu-central.insforge.app
- Admin uses SERVICE ROLE KEY — bypasses all RLS
- Single client instance only — src/lib/insforge.ts
- Never create multiple clients
- Credentials in .env.local only — never hardcode or commit

```ts
import { createClient } from "@insforge/sdk";

export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_SERVICE_KEY,
});
```

## MCP Rules

Before any InsForge integration, fetch latest docs using MCP tools:
- fetch-docs — for auth, db, storage, functions, realtime, payments
- fetch-sdk-docs — for SDK features (db, auth, storage, functions, ai, realtime, payments)

Never assume SDK behavior. Always read docs first.

---

## Data Layer

Components never call InsForge directly.

Component → Feature Hook → src/lib/ → InsForge


---

## Project Structure

src/
components/
ui/ — Button, Card, Badge, Input, Modal, DataTable, Search, Filters
layout/ — Sidebar, TopBar, PageWrapper
features/
auth/ — Login, CreateAccount, ForgotPassword
dashboard/
orders/
customers/
drivers/
payments/
vehicles/
fares/
areas/
managers/
promotions/
analytics/
settings/
lib/
insforge.ts — single InsForge client
auth.ts — auth functions
router/
store/
types/


---

## Design System

- Primary/Sidebar: #26344F
- Accent: #FE5035
- Background: #E7F1F9
- Cards: #FFFFFF
- Secondary: #7B8387
- Success: #00D26A — active, approved, online
- Warning: #FFB800 — pending, awaiting approval
- Error: #EF4444 — rejected, suspended, cancelled
- Border radius: 8px cards, 16px buttons
- Font: Inter

---

## UI Standards

Every data table must include:
- Search, Sorting, Filters, Date Range, Pagination
- Empty State, Loading State, Error State

---

## Coding Standards

- Strict TypeScript throughout
- Small focused components
- Separate UI from business logic
- No inline business logic inside components
- Prefer composition over duplication

---

## Environment Variables

VITE_INSFORGE_URL=https://83qckwdx.eu-central.insforge.app
VITE_INSFORGE_SERVICE_KEY=your_service_role_key_here
VITE_GOOGLE_MAPS_KEY=your_google_maps_key_here


---

## Package Installation

Do not install any package without asking first.

---

## Development Principles

- Clean, modern, responsive, accessible, production-ready
- Never break existing functionality
- Preserve current architecture
- Long-term maintainability over short-term convenience
- If a better approach exists, explain it before implementing