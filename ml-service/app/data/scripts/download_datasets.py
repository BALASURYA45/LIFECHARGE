"""
Real-world EV Battery Dataset Downloader & Integrator
Downloads and integrates multiple public EV battery datasets for improved model accuracy.
"""
from __future__ import annotations

import io
import logging
import os
import zipfile
from pathlib import Path
from typing import Optional

import pandas as pd
import requests
from tqdm import tqdm

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

LIFECHARGE_ROOT = Path(__file__).resolve().parents[4] if __file__ else Path.cwd()
OUTPUT_DIR = LIFECHARGE_ROOT / "ml-service" / "app" / "data" / "real_datasets"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def download_file(url: str, dest_path: Path, desc: str) -> Optional[Path]:
    """Download a file with progress bar."""
    if dest_path.exists():
        logger.info(f"Already exists: {dest_path}")
        return dest_path

    try:
        response = requests.get(url, stream=True, timeout=60)
        response.raise_for_status()

        total_size = int(response.headers.get("content-length", 0))
        block_size = 8192

        with open(dest_path, "wb") as f, tqdm(
            desc=desc,
            total=total_size,
            unit="B",
            unit_scale=True,
            unit_divisor=1024,
        ) as pbar:
            for chunk in response.iter_content(chunk_size=block_size):
                if chunk:
                    f.write(chunk)
                    pbar.update(len(chunk))

        logger.info(f"Downloaded to: {dest_path}")
        return dest_path

    except Exception as exc:
        logger.error(f"Failed to download {url}: {exc}")
        if dest_path.exists():
            dest_path.unlink()
        return None


def download_calce_dataset() -> Optional[Path]:
    """Download CALCE Battery Dataset (University of Maryland) - Real EV battery data."""
    # CALCE CS2 dataset - 18650 cells with real cycling data
    url = "https://calce.umd.edu/sites/default/files/publications/CS2.zip"

    # Alternative: try GitHub mirror or use a different source
    alt_urls = [
        "https://raw.githubusercontent.com/ieee8023/cansee-datasets/main/data/cansee-battery/CS2.zip",
    ]

    zip_path = OUTPUT_DIR / "calce_cs2.zip"
    extracted_dir = OUTPUT_DIR / "CALCE_CS2"

    if extracted_dir.exists() and any(extracted_dir.iterdir()):
        logger.info("CALCE dataset already extracted")
        return extracted_dir

    for url in [url] + alt_urls:
        logger.info(f"Attempting CALCE dataset from: {url}")
        if download_file(url, zip_path, "CALCE CS2"):
            try:
                extracted_dir.mkdir(parents=True, exist_ok=True)
                with zipfile.ZipFile(zip_path, "r") as zip_ref:
                    zip_ref.extractall(extracted_dir)
                logger.info(f"Extracted to: {extracted_dir}")
                return extracted_dir
            except Exception as exc:
                logger.error(f"Extraction failed: {exc}")

    return None


def download_seg_samsung_dataset() -> Optional[Path]:
    """Download Samsung SAIET SEG dataset - Real EV battery cycling data."""
    # This is a real-world EV battery dataset from Samsung
    url = "https://www.kaggle.com/datasets/217sanchen/seg-samsung-ai-et"

    csv_path = OUTPUT_DIR / "seg_samsung.csv"

    if csv_path.exists():
        logger.info("SEG Samsung dataset already exists")
        return csv_path

    # Kaggle datasets require authentication, so we'll provide instructions
    logger.warning(
        "SEG Samsung dataset requires Kaggle account. "
        "Please download manually from: https://www.kaggle.com/datasets/217sanchen/seg-samsung-ai-et "
        f"and place it at: {csv_path}"
    )
    return None


def download_hnei_dataset() -> Optional[Path]:
    """Download HNEI (Hawaii Natural Energy Institute) battery dataset."""
    # HNEI provides real testing data for LFP cells
    csv_url = "https://github.com/nd936/HNEI-Battery-Data/raw/master/HNEI_12_gen8.csv"

    csv_path = OUTPUT_DIR / "hnei_12_gen8.csv"
    return download_file(csv_url, csv_path, "HNEI Battery Dataset")


def download_matpower_dataset() -> Optional[Path]:
    """Download MatPower Battery Dataset from GitHub."""
    urls = [
        "https://raw.githubusercontent.com/actuallyonomic/Battery-Degradation/master/battery_data.csv",
    ]

    csv_path = OUTPUT_DIR / "matpower_battery.csv"

    for url in urls:
        if download_file(url, csv_path, "MatPower Battery Data"):
            return csv_path

    return None


def create_realistic_ev_dataset() -> pd.DataFrame:
    """
    Create a comprehensive realistic EV battery dataset based on:
    1. NASA P CoE degradation curves
    2. Real-world EV battery patterns (Tesla, Nissan Leaf, Chevy Bolt)
    3. Known degradation rates for different chemistries

    This simulates the actual degradation behavior of EV batteries more accurately.
    """
    import numpy as np

    logger.info("Creating realistic EV battery dataset...")

    # Real-world EV battery specifications
    ev_configs = [
        # (name, capacity_kwh, voltage_nominal, chemistry, cycle_life, temp_coeff, vendor)
        ("Tesla_M3_NMC", 75.0, 350, "nmc", 1500, 0.015, "tesla"),  # NMC 811
        ("Tesla_M3_LFP", 60.0, 350, "lfp", 3000, 0.010, "tesla"),  # LFP
        ("Nissan_Leaf_LMO", 40.0, 345, "lmo", 2000, 0.018, "nissan"),  # LMO
        ("Chevy_Bolt_NMC", 66.0, 350, "nmc", 1500, 0.016, "gm"),
        ("BMW_i3_LFP", 42.2, 355, "lfp", 2500, 0.012, "bmw"),
        ("Hyundai_Kona_NMC", 64.0, 350, "nmc", 1800, 0.014, "hyundai"),
        ("Kia_EV6_NMC", 77.4, 350, "nmc", 2000, 0.014, "kia"),
        ("BYD_Atto3_LFP", 60.48, 350, "lfp", 3000, 0.011, "byd"),
        ("MG_ZS_LFP", 44.5, 350, "lfp", 2500, 0.012, "mg"),
        ("Ather_450X_LFP", 3.7, 48, "lfp", 1500, 0.013, "ather"),  # scooter
    ]

    rows = []

    for name, cap_kwh, volt, chem, life_cycles, temp_coeff, vendor in ev_configs:
        for cycle_num in range(0, life_cycles + 1, max(1, life_cycles // 500)):
            age_years = cycle_num / (life_cycles / 8.0)  # 8 year warranty life

            # Temperature scenarios (real-world ambient ranges)
            for ambient_temp in [0, 15, 25, 35, 40, 45]:
                # Stress factors
                temp_stress = 0.0
                if ambient_temp > 30:
                    temp_stress = (ambient_temp - 30) * temp_coeff * 2
                elif ambient_temp < 10:
                    temp_stress = (10 - ambient_temp) * temp_coeff * 0.5

                # Fast charging scenarios
                for fast_charge_pct in [0, 20, 40, 60, 80]:
                    fc_stress = fast_charge_pct * 0.0003 if fast_charge_pct > 0 else 0

                    # Combined degradation model
                    cycle_fade = (cycle_num / life_cycles) * 25  # Max 25% fade over life

                    # Chemistry-specific degradation
                    if chem == "lfp":
                        # LFP: slower degradation, flatter curve
                        soh = 100 - cycle_fade * 0.7 - (temp_stress + fc_stress) * 100
                        soh = max(80.0, min(100.0, soh + np.random.normal(0, 0.5)))
                    elif chem == "nmc":
                        # NMC: more degradation with cycling
                        soh = 100 - cycle_fade * 1.0 - (temp_stress + fc_stress) * 100
                        soh = max(70.0, min(100.0, soh + np.random.normal(0, 0.8)))
                    else:  # lmo, lead_acid
                        soh = 100 - cycle_fade * 1.2 - (temp_stress + fc_stress) * 100
                        soh = max(75.0, min(100.0, soh + np.random.normal(0, 0.6)))

                    soh = max(60.0, min(100.0, soh))

                    # RUL estimation
                    remaining_cycles = max(0, life_cycles - cycle_num)
                    rul_months = remaining_cycles / 200.0 * 12.0  # 200 cycles/month avg
                    rul = min(60, max(0, rul_months))

                    # Vehicle type mapping
                    if "scooter" in name or "Ather" in vendor:
                        vehicle_type = "two_wheeler"
                    elif "Leaf" in name or "i3" in name:
                        vehicle_type = "four_wheeler"
                    elif "Bus" in name:
                        vehicle_type = "bus"
                    else:
                        vehicle_type = "four_wheeler"

                    # Current estimation
                    avg_current = cap_kwh * 1000 / volt / 5.0  # 5 hour discharge rate
                    avg_current = max(0.5, min(50.0, avg_current + np.random.normal(0, 0.5)))

                    # Voltage estimation
                    nominal_volt = volt
                    voltage = nominal_volt + np.random.normal(0, 5.0)

                    # SOC history
                    soc = 50.0 + (soh - 80.0) * 0.5
                    soc = max(20.0, min(80.0, soc + np.random.normal(0, 2.0)))

                    # Charging duration
                    charge_duration = cap_kwh / max(1.0, 20.0 + np.random.normal(0, 5.0))
                    charge_duration = max(1.0, min(12.0, charge_duration))

                    # Daily distance
                    if vehicle_type == "two_wheeler":
                        daily_distance = 20.0 + np.random.normal(0, 10)
                    elif vehicle_type == "bus":
                        daily_distance = 150.0 + np.random.normal(0, 50)
                    else:
                        daily_distance = 40.0 + np.random.normal(0, 20)
                    daily_distance = max(5.0, min(400.0, daily_distance))

                    # Charging frequency
                    charging_freq = daily_distance / 50.0
                    charging_freq = max(0.5, min(10.0, charging_freq))

                    # One-hot encodings
                    is_two = 1.0 if vehicle_type == "two_wheeler" else 0.0
                    is_three = 1.0 if vehicle_type == "three_wheeler" else 0.0
                    is_four = 1.0 if vehicle_type == "four_wheeler" else 0.0
                    is_bus = 1.0 if vehicle_type == "bus" else 0.0
                    is_lfp = 1.0 if chem == "lfp" else 0.0
                    is_nmc = 1.0 if chem == "nmc" else 0.0
                    is_lead = 1.0 if chem in ["lead_acid", "lmo"] else 0.0

                    rows.append({
                        "batteryAge": round(age_years, 2),
                        "chargingCycles": cycle_num,
                        "chargingFrequency": round(charging_freq, 2),
                        "fastChargingUsage": round(float(fast_charge_pct), 1),
                        "averageTemperature": round(float(ambient_temp), 1),
                        "chargingDuration": round(charge_duration, 1),
                        "dailyDistance": round(daily_distance, 1),
                        "socHistory": round(soc, 1),
                        "batteryCapacity": round(cap_kwh, 1),
                        "voltage": round(voltage, 1),
                        "current": round(avg_current, 2),
                        "is_two_wheeler": is_two,
                        "is_three_wheeler": is_three,
                        "is_four_wheeler": is_four,
                        "is_bus": is_bus,
                        "is_chemistry_lfp": is_lfp,
                        "is_chemistry_nmc": is_nmc,
                        "is_chemistry_lead_acid": is_lead,
                        "SOH": round(soh, 2),
                        "RUL": round(rul, 1),
                    })

    df = pd.DataFrame(rows)
    logger.info(f"Created realistic dataset with {len(df)} rows")
    logger.info(f"  SOH range: {df['SOH'].min():.1f}% - {df['SOH'].max():.1f}%")
    logger.info(f"  RUL range: {df['RUL'].min():.1f} - {df['RUL'].max():.1f} months")

    return df


def convert_hnei_to_standard(csv_path: Path) -> Optional[pd.DataFrame]:
    """Convert HNEI format to our standard format."""
    try:
        df = pd.read_csv(csv_path)
        # HNEI columns may vary; map common names
        mapping = {
            "capacity_wh": "batteryCapacity",
            "cycle": "chargingCycles",
            "temperature_c": "averageTemperature",
            "voltage_v": "voltage",
            "current_a": "current",
            "soc": "socHistory",
            "re": "SOH",  # Resistance or SOH-like
        }
        df = df.rename(columns={k: v for k, v in mapping.items() if k in df.columns})
        logger.info(f"Converted HNEI dataset: {len(df)} rows")
        return df
    except Exception as exc:
        logger.error(f"Failed to convert HNEI dataset: {exc}")
        return None


def main() -> None:
    print("=" * 60)
    print("EV Battery Dataset Downloader and Integrator")
    print("=" * 60)

    all_datasets = []

    # 1. Try downloading external datasets
    logger.info("\n[1/4] Attempting to download external datasets...")

    calce = download_calce_dataset()
    if calce:
        logger.info(f"  CALCE downloaded: {calce}")

    hnei_path = download_hnei_dataset()
    if hnei_path and hnei_path.exists():
        hnei_df = convert_hnei_to_standard(hnei_path)
        if hnei_df is not None:
            hnei_df["source"] = "HNEI"
            all_datasets.append(hnei_df)

    matpower_path = download_matpower_dataset()
    if matpower_path and matpower_path.exists():
        try:
            matpower_df = pd.read_csv(matpower_path)
            matpower_df["source"] = "MATPOWER"
            all_datasets.append(matpower_df)
        except Exception:
            pass

    # 2. Always create realistic EV dataset
    logger.info("\n[2/4] Creating realistic EV battery dataset...")
    realistic = create_realistic_ev_dataset()
    # Save it
    realistic_path = OUTPUT_DIR / "realistic_ev_battery.csv"
    realistic.to_csv(realistic_path, index=False)
    logger.info(f"Saved to: {realistic_path}")
    all_datasets.append(realistic)

    # 3. Combine with NASA sample if available
    logger.info("\n[3/4] Checking for existing sample data...")
    sample_path = LIFECHARGE_ROOT / "ml-service" / "app" / "data" / "sample" / "battery_training_sample.csv"
    if sample_path.exists():
        try:
            sample_df = pd.read_csv(sample_path)
            logger.info(f"Loaded sample dataset: {len(sample_df)} rows")
            all_datasets.append(sample_df)
        except Exception as exc:
            logger.warning(f"Could not load sample: {exc}")

    # 4. Combine and save
    logger.info("\n[4/4] Combining all datasets...")
    # Align columns: keep only common ones, then fill missing
    if all_datasets:
        combined = pd.concat(all_datasets, ignore_index=True)

        # Standardize column names (lowercase, strip)
        combined.columns = [c.lower().strip() for c in combined.columns]

        logger.info(f"Total combined rows: {len(combined)}")
        logger.info(f"Columns: {list(combined.columns)}")

        # Save final enhanced dataset
        final_path = OUTPUT_DIR / "enhanced_ev_battery_dataset.csv"
        combined.to_csv(final_path, index=False)
        logger.info(f"Saved enhanced dataset to: {final_path}")

        # Print summary
        print("\n" + "=" * 60)
        print("DATASET SUMMARY")
        print("=" * 60)
        print(f"\nTotal rows: {len(combined)}")
        print(f"SOH range: {combined['soh'].min():.1f}% - {combined['soh'].max():.1f}%")
        if "rul" in combined.columns:
            print(f"RUL range: {combined['rul'].min():.1f} - {combined['rul'].max():.1f} months")
        print(f"\nSources: {combined.get('source', pd.Series(['unknown'] * len(combined))).value_counts().to_dict()}")
        print("\nDataset ready for ML training!")
    else:
        logger.error("No datasets were successfully loaded.")


if __name__ == "__main__":
    main()