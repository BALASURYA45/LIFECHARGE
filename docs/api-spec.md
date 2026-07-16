# API Specification

Base backend URL:

```text
http://localhost:5000/api
```

Planned endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| POST | `/auth/forgot-password` | Start password reset |
| POST | `/auth/reset-password` | Complete password reset |
| POST | `/battery/add` | Add battery dataset record |
| GET | `/battery/history` | List user battery records |
| POST | `/predict` | Generate SOH and RUL prediction |
| GET | `/predictions` | List prediction history |
| GET | `/recommendations` | Get recommendations |
| GET | `/report/pdf` | Generate PDF report |

Implemented in Module 1:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Backend health check |
