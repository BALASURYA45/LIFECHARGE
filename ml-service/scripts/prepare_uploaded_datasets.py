from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd


FEATURE_COLUMNS = [
    "batteryAge",
    "chargingCycles",
    "chargingFrequency",
    "fastChargingUsage",
    "averageTemperature",
    "chargingDuration",
    "dailyDistance",
    "socHistory",
    "batteryCapacity",
    "voltage",
    "current",
]

TARGET_COLUMNS = ["SOH", "RUL"]


def find_cleaned_metadata(dataset_root: Path) -> Path:
    matches = list(dataset_root.rglob("metadata.csv")) + list(dataset_root.rglob("Battery_Data_Cleaned.csv"))

    if not matches:
        raise FileNotFoundError(f"Could not find battery metadata under {dataset_root}")

    def score(path: Path) -> tuple[int, int]:
        name_score = 0 if path.name == "metadata.csv" else 1
        archive_score = 1 if "archive (23)" in str(path) else 0
        return (archive_score, name_score)

    return sorted(matches, key=score)[0]


def find_cycle_data_dir(metadata_path: Path) -> Path:
    candidates = [
        metadata_path.parents[1] / "data",
        metadata_path.parent / "data",
        metadata_path.parents[2] / "cleaned_dataset" / "data",
    ]

    for candidate in candidates:
        if candidate.exists():
            return candidate

    raise FileNotFoundError(f"Could not find cycle data directory near {metadata_path}")


def summarize_cycle_file(path: Path) -> dict[str, float]:
    cycle = pd.read_csv(path)

    voltage = pd.to_numeric(cycle.get("Voltage_measured"), errors="coerce")
    current = pd.to_numeric(cycle.get("Current_measured"), errors="coerce")
    temperature = pd.to_numeric(cycle.get("Temperature_measured"), errors="coerce")
    time = pd.to_numeric(cycle.get("Time"), errors="coerce")

    return {
        "voltage": float(voltage.mean()),
        "current": float(current.abs().mean()),
        "averageTemperature": float(temperature.mean()),
        "chargingDuration": float((time.max() - time.min()) / 3600) if time.notna().any() else np.nan,
    }


def build_training_dataset(dataset_root: Path) -> pd.DataFrame:
    metadata_path = find_cleaned_metadata(dataset_root)
    cycle_data_dir = find_cycle_data_dir(metadata_path)

    metadata = pd.read_csv(metadata_path)
    type_values = metadata["type"].astype(str).str.strip().str.lower()
    discharge = metadata[type_values.isin(["discharge", "-1"])].copy()

    if discharge.empty:
        raise ValueError(f"No discharge records found in {metadata_path}")

    discharge["Capacity"] = pd.to_numeric(discharge["Capacity"], errors="coerce")
    discharge = discharge.dropna(subset=["Capacity"])
    discharge = discharge.sort_values(["battery_id", "test_id"])

    rows = []

    for battery_id, group in discharge.groupby("battery_id", sort=True):
        group = group.reset_index(drop=True)
        initial_capacity = group["Capacity"].dropna().iloc[0]
        max_cycle = max(len(group) - 1, 1)

        for cycle_index, row in group.iterrows():
            cycle_path = cycle_data_dir / str(row["filename"])

            if not cycle_path.exists():
                continue

            stats = summarize_cycle_file(cycle_path)
            capacity = float(row["Capacity"])
            soh = np.clip((capacity / initial_capacity) * 100, 0, 100)
            current = stats["current"]
            duration = stats["chargingDuration"]
            voltage = stats["voltage"]

            rows.append(
                {
                    "batteryAge": cycle_index,
                    "chargingCycles": cycle_index,
                    "chargingFrequency": cycle_index / max_cycle,
                    "fastChargingUsage": min((current / 2.0) * 100, 100) if np.isfinite(current) else np.nan,
                    "averageTemperature": stats["averageTemperature"]
                    if np.isfinite(stats["averageTemperature"])
                    else row["ambient_temperature"],
                    "chargingDuration": duration,
                    "dailyDistance": max(capacity * voltage * 8, 0) if np.isfinite(voltage) else np.nan,
                    "socHistory": soh,
                    "batteryCapacity": capacity,
                    "voltage": voltage,
                    "current": current,
                    "SOH": soh,
                    "RUL": max_cycle - cycle_index,
                }
            )

    training = pd.DataFrame(rows)
    training = training[FEATURE_COLUMNS + TARGET_COLUMNS]

    for column in training.columns:
        training[column] = pd.to_numeric(training[column], errors="coerce")

    training = training.replace([np.inf, -np.inf], np.nan).dropna()

    if training.empty:
        raise ValueError("No valid rows were produced from the uploaded datasets")

    return training


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare uploaded battery datasets for LifeCharge training.")
    parser.add_argument("--dataset-root", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    training = build_training_dataset(args.dataset_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    training.to_csv(args.output, index=False)

    print(f"Wrote {len(training)} rows to {args.output}")


if __name__ == "__main__":
    main()
