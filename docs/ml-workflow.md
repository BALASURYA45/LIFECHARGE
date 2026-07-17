# Machine Learning Workflow

The ML module will use historical battery datasets only. No IoT integration is required.

## Implemented Pipeline

1. Validate dataset columns.
2. Clean invalid, duplicate, and missing values.
3. Split training and validation data.
4. Train Random Forest, XGBoost, and LightGBM models.
5. Evaluate models using MAE, RMSE, R2, and cross-validation.
6. Select the best model automatically.
7. Save the model and preprocessing pipeline with Joblib.
8. Store model metadata and recent training history.

## Sample Dataset

Module 4 includes a temporary sample supervised dataset:

```text
ml-service/app/data/sample/battery_training_sample.csv
```

This file contains the required input features plus target columns:

- `SOH`
- `RUL`

Replace this sample file or pass another dataset path once real historical data is available.

## Pending For Later Modules

- SHAP explainability
- What-if analysis integration
- Recommendation engine integration

## Prediction

Module 5 loads the saved `best_model.joblib` bundle and predicts:

- `SOH`
- `RUL`
- battery status
- confidence score
- degradation trend

If no trained model exists, the ML API returns a clear error asking the user to train a model first.

## Explainable AI

Module 6 explains individual predictions using SHAP when possible. If SHAP cannot explain a model cleanly in the local environment, the system falls back to trained model feature importances.

Explanation output includes:

- feature importance
- top negative factors
- top positive factors
- plain-English explanation

## Recommendation Engine

Module 7 generates rule-based recommendations from prediction results and input features.

Recommendation signals include:

- low SOH
- low RUL
- high fast charging usage
- high average temperature
- SOC outside the 20-80 percent range
- high charging frequency
- long charging duration
- high daily distance
- high charging cycle count

## Target Outputs

- State of Health
- Remaining Useful Life
- Battery status
- Prediction confidence
- Degradation trend
- Feature importance
- Recommendations
