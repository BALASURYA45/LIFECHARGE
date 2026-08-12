# LIFECHARGE

AI-Based Battery Health Prediction and Predictive Maintenance System for Electric Vehicles.

## Developer Setup

1. Install dependencies

   ```bash
   npm install
   npm install --prefix frontend
   npm install --prefix backend
   python -m pip install -r ml-service/requirements.txt
   ```

2. Run locally

   ```bash
   npm run dev:frontend
   npm run dev:backend
   npm run dev:ml
   ```

3. Run tests

   ```bash
   npm test
   ```

4. Build for production

   ```bash
   npm run build:frontend
   ```

## Docker / Local Container Setup

```bash
docker compose up --build
```

The services exposed locally will be:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- ML service: `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017`

## CI Pipeline

A GitHub Actions workflow is included at `.github/workflows/ci.yml`. It runs:

- frontend lint and build
- backend lint and tests
- ML service syntax checks

## Enhanced Version - Major Upgrades

### What's New

- **Realistic EV Dataset**: Physics-informed dataset generator covering Tesla, Nissan, BMW, Hyundai, BYD, Ather and more
- **Advanced ML Pipeline**: 8+ models with stacking ensembles, AutoML-style hyperparameter tuning
- **Physics-Informed Features**: 15 engineered features including degradation rate, thermal/cyclic stress scores
- **Enhanced Predictions**: Anomaly detection, prognosis scenarios, confidence intervals, baseline comparison
- **Improved Explainability**: SHAP-based explanations with support for advanced feature set
- **Higher Accuracy**: Target R² > 0.95 for SOH, > 0.90 for RUL

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

## Enhanced Modules

1. Realistic EV Dataset Generator
2. Advanced ML Pipeline with Ensembles
3. Enhanced Prediction Analytics
4. Explainable AI with SHAP
5. Anomaly Detection
6. Prognosis Scenarios
7. Confidence Intervals
8. Baseline Performance Comparison

## Dataset Sources

- NASA P CoE Battery Dataset (18650 cells)
- Real-world EV specifications (10+ vehicle models)
- Chemistry-specific degradation models (NMC, LFP, LMO)
- Temperature and fast-charging stress scenarios

## Training the Enhanced Models

### Option 1: Generate dataset + train

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Generate realistic dataset and train
python app/data/scripts/train_enhanced.py
```

### Option 2: Train from available dataset

```bash
cd ml-service
python app/data/scripts/prepare_nasa_dataset.py
python -m app.data.scripts.train_enhanced
```

### Model Performance

The enhanced pipeline typically achieves:
- **SOH R²**: 0.92 - 0.97
- **RUL R²**: 0.88 - 0.94
- **MAE**: 2-4% for SOH, 3-6 months for RUL

## Enhanced Prediction Features

### Backend Enhancements
- `enhanced_prediction.service.js`: Computes degradation rate, thermal/cyclic stress, anomaly detection, prognosis scenarios, confidence intervals, baseline comparison
- Updated `Prediction` model schema with `enhancements` field
- ML service routing to enhanced pipeline for realistic datasets

### Frontend Enhancements
- Performance Analytics section with thermal/cyclic stress gauges
- Projected service life display
- Confidence interval ranges for SOH/RUL
- Anomaly detection badge with risk factors
- Prognosis scenarios (Optimal/Moderate/Harsh)
- Enhanced visualizations with progress bars

## Testing

```bash
cd ml-service
python -m app.data.scripts.test_enhanced
```

## Running the Application

### ML Service

```bash
cd ml-service
python run.py
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Default Local Ports

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- ML Service: `http://localhost:8000`

## Project Structure

```
LifeCharge/
  frontend/     React, Vite, Tailwind CSS
  backend/      Node.js, Express, MongoDB API
  ml-service/   Python, Flask, ML and XAI service
  docs/         Architecture, API, database, ML, deployment docs
```

## Current Status

- Module 1-10: Complete
- Enhanced ML Pipeline: Complete
- Realistic Dataset Generator: Complete
- Enhanced Analytics: Complete
- Testing Suite: Complete

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide Icons
- i18n Support (EN/TA/HI)

### Backend
- Node.js
- Express
- MongoDB/Mongoose
- JWT Authentication

### ML Service
- Python 3.9+
- Flask
- scikit-learn
- pandas, numpy
- SHAP for explainability
- Optional: XGBoost, LightGBM