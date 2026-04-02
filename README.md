# 🍔 Online Food Delivery

A full-stack food delivery web application with a customer-facing storefront, an admin dashboard, and a RESTful backend API.

## Overview

| Part | Tech Stack | Port |
|------|-----------|------|
| [Frontend](./frontend/README.md) | React 19, Vite, Axios, Firebase | 5173 |
| [Backend](./backend/README.md) | Node.js, Express, MongoDB, Stripe | 4000 |
| Admin | React 18, Vite, Axios | 5174 |

## Features

### Customer App
- Browse and search food items by category
- Shopping cart with real-time totals
- User registration & login (email/password)
- Social login via Google and Facebook (Firebase)
- Place orders — Stripe payment or Cash on Delivery
- Order history & live status tracking
- Animated page transitions, fully responsive layout

### Admin Dashboard
- Add, edit, and remove food items (with image upload)
- View and manage all orders
- Update order status

### Backend API
- JWT-based authentication
- OOP architecture (controllers, services, models as classes)
- Image uploads via Cloudinary
- Stripe payment integration
- Rate limiting

## Prerequisites

- **Node.js** v16+
- **MongoDB** v5+
- A **Stripe** account (for card payments)
- A **Firebase** project (for social login — optional)
- A **Cloudinary** account (for image uploads)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/hisham2028/Online_Food_DeliVary.git
cd Online_Food_DeliVary
```

### 2. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env   # then edit .env with your credentials
npm run dev
```

Key environment variables (`backend/.env`):

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `PORT` | Server port (default `4000`) |
| `FRONTEND_URL` | Customer app URL (default `http://localhost:5173`) |

### 3. Set up the Frontend

```bash
cd frontend
npm install
cp .env.example .env   # then add Firebase credentials
npm run dev
```

### 4. Set up the Admin Panel

```bash
cd admin
npm install
npm run dev
```

The admin panel runs on `http://localhost:5174` by default.

## Project Structure

```
Online_Food_DeliVary/
├── frontend/   # Customer-facing React app
├── backend/    # Express REST API (OOP architecture)
└── admin/      # Admin React dashboard
```

## Scripts

| Directory | Command | Description |
|---|---|---|
| `backend` | `npm run dev` | Start API with auto-reload |
| `backend` | `npm start` | Start API in production mode |
| `frontend` | `npm run dev` | Start dev server |
| `frontend` | `npm run build` | Production build |
| `frontend` | `npm run test` | Run unit tests |
| `admin` | `npm run dev` | Start admin dev server |
| `admin` | `npm run build` | Production build |

## API Reference

See [backend/README.md](./backend/README.md) for the full list of API endpoints.

## License

ISC
