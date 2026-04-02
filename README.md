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

## API Referene
# Food Delivery Backend - OOP Architecture

## Installation Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Step 1: Clone/Download the Project
```bash
cd food-delivery-oop
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
```bash
cp .env.example .env
```

Edit the `.env` file and update the following variables:
```
MONGODB_URI=mongodb://localhost:27017/food-delivery
JWT_SECRET=your_secure_random_string_here
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### Step 4: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For Linux/Mac
sudo systemctl start mongod

# For Windows (if installed as service)
net start MongoDB
```

### Step 5: Run the Application

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:4000`

### Step 6: Test the API
Open your browser or Postman and navigate to:
```
http://localhost:4000
```

You should see: "API Working Successfully"

## API Endpoints

### User Routes (`/api/user`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (requires auth)

### Food Routes (`/api/food`)
- `POST /add` - Add food item (with image upload)
- `GET /list` - Get all food items
- `POST /remove` - Remove food item
- `PUT /update/:id` - Update food item
- `GET /search` - Search food items

### Cart Routes (`/api/cart`)
- `POST /add` - Add item to cart (requires auth)
- `POST /remove` - Remove item from cart (requires auth)
- `POST /get` - Get user cart (requires auth)
- `POST /clear` - Clear cart (requires auth)

### Order Routes (`/api/order`)
- `POST /place` - Place new order (requires auth)
- `POST /verify` - Verify payment
- `POST /userorders` - Get user orders (requires auth)
- `GET /list` - Get all orders
- `POST /status` - Update order status
- `GET /:id` - Get order by ID
- `POST /cancel` - Cancel order (requires auth)

## Project Structure
```
food-delivery-oop/
├── src/
│   ├── config/
│   │   └── Database.js
│   ├── controllers/
│   │   ├── CartController.js
│   │   ├── FoodController.js
│   │   ├── OrderController.js
│   │   └── UserController.js
│   ├── middleware/
│   │   └── AuthMiddleware.js
│   ├── models/
│   │   ├── FoodModel.js
│   │   ├── OrderModel.js
│   │   └── UserModel.js
│   ├── routes/
│   │   ├── CartRoute.js
│   │   ├── FoodRoute.js
│   │   ├── OrderRoute.js
│   │   └── UserRoute.js
│   ├── services/
│   │   └── StripeService.js
│   └── server.js
├── uploads/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## OOP Architecture Overview

This project uses Object-Oriented Programming principles:

- **Classes**: All controllers, models, routes, and services are implemented as classes
- **Singleton Pattern**: Models, controllers, and services are exported as singleton instances
- **Separation of Concerns**: Each class has a single responsibility
- **Encapsulation**: Private methods and properties where appropriate
- **Dependency Injection**: Services are injected into controllers

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify MongoDB is accessible on the specified port

### Port Already in Use
- Change PORT in .env file
- Or kill the process using port 4000

### Stripe Errors
- Verify STRIPE_SECRET_KEY is correct
- Ensure Stripe account is properly configured

### Upload Errors
- Ensure `uploads/` directory exists
- Check write permissions on uploads directory

## Notes
- Default port: 4000
- Images are stored in `/uploads` directory
- JWT tokens expire after 7 days
- Minimum password length: 6 characters

## License

ISC
