"""
Enhanced Training Script
Generates realistic EV dataset and trains the enhanced ML pipeline.
"""
from __future__ import annotations

from pathlib import Path

from app.config.settings import settings
from app.pipelines.enhanced_training_pipeline import train_models
from app.services.ml_training_service import train_battery_health_models


def main() -> None:
    print("=" * 70)
    print("LIFECHARGE ENHANCED TRAINING PIPELINE")
    print("=" * 70)

    # 1. Generate realistic dataset
    print("\n[1/3] Generating realistic EV battery dataset...")
    try:
        from app.data.scripts.download_datasets import create_realistic_ev_dataset

        df = create_realistic_ev_dataset()
        output_path = Path(settings.default_training_dataset)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"  Saved dataset to: {output_path}")
        print(f"  Rows: {len(df)}")
    except Exception as exc:
        print(f"  Failed to generate dataset: {exc}")
        return

    # 2. Train enhanced models
    print("\n[2/3] Training enhanced ML models...")
    try:
        metadata = train_models(dataset_path=str(output_path), artifact_dir=settings.model_artifact_dir)
        print("  Training complete!")
        print(f"  Model artifact dir: {settings.model_artifact_dir}")
    except Exception as exc:
        print(f"  Training failed: {exc}")
        return

    # 3. Summary
    print("\n[3/3] Enhanced training pipeline complete")
    print("\n" + "=" * 70)
    print("RESULTS")
    print("=" * 70)
    print(f"Dataset: {output_path}")
    print(f"Artifacts: {settings.model_artifact_dir}")
    print(f"Best SOH model: {metadata.get('bestModelNames', {}).get('SOH')}")
    print(f"Best RUL model: {metadata.get('bestModelNames', {}).get('RUL')}")
    print(f"Enhanced features used: {metadata.get('advancedFeatures')}")
    print("=" * 70)


if __name__ == "__main__":
    main()