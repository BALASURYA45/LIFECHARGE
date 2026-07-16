# Architecture

LIFECHARGE uses a three-service architecture:

```text
React Frontend -> Express Backend -> Flask ML Service -> MongoDB Atlas
```

## Frontend

The frontend is responsible for user interaction, dashboards, forms, charts, route protection, report views, and what-if simulation screens.

## Backend

The backend is the secure gateway for the system. It handles authentication, authorization, validation, persistence, report generation, and calls to the ML service.

## ML Service

The ML service owns data cleaning, feature engineering, model training, prediction, explainability, and recommendation logic.

## Database

MongoDB Atlas stores users, uploaded battery records, predictions, and report metadata.

## Service Boundary Rule

The frontend calls only the Express backend. The backend calls the Flask ML service. This keeps security, validation, and audit trails centralized.
