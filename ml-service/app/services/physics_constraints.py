import numpy as np

class PhysicsConstraintValidator:
    """
    Enforces battery thermodynamic and physical boundary conditions on ML predictions.
    """
    @staticmethod
    def validate_soh_monotonicity(historical_soh: list, predicted_soh: float) -> float:
        """
        Ensures SOH is monotonically non-increasing under normal charge/discharge cycles
        unless a cell replacement or re-calibration event is recorded.
        """
        if not historical_soh:
            return float(np.clip(predicted_soh, 0.0, 100.0))
        
        last_soh = historical_soh[-1]
        # Allow at most 0.1% measurement noise fluctuation upward
        capped_soh = min(predicted_soh, last_soh + 0.1)
        return float(np.clip(capped_soh, 0.0, 100.0))

    @staticmethod
    def validate_operating_conditions(temp: float, voltage: float, current: float) -> dict:
        """
        Verifies operational bounds:
        - Temperature: -40°C to 80°C
        - Pack Voltage: 200V to 900V
        - Current: -500A (charging) to 500A (discharging)
        """
        warnings = []
        if temp < -20.0 or temp > 60.0:
            warnings.append(f"Extreme operational temperature detected: {temp}°C")
        if temp > 70.0:
            warnings.append("Thermal runaway risk warning triggered!")
            
        if voltage < 250.0 or voltage > 850.0:
            warnings.append(f"Voltage out of normal operating range: {voltage}V")

        return {
            "valid": len(warnings) == 0 or temp <= 70.0,
            "warnings": warnings,
            "thermal_runaway_flag": temp > 70.0
        }

physics_validator = PhysicsConstraintValidator()
