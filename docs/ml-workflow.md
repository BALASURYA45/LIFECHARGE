# Machine Learning Workflow

The ML module will use historical battery datasets only. No IoT integration is required.

## Planned Pipeline

1. Validate dataset columns.
2. Clean invalid, duplicate, and missing values.
3. Engineer battery degradation features.
4. Split training and validation data.
5. Train Random Forest, XGBoost, and LightGBM models.
6. Evaluate models using MAE, RMSE, R2, and cross-validation.
7. Select the best model automatically.
8. Save the model and preprocessing pipeline with Joblib.
9. Generate SHAP explanations for global and local interpretability.
10. Serve predictions through the Flask API.

## Target Outputs

- State of Health
- Remaining Useful Life
- Battery status
- Prediction confidence
- Degradation trend
- Feature importance
- Recommendations
