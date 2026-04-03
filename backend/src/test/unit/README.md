# Backend Unit Tests

## Setup

```bash
npm install --save-dev jest @babel/core @babel/preset-env babel-jest
```

Add to your `package.json`:

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watchAll"
  },
  "jest": {
    "transform": {
      "^.+\\.js$": "babel-jest"
    },
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^(\\.{1,2}/.*)\\.js$": "$1"
    },
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "controllers/**/*.js",
      "middleware/**/*.js",
      "models/**/*.js",
      "factories/**/*.js",
      "strategies/**/*.js"
    ]
  }
}
```

Create `babel.config.json` in your project root:

```json
{
  "presets": [
    ["@babel/preset-env", { "targets": { "node": "current" } }]
  ]
}
```

## Test Files

| File | What's covered |
|---|---|
| `AuthMiddleware.test.js` | Token validation, generation, missing/expired tokens |
| `FoodController.test.js` | All 5 endpoints: add, list, update, remove, search |
| `OrderController.test.js` | All 7 endpoints: place, verify, userOrders, list, status, getById, cancel |
| `UserController.test.js` | login, register, getUserProfile — success & error paths |
| `CartController.test.js` | add, remove, get, clear — success & error paths |
| `PaymentStrategy.test.js` | BaseStrategy, CardStrategy (Stripe), CodStrategy, PaymentProcessor context |
| `Models.UploadFactory.test.js` | Mongoose query delegation, UploadMiddlewareFactory presets & fileFilter logic |

## Run

```bash
npm test
```

## Key Patterns

- **All external dependencies are mocked** — no real DB, no real Stripe, no real file system.
- **Every controller** is tested for both the happy path and common error paths (404, 400, 500).
- **PaymentProcessor** tests cover strategy switching, chaining, and unknown methods.
- **UploadMiddlewareFactory** tests cover all three presets, custom strategies, and the fileFilter accept/reject logic.
