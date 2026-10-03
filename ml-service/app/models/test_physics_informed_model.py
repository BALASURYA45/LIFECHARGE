import sys
import unittest
import numpy as np

from app.models.physics_informed_model import (
    PhysicsInformedLoss,
    PhysicsInformedTemporalModel,
    TORCH_AVAILABLE,
)

if TORCH_AVAILABLE:
    import torch


class TestPhysicsInformedModel(unittest.TestCase):

    def test_model_initialization(self):
        model = PhysicsInformedTemporalModel(input_dim=15, hidden_dim=32)
        params = model.physical_parameters
        self.assertIn("degradation_coefficient_k_deg", params)
        self.assertIn("activation_energy_ea_ev", params)
        self.assertGreater(params["degradation_coefficient_k_deg"], 0.0)
        self.assertGreater(params["activation_energy_ea_ev"], 0.0)

    def test_forward_2d(self):
        model = PhysicsInformedTemporalModel(input_dim=15, hidden_dim=32)
        if TORCH_AVAILABLE:
            x = torch.randn(4, 15)
            soh, rul = model(x)
            self.assertEqual(soh.shape, (4, 1))
            self.assertEqual(rul.shape, (4, 1))
        else:
            x = np.random.randn(4, 15)
            soh, rul = model(x)
            self.assertEqual(soh.shape, (4, 1))
            self.assertEqual(rul.shape, (4, 1))

    def test_forward_3d_and_return_parameters(self):
        model = PhysicsInformedTemporalModel(input_dim=15, hidden_dim=32)
        if TORCH_AVAILABLE:
            x = torch.randn(4, 10, 15)
            soh, rul, p_tensors = model(x, return_parameters=True)
            self.assertEqual(soh.shape, (4, 1))
            self.assertEqual(rul.shape, (4, 1))
            self.assertIn("k_deg", p_tensors)
        else:
            x = np.random.randn(4, 10, 15)
            soh, rul, params = model(x, return_parameters=True)
            self.assertEqual(soh.shape, (4, 1))
            self.assertEqual(rul.shape, (4, 1))

    def test_forward_with_numpy_array(self):
        model = PhysicsInformedTemporalModel(input_dim=15, hidden_dim=32)
        x_np = np.random.randn(2, 15).astype(np.float32)
        soh, rul = model(x_np)
        self.assertEqual(len(soh), 2)

    def test_loss_function_pytorch(self):
        if not TORCH_AVAILABLE:
            self.skipTest("PyTorch is not available")

        loss_fn = PhysicsInformedLoss()

        pred_soh = torch.tensor([[90.0], [85.0]], requires_grad=True)
        pred_rul = torch.tensor([[400.0], [350.0]], requires_grad=True)
        target_soh = torch.tensor([91.0, 84.0])  # 1D target (tests shape broadcasting fix)
        target_rul = torch.tensor([410.0, 340.0])

        cycle_num = torch.tensor([100.0, 200.0])
        temperature_celsius = torch.tensor([25.0, 40.0])  # Celsius (tests temp unit fix)
        c_rate = torch.tensor([1.0, 1.5])
        dod = torch.tensor([0.8, 0.9])

        k_deg = torch.tensor(0.3, requires_grad=True)
        ea_ev = torch.tensor(0.35, requires_grad=True)
        beta_crate = torch.tensor(0.5, requires_grad=True)
        beta_dod = torch.tensor(0.5, requires_grad=True)

        l_total, metrics = loss_fn(
            pred_soh, pred_rul, target_soh, target_rul,
            cycle_num, temperature_celsius, c_rate, dod,
            k_deg, ea_ev, beta_crate, beta_dod
        )

        self.assertGreater(metrics["loss_total"], 0.0)
        self.assertFalse(np.isnan(metrics["loss_total"]))

        # Verify gradient flow
        l_total.backward()
        self.assertIsNotNone(k_deg.grad)
        self.assertIsNotNone(pred_soh.grad)

    def test_loss_function_fallback(self):
        loss_fn = PhysicsInformedLoss()

        pred_soh = np.array([90.0, 85.0])
        pred_rul = np.array([400.0, 350.0])
        target_soh = np.array([91.0, 84.0])
        target_rul = np.array([410.0, 340.0])

        l_total, metrics = loss_fn(
            pred_soh, pred_rul, target_soh, target_rul,
            100.0, 25.0, 1.0, 0.8,
            0.3, 0.35, 0.5, 0.5
        )

        self.assertGreaterEqual(metrics["loss_total"], 0.0)


if __name__ == "__main__":
    unittest.main()
