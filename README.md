# LIFECHARGE

AI-Based Battery Health Prediction and Predictive Maintenance System for Electric Vehicles.

LIFECHARGE is a full-stack final year project and research-oriented application for predicting EV battery State of Health (SOH), Remaining Useful Life (RUL), degradation trends, and maintenance recommendations from historical battery datasets.

## Architecture

```text
React Frontend
    |
    v
Express Backend
    |
    v
Python Flask ML API
    |
    v
MongoDB Atlas
```

The Express backend is the main application gateway. It handles authentication, validation, persistence, reports, and communication with the ML service. The React frontend does not call the ML service directly.

## Modules

1. Project Setup
2. Authentication
3. Battery Dataset Management
4. Machine Learning
5. Prediction
6. Explainable AI
7. Recommendation Engine
8. What-If Analysis
9. Dashboard
10. Reports

## Repository Structure

```text
LifeCharge/
  frontend/     React, Vite, Tailwind CSS
  backend/      Node.js, Express, MongoDB API
  ml-service/   Python, Flask, ML and XAI service
  docs/         Architecture, API, database, ML, deployment docs
```

## Local Setup

Copy each `.env.example` file to `.env` in the same folder before running services.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### ML Service

```bash
cd ml-service
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python run.py
```

## Default Local Ports

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- ML Service: `http://localhost:8000`

## Current Status

Module 1: Project Setup is complete.
Module 2: Authentication is complete.
Module 3: Battery Dataset Management is complete.
Module 4: Machine Learning is complete with a sample dataset.
Module 5: Prediction is complete.
Module 6: Explainable AI is complete.
Module 7: Recommendation Engine is complete.
Module 8: What-If Analysis is complete.
Module 9: Dashboard is complete.

Next module: Reports.
