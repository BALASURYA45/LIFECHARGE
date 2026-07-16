# API Specification

Base backend URL:

```text
http://localhost:5000/api
```

Authentication endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| POST | `/auth/forgot-password` | Start password reset |
| POST | `/auth/reset-password/:token` | Complete password reset |
| GET | `/auth/profile` | Get authenticated user profile |
| PATCH | `/auth/profile` | Update authenticated user profile |

Planned feature endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/battery/add` | Add battery dataset record |
| GET | `/battery/history` | List user battery records |
| POST | `/predict` | Generate SOH and RUL prediction |
| GET | `/predictions` | List prediction history |
| GET | `/recommendations` | Get recommendations |
| GET | `/report/pdf` | Generate PDF report |

Implemented:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Backend health check |
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| POST | `/auth/forgot-password` | Start password reset |
| POST | `/auth/reset-password/:token` | Complete password reset |
| GET | `/auth/profile` | Get authenticated user profile |
| PATCH | `/auth/profile` | Update authenticated user profile |
