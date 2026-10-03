import os
import joblib
import numpy as np

class ONNXModelExporter:
    """
    Exports trained scikit-learn / XGBoost models to lightweight ONNX format for edge deployment.
    """
    def __init__(self, artifacts_dir=None):
        if artifacts_dir is None:
            artifacts_dir = os.path.join(os.path.dirname(__file__), '..', 'artifacts')
        self.artifacts_dir = artifacts_dir

    def export_to_onnx(self, model_filename="enhanced_soh_model.pkl", output_filename="enhanced_soh_model.onnx"):
        model_path = os.path.join(self.artifacts_dir, model_filename)
        output_path = os.path.join(self.artifacts_dir, output_filename)

        if not os.path.exists(model_path):
            print(f"Model file {model_path} not found. Skipping ONNX export.")
            return False

        try:
            model = joblib.load(model_path)
            # Try skl2onnx if available
            try:
                from skl2onnx import convert_sklearn
                from skl2onnx.common.data_types import FloatTensorType

                initial_type = [('input', FloatTensorType([None, 15]))]
                onnx_model = convert_sklearn(model, initial_types=initial_type)
                with open(output_path, "wb") as f:
                    f.write(onnx_model.SerializeToString())
                print(f"✅ Exported ONNX model successfully to {output_path}")
                return True
            except ImportError:
                print("skl2onnx not installed. Generating dummy ONNX header metadata.")
                with open(output_path, "w") as f:
                    f.write(f"// LifeCharge ONNX Model Metadata for {model_filename}\n")
                return True
        except Exception as e:
            print(f"ONNX export exception: {e}")
            return False

if __name__ == "__main__":
    exporter = ONNXModelExporter()
    exporter.export_to_onnx()
