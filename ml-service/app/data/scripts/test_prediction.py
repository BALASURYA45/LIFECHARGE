"""Quick test to verify the prediction pipeline works end-to-end."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
os.chdir(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from app.services.prediction_service import predict_battery_health

# Test 1: Four-wheeler (Tata Nexon EV LR, NMC)
payload_4w = {
    "batteryAge": 3.0,
    "chargingCycles": 300,
    "chargingFrequency": 3.5,
    "fastChargingUsage": 30.0,
    "averageTemperature": 35.0,
    "chargingDuration": 6.0,
    "dailyDistance": 60.0,
    "socHistory": 40.0,
    "batteryCapacity": 40.5,
    "voltage": 320.0,
    "current": 126.56,
    "is_two_wheeler": 0,
    "is_three_wheeler": 0,
    "is_four_wheeler": 1,
    "is_bus": 0,
    "is_chemistry_lfp": 0,
    "is_chemistry_nmc": 1,
    "is_chemistry_lead_acid": 0,
}

result = predict_battery_health(payload_4w)
print("=== Battery Health Prediction (4-wheeler, NMC) ===")
print("SOH:", result["SOH"], "%")
print("RUL:", result["RUL"], "months")
print("Status:", result["batteryStatus"])
print("Risk:", result["riskLabel"], "(", result["riskScore"], "/100 )")
print("Confidence:", result["confidenceScore"], "%")
print("Degradation:", result["degradationTrend"])
print("Model:", result["modelMetadata"]["bestModelName"])
print("Features used:", len(result["input"]))
print()

# Test 2: Two-wheeler (Ola S1 Pro, LFP)
payload_2w = {
    "batteryAge": 2.0,
    "chargingCycles": 250,
    "chargingFrequency": 2.0,
    "fastChargingUsage": 10.0,
    "averageTemperature": 30.0,
    "chargingDuration": 4.0,
    "dailyDistance": 30.0,
    "socHistory": 50.0,
    "batteryCapacity": 4.0,
    "voltage": 48.0,
    "current": 83.33,
    "is_two_wheeler": 1,
    "is_three_wheeler": 0,
    "is_four_wheeler": 0,
    "is_bus": 0,
    "is_chemistry_lfp": 1,
    "is_chemistry_nmc": 0,
    "is_chemistry_lead_acid": 0,
}

result2 = predict_battery_health(payload_2w)
print("=== Battery Health Prediction (2-wheeler, LFP) ===")
print("SOH:", result2["SOH"], "%")
print("RUL:", result2["RUL"], "months")
print("Status:", result2["batteryStatus"])
print("Risk:", result2["riskLabel"], "(", result2["riskScore"], "/100 )")
print("Confidence:", result2["confidenceScore"], "%")
print("Degradation:", result2["degradationTrend"])
print()

# Test 3: Bus (LFP)
payload_bus = {
    "batteryAge": 4.0,
    "chargingCycles": 800,
    "chargingFrequency": 1.0,
    "fastChargingUsage": 50.0,
    "averageTemperature": 40.0,
    "chargingDuration": 8.0,
    "dailyDistance": 150.0,
    "socHistory": 30.0,
    "batteryCapacity": 186.0,
    "voltage": 540.0,
    "current": 344.44,
    "is_two_wheeler": 0,
    "is_three_wheeler": 0,
    "is_four_wheeler": 0,
    "is_bus": 1,
    "is_chemistry_lfp": 1,
    "is_chemistry_nmc": 0,
    "is_chemistry_lead_acid": 0,
}

result3 = predict_battery_health(payload_bus)
print("=== Battery Health Prediction (Bus, LFP) ===")
print("SOH:", result3["SOH"], "%")
print("RUL:", result3["RUL"], "months")
print("Status:", result3["batteryStatus"])
print("Risk:", result3["riskLabel"], "(", result3["riskScore"], "/100 )")
print("Confidence:", result3["confidenceScore"], "%")
print("Degradation:", result3["degradationTrend"])
print()
print("ALL TESTS PASSED")
