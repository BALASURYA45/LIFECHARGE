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

Battery dataset endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/battery/add` | Add battery dataset record |
| GET | `/battery/history` | List user battery records |
| GET | `/battery/:id` | Get one battery record |
| PATCH | `/battery/:id` | Update one battery record |
| DELETE | `/battery/:id` | Delete one battery record |
| POST | `/battery/upload-csv` | Upload battery dataset CSV |

Planned feature endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/recommendations` | Get recommendations |
| GET | `/report/pdf` | Generate PDF report |

Prediction endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/predict` | Generate SOH and RUL prediction |
| GET | `/predictions` | List prediction history |
| GET | `/predictions/:id` | Get one prediction |

Explainable AI endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/explain/:predictionId` | Generate and store explanation for a prediction |
| GET | `/explain/:predictionId` | Get stored explanation for a prediction |

Recommendation endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/recommendations` | Get latest prediction recommendations |
| POST | `/recommendations/:predictionId` | Generate recommendations for a prediction |
| GET | `/recommendations/:predictionId` | Get stored recommendations for a prediction |

What-if endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/what-if/simulate` | Compare baseline and scenario battery predictions |

Dashboard endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/dashboard/summary` | Get dashboard analytics summary |

Machine learning endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/ml/train` | Train and compare ML models |
| GET | `/ml/models/current` | Get current best trained model metadata |
| GET | `/ml/training-history` | Get recent training runs |
| POST | `/predict` | Generate SOH and RUL prediction |
| GET | `/predictions` | List prediction history |
| GET | `/predictions/:id` | Get one prediction |
| POST | `/explain/:predictionId` | Generate and store explanation for a prediction |
| GET | `/explain/:predictionId` | Get stored explanation for a prediction |
| GET | `/recommendations` | Get latest prediction recommendations |
| POST | `/recommendations/:predictionId` | Generate recommendations for a prediction |
| GET | `/recommendations/:predictionId` | Get stored recommendations for a prediction |
| POST | `/what-if/simulate` | Compare baseline and scenario battery predictions |
| GET | `/dashboard/summary` | Get dashboard analytics summary |

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
| POST | `/battery/add` | Add battery dataset record |
| GET | `/battery/history` | List user battery records |
| GET | `/battery/:id` | Get one battery record |
| PATCH | `/battery/:id` | Update one battery record |
| DELETE | `/battery/:id` | Delete one battery record |
| POST | `/battery/upload-csv` | Upload battery dataset CSV |
| POST | `/ml/train` | Train and compare ML models |
| GET | `/ml/models/current` | Get current best trained model metadata |
| GET | `/ml/training-history` | Get recent training runs |
